const API = {
    baseUrl: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000/api'
        : 'https://techstore-api-qu0b.onrender.com/api',

    getToken() {
        return localStorage.getItem('techstore_token');
    },

    setAuth(token, user) {
        localStorage.setItem('techstore_token', token);
        localStorage.setItem('techstore_user', JSON.stringify(user));
    },

    clearAuth() {
        localStorage.removeItem('techstore_token');
        localStorage.removeItem('techstore_user');
    },

    getUser() {
        const raw = localStorage.getItem('techstore_user');
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    isAuthenticated() {
        return Boolean(this.getToken());
    },

    normalizeProduct(raw) {
        if (!raw || typeof raw !== 'object') return null;
        const item = raw.item || raw.product || raw;
        if (!item || !item.id) return null;

        const images = Array.isArray(item.images)
            ? item.images.map(img => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
            : [];

        return {
            ...item,
            id: Number(item.id),
            name: item.name || item.title || '',
            title: item.title || item.name || '',
            price: Number(item.price ?? 0),
            discountPrice: item.discountPrice !== null && item.discountPrice !== undefined ? Number(item.discountPrice) : null,
            discount: Number(item.discount ?? 0),
            rating: Number(item.rating ?? 0),
            reviews: Number(item.reviews ?? 0),
            category: typeof item.category === 'object' ? (item.category?.name || '') : (item.category || ''),
            categoryCode: item.categoryCode || (typeof item.category === 'object' ? item.category?.code : '') || '',
            images,
            features: Array.isArray(item.features) ? item.features : [],
            specifications: Array.isArray(item.specifications) ? item.specifications : []
        };
    },

    normalizeCart(rawResponse) {
        const raw = rawResponse?.cart || rawResponse;
        if (!raw || typeof raw !== 'object') {
            return {
                items: [],
                promoCode: null,
                summary: {
                    totalItems: 0,
                    subtotal: 0,
                    taxRate: 0.08,
                    tax: 0,
                    discountPercentage: 0,
                    discount: 0,
                    total: 0
                }
            };
        }

        const items = Array.isArray(raw.items) ? raw.items.map(item => {
            const product = item.product || {};
            const productId = Number(item.productId ?? item.product_id ?? product.id ?? item.id);
            const name = item.name ?? item.title ?? product.name ?? product.title ?? 'Product';
            const category = item.category ?? (typeof product.category === 'string' ? product.category : product.category?.name) ?? '';
            const categoryCode = item.categoryCode ?? item.category_code ?? product.categoryCode ?? product.category?.code ?? '';
            const image = item.image
                ?? (Array.isArray(item.images) ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url) : null)
                ?? (Array.isArray(product.images) ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url) : '')
                ?? '';
            const unitPrice = Number(item.unitPrice ?? item.unit_price ?? item.price ?? product.discountPrice ?? product.price ?? 0);
            const quantity = Number(item.quantity ?? 1);
            const lineTotal = Number(item.lineTotal ?? item.line_total ?? +(unitPrice * quantity).toFixed(2));

            return {
                id: item.id,
                productId,
                name,
                category,
                categoryCode,
                image,
                unitPrice,
                quantity,
                lineTotal
            };
        }) : [];

        const summary = raw.summary || {};
        const totalItems = Number(summary.totalItems ?? summary.total_items ?? items.reduce((sum, i) => sum + i.quantity, 0));
        const subtotal = Number(summary.subtotal ?? +items.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2));
        const taxRate = Number(summary.taxRate ?? summary.tax_rate ?? 0.08);
        const tax = Number(summary.tax ?? +(subtotal * taxRate).toFixed(2));
        const discountPercentage = Number(summary.discountPercentage ?? summary.discount_percentage ?? 0);
        const discount = Number(summary.discount ?? 0);
        const total = Number(summary.total ?? +(subtotal + tax - discount).toFixed(2));
        const promoCode = typeof raw.promoCode === 'string'
            ? raw.promoCode
            : (raw.promoCode?.code ?? raw.promo_code ?? summary.promoCode ?? null);

        return {
            id: raw.id,
            items,
            promoCode,
            summary: {
                totalItems,
                subtotal,
                taxRate,
                tax,
                discountPercentage,
                discount,
                total
            }
        };
    },

    async request(endpoint, options = {}) {
        const headers = {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {})
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            if (response.status === 401 && token && !endpoint.startsWith('/auth/')) {
                this.clearAuth();
            }
            const message = data?.error?.message || 'Request failed';
            const error = new Error(message);
            error.status = response.status;
            error.details = data?.error?.details || null;
            throw error;
        }

        return data;
    },

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.setAuth(data.token, data.user);
        return data;
    },

    async register(email, password) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.setAuth(data.token, data.user);
        return data;
    },

    async getMe() {
        const data = await this.request('/auth/me');
        const user = data?.user || data;
        if (user) {
            localStorage.setItem('techstore_user', JSON.stringify(user));
        }
        return user || null;
    },

    logout() {
        this.clearAuth();
        window.location.href = 'login.html';
    },

    async getProductsWithMeta(params = {}) {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.set(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';

        try {
            const data = await this.request(endpoint);
            const rawItems = Array.isArray(data) ? data : (data?.items || []);
            const items = rawItems.map(item => this.normalizeProduct(item)).filter(Boolean);
            return {
                items,
                meta: data?.meta || {
                    total_items: items.length,
                    total_pages: 1,
                    current_page: 1,
                    limit: 12
                }
            };
        } catch (error) {
            console.error('Error loading products:', error);
            return {
                items: [],
                meta: { total_items: 0, total_pages: 1, current_page: 1, limit: 12 }
            };
        }
    },

    async getProducts(params = {}) {
        const result = await this.getProductsWithMeta(params);
        return result.items;
    },

    async getCategories() {
        try {
            const data = await this.request('/categories');
            return Array.isArray(data) ? data : (data?.items || data?.categories || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            return [];
        }
    },

    async getProductById(id) {
        try {
            const data = await this.request(`/products/${encodeURIComponent(id)}`);
            return this.normalizeProduct(data);
        } catch (error) {
            console.error('Error loading product:', error);
            return null;
        }
    },

    async getProductsByCategory(categoryCode) {
        return this.getProducts({ category: categoryCode });
    },

    async getDealProducts() {
        return this.getProducts({ is_deal: 'true' });
    },

    async getCart() {
        const data = await this.request('/cart');
        return this.normalizeCart(data);
    },

    async addToCart(productId, quantity = 1) {
        const data = await this.request('/cart/items', {
            method: 'POST',
            body: JSON.stringify({ productId: Number(productId), quantity: Number(quantity) })
        });
        return this.normalizeCart(data);
    },

    async updateCartItem(idOrProductId, quantity) {
        const data = await this.request(`/cart/items/${encodeURIComponent(idOrProductId)}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity: Number(quantity) })
        });
        return this.normalizeCart(data);
    },

    async removeCartItem(idOrProductId) {
        const data = await this.request(`/cart/items/${encodeURIComponent(idOrProductId)}`, {
            method: 'DELETE'
        });
        return this.normalizeCart(data);
    },

    async clearCart() {
        const data = await this.request('/cart', {
            method: 'DELETE'
        });
        return this.normalizeCart(data);
    },

    async applyPromo(code) {
        const data = await this.request('/cart/apply-promo', {
            method: 'POST',
            body: JSON.stringify({ code })
        });
        return this.normalizeCart(data);
    }
};