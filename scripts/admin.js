document.addEventListener('DOMContentLoaded', async () => {
    const user = API.getUser();

    if (!API.isAuthenticated() || !user || user.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    const tbody = document.getElementById('admin-products');
    const searchInput = document.getElementById('admin-search');
    const prevBtn = document.getElementById('admin-prev');
    const nextBtn = document.getElementById('admin-next');
    const pageInfo = document.getElementById('admin-page-info');
    const messageBox = document.getElementById('admin-message');

    const productsSection = document.getElementById('products-section');
    const formSection = document.getElementById('product-form-section');
    const formTitle = document.getElementById('product-form-title');
    const productForm = document.getElementById('product-form');
    const addProductBtn = document.getElementById('add-product-button');
    const cancelProductBtn = document.getElementById('cancel-product-button');

    const idInput = document.getElementById('product-id');
    const titleInput = document.getElementById('product-title');
    const priceInput = document.getElementById('product-price');
    const discountInput = document.getElementById('product-discount');
    const stockInput = document.getElementById('product-stock');
    const categoryInput = document.getElementById('product-category');
    const ratingInput = document.getElementById('product-rating');
    const reviewsInput = document.getElementById('product-reviews');
    const descInput = document.getElementById('product-description');

    const imagesContainer = document.getElementById('product-images');
    const addImageBtn = document.getElementById('add-image-button');
    const cloudinaryFileInput = document.getElementById('cloudinary-file-input');

    const specsContainer = document.getElementById('product-specifications');
    const addSpecBtn = document.getElementById('add-specification-button');
    const saveBtn = document.getElementById('save-product-button');

    let currentPage = 1;
    let totalPages = 1;
    let searchTerm = '';
    let searchTimer = null;

    function showMessage(text, isError = false) {
        messageBox.textContent = text;
        messageBox.className = `admin_alert visible ${
            isError ? 'admin_alert--error' : 'admin_alert--success'
        }`;
        setTimeout(() => {
            messageBox.className = 'admin_alert';
        }, 5000);
    }

    function addImageRow(url = '') {
        const row = document.createElement('div');
        row.className = 'admin_dynamic-row';
        row.innerHTML = `
            <input type="url" class="auth_input product-image-url" placeholder="https://res.cloudinary.com/..." value="${url}" required />
            <button type="button" class="admin_btn admin_btn--danger remove-row-btn" style="padding: 10px 12px;">Remove</button>
        `;
        row.querySelector('.remove-row-btn').addEventListener('click', () => {
            if (imagesContainer.querySelectorAll('.admin_dynamic-row').length > 3) {
                row.remove();
            } else {
                showMessage('Minimum 3 images are required for the product slider.', true);
            }
        });
        imagesContainer.appendChild(row);
    }

    function addSpecRow(key = '', val = '') {
        const row = document.createElement('div');
        row.className = 'admin_dynamic-row';
        row.innerHTML = `
            <input type="text" class="auth_input spec-key" placeholder="Property (e.g. Battery)" value="${key}" style="flex: 1;" />
            <input type="text" class="auth_input spec-val" placeholder="Value (e.g. 30 hours)" value="${val}" style="flex: 1;" />
            <button type="button" class="admin_btn admin_btn--danger remove-row-btn" style="padding: 10px 12px;">Remove</button>
        `;
        row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
        specsContainer.appendChild(row);
    }

    function openForm(product = null) {
        productsSection.style.display = 'none';
        addProductBtn.style.display = 'none';
        formSection.classList.add('visible');

        imagesContainer.innerHTML = '';
        specsContainer.innerHTML = '';

        if (product) {
            formTitle.textContent = `Edit Product #${product.id}`;
            idInput.value = String(product.id);
            titleInput.value = product.title || product.name || '';
            priceInput.value = String(product.price || 0);
            discountInput.value = String(product.discount || 0);
            stockInput.value = String(product.stock_quantity ?? 10);
            categoryInput.value = (product.categoryCode || product.category || 'audio').toLowerCase();
            ratingInput.value = String(product.rating ?? 4.8);
            reviewsInput.value = String(product.reviews ?? 25);
            descInput.value = product.description || '';

            const imgs = Array.isArray(product.images) && product.images.length >= 3
                ? product.images
                : [
                    product.images?.[0] || '',
                    product.images?.[1] || '',
                    product.images?.[2] || ''
                  ];
            imgs.forEach((u) => addImageRow(u));

            const rawSpecs = product.specifications;
            if (Array.isArray(rawSpecs) && rawSpecs.length > 0) {
                rawSpecs.forEach((s) => addSpecRow(s.name || s.key || '', s.value || ''));
            } else if (rawSpecs && typeof rawSpecs === 'object' && Object.keys(rawSpecs).length > 0) {
                Object.entries(rawSpecs).forEach(([k, v]) => addSpecRow(k, String(v)));
            } else {
                addSpecRow('Brand', 'TechStore');
            }
        } else {
            formTitle.textContent = 'Add New Product';
            productForm.reset();
            idInput.value = '';
            discountInput.value = '0';
            stockInput.value = '10';
            ratingInput.value = '4.8';
            reviewsInput.value = '25';
            addImageRow('');
            addImageRow('');
            addImageRow('');
            addSpecRow('Brand', 'TechStore');
            addSpecRow('Warranty', '1 Year');
        }
    }

    function closeForm() {
        formSection.classList.remove('visible');
        productsSection.style.display = 'block';
        addProductBtn.style.display = 'inline-flex';
    }

    async function loadProducts() {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 32px; color: #6A7282;">Loading products...</td></tr>`;
        try {
            const { items, meta } = await API.getProductsWithMeta({
                page: currentPage,
                limit: 8,
                search: searchTerm
            });

            totalPages = Math.max(1, Number(meta.total_pages || 1));
            currentPage = Number(meta.current_page || 1);
            pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${meta.total_items} items)`;
            prevBtn.disabled = currentPage <= 1;
            nextBtn.disabled = currentPage >= totalPages;

            if (items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 32px; color: #6A7282;">No products found.</td></tr>`;
                return;
            }

            tbody.innerHTML = items
                .map((p) => {
                    const thumb = p.images && p.images[0] ? p.images[0] : '';
                    const priceText = p.discountPrice
                        ? `<strong>$${p.discountPrice}</strong> <span style="text-decoration: line-through; color: #6A7282; font-size: 12px;">$${p.price}</span>`
                        : `<strong>$${p.price}</strong>`;
                    return `
                        <tr>
                            <td>
                                <div class="admin_product-cell">
                                    <img src="${thumb}" alt="${p.title}" class="admin_product-thumb" />
                                    <div>
                                        <div class="admin_product-name">${p.title}</div>
                                        <div class="admin_product-id">ID: #${p.id} • Rating: ★ ${p.rating}</div>
                                    </div>
                                </div>
                            </td>
                            <td style="text-transform: capitalize;">${p.category}</td>
                            <td>${priceText}</td>
                            <td>${p.stock_quantity} pcs</td>
                            <td>
                                <div class="admin_actions-cell">
                                    <button type="button" class="admin_btn admin_btn--secondary edit-btn" data-id="${p.id}" style="padding: 6px 12px; font-size: 13px;">Edit</button>
                                    <button type="button" class="admin_btn admin_btn--danger delete-btn" data-id="${p.id}" style="padding: 6px 12px; font-size: 13px;">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `;
                })
                .join('');

            tbody.querySelectorAll('.edit-btn').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    try {
                        const fullProduct = await API.getProductById(id);
                        openForm(fullProduct);
                    } catch (err) {
                        showMessage(err.message || 'Failed to load product details', true);
                    }
                });
            });

            tbody.querySelectorAll('.delete-btn').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    if (!confirm(`Delete product #${id}? Cache will be invalidated automatically.`)) {
                        return;
                    }
                    try {
                        await API.deleteProduct(id);
                        showMessage(`Product #${id} deleted and catalog cache cleared.`);
                        await loadProducts();
                    } catch (err) {
                        showMessage(err.message || 'Failed to delete product', true);
                    }
                });
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 32px; color: #DC2626;">${err.message}</td></tr>`;
        }
    }

    addProductBtn.addEventListener('click', () => openForm(null));
    cancelProductBtn.addEventListener('click', () => closeForm());
    addImageBtn.addEventListener('click', () => addImageRow(''));
    addSpecBtn.addEventListener('click', () => addSpecRow('', ''));

    cloudinaryFileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            showMessage('Uploading image to Cloudinary...');
            const uploadedUrl = await API.uploadProductImage(file);
            const emptyInput = Array.from(
                imagesContainer.querySelectorAll('.product-image-url')
            ).find((inp) => !inp.value.trim());

            if (emptyInput) {
                emptyInput.value = uploadedUrl;
            } else {
                addImageRow(uploadedUrl);
            }
            showMessage('Image uploaded to Cloudinary!');
        } catch (err) {
            showMessage(err.message || 'Cloudinary upload failed', true);
        } finally {
            cloudinaryFileInput.value = '';
        }
    });

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            searchTerm = searchInput.value.trim();
            currentPage = 1;
            loadProducts();
        }, 350);
    });

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadProducts();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadProducts();
        }
    });

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const images = Array.from(imagesContainer.querySelectorAll('.product-image-url'))
            .map((inp) => inp.value.trim())
            .filter(Boolean);

        if (images.length < 3) {
            showMessage('Please provide at least 3 image URLs.', true);
            return;
        }

        const specifications = {};
        specsContainer.querySelectorAll('.admin_dynamic-row').forEach((row) => {
            const k = row.querySelector('.spec-key')?.value.trim();
            const v = row.querySelector('.spec-val')?.value.trim();
            if (k && v) {
                specifications[k] = v;
            }
        });

        const price = Number(priceInput.value);
        const discount = Number(discountInput.value || 0);
        const discountPrice =
            discount > 0 ? Math.round(price * (1 - discount / 100) * 100) / 100 : null;

        const payload = {
            title: titleInput.value.trim(),
            description: descInput.value.trim(),
            price,
            discount: discount > 0 ? discount : null,
            discount_price: discountPrice,
            is_deal: discount > 0,
            rating: Number(ratingInput.value || 4.8),
            reviews: Number(reviewsInput.value || 0),
            stock_quantity: Number(stockInput.value || 0),
            category: categoryInput.value,
            images,
            features: ['Premium build quality', 'Official TechStore warranty', 'Fast delivery'],
            specifications
        };

        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
            const editingId = idInput.value.trim();
            if (editingId) {
                await API.updateProduct(editingId, payload);
                showMessage(`Product #${editingId} updated and cache invalidated!`);
            } else {
                await API.createProduct(payload);
                showMessage('New product created and cache invalidated!');
            }
            closeForm();
            await loadProducts();
        } catch (err) {
            showMessage(err.message || 'Failed to save product', true);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Product';
        }
    });

    await loadProducts();
});