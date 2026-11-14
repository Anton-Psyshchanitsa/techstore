document.addEventListener('DOMContentLoaded', () => {
    const ratingCheckboxes = document.querySelectorAll('.checkbox_input');
    const priceMinInput = document.querySelector('.range-slider_input.min');
    const priceMaxInput = document.querySelector('.range-slider_input.max');
    const priceMinValue = document.querySelector('.range-slider_val:first-child');
    const priceMaxValue = document.querySelector('.range-slider_val:last-child');
    const clearFiltersBtn = document.getElementById('clear-filters');

    let filterDebounceTimer = null;

    function triggerServerFilter() {
        if (!window.catalogState || typeof window.loadCatalogProducts !== 'function') return;

        const selectedRatings = [];
        ratingCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedRatings.push(parseInt(checkbox.value, 10));
            }
        });

        window.catalogState.min_rating = selectedRatings.length > 0 ? Math.min(...selectedRatings) : null;
        window.catalogState.min_price = parseFloat(priceMinInput?.value) || 0;
        window.catalogState.max_price = parseFloat(priceMaxInput?.value) || 3000;
        window.catalogState.page = 1;

        window.loadCatalogProducts();
    }

    function scheduleServerFilter() {
        if (filterDebounceTimer) {
            clearTimeout(filterDebounceTimer);
        }
        filterDebounceTimer = setTimeout(triggerServerFilter, 180);
    }

    function initPriceSlider() {
        if (!priceMinInput || !priceMaxInput) return;

        const trackFill = document.querySelector('.range-slider_fill');
        const minVal = parseFloat(priceMinInput.min) || 0;
        const maxVal = parseFloat(priceMaxInput.max) || 3000;

        function updateFill() {
            if (!trackFill) return;
            const currentMin = parseFloat(priceMinInput.value);
            const currentMax = parseFloat(priceMaxInput.value);
            const leftPercent = ((currentMin - minVal) / (maxVal - minVal)) * 100;
            const rightPercent = ((maxVal - currentMax) / (maxVal - minVal)) * 100;
            trackFill.style.left = leftPercent + '%';
            trackFill.style.right = rightPercent + '%';
        }

        function updatePriceValues() {
            const currentMin = parseFloat(priceMinInput.value);
            const currentMax = parseFloat(priceMaxInput.value);
            if (priceMinValue) priceMinValue.textContent = `$${currentMin}`;
            if (priceMaxValue) priceMaxValue.textContent = `$${currentMax}`;
            if (currentMin > currentMax) priceMinInput.value = currentMax;
            updateFill();
        }

        priceMinInput.addEventListener('input', () => {
            if (parseFloat(priceMinInput.value) > parseFloat(priceMaxInput.value)) {
                priceMinInput.value = priceMaxInput.value;
            }
            updatePriceValues();
            scheduleServerFilter();
        });

        priceMaxInput.addEventListener('input', () => {
            if (parseFloat(priceMaxInput.value) < parseFloat(priceMinInput.value)) {
                priceMaxInput.value = priceMinInput.value;
            }
            updatePriceValues();
            scheduleServerFilter();
        });

        updatePriceValues();
        updateFill();
    }

    ratingCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', triggerServerFilter);
    });

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            ratingCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            if (priceMinInput) priceMinInput.value = 0;
            if (priceMaxInput) priceMaxInput.value = 3000;
            if (priceMinValue) priceMinValue.textContent = '$0';
            if (priceMaxValue) priceMaxValue.textContent = '$3000';

            const trackFill = document.querySelector('.range-slider_fill');
            if (trackFill) {
                trackFill.style.left = '0%';
                trackFill.style.right = '0%';
            }

            if (window.catalogState) {
                window.catalogState.category = '';
                window.catalogState.search = '';
                const url = new URL(window.location.href);
                url.searchParams.delete('category');
                url.searchParams.delete('search');
                window.history.replaceState({}, '', url);
            }

            triggerServerFilter();
        });
    }

    initPriceSlider();

    const openFiltersBtn = document.getElementById('open-filters');
    const closeFiltersBtn = document.getElementById('close-filters');
    const filtersSidebar = document.getElementById('filters-sidebar');
    const filtersOverlay = document.getElementById('filters-overlay');

    function openFilters() {
        filtersSidebar?.classList.add('open');
        filtersOverlay?.classList.add('open');
    }

    function closeFilters() {
        filtersSidebar?.classList.remove('open');
        filtersOverlay?.classList.remove('open');
    }

    openFiltersBtn?.addEventListener('click', openFilters);
    closeFiltersBtn?.addEventListener('click', closeFilters);
    filtersOverlay?.addEventListener('click', closeFilters);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeFilters();
    });
});