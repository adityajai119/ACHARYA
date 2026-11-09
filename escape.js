function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function jsArg(value) {
    return escapeHTML(JSON.stringify(value ?? ''));
}

function safeURL(url) {
    try {
        return ['http:', 'https:', 'mailto:'].includes(new URL(url, location.href).protocol) ? url : '#';
    } catch (error) {
        return '#';
    }
}
