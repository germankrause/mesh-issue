const { createServer } = require("http");
const express = require("express");
const { processConfig } = require("@graphql-mesh/config");
const { getMesh } = require("@graphql-mesh/runtime");
const { graphqlHTTP } = require("express-graphql");

const reducePath = (path, result = '') => {
  if (!path) return null;
  result = `${path.key}.${result}`;
  if (path.prev) return reducePath(path.prev, result);
  return result.replace(/\.$/, '');
};

async function start() {
  const meshConfig = await processConfig({
    sources: [
      {
        name: "covid",
        handler: {
          graphql: {
            endpoint: "https://covid-19-two-rust.vercel.app/api/graphql",
          },
        },
      },
    ],
  });
  const { schema, pubsub } = await getMesh(meshConfig);

  pubsub.subscribe("resolverCalled", (data) => {
    console.log("resolverCalled", reducePath(data.resolverData.info.path));
  });
  pubsub.subscribe("resolverDone", (data) => {
    console.log("resolverDone", reducePath(data.resolverData.info.path));
  });
  pubsub.subscribe("resolverError", (data) => {
    console.log("resolverError", reducePath(data.resolverData.info.path));
  });

  const app = express();
  const router = express.Router();
  router.use(
    "/graphql",
    graphqlHTTP({
      schema,
      graphiql: { headerEditorEnabled: true },
    })
  );
  app.use(router);

  app.listen(3000, () => {
    console.log("gateway is listening on http://localhost:3000/graphql");
  });
}

start();
