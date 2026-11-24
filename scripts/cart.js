document.addEventListener('DOMContentLoaded', async () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    if (!API.isAuthenticated()) {
        window.location.href = 'login.html?redirect=cart.html';
        return;
    }

    const cartItemsContainer = document.getElementById('cart-items');
    const emptyState = document.getElementById('empty-state');
    const cartLayout = document.getElementById('cart-layout');

    const subtotalEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    const totalEl = document.getElementById('summary-total');
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('summary-discount');
    const promoInput = document.querySelector('.cart-promo_input');
    const promoMessage = document.querySelector('.cart-promo_hint');

    let currentCart = null;

    function renderCart(cart) {
        currentCart = cart;

        if (!cart || !cart.items || cart.items.length === 0) {
            emptyState.style.display = 'flex';
            cartLayout.style.display = 'none';
            if (typeof updateCartBadge === 'function') {
                updateCartBadge(cart);
            }
            return;
        }

        emptyState.style.display = 'none';
        cartLayout.style.display = 'flex';
        cartLayout.style.flexWrap = 'wrap';

        cartItemsContainer.innerHTML = cart.items.map(item => {
            const formattedCategory = item.category || (item.categoryCode
                ? item.categoryCode.charAt(0).toUpperCase() + item.categoryCode.slice(1).toLowerCase()
                : '');

            return `
                <div class="cart-item" data-id="${item.productId}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item_img">
                    
                    <div class="cart-item_content">
                        <div class="cart-item_info">
                            <h3 class="cart-item_title">${item.name}</h3>
                            <span class="cart-item_category">${formattedCategory}</span>
                            
                            <div class="cart-item_controls">
                                <div class="cart-item_qty">
                                    <button class="btn-minus" onclick="updateQty(${item.productId}, ${item.quantity - 1})">-</button>
                                    <span>${item.quantity}</span>
                                    <button class="btn-plus" onclick="updateQty(${item.productId}, ${item.quantity + 1})">+</button>
                                </div>
                            </div>
                        </div>

                        <div class="cart-item_actions">
                            <button class="cart-item_delete" onclick="removeFromCart(${item.productId})">
                                <i data-lucide="trash-2"></i>
                            </button>
                            <div class="cart-item_prices">
                                <div class="cart-item_price-total">$${item.lineTotal.toFixed(2)}</div>
                                <div class="cart-item_price-each">$${item.unitPrice.toFixed(2)} each</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const summary = cart.summary;

        if (cart.promoCode && summary.discount > 0) {
            if (discountRow) discountRow.style.display = 'flex';
            if (discountEl) discountEl.textContent = `-$${summary.discount.toFixed(2)}`;
            if (promoInput && !promoInput.value) {
                promoInput.value = cart.promoCode;
            }
        } else {
            if (discountRow) discountRow.style.display = 'none';
        }

        if (subtotalEl) subtotalEl.textContent = `$${summary.subtotal.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${summary.tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${summary.total.toFixed(2)}`;

        if (typeof updateCartBadge === 'function') {
            updateCartBadge(cart);
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    document.addEventListener('click', async (e) => {
        const promoBtn = e.target.closest('.cart-promo_btn');
        if (!promoBtn) return;

        e.preventDefault();
        if (!promoInput || !promoMessage) return;

        const code = promoInput.value.trim();

        if (code === '') {
            promoMessage.textContent = 'Try code "SAVE10" for 10% off';
            promoMessage.style.color = '#6B7280';
            return;
        }

        try {
            const updatedCart = await API.applyPromo(code);
            promoMessage.textContent = 'Promo code applied successfully!';
            promoMessage.style.color = '#22C55E';
            renderCart(updatedCart);
        } catch {
            promoMessage.textContent = 'Wrong Promo code!';
            promoMessage.style.color = '#EF4444';
        }
    });

    window.updateQty = async function (productId, newQuantity) {
        try {
            let updatedCart;
            if (newQuantity <= 0) {
                updatedCart = await API.removeCartItem(productId);
            } else {
                updatedCart = await API.updateCartItem(productId, newQuantity);
            }
            renderCart(updatedCart);
        } catch (error) {
            alert(error.message || 'Failed to update quantity');
        }
    };

    window.removeFromCart = async function (productId) {
        try {
            const updatedCart = await API.removeCartItem(productId);
            renderCart(updatedCart);
        } catch (error) {
            alert(error.message || 'Failed to remove item');
        }
    };

    try {
        const initialCart = await API.getCart();
        renderCart(initialCart);
    } catch (error) {
        if (error.status === 401) {
            window.location.href = 'login.html?redirect=cart.html';
        }
    }
});