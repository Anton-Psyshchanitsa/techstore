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
                if (sortValue && window.currentProducts && window.renderProducts) {
                    const sortedProducts = API.sortProducts(window.currentProducts, sortValue);
                    window.renderProducts(sortedProducts);
                } else if (sortValue && window.currentProducts) {
                    const productsGrid = document.querySelector('.products_grid');
                    if (productsGrid) {
                        const sortedProducts = API.sortProducts(window.currentProducts, sortValue);
                        function renderStars(rating) {
                            const fullStars = Math.floor(rating);
                            const hasHalf = rating % 1 !== 0;
                            let stars = '';
                            for (let i = 0; i < fullStars; i++) stars += '<i data-lucide="star" class="star fill"></i>';
                            if (hasHalf) stars += '<i data-lucide="star-half" class="star fill"></i>';
                            const emptyStars = 5 - Math.ceil(rating);
                            for (let i = 0; i < emptyStars; i++) stars += '<i data-lucide="star" class="star"></i>';
                            return stars;
                        }
                        productsGrid.innerHTML = sortedProducts.map(product => `
                            <article class="product-card" data-id="${product.id}" data-price="${product.price}" data-rating="${product.rating}">
                                <div class="product-card_img-wrapper">
                                    <img src="${product.images[0]}" alt="${product.name}" class="product-card_img">
                                    <button class="btn-add-to-cart">Add to Cart</button>
                                </div>
                                <div class="product-card_info">
                                    <h3 class="product-card_title"><a href="product.html?id=${product.id}">${product.name}</a></h3>
                                    <div class="product-card_rating">
                                        <div class="rating-stars">${renderStars(product.rating)}</div>
                                        <span class="rating-val">(${product.rating})</span>
                                    </div>
                                    <div class="product-card_footer">
                                        <span class="product-card_price">$${product.price}</span>
                                        <span class="product-card_category">${product.categoryCode}</span>
                                    </div>
                                </div>
                            </article>
                        `).join('');
                        if (typeof lucide !== 'undefined') lucide.createIcons();
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