function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const badge = document.querySelector('.header_badge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function addToCart(productId, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: productId, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function getCartItems() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartBadge();
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    updateCartBadge();
    
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-add-to-cart');
        if (btn) {
            const card = btn.closest('.product-card, .deal-card');
            if (card) {
                const productId = parseInt(card.dataset.id);
                if (productId) {
                    addToCart(productId);
                }
            }
        }
    });
});