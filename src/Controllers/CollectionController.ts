import { Request, response, Response } from "express";
import ESController from "./ESController";
import CollectionModel from "../Models/CollectionModel";
import { MatchedProduct } from "../types/collection";

class CollectionController {
	public static async getCollection(req: Request, res: Response) {
		const queryParams = req.query;
		const { collectionHandle, limit } = queryParams;
		let collection: MatchedProduct[] = []
		try {
			if (collectionHandle && collectionHandle.length && collectionHandle != 'default') {
				collection = await CollectionModel.getCustomCollection(collectionHandle as string);
			} else {
				collection = await CollectionModel.getDeafultCollection();
			}
			res.json({
				status: '200',
				message: '',
				data: {
					totalProducts: collection.length,
					collectionHandle: collectionHandle ?? '',
					matchedProducts: collection
				}
			});
		} catch (error) {
			res.json({
				status: '400',
				message: error.message,
				data: {}
			})
			console.log('Error in querying');
		}
	}
}

export default CollectionController;