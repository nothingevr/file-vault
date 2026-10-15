/**
 * Code Editor Application Logic
 * Multi-file management, Monaco controller, Tab switching,
 * Multi-file import (files & folders), JSZip export, and Pyodide runner.
 */

(function () {
    'use strict';

    // ---- APP STATE ----
    const state = {
        files: [],               // Array of { id, name, content, language, model, isDirty }
        activeFileId: null,
        openTabIds: [],
        editor: null,
        pyodide: null,
        pyodideLoading: false,
        settings: {
            fontSize: 14,
            tabSize: 4,
            wordWrap: 'off',
            minimap: true,
            theme: 'vs-dark'
        }
    };

    // Default starter files if none exist in localStorage
    const STARTER_FILES = [
        {
            id: 'file_main',
            name: 'main.py',
            language: 'python',
            isDirty: false,
            content: `"""
⚡ Welcome to Minimal Code Editor!
Features:
- Multi-file editing with tabs & sidebar
- Python autocomplete (modules, functions, snippets)
- Import multiple files or whole folders at once
- In-browser Python runner (Pyodide WASM)
"""

import math
import os
import json
import random
from datetime import datetime
from helper import calculate_stats, greet_user

def main():
    user = "Developer"
    print(greet_user(user))
    print(f"Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Current working dir: {os.getcwd()}")
    
    # Mathematical computations
    numbers = [random.randint(10, 100) for _ in range(8)]
    stats = calculate_stats(numbers)
    
    print("\n--- Statistics ---")
    print(json.dumps(stats, indent=2))
    
    print(f"\nmath.sqrt(144) = {math.sqrt(144)}")
    print(f"math.pi = {math.pi:.5f}")

if __name__ == '__main__':
    main()
`
        },
        {
            id: 'file_helper',
            name: 'helper.py',
            language: 'python',
            isDirty: false,
            content: `"""
Helper module demonstrating multi-file imports!
Imported directly by main.py in the browser.
"""

import math

def greet_user(name: str) -> str:
    """Return a warm greeting for the user."""
    return f"Hello, {name}! Ready to code Python?"

def calculate_stats(data: list) -> dict:
    """Calculate mean, standard deviation, min, and max."""
    if not data:
        return {}
    
    n = len(data)
    mean_val = sum(data) / n
    variance = sum((x - mean_val) ** 2 for x in data) / n
    std_dev = math.sqrt(variance)
    
    return {
        "count": n,
        "sample": data,
        "mean": round(mean_val, 2),
        "std_dev": round(std_dev, 2),
        "min": min(data),
        "max": max(data)
    }
`
        }
    ];

    // ---- DOM REFERENCES ----
    const dom = {
        sidebar: document.getElementById('sidebar'),
        fileTree: document.getElementById('file-tree'),
        fileCountBadge: document.getElementById('file-count-badge'),
        tabList: document.getElementById('tab-list'),
        monacoContainer: document.getElementById('monaco-container'),
        emptyState: document.getElementById('empty-state'),
        outputPanel: document.getElementById('output-panel'),
        panelOutput: document.getElementById('panel-output'),
        panelStatus: document.getElementById('panel-status'),
        currentFilePath: document.getElementById('current-file-path'),
        currentLangBadge: document.getElementById('current-lang-badge'),
        statusPos: document.getElementById('status-pos'),
        statusEncoding: document.getElementById('status-encoding'),
        statusPyRuntime: document.getElementById('status-py-runtime'),
        statusPyDot: document.getElementById('status-py-dot'),
        fileInput: document.getElementById('file-input'),
        folderInput: document.getElementById('folder-input'),
        sidebarDropOverlay: document.getElementById('sidebar-drop-overlay'),
        newFileModal: document.getElementById('new-file-modal'),
        newFileInput: document.getElementById('new-file-name-input'),
        settingsModal: document.getElementById('settings-modal'),
        quickOpenModal: document.getElementById('quick-open-modal'),
        quickOpenInput: document.getElementById('quick-open-input'),
        quickOpenResults: document.getElementById('quick-open-results')
    };

    // ---- LANGUAGE HELPERS ----
    const EXTENSION_MAP = {
        'py': 'python',
        'js': 'javascript',
        'mjs': 'javascript',
        'cjs': 'javascript',
        'ts': 'typescript',
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'json': 'json',
        'md': 'markdown',
        'sql': 'sql',
        'sh': 'shell',
        'bash': 'shell',
        'xml': 'xml',
        'yaml': 'yaml',
        'yml': 'yaml',
        'txt': 'plaintext',
        'csv': 'plaintext'
    };

    function getLanguageFromFileName(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        return EXTENSION_MAP[ext] || 'plaintext';
    }

    function getExtClass(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        if (['py', 'js', 'ts', 'html', 'css', 'json', 'md'].includes(ext)) {
            return ext;
        }
        return 'default';
    }

    function getExtIconText(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        if (ext === 'py') return '🐍';
        if (ext === 'js' || ext === 'ts') return 'JS';
        if (ext === 'html') return '<>';
        if (ext === 'css') return '#';
        if (ext === 'json') return '{}';
        if (ext === 'md') return 'M↓';
        if (ext === 'sql') return '🗄';
        return '📄';
    }

    // ---- PERSISTENCE ----
    function loadSavedSettings() {
        try {
            const saved = localStorage.getItem('codevault_settings');
            if (saved) {
                Object.assign(state.settings, JSON.parse(saved));
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem('codevault_settings', JSON.stringify(state.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    function loadWorkspaceFromStorage() {
        try {
            const saved = localStorage.getItem('codevault_files');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Could not load workspace from storage:', e);
        }
        return STARTER_FILES;
    }

    function saveWorkspaceToStorage() {
        try {
            const toSave = state.files.map(f => ({
                id: f.id,
                name: f.name,
                content: f.model ? f.model.getValue() : f.content,
                language: f.language
            }));
            localStorage.setItem('codevault_files', JSON.stringify(toSave));
        } catch (e) {
            console.warn('Could not save workspace to storage:', e);
        }
    }

    // Debounced auto-save
    let autoSaveTimer = null;
    function scheduleAutoSave() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            saveWorkspaceToStorage();
        }, 1500);
    }

    // ---- MONACO INITIALIZATION ----
    function initMonaco() {
        require.config({
            paths: {
                'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs'
            }
        });

        // Safe web worker initialization from CDN
        window.MonacoEnvironment = {
            getWorkerUrl: function (workerId, label) {
                return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                    self.MonacoEnvironment = {
                        baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/'
                    };
                    importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/base/worker/workerMain.js');
                `)}`;
            }
        };

        require(['vs/editor/editor.main'], function () {
            // Register custom Python autocomplete and hover provider
            if (window.PythonIntellisense) {
                window.PythonIntellisense.register(monaco, function () {
                    // Provide other workspace files content for symbol extraction
                    return state.files.map(f => f.model ? f.model.getValue() : f.content);
                });
            }

            // Create Monaco Editor Instance
            state.editor = monaco.editor.create(dom.monacoContainer, {
                theme: state.settings.theme,
                fontSize: state.settings.fontSize,
                tabSize: state.settings.tabSize,
                wordWrap: state.settings.wordWrap,
                minimap: { enabled: state.settings.minimap },
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                fontLigatures: true,
                automaticLayout: true,
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                bracketPairColorization: { enabled: true },
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                quickSuggestions: { other: true, comments: false, strings: true },
                suggestOnTriggerCharacters: true
            });

            // Track cursor position
            state.editor.onDidChangeCursorPosition(e => {
                dom.statusPos.textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
            });

            // Global shortcut inside editor: Ctrl+S to save
            state.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                saveActiveFile();
                showToast('File saved!', 'success');
            });

            // Global shortcut: Ctrl+Enter to run
            state.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                runActiveCode();
            });

            // Global shortcut: Ctrl+P to quick open
            state.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
                openQuickOpenModal();
            });

            // Populate workspace models
            initializeWorkspace();

            // Check URL parameters for loading a specific file from file-vault
            handleUrlParams();
        });
    }

    // ---- WORKSPACE & FILES ----
    function initializeWorkspace() {
        const loadedFiles = loadWorkspaceFromStorage();
        state.files = [];
        state.openTabIds = [];

        loadedFiles.forEach(f => {
            addFileToWorkspace(f.name, f.content, false);
        });

        if (state.files.length > 0) {
            setActiveFile(state.files[0].id);
        } else {
            updateEmptyState();
        }

        renderFileTree();
        renderTabs();
    }

    function addFileToWorkspace(filename, content, makeActive = true) {
        // Prevent duplicate names
        let finalName = filename;
        let counter = 1;
        while (state.files.some(f => f.name.toLowerCase() === finalName.toLowerCase())) {
            const parts = filename.split('.');
            if (parts.length > 1) {
                const ext = parts.pop();
                finalName = `${parts.join('.')}_${counter}.${ext}`;
            } else {
                finalName = `${filename}_${counter}`;
            }
            counter++;
        }

        const lang = getLanguageFromFileName(finalName);
        const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

        // Create Monaco Model
        const modelUri = monaco.Uri.parse(`inmemory://workspace/${finalName}`);
        let model;
        try {
            model = monaco.editor.createModel(content, lang, modelUri);
        } catch (e) {
            model = monaco.editor.createModel(content, lang);
        }

        // Detect dirty status on changes
        model.onDidChangeContent(() => {
            const file = state.files.find(f => f.id === fileId);
            if (file) {
                file.isDirty = true;
                file.content = model.getValue();
                renderTabs();
                scheduleAutoSave();
            }
        });

        const newFile = {
            id: fileId,
            name: finalName,
            content: content,
            language: lang,
            model: model,
            isDirty: false
        };

        state.files.push(newFile);
        if (!state.openTabIds.includes(fileId)) {
            state.openTabIds.push(fileId);
        }

        if (makeActive) {
            setActiveFile(fileId);
        }

        renderFileTree();
        renderTabs();
        updateEmptyState();
        scheduleAutoSave();

        return newFile;
    }

    function setActiveFile(fileId) {
        const file = state.files.find(f => f.id === fileId);
        if (!file) return;

        state.activeFileId = fileId;

        // Ensure tab is open
        if (!state.openTabIds.includes(fileId)) {
            state.openTabIds.push(fileId);
        }

        if (state.editor) {
            state.editor.setModel(file.model);
            state.editor.focus();
        }

        // Update Breadcrumbs & Status Bar
        dom.currentFilePath.textContent = file.name;
        dom.currentLangBadge.textContent = file.language.toUpperCase();

        renderFileTree();
        renderTabs();
        updateEmptyState();
    }

    function closeTab(fileId, e) {
        if (e) e.stopPropagation();

        const index = state.openTabIds.indexOf(fileId);
        if (index === -1) return;

        state.openTabIds.splice(index, 1);

        if (state.activeFileId === fileId) {
            if (state.openTabIds.length > 0) {
                const nextIndex = Math.max(0, index - 1);
                setActiveFile(state.openTabIds[nextIndex]);
            } else {
                state.activeFileId = null;
                if (state.editor) {
                    state.editor.setModel(null);
                }
                dom.currentFilePath.textContent = 'No file open';
                dom.currentLangBadge.textContent = 'NONE';
            }
        }

        renderTabs();
        updateEmptyState();
    }

    function deleteFile(fileId, e) {
        if (e) e.stopPropagation();

        const file = state.files.find(f => f.id === fileId);
        if (!file) return;

        if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;

        // Dispose Monaco model
        if (file.model) {
            file.model.dispose();
        }

        // Remove from open tabs
        closeTab(fileId);

        // Remove from files
        state.files = state.files.filter(f => f.id !== fileId);

        renderFileTree();
        renderTabs();
        updateEmptyState();
        saveWorkspaceToStorage();
        showToast(`Deleted ${file.name}`, 'info');
    }

    function saveActiveFile() {
        const file = state.files.find(f => f.id === state.activeFileId);
        if (file && file.model) {
            file.content = file.model.getValue();
            file.isDirty = false;
            renderTabs();
            saveWorkspaceToStorage();
        }
    }

    function downloadActiveFile() {
        const file = state.files.find(f => f.id === state.activeFileId);
        if (!file) {
            showToast('No active file to download', 'warning');
            return;
        }

        const content = file.model ? file.model.getValue() : file.content;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Downloaded ${file.name}`, 'success');
    }

    function exportWorkspaceAsZip() {
        if (state.files.length === 0) {
            showToast('No files to export', 'warning');
            return;
        }

        if (typeof JSZip === 'undefined') {
            showToast('JSZip library not loaded yet', 'error');
            return;
        }

        const zip = new JSZip();
        state.files.forEach(f => {
            const content = f.model ? f.model.getValue() : f.content;
            zip.file(f.name, content);
        });

        zip.generateAsync({ type: 'blob' }).then(content => {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'workspace_code.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(`Exported ${state.files.length} files as ZIP!`, 'success');
        }).catch(err => {
            console.error('ZIP error:', err);
            showToast('Failed to generate ZIP', 'error');
        });
    }

    // ---- FILE IMPORT (MULTIPLE FILES & FOLDERS) ----
    function handleMultipleFilesImport(fileList) {
        if (!fileList || fileList.length === 0) return;

        let loadedCount = 0;
        const total = fileList.length;
        let lastCreatedFile = null;

        Array.from(fileList).forEach(file => {
            // Ignore system or binary hidden files
            if (file.name.startsWith('.') || file.name.endsWith('.pyc')) {
                loadedCount++;
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const content = e.target.result;
                lastCreatedFile = addFileToWorkspace(file.name, content, false);
                loadedCount++;

                if (loadedCount === total) {
                    if (lastCreatedFile) {
                        setActiveFile(lastCreatedFile.id);
                    }
                    showToast(`Imported ${total} file${total > 1 ? 's' : ''}!`, 'success');
                }
            };
            reader.onerror = function () {
                loadedCount++;
                showToast(`Error reading ${file.name}`, 'error');
            };
            reader.readAsText(file);
        });
    }

    // ---- RENDER UI ----
    function renderFileTree() {
        dom.fileTree.innerHTML = '';
        dom.fileCountBadge.textContent = `${state.files.length} files`;

        const filterQuery = (dom.sidebarSearchInput ? dom.sidebarSearchInput.value : '').toLowerCase().trim();

        state.files.forEach(file => {
            if (filterQuery && !file.name.toLowerCase().includes(filterQuery)) {
                return;
            }

            const item = document.createElement('div');
            item.className = 'file-item' + (file.id === state.activeFileId ? ' active' : '');
            item.title = file.name;

            const iconClass = getExtClass(file.name);
            const iconText = getExtIconText(file.name);

            item.innerHTML = `
                <div class="file-item-left">
                    <span class="file-ext-icon ${iconClass}">${iconText}</span>
                    <span class="file-item-name">${escapeHtml(file.name)}</span>
                </div>
                <div class="file-item-actions">
                    <button class="file-sub-btn download" title="Download file">⬇</button>
                    <button class="file-sub-btn delete" title="Delete file">✕</button>
                </div>
            `;

            // Click to open
            item.addEventListener('click', () => {
                setActiveFile(file.id);
            });

            // Action: Download
            item.querySelector('.download').addEventListener('click', (e) => {
                e.stopPropagation();
                const content = file.model ? file.model.getValue() : file.content;
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });

            // Action: Delete
            item.querySelector('.delete').addEventListener('click', (e) => {
                deleteFile(file.id, e);
            });

            dom.fileTree.appendChild(item);
        });
    }

    function renderTabs() {
        dom.tabList.innerHTML = '';

        state.openTabIds.forEach(fileId => {
            const file = state.files.find(f => f.id === fileId);
            if (!file) return;

            const tab = document.createElement('div');
            tab.className = 'tab' + 
                (file.id === state.activeFileId ? ' active' : '') + 
                (file.isDirty ? ' dirty' : '');
            
            const iconText = getExtIconText(file.name);

            tab.innerHTML = `
                <span class="tab-icon">${iconText}</span>
                <span class="tab-title" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
                <span class="tab-dirty-dot" title="Unsaved changes"></span>
                <button class="tab-close-btn" title="Close">✕</button>
            `;

            tab.addEventListener('click', () => {
                setActiveFile(file.id);
            });

            tab.querySelector('.tab-close-btn').addEventListener('click', (e) => {
                closeTab(file.id, e);
            });

            dom.tabList.appendChild(tab);
        });
    }

    function updateEmptyState() {
        if (!state.activeFileId || state.openTabIds.length === 0) {
            dom.emptyState.style.display = 'flex';
        } else {
            dom.emptyState.style.display = 'none';
        }
    }

    // ---- PYODIDE PYTHON WASM RUNNER ----
    async function initPyodide() {
        if (state.pyodide) return state.pyodide;
        if (state.pyodideLoading) {
            while (state.pyodideLoading) {
                await new Promise(r => setTimeout(r, 100));
            }
            return state.pyodide;
        }

        state.pyodideLoading = true;
        updatePyodideStatus('Loading Pyodide runtime...', 'running');

        try {
            if (typeof loadPyodide === 'undefined') {
                throw new Error('Pyodide script not loaded');
            }

            state.pyodide = await loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
            });

            updatePyodideStatus('Pyodide Python 3.11 Ready', 'ready');
            state.pyodideLoading = false;
            return state.pyodide;
        } catch (err) {
            state.pyodideLoading = false;
            updatePyodideStatus('Pyodide failed to load', 'error');
            console.error('Pyodide init error:', err);
            throw err;
        }
    }

    function updatePyodideStatus(text, statusClass) {
        dom.statusPyRuntime.textContent = text;
        dom.statusPyDot.className = 'status-indicator ' + (statusClass || '');
    }

    async function runActiveCode() {
        const file = state.files.find(f => f.id === state.activeFileId);
        if (!file) {
            showToast('No active file to run', 'warning');
            return;
        }

        // Open console output panel
        dom.outputPanel.classList.remove('hidden');
        dom.panelOutput.innerHTML = '';
        dom.panelStatus.textContent = 'Running...';
        dom.panelStatus.className = 'panel-status-tag running';

        appendOutput(`[System] Executing ${file.name}...\n`, 'log-system');

        const startTime = performance.now();

        try {
            const pyodide = await initPyodide();

            // Sync all workspace files into Pyodide virtual filesystem!
            // This enables multi-file Python imports (e.g. from helper import ...)
            state.files.forEach(f => {
                const code = f.model ? f.model.getValue() : f.content;
                pyodide.FS.writeFile(f.name, code);
            });

            // Prepare stdout and stderr capture
            let stdoutLogs = [];
            let stderrLogs = [];

            pyodide.setStdout({
                batched: (text) => {
                    stdoutLogs.push(text);
                    appendOutput(text + '\n', 'log-stdout');
                }
            });

            pyodide.setStderr({
                batched: (text) => {
                    stderrLogs.push(text);
                    appendOutput(text + '\n', 'log-stderr');
                }
            });

            const codeToRun = file.model ? file.model.getValue() : file.content;

            // Execute Python code
            await pyodide.runPythonAsync(codeToRun);

            const elapsed = Math.round(performance.now() - startTime);
            dom.panelStatus.textContent = `Completed (${elapsed}ms)`;
            dom.panelStatus.className = 'panel-status-tag success';

            appendOutput(`\n[System] Program finished in ${elapsed}ms.\n`, 'log-system');
        } catch (err) {
            const elapsed = Math.round(performance.now() - startTime);
            dom.panelStatus.textContent = 'Error';
            dom.panelStatus.className = 'panel-status-tag error';
            appendOutput(`\n${err.message || err}\n`, 'log-stderr');
            appendOutput(`[System] Process terminated with error after ${elapsed}ms.\n`, 'log-system');
        }
    }

    function appendOutput(text, className) {
        const span = document.createElement('span');
        span.className = className || 'log-stdout';
        span.textContent = text;
        dom.panelOutput.appendChild(span);
        dom.panelOutput.scrollTop = dom.panelOutput.scrollHeight;
    }

    // ---- MODALS & SHORTCUTS ----
    function openNewFileModal() {
        dom.newFileModal.classList.add('open');
        dom.newFileInput.value = '';
        dom.newFileInput.focus();
    }

    function closeNewFileModal() {
        dom.newFileModal.classList.remove('open');
    }

    function submitNewFile() {
        const name = dom.newFileInput.value.trim();
        if (!name) return;
        closeNewFileModal();
        addFileToWorkspace(name, `# ${name}\n`, true);
        showToast(`Created ${name}`, 'success');
    }

    function openSettingsModal() {
        dom.settingsModal.classList.add('open');
        document.getElementById('setting-font-size').value = state.settings.fontSize;
        document.getElementById('setting-tab-size').value = state.settings.tabSize;
        document.getElementById('setting-word-wrap').value = state.settings.wordWrap;
        document.getElementById('setting-minimap').checked = state.settings.minimap;
        document.getElementById('setting-theme').value = state.settings.theme;
    }

    function closeSettingsModal() {
        dom.settingsModal.classList.remove('open');
    }

    function applySettings() {
        state.settings.fontSize = parseInt(document.getElementById('setting-font-size').value, 10) || 14;
        state.settings.tabSize = parseInt(document.getElementById('setting-tab-size').value, 10) || 4;
        state.settings.wordWrap = document.getElementById('setting-word-wrap').value;
        state.settings.minimap = document.getElementById('setting-minimap').checked;
        state.settings.theme = document.getElementById('setting-theme').value;

        if (state.editor) {
            state.editor.updateOptions({
                fontSize: state.settings.fontSize,
                tabSize: state.settings.tabSize,
                wordWrap: state.settings.wordWrap,
                minimap: { enabled: state.settings.minimap }
            });
            monaco.editor.setTheme(state.settings.theme);
        }

        saveSettings();
        closeSettingsModal();
        showToast('Settings saved', 'success');
    }

    function openQuickOpenModal() {
        dom.quickOpenModal.classList.add('open');
        dom.quickOpenInput.value = '';
        dom.quickOpenInput.focus();
        renderQuickOpenResults('');
    }

    function closeQuickOpenModal() {
        dom.quickOpenModal.classList.remove('open');
    }

    function renderQuickOpenResults(query) {
        dom.quickOpenResults.innerHTML = '';
        const q = query.toLowerCase().trim();

        const filtered = state.files.filter(f => !q || f.name.toLowerCase().includes(q));

        if (filtered.length === 0) {
            dom.quickOpenResults.innerHTML = '<div style="padding:12px;color:var(--text-muted);text-align:center;">No matching files found</div>';
            return;
        }

        filtered.forEach(file => {
            const item = document.createElement('div');
            item.className = 'quick-open-item';
            item.innerHTML = `
                <span class="file-ext-icon ${getExtClass(file.name)}">${getExtIconText(file.name)}</span>
                <span>${escapeHtml(file.name)}</span>
            `;
            item.addEventListener('click', () => {
                setActiveFile(file.id);
                closeQuickOpenModal();
            });
            dom.quickOpenResults.appendChild(item);
        });
    }

    // ---- URL PARAMETERS HANDLER ----
    // Allows opening files directly from file-vault, e.g. editor.html?file=compare.py
    function handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const fileToLoad = urlParams.get('file');

        if (fileToLoad) {
            // Check if already in workspace
            const existing = state.files.find(f => f.name.toLowerCase() === fileToLoad.toLowerCase());
            if (existing) {
                setActiveFile(existing.id);
                return;
            }

            // Fetch file from files/ folder
            fetch('files/' + encodeURIComponent(fileToLoad))
                .then(res => {
                    if (!res.ok) throw new Error('File not found in vault');
                    return res.text();
                })
                .then(content => {
                    const newFile = addFileToWorkspace(fileToLoad, content, true);
                    showToast(`Loaded ${fileToLoad} from Vault!`, 'success');
                })
                .catch(err => {
                    console.warn('Could not fetch vault file:', err);
                });
        }
    }

    // ---- TOAST HELPER ----
    function showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        else if (type === 'warning') icon = '⚠️';
        else if (type === 'error') icon = '❌';

        toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.2s ease';
            setTimeout(() => toast.remove(), 200);
        }, 2600);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ---- EVENT LISTENERS SETUP ----
    function setupEventListeners() {
        // Toolbar actions
        document.getElementById('btn-open-files').addEventListener('click', () => dom.fileInput.click());
        document.getElementById('btn-open-folder').addEventListener('click', () => dom.folderInput.click());
        document.getElementById('btn-new-file').addEventListener('click', openNewFileModal);
        document.getElementById('btn-save-file').addEventListener('click', () => {
            saveActiveFile();
            showToast('Saved file to local workspace', 'success');
        });
        document.getElementById('btn-run-code').addEventListener('click', runActiveCode);
        document.getElementById('btn-download-file').addEventListener('click', downloadActiveFile);
        document.getElementById('btn-export-zip').addEventListener('click', exportWorkspaceAsZip);
        document.getElementById('btn-settings').addEventListener('click', openSettingsModal);

        // Zen mode toggle
        document.getElementById('btn-toggle-zen').addEventListener('click', () => {
            dom.sidebar.classList.toggle('collapsed');
        });

        // Sidebar actions
        document.getElementById('sidebar-new-file-btn').addEventListener('click', openNewFileModal);
        document.getElementById('sidebar-import-btn').addEventListener('click', () => dom.fileInput.click());
        document.getElementById('sidebar-collapse-btn').addEventListener('click', () => {
            dom.sidebar.classList.add('collapsed');
        });

        // Sidebar search filter
        dom.sidebarSearchInput = document.getElementById('sidebar-search-input');
        dom.sidebarSearchInput.addEventListener('input', renderFileTree);

        // New tab '+' button
        document.getElementById('btn-new-tab').addEventListener('click', openNewFileModal);

        // Empty state buttons
        document.getElementById('empty-create-btn').addEventListener('click', openNewFileModal);
        document.getElementById('empty-import-btn').addEventListener('click', () => dom.fileInput.click());

        // File Inputs
        dom.fileInput.addEventListener('change', (e) => {
            handleMultipleFilesImport(e.target.files);
            dom.fileInput.value = '';
        });

        dom.folderInput.addEventListener('change', (e) => {
            handleMultipleFilesImport(e.target.files);
            dom.folderInput.value = '';
        });

        // Drag & Drop onto Window & Sidebar
        window.addEventListener('dragover', (e) => {
            e.preventDefault();
            dom.sidebarDropOverlay.classList.add('dragover');
        });

        window.addEventListener('dragleave', (e) => {
            if (e.clientX <= 0 || e.clientY <= 0) {
                dom.sidebarDropOverlay.classList.remove('dragover');
            }
        });

        window.addEventListener('drop', (e) => {
            e.preventDefault();
            dom.sidebarDropOverlay.classList.remove('dragover');
            if (e.dataTransfer && e.dataTransfer.files) {
                handleMultipleFilesImport(e.dataTransfer.files);
            }
        });

        // Output Panel controls
        document.getElementById('btn-clear-panel').addEventListener('click', () => {
            dom.panelOutput.innerHTML = '';
        });
        document.getElementById('btn-close-panel').addEventListener('click', () => {
            dom.outputPanel.classList.add('hidden');
        });
        document.getElementById('status-toggle-panel').addEventListener('click', () => {
            dom.outputPanel.classList.toggle('hidden');
        });

        // Modals
        document.getElementById('modal-close-new-file').addEventListener('click', closeNewFileModal);
        document.getElementById('modal-cancel-new-file').addEventListener('click', closeNewFileModal);
        document.getElementById('modal-submit-new-file').addEventListener('click', submitNewFile);
        dom.newFileInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submitNewFile();
            if (e.key === 'Escape') closeNewFileModal();
        });

        document.getElementById('modal-close-settings').addEventListener('click', closeSettingsModal);
        document.getElementById('modal-cancel-settings').addEventListener('click', closeSettingsModal);
        document.getElementById('modal-save-settings').addEventListener('click', applySettings);

        // Quick Open
        dom.quickOpenInput.addEventListener('input', (e) => {
            renderQuickOpenResults(e.target.value);
        });
        dom.quickOpenInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeQuickOpenModal();
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                dom.sidebar.classList.toggle('collapsed');
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                openQuickOpenModal();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === '`') {
                e.preventDefault();
                dom.outputPanel.classList.toggle('hidden');
            }
            if (e.key === 'Escape') {
                closeNewFileModal();
                closeSettingsModal();
                closeQuickOpenModal();
            }
        });

        // Close modals on backdrop click
        [dom.newFileModal, dom.settingsModal, dom.quickOpenModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('open');
                }
            });
        });
    }

    // ---- INIT ENTRY POINT ----
    function init() {
        loadSavedSettings();
        setupEventListeners();
        if (window.innerWidth <= 768) {
            dom.sidebar.classList.add('collapsed');
        }
        initMonaco();
    }

    window.addEventListener('DOMContentLoaded', init);

})();
