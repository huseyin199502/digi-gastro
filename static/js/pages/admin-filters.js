(function () {
    window.toggleFilterPanel = function () {
        const panel = document.getElementById('produkte-filter-panel');
        const button = document.getElementById('filter-toggle-btn');
        if (!panel || !button) return;
        panel.classList.toggle('hidden');
        button.classList.toggle('active');
    };

    window.updateFilterBadge = function () {
        const count = document.querySelectorAll('#active-filter-pills .active-filter-pill').length;
        const badge = document.getElementById('filter-active-badge');
        if (!badge) return;
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    };

    document.addEventListener('DOMContentLoaded', updateFilterBadge);
}());
