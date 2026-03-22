document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) return;
    
    const product = await API.getProductById(productId);
    if (!product) return;
    const productTitle = document.querySelector('.product-page_title');
    const productPrice = document.querySelector('.product-page_price');
    const productRating = document.querySelector('.product-page_rating');
    const productDescription = document.querySelector('.product-page_description');
    const productCategory = document.querySelector('.product-page_category');
    const productImages = document.querySelector('.product-page_images');
    
    if (productTitle) productTitle.textContent = product.name;
    if (productPrice) productPrice.textContent = `$${product.price}`;
    if (productRating) {
        productRating.innerHTML = renderStars(product.rating);
    }
    if (productDescription) productDescription.textContent = product.description;
    if (productCategory) productCategory.textContent = product.categoryCode;
    
    if (productImages && product.images) {
        productImages.innerHTML = product.images.map(img => `
            <img src="${img}" alt="${product.name}" class="product-page_image">
        `).join('');
    }
    
    lucide.createIcons();
    
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
});