document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) return;

    const product = await API.getProductById(productId);
    if (!product) return;

    let currentImageIndex = 0;
    let currentImages = product.images || [];

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

    function renderStarsSmall(rating) {
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

    function updateMainImage() {
        const mainImage = document.getElementById('main-image');
        if (mainImage && currentImages[currentImageIndex]) {
            mainImage.src = currentImages[currentImageIndex];
            mainImage.alt = product.name;
        }
    }

    function renderThumbnails() {
        const container = document.getElementById('thumbnails');
        if (!container) return;

        container.innerHTML = currentImages.map((img, index) => `
            <div class="product-gallery_thumb ${index === currentImageIndex ? 'product-gallery_thumb--active' : ''}" data-index="${index}">
                <img src="${img}" alt="${product.name}">
            </div>
        `).join('');

        document.querySelectorAll('.product-gallery_thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                currentImageIndex = parseInt(thumb.dataset.index);
                updateMainImage();
                renderThumbnails();
            });
        });
    }

    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = `$${product.price}`;
    document.getElementById('product-description').textContent = product.description;

    const starsContainer = document.getElementById('product-stars');
    if (starsContainer) {
        starsContainer.innerHTML = renderStars(product.rating);
    }

    const ratingValueSpan = document.getElementById('product-rating-value');
    if (ratingValueSpan) {
        ratingValueSpan.textContent = `(${product.rating})`;
    }

    const reviewsSpan = document.getElementById('product-reviews');
    if (reviewsSpan) {
        reviewsSpan.textContent = `Based on ${product.reviews} reviews`;
    }

    const featuresList = document.getElementById('product-features');
    if (featuresList && product.features) {
        featuresList.innerHTML = product.features.map(feature => `<li>${feature}</li>`).join('');
    }

    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = product.category;
    }

    const breadcrumbProduct = document.getElementById('breadcrumb-product');
    if (breadcrumbProduct) {
        breadcrumbProduct.textContent = product.name;
    }

    const specsContainer = document.querySelector('.specs-table');
    if (specsContainer && product.specifications) {
        specsContainer.innerHTML = product.specifications.map(spec => {
            const [label, value] = spec.split(': ');
            return `
            <div class="specs-row">
                <span class="specs-label">${label}</span>
                <span class="specs-value">${value}</span>
            </div>
        `;
        }).join('');
    }

    if (currentImages.length > 0) {
        renderThumbnails();
        updateMainImage();
    }

    document.getElementById('prev-image')?.addEventListener('click', () => {
        if (currentImages.length > 0) {
            currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
            updateMainImage();
            renderThumbnails();
        }
    });

    document.getElementById('next-image')?.addEventListener('click', () => {
        if (currentImages.length > 0) {
            currentImageIndex = (currentImageIndex + 1) % currentImages.length;
            updateMainImage();
            renderThumbnails();
        }
    });

    const qtyInput = document.querySelector('.qty-input');
    const qtyMinus = document.querySelector('.qty-minus');
    const qtyPlus = document.querySelector('.qty-plus');

    if (qtyMinus) {
        qtyMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) {
                qtyInput.value = val - 1;
            }
        });
    }

    if (qtyPlus) {
        qtyPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val < 99) {
                qtyInput.value = val + 1;
            }
        });
    }

    document.getElementById('add-to-cart')?.addEventListener('click', () => {
        const quantity = parseInt(qtyInput.value);
        addToCart(product.id, quantity);

        const btn = document.getElementById('add-to-cart');
        lucide.createIcons();
        setTimeout(() => {
            lucide.createIcons();
        }, 1500);
    });

    const accordionHeader = document.getElementById('accordion-header');
    const accordionContent = document.getElementById('accordion-content');

    if (accordionHeader && accordionContent) {
        accordionHeader.addEventListener('click', () => {
            accordionHeader.classList.toggle('open');
            accordionContent.classList.toggle('open');
        });
    }

    const relatedProducts = await API.getProductsByCategory(product.categoryCode);
    const filteredRelated = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);
    const relatedGrid = document.getElementById('related-products');
    const relatedTitle = document.querySelector('.related-products_title');

    if (relatedGrid && filteredRelated.length > 0) {

        if (relatedTitle) relatedTitle.style.display = 'block';
        if (document.querySelector('.related-products')) {
            document.querySelector('.related-products').style.display = 'block';
        }

        relatedGrid.innerHTML = filteredRelated.map(related => `
            <a href="product.html?id=${related.id}" class="related-card">
                <div class="related-card_img-wrapper">
                    <img src="${related.images[0]}" alt="${related.name}" class="related-card_img">
                </div>
                <div class="related-card_info">
                    <h3 class="related-card_title">${related.name}</h3>
                    <div class="related-card_rating">
                        <div class="rating-stars">
                            ${renderStarsSmall(related.rating)}
                        </div>
                        <span class="rating-val">(${related.rating})</span>
                    </div>
                    <div class="related-card_footer">
                        <span class="related-card_price">$${related.price}</span>
                        <span class="related-card_category">${related.categoryCode}</span>
                    </div>
                </div>
            </a>
        `).join('');
    }

     else {
    if (relatedTitle) relatedTitle.style.display = 'none';
    if (document.querySelector('.related-products')) {
        document.querySelector('.related-products').style.display = 'none';
    }
}

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});