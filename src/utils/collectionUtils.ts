import { MatchedProduct } from "../types/collection";

export function isMatchedProduct(product: any): product is MatchedProduct {
    return (
        typeof product === 'object' &&
        'product_name' in product &&
        'category' in product &&
        Array.isArray(product.category) &&
        'description' in product &&
        'selling_price' in product
        // Add other required field checks
    );
}

export function filterProductFields(product: any): MatchedProduct {
    const {
        _id,
        product_name,
        category,
        description,
        selling_price,
        image_url,
        structured_categories,
        product_specification
    } = product;

    return {
        id: _id,
        product_name,
        category,
        description,
        selling_price,
        image_url,
        ...(structured_categories && { structured_categories }),
        ...(product_specification && { product_specification })
    };
}
