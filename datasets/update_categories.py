import json
import re
from typing import Dict, List, Optional, Union

def parse_product_spec(spec_str: str) -> Dict[str, Union[str, Dict]]:
    """
    Parses the product specification string into a structured dictionary.
    
    Args:
        spec_str: The product specification string (e.g., "ProductDimensions:5.9x4x0.4inches|ItemWeight:0.32ounces")
    
    Returns:
        A dictionary with parsed key-value pairs
    """
    if not spec_str or not isinstance(spec_str, str):
        return {}
    
    # Split into key-value pairs
    pairs = [pair.strip() for pair in spec_str.split('|') if pair.strip()]
    
    spec_dict = {}
    for pair in pairs:
        # Split on first colon only (some values contain colons)
        if ':' not in pair:
            continue
            
        key, value = pair.split(':', 1)
        key = key.strip()
        value = value.strip()
        
        # Special handling for dimensions to split into components
        if key.lower() == 'productdimensions':
            try:
                dimensions = [dim.strip() for dim in value.split('x')]
                if len(dimensions) == 3:
                    spec_dict['Dimensions'] = {
                        'Length': dimensions[0],
                        'Width': dimensions[1],
                        'Height': dimensions[2],
                        'Unit': re.sub(r'[^a-zA-Z]', '', dimensions[2]) or 'inches'
                    }
                    continue
            except:
                pass  # Fall through to regular key-value storage
        
        # Special handling for weights
        elif key.lower() in ['itemweight', 'shippingweight']:
            unit_match = re.search(r'([a-zA-Z]+)$', value)
            unit = unit_match.group(1) if unit_match else ''
            numeric_value = re.sub(r'[^0-9.]', '', value)
            spec_dict[key] = {
                'Value': numeric_value,
                'Unit': unit
            }
            continue
        
        # Regular key-value pair
        spec_dict[key] = value
    
    return spec_dict

def process_categories(category_str: str) -> List[str]:
    """
    Processes the category string into a list of categories.
    
    Args:
        category_str: The pipe-separated category string
    
    Returns:
        A list of cleaned category strings
    """
    if not category_str or not isinstance(category_str, str):
        return []
    
    return [cat.strip() for cat in category_str.split('|') if cat.strip()]

def update_amazon_products(input_file: str, output_file: str = None):
    """
    Processes a JSON file of Amazon products to:
    1. Convert pipe-separated categories into lists
    2. Parse product specifications into structured dictionaries
    
    Args:
        input_file: Path to input JSON file
        output_file: Path to output file (defaults to input_file with '_processed' suffix)
    """
    if output_file is None:
        if input_file.endswith('.json'):
            output_file = input_file.replace('.json', '_processed.json')
        else:
            output_file = input_file + '_processed.json'
    
    # Read the input JSON file
    with open(input_file, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    # Process each product
    updated_products = []
    for product in products:
        updated_product = product.copy()
        
        # Update categories
        if 'Category' in updated_product:
            updated_product['Category'] = process_categories(updated_product['Category'])
        
        # Update product specifications
        if 'Product Specification' in updated_product:
            updated_product['Product Specification'] = parse_product_spec(
                updated_product['Product Specification']
            )
        
        updated_products.append(updated_product)
    
    # Save the updated data
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(updated_products, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully processed and saved to {output_file}")
    print(f"Total products processed: {len(updated_products)}")

def categorize_products(products_data: List[Dict], category_hierarchy: List[Dict]) -> List[Dict]:
    """
    Categorize products by matching their categories with a predefined hierarchy.
    
    Args:
        products_data: List of product dictionaries
        category_hierarchy: List of main categories with subcategories
        
    Returns:
        List of products with added structured category information
    """
    def find_parent_category(subcategory: str) -> Optional[Dict]:
        """Helper function to find parent category for a subcategory"""
        for main_cat in category_hierarchy['categories']:
            for subcat_group in main_cat['subcategories']:
                if subcategory in subcat_group['items']:
                    return {
                        'main_category': main_cat['name'],
                        'subcategory_group': subcat_group['name'],
                        'subcategory': subcategory
                    }
        return None

    updated_products = []
    
    for product in products_data:
        # Create a copy to avoid modifying the original
        processed_product = product.copy()
        
        if 'Category' in product and isinstance(product['Category'], list):
            structured_cats = []
            remaining_cats = []
            
            for category in product['Category']:
                parent_info = find_parent_category(category)
                if parent_info:
                    structured_cats.append(parent_info)
                else:
                    remaining_cats.append(category)
            
            # Add the new structured categories
            if structured_cats:
                processed_product['StructuredCategories'] = structured_cats
            
            # Keep unmatched categories
            if remaining_cats:
                processed_product['OtherCategories'] = remaining_cats
        
        updated_products.append(processed_product)
    
    return updated_products


if __name__ == "__main__":
    import argparse
    
    # parser = argparse.ArgumentParser(description='Process Amazon products JSON file')
    # parser.add_argument('input_file', help='Path to input JSON file')
    # parser.add_argument('-o', '--output', help='Path to output file (optional)')
    
    # args = parser.parse_args()
    with open('amazon_products_processed.json', 'r', encoding='utf-8') as f:
        products = json.load(f)

    with open('category_subcategory.json', 'r', encoding='utf-8') as f:
        sampsample_hierarchy = json.load(f)
    categorized_products = categorize_products(products_data=products, category_hierarchy=sampsample_hierarchy)

    with open('new.json', 'w', encoding='utf-8') as f:
        json.dump(categorized_products, f, indent=2, ensure_ascii=False)
    # update_amazon_products('amazon_products.json')
