document.addEventListener('DOMContentLoaded', () => {
    const customSelects = document.querySelectorAll('.custom-select');
    if (!customSelects.length) return;

    const sortMap = {
        'name-asc': { sort_by: 'title', order: 'asc' },
        'name-desc': { sort_by: 'title', order: 'desc' },
        'price-asc': { sort_by: 'price', order: 'asc' },
        'price-desc': { sort_by: 'price', order: 'desc' }
    };

    customSelects.forEach(customSelect => {
        const trigger = customSelect.querySelector('.custom-select_trigger');
        const valueDisplay = trigger?.querySelector('.custom-select_value');
        const options = customSelect.querySelectorAll('.custom-select_option');

        if (trigger) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                customSelects.forEach(select => {
                    if (select !== customSelect) select.classList.remove('open');
                });
                customSelect.classList.toggle('open');
            });
        }

        options.forEach(option => {
            option.addEventListener('click', async () => {
                if (valueDisplay) {
                    valueDisplay.textContent = option.textContent.trim();
                }

                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                customSelect.classList.remove('open');

                const sortValue = option.getAttribute('data-value');
                const mapped = sortValue ? sortMap[sortValue] : null;

                if (mapped && window.catalogState && typeof window.loadCatalogProducts === 'function') {
                    window.catalogState.sort_by = mapped.sort_by;
                    window.catalogState.order = mapped.order;
                    window.catalogState.page = 1;
                    await window.loadCatalogProducts();
                }
            });
        });
    });

    document.addEventListener('click', () => {
        customSelects.forEach(select => select.classList.remove('open'));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            customSelects.forEach(select => select.classList.remove('open'));
        }
    });
});