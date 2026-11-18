/**
 * Portfolio Dynamic CMS & Blog Engine
 * Handles real-time synchronization between portfolio_data.json / Admin Dashboard and the live website.
 */

(function () {
    let cmsData = null;
    let activeBlogCategory = 'all';

    async function loadPortfolioData() {
        // 1. Try local storage cache first for instant load
        const cached = localStorage.getItem('portfolio_cms_cache');
        if (cached) {
            try {
                cmsData = JSON.parse(cached);
                applyDataToDOM(cmsData);
                renderBlogSection(cmsData.blog || []);
            } catch (err) { }
        }

        // 2. Fetch fresh data from API server or static portfolio_data.json
        try {
            // First check if server.py is running
            const res = await fetch('/api/data?t=' + Date.now(), { cache: 'no-store' });
            if (res.ok) {
                cmsData = await res.json();
                localStorage.setItem('portfolio_cms_cache', JSON.stringify(cmsData));
                applyDataToDOM(cmsData);
                renderBlogSection(cmsData.blog || []);
                return;
            }
        } catch (e) {
            // Server not active, fetch portfolio_data.json directly (GitHub Pages / static mode)
        }

        try {
            const staticRes = await fetch('portfolio_data.json?t=' + Date.now(), { cache: 'no-store' });
            if (staticRes.ok) {
                cmsData = await staticRes.json();
                localStorage.setItem('portfolio_cms_cache', JSON.stringify(cmsData));
                applyDataToDOM(cmsData);
                renderBlogSection(cmsData.blog || []);
            }
        } catch (err) {
            console.warn('Could not load portfolio data file:', err);
        }
    }

    function applyDataToDOM(data) {
        if (!data) return;

        // Theme & Background sync
        if (data.theme) {
            if (data.theme.bgImage) {
                const ambientBg = document.querySelector('.ambient-bg');
                if (ambientBg) {
                    ambientBg.style.backgroundImage = `linear-gradient(rgba(3, 3, 5, 0.72), rgba(1, 1, 2, 0.80)), url('${data.theme.bgImage}')`;
                }
            }
            if (data.theme.accent) {
                document.documentElement.style.setProperty('--color-electric-blue', data.theme.accent);
                const r = parseInt(data.theme.accent.slice(1, 3), 16) || 0;
                const g = parseInt(data.theme.accent.slice(3, 5), 16) || 0;
                const b = parseInt(data.theme.accent.slice(5, 7), 16) || 0;
                document.documentElement.style.setProperty('--glow-blue', `0 0 40px rgba(${r}, ${g}, ${b}, 0.35)`);
                document.documentElement.style.setProperty('--border-glass-glow', `rgba(${r}, ${g}, ${b}, 0.25)`);
            }
        }

        // Hero Section updates
        if (data.hero) {
            const h = data.hero;
            const greetHi = document.querySelector('.greeting-hi');
            if (greetHi && h.greetingHi) greetHi.textContent = h.greetingHi;

            const greetIm = document.querySelector('.greeting-im');
            if (greetIm && h.greetingIm) greetIm.textContent = h.greetingIm;

            const nameFirst = document.querySelector('.name-first');
            if (nameFirst && h.nameFirst) nameFirst.textContent = h.nameFirst;

            const nameLast = document.querySelector('.name-last');
            if (nameLast && h.nameLast) nameLast.textContent = h.nameLast;

            const heroDesc = document.querySelector('.hero-description-text');
            if (heroDesc && h.bio) heroDesc.textContent = h.bio;

            const portraitImg = document.querySelector('.portrait-image');
            if (portraitImg && h.profileImage) portraitImg.src = h.profileImage;

            const roleTag = document.querySelector('.role-tag');
            if (roleTag && h.roleTag) roleTag.textContent = h.roleTag;

            const roleWords = document.querySelectorAll('.role-main .role-word');
            if (roleWords.length >= 2) {
                if (h.roleMainLine1) roleWords[0].textContent = h.roleMainLine1;
                if (h.roleMainLine2) roleWords[1].textContent = h.roleMainLine2;
            }
        }

        // About Section updates
        if (data.about) {
            const a = data.about;
            const aboutPortrait = document.querySelector('.about-portrait');
            if (aboutPortrait && a.portraitImage) aboutPortrait.src = a.portraitImage;

            const quoteEl = document.querySelector('.about-quote');
            if (quoteEl && a.quote) quoteEl.textContent = a.quote;
        }

        // Contact Section updates
        if (data.contact) {
            const c = data.contact;
            const emailLink = document.querySelector('a[href^="mailto:"]');
            if (emailLink && c.email) {
                emailLink.href = `mailto:${c.email}`;
                emailLink.textContent = c.email;
            }
        }
    }

    function renderBlogSection(articles) {
        const grid = document.getElementById('blogGrid');
        if (!grid) return;

        const filtered = activeBlogCategory === 'all'
            ? articles
            : articles.filter(a => (a.category || '').toLowerCase() === activeBlogCategory.toLowerCase());

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p>No articles found in this category yet. Check back soon!</p>
                </div>`;
            return;
        }

        grid.innerHTML = filtered.map(item => `
            <article class="blog-card" data-id="${item.id}">
                <div class="blog-card-media">
                    <img src="${item.image || 'assets/doodle_purple.jpg'}" alt="${item.title}" loading="lazy" onerror="this.src='assets/doodle_purple.jpg'">
                    <span class="blog-card-category">${item.category || 'Article'}</span>
                </div>
                <div class="blog-card-body">
                    <div class="blog-card-meta">
                        <span><i class="fa-regular fa-calendar"></i> ${item.date || 'Recent'}</span>
                        <span><i class="fa-regular fa-clock"></i> ${item.readTime || '3 min'}</span>
                    </div>
                    <h3 class="blog-card-title">${item.title}</h3>
                    <p class="blog-card-excerpt">${item.excerpt || ''}</p>
                    <div class="blog-card-footer">
                        <span class="blog-read-link">Read Full Article <i class="fa-solid fa-arrow-right"></i></span>
                    </div>
                </div>
            </article>
        `).join('');

        // Attach click listeners to cards
        grid.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const article = articles.find(a => String(a.id) === String(id));
                if (article) openBlogModal(article);
            });
        });
    }

    function initBlogFilters() {
        const filterBtns = document.querySelectorAll('#blogFilters .blog-pill');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeBlogCategory = btn.dataset.category || 'all';
                if (cmsData && cmsData.blog) {
                    renderBlogSection(cmsData.blog);
                }
            });
        });
    }

    function initBlogModal() {
        const modal = document.getElementById('blogModal');
        const closeBtn = document.getElementById('blogModalClose');
        if (!modal) return;

        if (closeBtn) {
            closeBtn.addEventListener('click', closeBlogModal);
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeBlogModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeBlogModal();
            }
        });
    }

    function openBlogModal(article) {
        const modal = document.getElementById('blogModal');
        if (!modal) return;

        document.getElementById('blogModalTitle').textContent = article.title || '';
        document.getElementById('blogModalCategory').textContent = article.category || 'Article';
        document.querySelector('#blogModalDate .val').textContent = article.date || '';
        document.querySelector('#blogModalReadTime .val').textContent = article.readTime || '';
        
        const img = document.getElementById('blogModalImg');
        if (img) img.src = article.image || 'assets/doodle_purple.jpg';

        const textContainer = document.getElementById('blogModalText');
        if (textContainer) {
            const paragraphs = (article.content || article.excerpt || '').split('\n\n');
            textContainer.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeBlogModal() {
        const modal = document.getElementById('blogModal');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Live Cross-Tab Sync: When admin.html saves, update this page instantly!
    window.addEventListener('storage', (e) => {
        if (e.key === 'portfolio_cms_cache' && e.newValue) {
            try {
                cmsData = JSON.parse(e.newValue);
                applyDataToDOM(cmsData);
                renderBlogSection(cmsData.blog || []);
            } catch (err) { }
        }
    });

    // Secret Admin Shortcut: Press Ctrl + Shift + A (or Cmd + Shift + A) to open admin dashboard
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            window.location.href = 'admin.html';
        }
    });

    // Expose for external refreshes
    window.refreshPortfolioCMS = loadPortfolioData;

    // Run on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadPortfolioData();
            initBlogModal();
            initBlogFilters();
        });
    } else {
        loadPortfolioData();
        initBlogModal();
        initBlogFilters();
    }
})();
