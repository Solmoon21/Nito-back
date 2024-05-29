export function createProductsHTML(products) {

    return products.map(
        (product) => `
            <tr>
                <td class="product-card">
                    <a href="http://localhost:5173/products/${product._id}">
                        <img src="${product.previewImages[0]}" alt="${product.name}" class="product-image">
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">${product.price}</div>
                    </a>
                </td>
            </tr>
            `
        
    ).join('')
}