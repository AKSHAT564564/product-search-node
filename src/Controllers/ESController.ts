import { Request, Response } from "express";
import { ESUtils } from "../utils/EsUtils";
import { Client } from "@elastic/elasticsearch";
import { WriteResponseBase } from "@elastic/elasticsearch/lib/api/types";
import Logger from "../utils/Logger";
import { MatchedProduct } from "../types/collection";

const logger = new Logger("ESController");

const esClient = new Client({
  node: "https://localhost:9200/",
  auth: {
    username: "elastic",
    password: "4mG4EiHRMB-JlTiwqgzC",
  },
  tls: {
    rejectUnauthorized: false
  }
});

const esUtils = new ESUtils(esClient);

class ESController {
  public static async createElasticDocument(
    index: string,
    document: any,
    id?: string
  ): Promise<WriteResponseBase> {
    try {
      const response = await esClient.index({ index, id, document });
      return response;
    } catch (error) {
      throw new Error("Error Creating Elastic Document");
    }
  }

  public static async queryElasticIndex(
    index: string,
    query: any,
    limit?: number
  ): Promise<any> {
    const methodName: string = "queryElasticIndex";
    try {
      const result = await esClient.search({
        index,
        size: limit ?? 100,
        query: query["query"],
      });

      if (result && result.hits) {
        const matchedDocuments = result.hits.hits as Array<any>;

        if (matchedDocuments.length) {
          const documentsSource: any[] = matchedDocuments.map((document) => {
            return {
              '_id': document['_id'],
              ...document['_source']
            };
          });

          logger.info(
            `${matchedDocuments.length} Matched documents found.`,
            methodName
          );

          return documentsSource;
        } else {
          throw new Error("No Projects Found");
        }
      }
    } catch (error) {
      logger.error(
        `Error Querying Elastic Search`,
        methodName,
        JSON.stringify(error)
      );
      throw new Error(`Error Querying Elastic Search: ${error}`);
    }
  }
}

export default ESController;
