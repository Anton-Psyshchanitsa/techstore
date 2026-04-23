document.addEventListener('DOMContentLoaded', async () => {

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const productsGrid = document.querySelector('.products_grid');
    if (!productsGrid) return;

    const allProducts = await API.getProducts();

    const productsCount = document.querySelector('.products_count');
    if (productsCount) {
        productsCount.textContent = `${allProducts.length} products`;
    }

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

    window.renderProducts = function (products) {
        if (!productsGrid) return;

        productsGrid.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
        <a href="product.html?id=${product.id}" class="product-card_img-link">
            <div class="product-card_img-wrapper">
                <img src="${product.images[0]}" alt="${product.name}" class="product-card_img">
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
            <button class="btn-add-to-cart">Add to Cart</button>
        </div>
    </div>
`).join('');

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    };

    window.renderProducts(allProducts);
    window.currentProducts = allProducts;
});