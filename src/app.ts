import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import Logger from "./utils/Logger";

dotenv.config();

const logger = new Logger("app");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use("/", router);

app.set("port", port);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

// const typeDefs = `#graphql
//   type Query {
//     hello: String
//   }`;
// const resolvers = {
//   Query: {
//     hello: (id: String) => "test",
//   },
// };

// const apolloServer = new ApolloServer({
//   typeDefs,
//   resolvers,
// });

// apolloServer.start().then(() => {
//   logger.info("Apollo Server Started");
//   app.use("/graphql", expressMiddleware(apolloServer));
// });

export default app;
