/**
 * Admin login gate. Hides the dashboard until the correct credentials are entered.
 * Settings live in auth-config.js.
 */
(function () {
    const cfg = window.ADMIN_AUTH || {};
    const SESSION_KEY = 'portfolio_admin_session';
    const LOCK_KEY = 'portfolio_admin_lock';

    const $ = (id) => document.getElementById(id);

    async function sha256(text) {
        if (!(window.crypto && crypto.subtle)) {
            throw new Error('Secure context required. Open the site via https:// or http://localhost');
        }
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function isLoggedIn() {
        try {
            const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
            return !!(s && s.exp > Date.now());
        } catch (e) { return false; }
    }

    function startSession() {
        const exp = Date.now() + (cfg.sessionMinutes || 120) * 60000;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ exp }));
    }

    function showDashboard(show) {
        document.body.classList.toggle('auth-locked', !show);
        const gate = $('loginGate');
        if (gate) gate.style.display = show ? 'none' : 'flex';
    }

    function lockState() {
        try {
            const l = JSON.parse(localStorage.getItem(LOCK_KEY) || '{}');
            return { count: l.count || 0, until: l.until || 0 };
        } catch (e) { return { count: 0, until: 0 }; }
    }

    function setError(msg) {
        const el = $('loginError');
        if (el) el.textContent = msg || '';
    }

    async function handleLogin(e) {
        e.preventDefault();
        const lock = lockState();
        if (lock.until > Date.now()) {
            const mins = Math.ceil((lock.until - Date.now()) / 60000);
            setError('Too many attempts. Try again in ' + mins + ' min.');
            return;
        }
        const user = $('loginUser').value.trim();
        const pass = $('loginPass').value;
        try {
            const hash = await sha256((cfg.salt || '') + pass);
            if (user === cfg.username && hash === cfg.passwordHash) {
                localStorage.removeItem(LOCK_KEY);
                startSession();
                $('loginPass').value = '';
                setError('');
                showDashboard(true);
            } else {
                const count = lock.count + 1;
                const state = { count, until: 0 };
                if (count >= (cfg.maxAttempts || 5)) {
                    state.until = Date.now() + (cfg.lockMinutes || 5) * 60000;
                    state.count = 0;
                    setError('Too many attempts. Locked for ' + (cfg.lockMinutes || 5) + ' min.');
                } else {
                    setError('Wrong username or password. (' + (cfg.maxAttempts - count) + ' tries left)');
                }
                localStorage.setItem(LOCK_KEY, JSON.stringify(state));
            }
        } catch (err) {
            setError(err.message);
        }
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        showDashboard(false);
        $('loginUser').focus();
    }

    async function changePassword() {
        const np = prompt('Enter a NEW admin password (min 8 characters):');
        if (!np) return;
        if (np.length < 8) { alert('Password must be at least 8 characters.'); return; }
        const hash = await sha256((cfg.salt || '') + np);
        const line = "passwordHash: '" + hash + "',";
        try { await navigator.clipboard.writeText(line); } catch (e) { }
        prompt(
            'Open auth-config.js, replace the passwordHash line with this, then commit to GitHub.\n(Already copied to clipboard if allowed.)',
            line
        );
    }

    document.addEventListener('DOMContentLoaded', () => {
        showDashboard(isLoggedIn());
        const form = $('loginForm');
        if (form) form.addEventListener('submit', handleLogin);
        const out = $('logoutBtn');
        if (out) out.addEventListener('click', logout);
        const pw = $('changePassBtn');
        if (pw) pw.addEventListener('click', changePassword);
        const toggle = $('togglePass');
        if (toggle) toggle.addEventListener('click', () => {
            const i = $('loginPass');
            i.type = i.type === 'password' ? 'text' : 'password';
        });
        // Auto-logout when the session expires
        setInterval(() => { if (!isLoggedIn() && !document.body.classList.contains('auth-locked')) logout(); }, 30000);
    });
})();
