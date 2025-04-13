import { query } from "winston";
import ESController from "../Controllers/ESController";
import { MatchedProduct } from "../types/collection";
import { filterProductFields } from "../utils/collectionUtils";

class CollectionModel {
	public static async getDeafultCollection(): Promise<MatchedProduct[]> {
		const esQuery = {
			"query": {
				"match_all": {}
			}
		}
		try {
			const matchedDocuments = await ESController.queryElasticIndex('amazon_products_4', esQuery, 20);
			const matchedProducts: MatchedProduct[] = matchedDocuments.map(document => filterProductFields(document));
			return matchedProducts;
		} catch (error) {
			throw 'Error';
		}

	}

	public static async getCustomCollection(collectionHandle: string): Promise<MatchedProduct[]> {
		try {
			const esQuery = {
				query: {
					bool: {
						must: {
							multi_match: {
								query: collectionHandle,
								fields: ['product_name^3', 'description', 'category^4'],
								fuzziness: 'Auto'
							}
						}
					}
				}
			}

			const matchedDocuments = await ESController.queryElasticIndex('amazon_products_4', esQuery, 20);
			const matchedProducts: MatchedProduct[] = matchedDocuments.map(document => filterProductFields(document));
			return matchedProducts;
		} catch (error) {
			throw new Error("Unable to fetch collecition");
		}

	}
}

export default CollectionModel;