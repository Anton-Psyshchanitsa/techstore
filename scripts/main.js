function ensureIntegrationStyles() {
    if (document.getElementById('techstore-integration-styles')) return;

    const style = document.createElement('style');
    style.id = 'techstore-integration-styles';
    style.textContent = `
        .header_auth {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .header_auth-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 8px;
            background-color: #155DFC;
            color: #FFFFFF !important;
            font-family: "Inter", sans-serif;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            transition: background-color 0.2s;
        }
        .header_auth-link:hover {
            background-color: #114AC6;
        }
        .header_user {
            font-family: "Inter", sans-serif;
            font-size: 14px;
            font-weight: 500;
            color: #364153;
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .header_search-bar {
            display: none;
            width: 100%;
            background-color: #F9FAFB;
            border-top: 1px solid rgba(0, 0, 0, 0.08);
            padding: 12px 32px;
        }
        .header_search-bar.open {
            display: block;
        }
        .header_search-container {
            max-width: 1280px;
            margin: 0 auto;
        }
        .header_search-form {
            display: flex;
            gap: 10px;
        }
        .header_search-input {
            flex: 1;
            height: 40px;
            padding: 0 14px;
            border: 1px solid #D1D5DC;
            border-radius: 8px;
            font-family: "Inter", sans-serif;
            font-size: 14px;
            outline: none;
            background: #FFFFFF;
        }
        .header_search-input:focus {
            border-color: #155DFC;
        }
        .header_search-submit {
            height: 40px;
            padding: 0 18px;
            border: none;
            border-radius: 8px;
            background-color: #155DFC;
            color: #FFFFFF;
            font-family: "Inter", sans-serif;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
        }
        .header_search-clear {
            height: 40px;
            padding: 0 14px;
            border: 1px solid #D1D5DC;
            border-radius: 8px;
            background-color: #FFFFFF;
            color: #364153;
            font-family: "Inter", sans-serif;
            font-size: 14px;
            cursor: pointer;
        }
        .auth_container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 64px 16px;
        }
        .auth_card {
            width: 100%;
            max-width: 440px;
            background-color: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 16px;
            padding: 36px 32px;
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
        }
        .auth_title {
            font-family: "Inter", sans-serif;
            font-size: 26px;
            font-weight: 700;
            color: #0A0A0A;
            margin: 0 0 8px 0;
            text-align: center;
        }
        .auth_subtitle {
            font-family: "Inter", sans-serif;
            font-size: 14px;
            color: #4A5565;
            margin: 0 0 24px 0;
            text-align: center;
        }
        .auth_error {
            background-color: #FEF2F2;
            border: 1px solid #FECACA;
            color: #DC2626;
            padding: 12px;
            border-radius: 8px;
            font-family: "Inter", sans-serif;
            font-size: 14px;
            margin-bottom: 16px;
        }
        .auth_form {
            display: flex;
            flex-direction: column;
            gap: 18px;
        }
        .auth_field {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .auth_label {
            font-family: "Inter", sans-serif;
            font-size: 14px;
            font-weight: 500;
            color: #111827;
        }
        .auth_input {
            height: 44px;
            padding: 0 14px;
            border: 1px solid #D1D5DC;
            border-radius: 8px;
            font-family: "Inter", sans-serif;
            font-size: 15px;
            outline: none;
            width: 100%;
            box-sizing: border-box;
        }
        .auth_input:focus {
            border-color: #155DFC;
        }
        .auth_submit {
            height: 46px;
            border: none;
            border-radius: 8px;
            background-color: #155DFC;
            color: #FFFFFF;
            font-family: "Inter", sans-serif;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 6px;
            transition: background-color 0.2s;
        }
        .auth_submit:hover {
            background-color: #114AC6;
        }
        .auth_switch {
            margin: 20px 0 0 0;
            text-align: center;
            font-family: "Inter", sans-serif;
            font-size: 14px;
            color: #4A5565;
        }
        .auth_link {
            color: #155DFC;
            font-weight: 600;
            text-decoration: none;
        }
    `;
    document.head.appendChild(style);
}

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

        authWrapper.innerHTML = `
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
                    <input type="text" id="header-search-input" class="header_search-input" placeholder="Search products by name or description...">
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
    ensureIntegrationStyles();
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