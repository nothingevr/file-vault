# 🔐 File Vault

A simple personal file download website hosted free on GitHub Pages.
Password protected. No backend needed. No Cloudflare. No complexity.

---

## What it does

- Shows a password screen
- After correct password, shows all your files as cards
- Search and filter by category
- Click Download to get any file

---

## Setup — Step by Step

### 1. Create the folder and files

```bash
mkdir file-vault
cd file-vault
```

Create these files and folders exactly:

```
file-vault/
├── index.html
├── style.css
├── script.js
├── data/
│   └── files.json
├── files/
│   └── (your actual files go here)
└── README.md
```

---

### 2. Set your password

Open `script.js` and change this line:

```javascript
const PASSWORD = 'myvault123';
```

Change `myvault123` to whatever password you want.

---

### 3. Add your files

Copy your files into the `files/` folder:

```bash
cp ~/Downloads/Physics.pdf files/
cp ~/Pictures/photo.jpg files/
```

---

### 4. Update files.json

Open `data/files.json` and add an entry for each file:

```json
[
    {
        "name": "Physics Notes",
        "category": "School",
        "file": "Physics.pdf",
        "size": "4 MB"
    },
    {
        "name": "Holiday Photo",
        "category": "Personal",
        "file": "photo.jpg",
        "size": "2.1 MB"
    }
]
```

Fields:
- `name` — display name on the card
- `category` — used for the filter buttons
- `file` — exact filename in the `files/` folder
- `size` — shown on the card (you type this manually)

---

### 5. Create the GitHub repository

Install GitHub CLI from https://cli.github.com then run:

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create file-vault --public --source=. --push
```

Or without GitHub CLI:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/file-vault.git
git branch -M main
git push -u origin main
```

---

### 6. Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings**
3. Click **Pages** in the left sidebar
4. Under **Source** select **Deploy from a branch**
5. Choose branch: **main** and folder: **/ (root)**
6. Click **Save**
7. Wait about 1 minute
8. Your site is live at:

```
https://YOUR_USERNAME.github.io/file-vault/
```

---

## Adding more files later

```bash
# Copy new file into files/
cp ~/Downloads/NewFile.pdf files/

# Edit data/files.json and add the entry

# Push to GitHub
git add .
git commit -m "Add NewFile.pdf"
git push
```

The site updates automatically within a minute.

---

## Removing a file

1. Delete the file from `files/`
2. Remove its entry from `data/files.json`
3. Push:

```bash
git add .
git commit -m "Remove old file"
git push
```

---

## Changing your password

Open `script.js`, change the PASSWORD line, then push:

```bash
git add script.js
git commit -m "Update password"
git push
```

---

## Useful Git commands

```bash
# See what changed
git status

# Pull latest from GitHub
git pull

# Add all changes
git add .

# Commit
git commit -m "Your message here"

# Push
git push

# Clone onto a new computer
git clone https://github.com/YOUR_USERNAME/file-vault.git

# Create a release tag
git tag v1.0
git push origin v1.0
```

---

## File size limit

GitHub has a **100 MB limit per file**.

For bigger files use Git LFS:

```bash
# Install Git LFS
git lfs install

# Track big file types
git lfs track "*.mp4"
git lfs track "*.zip"

git add .gitattributes
git add files/bigvideo.mp4
git commit -m "Add large file"
git push
```

---

## Cost

| Thing | Cost |
|---|---|
| GitHub Pages | Free |
| GitHub storage (under 1 GB) | Free |
| Custom domain | Optional |

**Total: $0**

---

## Note on security

The password is stored in `script.js` which is a public file.
Anyone who views the page source can find it.

This is fine for keeping casual visitors out.
Do not store truly sensitive files here.
For real security you would need a private repo and a real backend.
