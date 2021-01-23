const { createServer } = require("http");
const express = require("express");
const { processConfig } = require("@graphql-mesh/config");
const { getMesh } = require("@graphql-mesh/runtime");
const { graphqlHTTP } = require("express-graphql");

async function start() {
  // wait for the source to start serving
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const meshConfig = await processConfig({
    sources: [
      {
        name: "source",
        handler: {
          graphql: {
            endpoint: "http://localhost:3002/graphql",
          },
        },
      },
    ],
  });
  const { schema } = await getMesh(meshConfig);

  const app = express();
  const httpServer = createServer(app);
  const router = express.Router();
  router.use(
    "/api",
    graphqlHTTP({
      schema,
      graphiql: { headerEditorEnabled: true },
    })
  );
  app.use(router);
  httpServer.listen(3001, () => {
    console.log("gateway is listening on http://localhost:3001");
  });
}

start();
