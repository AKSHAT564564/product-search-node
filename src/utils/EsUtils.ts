import { Client } from "@elastic/elasticsearch";

export class ESUtils {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async indexExists(index: string): Promise<boolean> {
    return await this.client.indices.exists({ index });
  }

  public async createIndex(index: string, mapping: any): Promise<boolean> {
    try {
      const response = await this.client.indices.create({
        index,
        mappings: {
          properties: {
            id: {
              type: "keyword",
            },
            type: {
              type: "keyword",
            },
            source: {
              type: "text",
            },
            name: {
              type: "text",
            },
            created_at: {
              type: "date",
              format: "strict_date_time",
            },
            updated_at: {
              type: "date",
              format: "strict_date_time",
            },
            location: {
              properties: {
                geocode: {
                  properties: {
                    address: {
                      type: "text",
                    },
                    types: {
                      type: "keyword",
                    },
                    place_id: {
                      type: "keyword",
                    },
                    address_components: {
                      type: "nested",
                      properties: {
                        types: {
                          type: "keyword",
                        },
                        long_name: {
                          type: "text",
                        },
                      },
                    },
                  },
                },
                lat: {
                  type: "float",
                },
                lng: {
                  type: "float",
                },
                polygon: {
                  type: "keyword",
                },
              },
            },
          },
        },
      });
      return response.acknowledged;
    } catch (error) {
      console.error(`Error creating index ${index}:`, error);
      return false;
    }
  }

  public async createDocument(index: string): Promise<any> {
    try {
      const response = await this.client.index({
        index,
        // id: "",
        document: {
          id: "12345",
          type: "project",
          source: "source-data",
          name: "My Location",
          created_at: "2024-11-19T12:00:00Z",
          updated_at: "2024-11-19T12:30:00Z",
          location: {
            geocode: {
              address: "123 Main St, City, Country",
              types: ["street_address", "premise"],
              place_id: "abc123",
              address_components: [
                {
                  types: ["street_number"],
                  long_name: "123",
                },
              ],
            },
            lat: 12.345678,
            lng: 98.765432,
            polygon: ["lat1,lng1", "lat2,lng2", "lat3,lng3"],
          },
        },
      });

      return response.result;
    } catch (error) {
      return false;
    }
  }
}
