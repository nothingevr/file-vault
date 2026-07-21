// ============================================================
// FILE VAULT - script.js
//
// HOW IT WORKS:
// 1. User enters a password on the login screen.
// 2. The password is compared to the PASSWORD constant below.
// 3. If correct, the file grid is shown.
// 4. Files are loaded from data/files.json.
// 5. Download links point to files/ folder on GitHub Pages.
//
// TO CHANGE YOUR PASSWORD: edit the PASSWORD value below.
// ============================================================

// ---- CHANGE THIS TO YOUR PASSWORD ----
const PASSWORD = 'admin';
// ---------------------------------------

// Files are stored in the files/ folder of your repo
const FILES_FOLDER = 'files/';

// Path to the JSON catalog
const FILES_JSON = 'data/files.json';

// ---- DOM ELEMENTS ----
const loginScreen  = document.getElementById('login-screen');
const app          = document.getElementById('app');
const loginForm    = document.getElementById('login-form');
const passwordInput= document.getElementById('password-input');
const errorMsg     = document.getElementById('error-msg');
const logoutBtn    = document.getElementById('logout-btn');
const searchInput  = document.getElementById('search');
const categoryBar  = document.getElementById('category-bar');
const fileGrid     = document.getElementById('file-grid');
const noResults    = document.getElementById('no-results');

// Holds all files loaded from JSON
let allFiles = [];
let activeCategory = 'All';

// ---- LOGIN ----
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var entered = passwordInput.value;

    if (entered === PASSWORD) {
        // Save session so page refresh keeps user logged in
        sessionStorage.setItem('vault_auth', 'yes');
        showApp();
    } else {
        errorMsg.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();
        // Shake the box to indicate wrong password
        var box = document.querySelector('.login-box');
        box.style.animation = 'none';
        void box.offsetWidth; // force reflow
        box.style.animation = 'shake 0.4s ease';
    }
});

// ---- LOGOUT ----
logoutBtn.addEventListener('click', function() {
    sessionStorage.removeItem('vault_auth');
    location.reload();
});

// ---- SHOW APP ----
function showApp() {
    loginScreen.classList.add('hidden');
    app.classList.remove('hidden');
    loadFiles();
}

// ---- CHECK EXISTING SESSION ----
if (sessionStorage.getItem('vault_auth') === 'yes') {
    showApp();
}

// ---- LOAD FILES FROM JSON ----
function loadFiles() {
    fetch(FILES_JSON + '?t=' + Date.now())
        .then(function(res) {
            if (!res.ok) throw new Error('Could not load files.json');
            return res.json();
        })
        .then(function(data) {
            allFiles = data;
            buildCategories();
            renderFiles(allFiles);
        })
        .catch(function(err) {
            fileGrid.innerHTML = '<p style="color:#f87171;padding:20px;">Could not load files.json. Make sure the file exists.</p>';
            console.error(err);
        });
}

// ---- BUILD CATEGORY BUTTONS ----
function buildCategories() {
    // Collect unique categories
    var cats = ['All'];
    allFiles.forEach(function(f) {
        if (f.category && cats.indexOf(f.category) === -1) {
            cats.push(f.category);
        }
    });

    categoryBar.innerHTML = '';

    cats.forEach(function(cat) {
        var btn = document.createElement('button');
        btn.className = 'cat-btn' + (cat === 'All' ? ' active' : '');
        btn.textContent = cat;
        btn.addEventListener('click', function() {
            activeCategory = cat;
            // Update active state
            document.querySelectorAll('.cat-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            applyFilters();
        });
        categoryBar.appendChild(btn);
    });
}

// ---- SEARCH ----
searchInput.addEventListener('input', function() {
    applyFilters();
});

// ---- APPLY BOTH CATEGORY + SEARCH FILTERS ----
function applyFilters() {
    var query = searchInput.value.toLowerCase().trim();

    var filtered = allFiles.filter(function(f) {
        var matchCat = (activeCategory === 'All') || (f.category === activeCategory);
        var matchSearch = !query ||
            f.name.toLowerCase().includes(query) ||
            f.file.toLowerCase().includes(query) ||
            (f.category && f.category.toLowerCase().includes(query));
        return matchCat && matchSearch;
    });

    renderFiles(filtered);
}

// ---- RENDER FILE CARDS ----
function renderFiles(files) {
    fileGrid.innerHTML = '';

    if (files.length === 0) {
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');

    files.forEach(function(file) {
        var card = document.createElement('div');
        card.className = 'file-card';

        var icon = getIcon(file.file);
        var iconClass = getIconClass(file.file);
        var fileUrl = FILES_FOLDER + file.file;

        card.innerHTML =
            '<div class="card-top">' +
                '<div class="file-icon ' + iconClass + '">' + icon + '</div>' +
                '<div class="card-info">' +
                    '<h3 title="' + esc(file.name) + '">' + esc(file.name) + '</h3>' +
                    '<div class="card-meta">' + esc(file.file) + ' &bull; ' + esc(file.size || '?') + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="card-bottom">' +
                '<span class="category-tag">' + esc(file.category || 'Other') + '</span>' +
                '<a class="download-btn" href="' + fileUrl + '" download="' + esc(file.file) + '">' +
                    '⬇ Download' +
                '</a>' +
            '</div>';

        fileGrid.appendChild(card);
    });
}

// ---- HELPERS ----

// Pick an emoji icon based on file extension
function getIcon(filename) {
    var ext = filename.split('.').pop().toLowerCase();
    var map = {
        pdf: '📄',
        jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', svg: '🖼️',
        mp4: '🎬', mov: '🎬', avi: '🎬', webm: '🎬', mkv: '🎬',
        mp3: '🎵', wav: '🎵', flac: '🎵', aac: '🎵', m4a: '🎵',
        doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📊', pptx: '📊',
        txt: '📝', csv: '📊',
        zip: '🗜️', rar: '🗜️', '7z': '🗜️', tar: '🗜️', gz: '🗜️',
    };
    return map[ext] || '📁';
}

// Pick a CSS class for the icon background colour
function getIconClass(filename) {
    var ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'image';
    if (['mp4','mov','avi','webm','mkv'].includes(ext)) return 'video';
    if (['mp3','wav','flac','aac','m4a'].includes(ext)) return 'audio';
    if (['doc','docx','xls','xlsx','ppt','pptx','txt','csv'].includes(ext)) return 'doc';
    if (['zip','rar','7z','tar','gz'].includes(ext)) return 'zip';
    return 'other';
}

// Escape HTML to prevent XSS
function esc(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
}
