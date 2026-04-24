const API = {
    baseUrl: './data/products.json',
    cache: null,
    
    async loadData() {
        if (this.cache) return this.cache;
        
        try {
            const response = await fetch(this.baseUrl);
            if (!response.ok) throw new Error('Ошибка загрузки данных');
            const data = await response.json();
            this.cache = data;
            return data;
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return { products: [], categories: [] };
        }
    },
    
    async getProducts() {
        const data = await this.loadData();
        return data.products || [];
    },
    
    async getCategories() {
        const data = await this.loadData();
        return data.categories || [];
    },
    
    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(product => product.id === parseInt(id));
    },
    
    async getProductsByCategory(categoryCode) {
        const products = await this.getProducts();
        return products.filter(product => product.categoryCode === categoryCode);
    },
    
    async getDealProducts() {
        const products = await this.getProducts();
        return products.filter(product => product.isDeal === true);
    },
    
    sortProducts(products, sortType) {
        const sorted = [...products];
        switch(sortType) {
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'price-asc':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return sorted.sort((a, b) => b.price - a.price);
            default:
                return sorted;
        }
    },
    
    filterByPrice(products, minPrice, maxPrice) {
        return products.filter(product => product.price >= minPrice && product.price <= maxPrice);
    },
    
    filterByRating(products, minRating) {
        return products.filter(product => product.rating >= minRating);
    }
};