// Shared helpers for putting user, API and AI data into HTML without it running as markup or code
function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// A value passed to an inline on* handler: a JS literal, escaped for the HTML attribute around it
function jsArg(value) {
    return escapeHTML(JSON.stringify(value ?? ''));
}

// Keep http(s), mailto and relative links; javascript:, data: and other schemes become '#'
function safeURL(url) {
    try {
        return ['http:', 'https:', 'mailto:'].includes(new URL(url, location.href).protocol) ? url : '#';
    } catch (error) {
        return '#';
    }
}
