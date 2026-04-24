document.addEventListener('DOMContentLoaded', async () => {
    const categoriesGrid = document.querySelector('.categories_grid');
    if (!categoriesGrid) return;
    
    const categories = await API.getCategories();
    
    categoriesGrid.innerHTML = categories.map(category => `
        <div class="category-card" data-category="${category.code}">
            <div class="category-card_image-wrapper">
                <img src="${category.image}" alt="${category.name}" class="category-card_image">
                <div class="category-card_overlay">
                    <div class="category-card_content">
                        <h2 class="category-card_title">${category.name}</h2>
                        <span class="category-card_count">${category.productCount} products</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    });
});