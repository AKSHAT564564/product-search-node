import json
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
import re

def to_snake_case(name: str) -> str:
    """Convert field names to snake_case"""
    name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    name = re.sub('([a-z0-9])([A-Z])', r'\1_\2', name)
    return name.lower()

def transform_product(product: dict) -> dict:
    """Transform product data to snake_case"""
    transformed = {}
    
    # Simple field mappings
    field_mappings = {
        "Product Name": "product_name",
        "Category": "category",
        "Description": "description",
        "Selling Price": "selling_price",
        "Image": "image_url",
        "StructuredCategories": "structured_categories",
        "OtherCategories": "other_categories"
    }
    
    # Map simple fields
    for original, new in field_mappings.items():
        if original in product:
            transformed[new] = product[original]
    
    # Handle product specification
    if "Product Specification" in product:
        spec = {}
        for key, value in product["Product Specification"].items():
            snake_key = to_snake_case(key)
            spec[snake_key] = value
        transformed["product_specification"] = spec
    
    return transformed

def create_index_with_structured_categories(es_client, index_name: str):
    """Create index with mapping for structured categories"""
    mapping = {
        "settings": {
            "analysis": {
                "normalizer": {
                    "lowercase_normalizer": {
                        "type": "custom",
                        "char_filter": [],
                        "filter": ["lowercase"]
                    }
                }
            }
        },
        "mappings": {
            "properties": {
                "product_name": {"type": "text"},
                "category": {
                    "type": "text",
                    "fields": {
                        "raw": {
                            "type": "keyword",
                            "normalizer": "lowercase_normalizer"
                        }
                    }
                },
                "structured_categories": {
                    "type": "nested",
                    "properties": {
                        "main_category": {"type": "keyword"},
                        "subcategory_group": {"type": "keyword"},
                        "subcategory": {"type": "keyword"},
                        "level": {"type": "keyword"}
                    }
                },
                "other_categories": {"type": "keyword"},
                "description": {"type": "text"},
                "selling_price": {"type": "keyword"},
                "image_url": {"type": "keyword"},
                "product_specification": {
                    "type": "object",
                    "properties": {
                        "dimensions": {
                            "type": "object",
                            "properties": {
                                "length": {"type": "float"},
                                "width": {"type": "float"},
                                "height": {"type": "float"},
                                "unit": {"type": "keyword"}
                            }
                        },
                        "item_weight": {
                            "type": "object",
                            "properties": {
                                "value": {"type": "float"},
                                "unit": {"type": "keyword"}
                            }
                        }
                    }
                }
            }
        }
    }
    
    if not es_client.indices.exists(index=index_name):
        es_client.indices.create(index=index_name, body=mapping)
        print(f"Created index '{index_name}' with structured categories mapping")
    else:
        print(f"Index '{index_name}' already exists")

def index_products(es_client, index_name: str, file_path: str):
    """Index products with existing structured categories"""
    # Load products
    with open(file_path, 'r') as f:
        products = json.load(f)
    
    # Prepare bulk actions
    actions = [
        {
            "_index": index_name,
            "_source": transform_product(product)
        }
        for product in products
    ]
    
    # Bulk index
    success, _ = bulk(es_client, actions)
    print(f"Successfully indexed {success} products to index '{index_name}'")

if __name__ == "__main__":
    # Initialize Elasticsearch client
    es = Elasticsearch(
        hosts=["https://localhost:9200"],
        basic_auth=('elastic', '4mG4EiHRMB-JlTiwqgzC'),
        verify_certs=False
    )
    
    # Verify connection
    if not es.ping():
        raise ValueError("Could not connect to Elasticsearch")
    
    # Configuration
    INDEX_NAME = "amazon_products_"
    PRODUCTS_FILE = "new.json"  # Your file with structured categories
    
    # 1. Create index with proper mapping
    create_index_with_structured_categories(es, INDEX_NAME)
    
    # 2. Index products
    index_products(es, INDEX_NAME, PRODUCTS_FILE)
