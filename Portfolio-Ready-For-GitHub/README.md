# Modern Dark Minimalist Portfolio with CMS & Admin Dashboard

A high-performance personal portfolio website inspired by [xlrrr8.github.io/Aaryansama](https://xlrrr8.github.io/Aaryansama/), enhanced with custom organic doodle wallpapers, an interactive **Blog Section**, dynamic article reader, and a complete **Admin Dashboard** allowing live content editing, image uploads, and GitHub synchronization.

---

## 🚀 Live Demo & Structure

- **Portfolio Site (`index.html`)**: The public portfolio featuring smooth Lenis scrolling, GSAP micro-animations, theme color switcher, projects accordion, blog reader, and interactive timeline.
- **Admin Dashboard (`admin.html`)**: A private control center to edit texts, upload portraits, write blog articles, add projects, and sync changes live.

> **Note**: For privacy and clean aesthetics, no "Admin" button is displayed to public visitors on the portfolio. You can access the dashboard directly via `yourdomain.com/admin.html` or by pressing `Ctrl + Shift + A` (or `Cmd + Shift + A` on Mac).

---

## 📁 Project Contents

```text
├── index.html                   # Main public portfolio website
├── admin.html                   # Private CMS & Admin Dashboard
├── styles.css                   # Core styling, dark glassmorphism, animations
├── blog_styles.css              # Blog grid, article reader modal, and tag styling
├── admin.css                    # Admin control center styling
├── script.js                    # Smooth scrolling, GSAP parallax, theme switcher
├── portfolio_cms.js             # Real-time data loader & cross-tab sync engine
├── admin.js                     # Admin dashboard logic, image upload, GitHub sync
├── portfolio_data.json          # Master data file (Hero, About, Projects, Blog, Contact)
├── server.py                    # Lightweight Python backend server (optional for local/VPS)
├── profile.png                  # Hero portrait (clean transparent cutout)
├── about-profile.png            # About section portrait (clean transparent cutout)
├── cinematic_tech_bg.png        # Ambient cyber-lime background wallpaper
├── assets/
│   ├── doodle_purple.jpg        # High-res purple organic doodle pattern
│   ├── doodle_purple_ambient.png# Ambient vignette purple wallpaper
│   ├── doodle_bg.jpg            # Lime green contour doodle pattern
│   ├── portrait_straight.jpg    # Original straight-facing photo
│   └── portrait_angled.jpg      # Original angled photo
├── uploads/                     # Upload directory for newly uploaded images
├── *.png                        # Project card artwork (deepfake, voice, birthday, chess, etc.)
└── resume.pdf                   # Resume document
```

---

## ⚡ How to Run Locally

You can run the portfolio locally using the included Python server:

```powershell
# Open terminal in the project folder and run:
python server.py
```

Then open:
- **Live Portfolio**: `http://localhost:8080/index.html`
- **Admin Dashboard**: `http://localhost:8080/admin.html`

*(You can also simply double-click `index.html` or `admin.html` in any browser!)*

---

## 🌐 How to Upload to GitHub (GitHub Pages)

### Step 1: Create a GitHub Repository
1. Log in to [GitHub](https://github.com) and click **New Repository**.
2. Name it (for example `portfolio` or `Aaryansama`). Set it to **Public**.

### Step 2: Upload Files
- Extract the ZIP file and push the files to your repository:
```bash
git init
git add .
git commit -m "Initial commit of portfolio and admin dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```
*(Or simply drag and drop the extracted files directly into the GitHub web interface!)*

### Step 3: Enable GitHub Pages
1. Go to your repository **Settings** -> **Pages** (on the left sidebar).
2. Under **Build and deployment**, select:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or `gh-pages`), folder: `/ (root)`
3. Click **Save**.
4. Within 1–2 minutes, your website is live at:
   `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

---

## 🛠️ How Live Updates Work in the Admin Dashboard

When you open `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/admin.html`, you have 3 convenient ways to update your site:

### Method 1: Direct GitHub Sync (Worldwide Live Update)
1. In `admin.html`, go to the **GitHub Live Sync** tab.
2. Enter your Repository (`YOUR_USERNAME/YOUR_REPO_NAME`), Branch (`main`), and a [GitHub Personal Access Token](https://github.com/settings/tokens) with `repo` permissions.
3. Click **Save Token**.
4. Now, whenever you edit text, write a blog post, or add a project, click **Publish to GitHub Live Site**.
5. It commits the updated `portfolio_data.json` directly to your GitHub repo, automatically updating the live site for all visitors worldwide in seconds!

### Method 2: One-Click JSON Export
1. Click the **Export JSON** button in the top bar of `admin.html`.
2. It downloads the updated `portfolio_data.json`.
3. Drag and drop this file into your GitHub repository on github.com and commit.

### Method 3: Instant Local & Browser Sync
- When you click **Save All Changes**, the updates are instantly cached in `localStorage` and sent to `server.py` (if running).
- If your portfolio tab is open, it updates live in real time without reloading!

---

## 🎨 Theme & Wallpaper Customization

In the **Background & Theme** tab of the Admin Dashboard:
- Choose between the **Purple Organic Doodle** and **Lime Neon Contour** wallpapers.
- Upload any custom background image.
- Choose your default theme accent color (*Ultraviolet*, *Cyber Lime*, *Electric Blue*, *Emerald*, *Rose*, *Terracotta*).
