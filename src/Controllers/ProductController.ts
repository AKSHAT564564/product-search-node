import { Request, Response } from "express";
import ESController from "./ESController";

class ProductController {
	public static async getAllProducts(req: Request, res: Response) {
		const query = req.query;
		const { category, limit } = query;
		try {
			const esQuery = {
				"query": {
					"wildcard": { "category": `*${category}*` }
				}
			}
			const collection = await ESController.queryElasticIndex('amazon_products_2', esQuery, Number(limit));
			res.json([...collection]);
		} catch (error) {
			console.log('Error in querying');
		}
	}
}

export default ProductController;