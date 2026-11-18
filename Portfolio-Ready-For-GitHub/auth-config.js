/**
 * Admin login settings.
 * Default login  ->  username: admin   |   password: admin123
 * CHANGE THE PASSWORD before publishing: log in, click the key icon (top bar),
 * enter a new password, then paste the generated line over passwordHash below.
 *
 * NOTE: GitHub Pages is a static host, so this login is a front-end gate.
 * Real protection for publishing comes from your GitHub token (only you have it).
 */
window.ADMIN_AUTH = {
    username: 'admin',
    salt: 'portfolio-cms-v1',
    passwordHash: '389292e15ea5cc33f6e22c944ea0a491bf845f11f91429dd36dc505e14f13f25',
    sessionMinutes: 120,
    maxAttempts: 5,
    lockMinutes: 5
};
