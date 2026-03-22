document.addEventListener('DOMContentLoaded', async () => {
    const dealsGrid = document.querySelector('.deals_grid');
    if (!dealsGrid) return;
    
    const dealProducts = await API.getDealProducts();
    
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
    
    dealsGrid.innerHTML = dealProducts.map(product => `
        <article class="deal-card" data-id="${product.id}" data-price="${product.price}" data-rating="${product.rating}">
            <div class="deal-card_img-wrapper">
                <img src="${product.images[0]}" alt="${product.name}" class="deal-card_img">
                ${product.discount ? `<div class="deal-card_discount">Save ${product.discount}%</div>` : ''}
            </div>
            <div class="deal-card_info">
                <h3 class="deal-card_title">
                    <a href="product.html?id=${product.id}">${product.name}</a>
                </h3>
                <div class="deal-card_rating">
                    <div class="rating-stars">
                        ${renderStars(product.rating)}
                    </div>
                    <span class="rating-val">(${product.rating})</span>
                </div>
                <div class="deal-card_price-category">
                    <div class="deal-card_price-current">$${product.discountPrice || product.price}</div>
                    ${product.discountPrice ? `<div class="deal-card_price-old">$${product.price}</div>` : ''}
                </div>
                <div class="deal-card_category">${product.categoryCode}</div>
            </div>
        </article>
    `).join('');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});