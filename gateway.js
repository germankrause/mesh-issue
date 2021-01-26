const { createServer } = require("http");
const express = require("express");
const { processConfig } = require("@graphql-mesh/config");
const { getMesh } = require("@graphql-mesh/runtime");
const { graphqlHTTP } = require("express-graphql");
const ws = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { execute, subscribe } = require("graphql");

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
    "/graphql",
    graphqlHTTP({
      schema,
      graphiql: { headerEditorEnabled: true },
    })
  );
  app.use(router);

  const wsServer = new ws.Server({
    server: httpServer,
    path: "/graphql",
  });

  app.listen(3001, () => {
    useServer(
      {
        schema,
        execute,
        subscribe,
      },
      wsServer
    );
    console.log("gateway is listening on http://localhost:3001");
  });
}

start();
