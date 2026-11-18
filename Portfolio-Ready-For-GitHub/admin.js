/**
 * Portfolio Admin Dashboard Logic
 * Provides full control over portfolio data, image uploads, project & blog management.
 */

let portfolioData = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadAdminData();
    bindActionButtons();
    bindImageUploaders();
    bindSwatches();
});

// Tab Switching
function initTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const panels = document.querySelectorAll('.tab-panel');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.dataset.tab;
            navItems.forEach(n => n.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            item.classList.add('active');
            const targetPanel = document.getElementById(tabId);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });
}

// Load Data from Server or Local Cache
async function loadAdminData() {
    try {
        const res = await fetch('/api/data?t=' + Date.now());
        if (res.ok) {
            portfolioData = await res.json();
        } else {
            throw new Error('Server returned ' + res.status);
        }
    } catch (e) {
        console.warn('Falling back to local cache or portfolio_data.json:', e);
        const cached = localStorage.getItem('portfolio_cms_cache');
        if (cached) {
            portfolioData = JSON.parse(cached);
        } else {
            const fallback = await fetch('portfolio_data.json');
            portfolioData = await fallback.json();
        }
    }

    if (portfolioData) {
        populateFormFields(portfolioData);
        renderProjectsList(portfolioData.projects || []);
        renderBlogList(portfolioData.blog || []);
    }
}

// Populate UI Form Fields
function populateFormFields(data) {
    // 1. Hero
    if (data.hero) {
        const h = data.hero;
        setVal('heroGreetingHi', h.greetingHi || 'Hi');
        setVal('heroGreetingIm', h.greetingIm || "I'm");
        setVal('heroNameFirst', h.nameFirst || '');
        setVal('heroNameLast', h.nameLast || '');
        setVal('heroRoleTag', h.roleTag || '');
        setVal('heroRoleMain1', h.roleMainLine1 || 'WEB');
        setVal('heroRoleMain2', h.roleMainLine2 || 'DEVELOPER');
        setVal('heroBio', h.bio || '');
        
        if (h.profileImage) {
            setVal('heroPortraitPath', h.profileImage);
            document.getElementById('heroPortraitPreview').src = h.profileImage;
        }
    }

    // 2. About
    if (data.about) {
        const a = data.about;
        setVal('aboutBio1', a.bioParagraph1 || '');
        setVal('aboutBio2', a.bioParagraph2 || '');
        setVal('aboutQuote', a.quote || '');
        if (a.portraitImage) {
            setVal('aboutPortraitPath', a.portraitImage);
            document.getElementById('aboutPortraitPreview').src = a.portraitImage;
        }
    }

    // 3. Theme & Background
    if (data.theme) {
        const t = data.theme;
        setVal('themeAccentHex', t.accent || '#9d4edd');
        updateAccentColor(t.accent || '#9d4edd');

        const activeBg = t.bgImage || 'assets/doodle_purple_ambient.png';
        setVal('customBgPath', activeBg);

        if (activeBg.includes('doodle_purple')) {
            document.getElementById('bgOptPurple').checked = true;
        } else if (activeBg.includes('cinematic_tech_bg') || activeBg.includes('doodle_bg')) {
            document.getElementById('bgOptLime').checked = true;
        }
    }

    // 4. Contact
    if (data.contact) {
        const c = data.contact;
        setVal('contactEmail', c.email || '');
        setVal('contactLocation', c.location || '');
        setVal('contactGithub', c.github || '');
        setVal('contactLinkedin', c.linkedin || '');
        setVal('contactInstagram', c.instagram || '');
        setVal('contactPinterest', c.pinterest || '');
        setVal('contactChess', c.chess || '');
    }
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

// Bind Action Buttons
function bindActionButtons() {
    // Save All Changes
    document.getElementById('saveAllBtn').addEventListener('click', saveAllData);

    // Reset Defaults
    document.getElementById('resetBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset all portfolio fields to factory defaults?')) {
            const res = await fetch('portfolio_data.json');
            portfolioData = await res.json();
            populateFormFields(portfolioData);
            renderProjectsList(portfolioData.projects || []);
            renderBlogList(portfolioData.blog || []);
            await saveAllData();
            showToast('Reset to defaults complete!');
        }
    });

    // Background Radio Change
    document.querySelectorAll('input[name="bgPatternOption"]').forEach(radio => {
        radio.addEventListener('change', () => {
            setVal('customBgPath', radio.value);
            if (!portfolioData.theme) portfolioData.theme = {};
            portfolioData.theme.bgImage = radio.value;
        });
    });

    // Hex Color Input
    const hexInput = document.getElementById('themeAccentHex');
    if (hexInput) {
        hexInput.addEventListener('input', (e) => {
            updateAccentColor(e.target.value);
        });
    }

    // Export JSON file download
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDataFile);
    }

    // GitHub Sync buttons
    const saveGhBtn = document.getElementById('saveGhConfigBtn');
    if (saveGhBtn) {
        saveGhBtn.addEventListener('click', saveGitHubConfig);
    }
    const pubGhBtn = document.getElementById('publishGhBtn');
    if (pubGhBtn) {
        pubGhBtn.addEventListener('click', publishToGitHub);
    }

    // Restore GitHub config from localStorage
    restoreGitHubConfig();

    // Project Modal bindings
    document.getElementById('addNewProjectBtn').addEventListener('click', () => openProjectModal(-1));
    document.getElementById('closeProjectModal').addEventListener('click', closeProjectModal);
    document.getElementById('cancelProjectBtn').addEventListener('click', closeProjectModal);
    document.getElementById('saveProjectBtn').addEventListener('click', saveProjectFromModal);

    // Blog Modal bindings
    document.getElementById('addNewBlogBtn').addEventListener('click', () => openBlogModal(-1));
    document.getElementById('closeBlogEditorModal').addEventListener('click', closeBlogModal);
    document.getElementById('cancelBlogBtn').addEventListener('click', closeBlogModal);
    document.getElementById('saveBlogBtn').addEventListener('click', saveBlogFromModal);
}

// Swatches & Theme Accent
function bindSwatches() {
    document.querySelectorAll('.admin-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            const color = swatch.dataset.color;
            setVal('themeAccentHex', color);
            updateAccentColor(color);
            document.querySelectorAll('.admin-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
        });
    });
}

function updateAccentColor(color) {
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-glow', color + '55');
}

// Image Uploaders
function bindImageUploaders() {
    // 1. Hero Portrait
    setupImageUploader('heroPortraitUpload', (url) => {
        setVal('heroPortraitPath', url);
        document.getElementById('heroPortraitPreview').src = url;
        showToast('Hero portrait uploaded successfully!');
    });

    // 2. About Portrait
    setupImageUploader('aboutPortraitUpload', (url) => {
        setVal('aboutPortraitPath', url);
        document.getElementById('aboutPortraitPreview').src = url;
        showToast('About portrait uploaded successfully!');
    });

    // 3. Custom Background
    setupImageUploader('customBgUpload', (url) => {
        setVal('customBgPath', url);
        document.querySelectorAll('input[name="bgPatternOption"]').forEach(r => r.checked = false);
        showToast('Custom background uploaded successfully!');
    });

    // 4. Project Modal Image
    setupImageUploader('editProjImgUpload', (url) => {
        setVal('editProjImgPath', url);
        document.getElementById('editProjImgPreview').src = url;
    });

    // 5. Blog Modal Image
    setupImageUploader('editBlogImgUpload', (url) => {
        setVal('editBlogImgPath', url);
        document.getElementById('editBlogImgPreview').src = url;
    });
}

function setupImageUploader(inputId, onSuccess) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Convert to base64
        const reader = new FileReader();
        reader.onload = async () => {
            const base64Data = reader.result;
            try {
                // Upload via API
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: file.name,
                        data: base64Data
                    })
                });

                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.url) {
                        onSuccess(json.url);
                        return;
                    }
                }
                throw new Error('Upload failed on server');
            } catch (err) {
                console.warn('API upload error, using local base64 fallback:', err);
                // Fallback to direct data URI for standalone preview
                onSuccess(base64Data);
            }
        };
        reader.readAsDataURL(file);
    });
}

// PROJECTS CRUD
function renderProjectsList(projects) {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:30px;">No projects added yet.</p>';
        return;
    }

    container.innerHTML = projects.map((p, index) => `
        <div class="admin-list-item">
            <div class="item-left">
                <div class="item-thumb">
                    <img src="${p.image || 'assets/doodle_purple.jpg'}" alt="${p.title}" onerror="this.src='assets/doodle_purple.jpg'">
                </div>
                <div class="item-meta">
                    <h4>${p.title}</h4>
                    <p><span style="color:var(--accent);">${p.category || 'Project'}</span> &bull; ${p.badge || 'Active'}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-icon-edit" onclick="openProjectModal(${index})" title="Edit Project"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon-delete" onclick="deleteProject(${index})" title="Delete Project"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

window.openProjectModal = function (index) {
    document.getElementById('editProjIndex').value = index;
    if (index === -1) {
        // New project
        document.getElementById('projectModalTitle').textContent = 'Add New Project';
        setVal('editProjTitle', '');
        setVal('editProjCategory', 'Full Stack');
        setVal('editProjBadge', 'New');
        setVal('editProjDesc', '');
        setVal('editProjTags', 'React, Node.js');
        setVal('editProjLive', '#');
        setVal('editProjGithub', '#');
        setVal('editProjImgPath', 'deepfake_detect_bg.png');
        document.getElementById('editProjImgPreview').src = 'deepfake_detect_bg.png';
    } else {
        const p = portfolioData.projects[index];
        document.getElementById('projectModalTitle').textContent = 'Edit Project: ' + p.title;
        setVal('editProjTitle', p.title || '');
        setVal('editProjCategory', p.category || '');
        setVal('editProjBadge', p.badge || '');
        setVal('editProjDesc', p.description || '');
        setVal('editProjTags', Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''));
        setVal('editProjLive', p.liveUrl || '');
        setVal('editProjGithub', p.githubUrl || '');
        setVal('editProjImgPath', p.image || '');
        document.getElementById('editProjImgPreview').src = p.image || 'assets/doodle_purple.jpg';
    }

    document.getElementById('projectModal').classList.add('active');
};

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

function saveProjectFromModal() {
    const index = parseInt(document.getElementById('editProjIndex').value, 10);
    const tagsArr = getVal('editProjTags').split(',').map(t => t.trim()).filter(Boolean);

    const projectObj = {
        id: 'proj-' + Date.now(),
        title: getVal('editProjTitle') || 'Untitled Project',
        category: getVal('editProjCategory') || 'Web App',
        badge: getVal('editProjBadge') || 'Live',
        description: getVal('editProjDesc'),
        tags: tagsArr,
        liveUrl: getVal('editProjLive'),
        githubUrl: getVal('editProjGithub'),
        image: getVal('editProjImgPath') || 'assets/doodle_purple.jpg'
    };

    if (!portfolioData.projects) portfolioData.projects = [];

    if (index === -1) {
        portfolioData.projects.push(projectObj);
        showToast('New project created!');
    } else {
        portfolioData.projects[index] = { ...portfolioData.projects[index], ...projectObj };
        showToast('Project updated!');
    }

    renderProjectsList(portfolioData.projects);
    closeProjectModal();
}

window.deleteProject = function (index) {
    if (confirm('Delete this project?')) {
        portfolioData.projects.splice(index, 1);
        renderProjectsList(portfolioData.projects);
        showToast('Project deleted');
    }
};

// BLOG ARTICLES CRUD
function renderBlogList(articles) {
    const container = document.getElementById('blogArticlesContainer');
    if (!container) return;

    if (articles.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:30px;">No articles written yet.</p>';
        return;
    }

    container.innerHTML = articles.map((a, index) => `
        <div class="admin-list-item">
            <div class="item-left">
                <div class="item-thumb">
                    <img src="${a.image || 'assets/doodle_purple.jpg'}" alt="${a.title}" onerror="this.src='assets/doodle_purple.jpg'">
                </div>
                <div class="item-meta">
                    <h4>${a.title}</h4>
                    <p><span style="color:var(--accent);">${a.category || 'Article'}</span> &bull; ${a.date || 'Recent'} &bull; ${a.readTime || '3 min read'}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-icon-edit" onclick="openBlogModal(${index})" title="Edit Article"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon-delete" onclick="deleteBlog(${index})" title="Delete Article"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

window.openBlogModal = function (index) {
    document.getElementById('editBlogIndex').value = index;
    if (index === -1) {
        // New article
        document.getElementById('blogEditorModalTitle').textContent = 'Write New Article';
        setVal('editBlogTitle', '');
        setVal('editBlogCategory', 'UI/UX Design');
        setVal('editBlogReadTime', '4 min read');
        setVal('editBlogExcerpt', '');
        setVal('editBlogContent', '');
        setVal('editBlogImgPath', 'assets/doodle_purple.jpg');
        document.getElementById('editBlogImgPreview').src = 'assets/doodle_purple.jpg';
    } else {
        const a = portfolioData.blog[index];
        document.getElementById('blogEditorModalTitle').textContent = 'Edit Article: ' + a.title;
        setVal('editBlogTitle', a.title || '');
        setVal('editBlogCategory', a.category || '');
        setVal('editBlogReadTime', a.readTime || '');
        setVal('editBlogExcerpt', a.excerpt || '');
        setVal('editBlogContent', a.content || '');
        setVal('editBlogImgPath', a.image || '');
        document.getElementById('editBlogImgPreview').src = a.image || 'assets/doodle_purple.jpg';
    }

    document.getElementById('blogModalEditor').classList.add('active');
};

function closeBlogModal() {
    document.getElementById('blogModalEditor').classList.remove('active');
}

function saveBlogFromModal() {
    const index = parseInt(document.getElementById('editBlogIndex').value, 10);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const blogObj = {
        id: 'article-' + Date.now(),
        title: getVal('editBlogTitle') || 'Untitled Article',
        category: getVal('editBlogCategory') || 'Thoughts',
        readTime: getVal('editBlogReadTime') || '4 min read',
        date: dateStr,
        excerpt: getVal('editBlogExcerpt'),
        content: getVal('editBlogContent'),
        image: getVal('editBlogImgPath') || 'assets/doodle_purple.jpg'
    };

    if (!portfolioData.blog) portfolioData.blog = [];

    if (index === -1) {
        portfolioData.blog.unshift(blogObj);
        showToast('New article published!');
    } else {
        portfolioData.blog[index] = { ...portfolioData.blog[index], ...blogObj };
        showToast('Article updated!');
    }

    renderBlogList(portfolioData.blog);
    closeBlogModal();
}

window.deleteBlog = function (index) {
    if (confirm('Delete this article?')) {
        portfolioData.blog.splice(index, 1);
        renderBlogList(portfolioData.blog);
        showToast('Article deleted');
    }
};

// Save All Data to Server & localStorage
async function saveAllData() {
    const btn = document.getElementById('saveAllBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    // Collect all fields into portfolioData
    portfolioData.hero = {
        ...portfolioData.hero,
        greetingHi: getVal('heroGreetingHi'),
        greetingIm: getVal('heroGreetingIm'),
        nameFirst: getVal('heroNameFirst'),
        nameLast: getVal('heroNameLast'),
        roleTag: getVal('heroRoleTag'),
        roleMainLine1: getVal('heroRoleMain1'),
        roleMainLine2: getVal('heroRoleMain2'),
        bio: getVal('heroBio'),
        profileImage: getVal('heroPortraitPath') || 'profile.png'
    };

    portfolioData.about = {
        ...portfolioData.about,
        bioParagraph1: getVal('aboutBio1'),
        bioParagraph2: getVal('aboutBio2'),
        quote: getVal('aboutQuote'),
        portraitImage: getVal('aboutPortraitPath') || 'about-profile.png'
    };

    portfolioData.theme = {
        ...portfolioData.theme,
        accent: getVal('themeAccentHex') || '#9d4edd',
        bgImage: getVal('customBgPath') || 'assets/doodle_purple_ambient.png'
    };

    portfolioData.contact = {
        ...portfolioData.contact,
        email: getVal('contactEmail'),
        location: getVal('contactLocation'),
        github: getVal('contactGithub'),
        linkedin: getVal('contactLinkedin'),
        instagram: getVal('contactInstagram'),
        pinterest: getVal('contactPinterest'),
        chess: getVal('contactChess')
    };

    // Cache locally
    localStorage.setItem('portfolio_cms_cache', JSON.stringify(portfolioData));
    localStorage.setItem('portfolio-accent', portfolioData.theme.accent);

    // Save to Server via POST /api/data
    try {
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(portfolioData)
        });

        if (res.ok) {
            showToast('✓ All changes saved to server and live portfolio!');
        } else {
            showToast('Saved locally (server responded with error)');
        }
    } catch (err) {
        showToast('Saved locally in browser cache!');
    }

    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>Save All Changes</span>';
    }, 400);
}

// Toast notification helper
function showToast(msg) {
    const toast = document.getElementById('adminToast');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}
