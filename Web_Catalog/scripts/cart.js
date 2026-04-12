document.addEventListener('DOMContentLoaded', async () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const cartItemsContainer = document.getElementById('cart-items');
    const emptyState = document.getElementById('empty-state');
    const cartLayout = document.getElementById('cart-layout');
    
    const subtotalEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    const totalEl = document.getElementById('summary-total');
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('summary-discount');

    let isPromoApplied = false;
    const allProducts = await API.getProducts();

    document.addEventListener('click', (e) => {
        const promoBtn = e.target.closest('.cart-promo_btn');
        
        if (promoBtn) {
            e.preventDefault(); 
            
            const promoInput = document.querySelector('.cart-promo_input');
            const promoMessage = document.querySelector('.cart-promo_hint');
            
            if (!promoInput || !promoMessage) return;

            const code = promoInput.value.trim().toUpperCase(); 
            
            if (code === 'SAVE10') {
                isPromoApplied = true;
                promoMessage.textContent = 'Promo code applied successfully!';
                promoMessage.style.color = '#22C55E'; 
            } else if (code === '') {
                isPromoApplied = false;
                promoMessage.textContent = 'Try code "SAVE10" for 10% off';
                promoMessage.style.color = '#6B7280'; 
            } else {
                isPromoApplied = false;
                promoMessage.textContent = 'Wrong Promo code!';
                promoMessage.style.color = '#EF4444';
            }
            
            renderCart();
        }
    });

    function renderCart() {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (cart.length === 0) {
            emptyState.style.display = 'flex';
            cartLayout.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        cartLayout.style.display = 'flex';
        cartLayout.style.flexWrap = 'wrap';

        let subtotal = 0;
        let html = '';

        cart.forEach(cartItem => {
            const product = allProducts.find(p => p.id === cartItem.id);
            if (!product) return;

            const itemTotal = product.price * cartItem.quantity;
            subtotal += itemTotal;
            
            const formattedCategory = product.categoryCode.charAt(0).toUpperCase() + product.categoryCode.slice(1).toLowerCase();

            html += `
                <div class="cart-item" data-id="${product.id}">
                    <img src="${product.images[0]}" alt="${product.name}" class="cart-item_img">
                    
                    <div class="cart-item_content">
                        <div class="cart-item_info">
                            <h3 class="cart-item_title">${product.name}</h3>
                            <span class="cart-item_category">${formattedCategory}</span>
                            
                            <div class="cart-item_controls">
                                <div class="cart-item_qty">
                                    <button class="btn-minus" onclick="updateQty(${product.id}, -1)">-</button>
                                    <span>${cartItem.quantity}</span>
                                    <button class="btn-plus" onclick="updateQty(${product.id}, 1)">+</button>
                                </div>
                            </div>
                        </div>

                        <div class="cart-item_actions">
                            <button class="cart-item_delete" onclick="removeFromCart(${product.id})">
                                <i data-lucide="trash-2"></i>
                            </button>
                            <div class="cart-item_prices">
                                <div class="cart-item_price-total">$${itemTotal.toFixed(2)}</div>
                                <div class="cart-item_price-each">$${product.price.toFixed(2)} each</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = html;

        let discount = 0;
        
        if (isPromoApplied) {
            discount = subtotal * 0.10; 
            if (discountRow) discountRow.style.display = 'flex';
            if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
        } else {
            if (discountRow) discountRow.style.display = 'none';
        }

        const discountedSubtotal = subtotal - discount; 
        const taxRate = 0.08; 
        const tax = discountedSubtotal * taxRate; 
        const total = discountedSubtotal + tax;

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    window.updateQty = function(productId, change) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const item = cart.find(i => i.id === productId);
        
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== productId);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            
            if (typeof updateCartBadge === 'function') {
                updateCartBadge();
            }
            renderCart();
        }
    };

    window.removeFromCart = function(productId) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(i => i.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }
        renderCart();
    };

    renderCart();
});