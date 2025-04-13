import requests
import json

dataset = "ckandemir/amazon-products"
base_url = "https://datasets-server.huggingface.co/rows"
config = "default"
split = "train"
batch_size = 100  # Max allowed by API

# First request to get total number of rows
params = {
    "dataset": dataset,
    "config": config,
    "split": split,
    "offset": 0,
    "length": 1  # Just to get the count
}

response = requests.get(base_url, params=params)
total_rows = response.json()["num_rows_total"]
print(f"Total rows to fetch: {total_rows}")

# Fetch all data in batches
all_data = []
for offset in range(0, total_rows, batch_size):
    params["length"] = min(batch_size, total_rows - offset)
    params["offset"] = offset
    
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        batch_data = response.json()["rows"]
        all_data.extend([row["row"] for row in batch_data])
        print(f"Fetched {len(batch_data)} rows (offset {offset})")
    else:
        print(f"Error at offset {offset}: {response.status_code}")
        break

# Save to JSON file
with open("amazon_products.json", "w") as f:
    json.dump(all_data, f, indent=2)

print(f"Successfully saved {len(all_data)} rows to amazon_products.json")
