document.addEventListener('DOMContentLoaded', () => {
    const customSelects = document.querySelectorAll('.custom-select');
    
    if (!customSelects.length) return;
    
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
                    valueDisplay.textContent = option.textContent;
                }
                
                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                customSelect.classList.remove('open');
                
                const sortValue = option.getAttribute('data-value');
                if (sortValue && window.currentProducts) {
                    const sortedProducts = API.sortProducts(window.currentProducts, sortValue);
                    if (window.renderProducts) {
                        window.renderProducts(sortedProducts);
                    }
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