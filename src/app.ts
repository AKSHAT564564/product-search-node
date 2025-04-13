import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import Logger from "./utils/Logger";
import cors from 'cors';

dotenv.config();

const logger = new Logger("app");
const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: [
    "http://localhost:5173", // Vite default port
    "http://127.0.0.1:5173", // Alternative localhost
    "http://localhost:3000", // React default port
    "http://127.0.0.1:3000", // Alternative localhost
    /\.vercel\.app$/, // Allow Vercel deployments
    /\.netlify\.app$/ // Allow Netlify deployments
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies/auth headers
  optionsSuccessStatus: 204 // Legacy browsers
};

app.use(cors(corsOptions));

// For preflight requests
app.options('*', cors(corsOptions));
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
