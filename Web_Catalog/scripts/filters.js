document.addEventListener('DOMContentLoaded', async () => {
    const ratingCheckboxes = document.querySelectorAll('.checkbox_input');
    const priceMinInput = document.querySelector('.range-slider_input.min');
    const priceMaxInput = document.querySelector('.range-slider_input.max');
    const priceMinValue = document.querySelector('.range-slider_val:first-child');
    const priceMaxValue = document.querySelector('.range-slider_val:last-child');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const productsCount = document.querySelector('.products_count');
    const productsGrid = document.querySelector('.products_grid');

    let allProducts = [];
    let currentFilteredProducts = [];

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

    function renderProducts(products) {
        if (!productsGrid) return;

        productsGrid.innerHTML = products.map(product => `
        <a href="product.html?id=${product.id}" class="product-card-link">
            <article class="product-card" data-id="${product.id}" data-price="${product.price}" data-rating="${product.rating}">
                <div class="product-card_img-wrapper">
                    <img src="${product.images[0]}" alt="${product.name}" class="product-card_img">
                </div>
                <div class="product-card_info">
                    <h3 class="product-card_title">${product.name}</h3>
                    <div class="product-card_rating">
                        <div class="rating-stars">
                            ${renderStars(product.rating)}
                        </div>
                        <span class="rating-val">(${product.rating})</span>
                    </div>
                    <div class="product-card_footer">
                        <span class="product-card_price">$${product.price}</span>
                        <span class="product-card_category">${product.categoryCode}</span>
                    </div>
                </div>
            </article>
        </a>
    `).join('');

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        if (productsCount) {
            productsCount.textContent = `${products.length} products`;
        }
    }

    function applyFilters() {
        let filtered = [...allProducts];

        const selectedRatings = [];
        ratingCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedRatings.push(parseInt(checkbox.value));
            }
        });

        if (selectedRatings.length > 0) {
            const minRating = Math.min(...selectedRatings);
            filtered = filtered.filter(product => product.rating >= minRating);
        }

        const minPrice = parseFloat(priceMinInput?.value) || 0;
        const maxPrice = parseFloat(priceMaxInput?.value) || 3000;
        filtered = filtered.filter(product => product.price >= minPrice && product.price <= maxPrice);

        currentFilteredProducts = filtered;
        renderProducts(filtered);

        window.currentProducts = filtered;
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

            if (currentMin > currentMax) {
                priceMinInput.value = currentMax;
                if (priceMinValue) priceMinValue.textContent = `$${currentMax}`;
            }

            updateFill();
        }

        priceMinInput.addEventListener('input', () => {
            if (parseFloat(priceMinInput.value) > parseFloat(priceMaxInput.value)) {
                priceMinInput.value = priceMaxInput.value;
            }
            updatePriceValues();
            applyFilters();
        });

        priceMaxInput.addEventListener('input', () => {
            if (parseFloat(priceMaxInput.value) < parseFloat(priceMinInput.value)) {
                priceMaxInput.value = priceMinInput.value;
            }
            updatePriceValues();
            applyFilters();
        });

        updatePriceValues();
        updateFill();
    }

    ratingCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            applyFilters();
        });
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

            applyFilters();
        });
    }

    allProducts = await API.getProducts();
    currentFilteredProducts = [...allProducts];
    window.currentProducts = allProducts;

    renderProducts(allProducts);
    initPriceSlider();

    window.renderProducts = renderProducts;
});