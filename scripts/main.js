function loadAuthStylesheet() {
    if (document.getElementById('techstore-auth-css')) return;
    const link = document.createElement('link');
    link.id = 'techstore-auth-css';
    link.rel = 'stylesheet';
    link.href = 'scss/auth.css?v=3';
    document.head.appendChild(link);
}

loadAuthStylesheet();

async function updateCartBadge(cartData = null) {
    const badge = document.querySelector('.header_badge');
    if (!badge) return;

    if (!API.isAuthenticated()) {
        badge.textContent = '0';
        badge.style.display = 'none';
        return;
    }

    try {
        const cart = cartData || await API.getCart();
        const totalItems = cart?.summary?.totalItems || 0;
        badge.textContent = String(totalItems);
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    } catch {
        badge.textContent = '0';
        badge.style.display = 'none';
    }
}

async function addToCart(productId, quantity = 1, buttonEl = null) {
    if (!API.isAuthenticated()) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const returnUrl = encodeURIComponent(currentPage + window.location.search);
        window.location.href = `login.html?redirect=${returnUrl}`;
        return;
    }

    try {
        if (buttonEl) {
            buttonEl.disabled = true;
        }
        const cart = await API.addToCart(productId, quantity);
        await updateCartBadge(cart);

        if (buttonEl) {
            const originalHtml = buttonEl.innerHTML;
            buttonEl.textContent = 'Added!';
            setTimeout(() => {
                buttonEl.innerHTML = originalHtml;
                buttonEl.disabled = false;
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 900);
        }
    } catch (error) {
        if (buttonEl) {
            buttonEl.disabled = false;
        }
        alert(error.message || 'Could not add item to cart');
    }
}

function renderHeaderAuth() {
    const actionsContainer = document.querySelector('.header_actions');
    if (!actionsContainer) return;

    const existingAuth = actionsContainer.querySelector('.header_auth');
    if (existingAuth) {
        existingAuth.remove();
    }

    const authWrapper = document.createElement('div');
    authWrapper.className = 'header_auth';

    if (API.isAuthenticated()) {
        const user = API.getUser();
        const emailLabel = user?.email ? user.email.split('@')[0] : 'Account';
        const adminLink =
            user?.role === 'admin'
                ? `<a href="admin.html" class="header_auth-link" title="Admin Panel"><span>Admin</span></a>`
                : '';

        authWrapper.innerHTML = `
            ${adminLink}
            <span class="header_user" title="${user?.email || ''}">${emailLabel}</span>
            <button type="button" class="header_btn" id="logout-btn" title="Sign Out">
                <i data-lucide="log-out" class="header_icon"></i>
            </button>
        `;
    } else {
        authWrapper.innerHTML = `
            <a href="login.html" class="header_auth-link" title="Sign In">
                <i data-lucide="user" class="header_icon"></i>
                <span>Sign In</span>
            </a>
        `;
    }

    const burgerBtn = document.getElementById('burger-btn');
    if (burgerBtn) {
        actionsContainer.insertBefore(authWrapper, burgerBtn);
    } else {
        actionsContainer.appendChild(authWrapper);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            API.logout();
        });
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function initHeaderSearch() {
    const searchBtn = document.querySelector('.header_actions .header_btn:not(.cart-btn):not(#logout-btn)');
    const header = document.querySelector('.header');
    if (!searchBtn || !header) return;

    let searchBar = document.getElementById('header-search-bar');
    if (!searchBar) {
        searchBar = document.createElement('div');
        searchBar.id = 'header-search-bar';
        searchBar.className = 'header_search-bar';
        searchBar.innerHTML = `
            <div class="header_search-container">
                <form id="header-search-form" class="header_search-form">
                    <input type="text" id="header-search-input" class="header_search-input" placeholder="Search products...">
                    <button type="submit" class="header_search-submit">Search</button>
                    <button type="button" id="header-search-clear" class="header_search-clear">Clear</button>
                </form>
            </div>
        `;
        header.appendChild(searchBar);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('search') || '';
    const searchInput = document.getElementById('header-search-input');
    if (searchInput && initialSearch) {
        searchInput.value = initialSearch;
        searchBar.classList.add('open');
    }

    searchBtn.addEventListener('click', () => {
        searchBar.classList.toggle('open');
        if (searchBar.classList.contains('open')) {
            searchInput?.focus();
        }
    });

    const searchForm = document.getElementById('header-search-form');
    searchForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput?.value.trim() || '';
        const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');

        if (isIndexPage && window.catalogState && typeof window.loadCatalogProducts === 'function') {
            window.catalogState.search = query;
            window.catalogState.page = 1;
            window.loadCatalogProducts();
        } else {
            window.location.href = query ? `index.html?search=${encodeURIComponent(query)}` : 'index.html';
        }
    });

    const clearBtn = document.getElementById('header-search-clear');
    clearBtn?.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchBar.classList.remove('open');
        if (window.catalogState && typeof window.loadCatalogProducts === 'function') {
            window.catalogState.search = '';
            window.catalogState.page = 1;
            window.loadCatalogProducts();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderHeaderAuth();
    initHeaderSearch();
    updateCartBadge();

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-add-to-cart');
        if (btn) {
            const card = btn.closest('.product-card, .deal-card');
            if (card) {
                const productId = parseInt(card.dataset.id, 10);
                if (productId) {
                    await addToCart(productId, 1, btn);
                }
            }
        }
    });

    const burgerBtn = document.getElementById('burger-btn');
    const headerNav = document.querySelector('.header_nav');
    const header = document.querySelector('.header');

    if (burgerBtn && headerNav && header) {
        burgerBtn.addEventListener('click', () => {
            const isOpen = headerNav.classList.contains('open');

            if (!isOpen) {
                headerNav.classList.add('open');
                const navHeight = headerNav.scrollHeight;
                header.style.paddingBottom = navHeight + 'px';
            } else {
                headerNav.classList.remove('open');
                header.style.paddingBottom = '0px';
            }
        });

        document.addEventListener('click', (e) => {
            if (!burgerBtn.contains(e.target) && !headerNav.contains(e.target)) {
                if (headerNav.classList.contains('open')) {
                    headerNav.classList.remove('open');
                    header.style.paddingBottom = '0px';
                }
            }
        });
    }
});