export interface MatchedProduct {
    id: string;
    product_name: string;
    category: string[];
    description: string;
    selling_price: string;
    image_url: string;
    structured_categories?: StructuredCategory[];
    product_specification: {
        dimensions?: {
            length?: number;
            width?: number;
            height?: number;
            unit?: string;
        };
        item_weight?: {
            value?: number;
            unit?: string;
        };
        shipping_weight?: {
            value?: number;
            unit?: string;
        };
        domestic_shipping?: string;
        international_shipping?: string;
        manufacturer_recommended_age?: string;
    };
}

export interface StructuredCategory {
    main_category: string;
    subcategory_group?: string;
    subcategory?: string;
    level: 'main' | 'subcategory_group' | 'subcategory';
}