document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.querySelector('.products_grid');
    if (!productsGrid) return;

    const productsCount = document.querySelector('.products_count');
    const urlParams = new URLSearchParams(window.location.search);

    window.catalogState = {
        page: 1,
        limit: 12,
        search: urlParams.get('search') || '',
        min_price: 0,
        max_price: 3000,
        min_rating: null,
        sort_by: 'title',
        order: 'asc',
        category: urlParams.get('category') || ''
    };

    function renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i data-lucide="star" class="star fill"></i>';
        }

        if (hasHalf) {
            stars += '<i data-lucide="star-half" class="star fill"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i data-lucide="star" class="star"></i>';
        }

        return stars;
    }

    window.renderProducts = function (products, totalCount = products.length) {
        if (!productsGrid) return;

        if (products.length === 0) {
            productsGrid.innerHTML = '<p style="grid-column: 1 / -1; color: #4A5565; padding: 24px 0;">No products found matching your criteria.</p>';
        } else {
            productsGrid.innerHTML = products.map(product => {
                const imgSrc = (product.images && product.images.length > 0) ? product.images[0] : '';
                
                return `
                <div class="product-card" data-id="${product.id}">
                    <a href="product.html?id=${product.id}" class="product-card_img-link">
                        <div class="product-card_img-wrapper">
                            <img src="${imgSrc}" alt="${product.name}" class="product-card_img">
                        </div>
                    </a>
                    <div class="product-card_info">
                        <a href="product.html?id=${product.id}" class="product-card_title-link">
                            <h3 class="product-card_title">${product.name}</h3>
                        </a>
                        <div class="product-card_rating">
                            <div class="rating-stars">
                                ${renderStars(product.rating)}
                            </div>
                            <span class="rating-val">(${product.rating})</span>
                        </div>
                        <div class="product-card_footer">
                            <span class="product-card_price">$${product.price}</span>
                            <span class="product-card_category">${product.category}</span>
                        </div>
                        <button class="btn-add-to-cart" type="button">Add to Cart</button>
                    </div>
                </div>
            `}).join('');
        }

        if (productsCount) {
            productsCount.textContent = `${totalCount} products`;
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    };

    window.loadCatalogProducts = async function () {
        const result = await API.getProductsWithMeta(window.catalogState);
        window.currentProducts = result.items;
        window.renderProducts(result.items, result.meta.total_items);
    };

    await window.loadCatalogProducts();
});