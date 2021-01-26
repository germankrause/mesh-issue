const https = require("https");
const express = require("express");
const { ApolloServer, gql, PubSub } = require("apollo-server-express");
const ws = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { execute, subscribe } = require("graphql");

const pubsub = new PubSub();

const A = { a: "a" };

const typeDefs = gql`
  type Query {
    a: A
  }
  type A {
    a: String!
  }
  type Subscription {
    eventtest: A
  }
`;

const resolvers = {
  Query: {
    a() {
      return A;
    },
  },
  Subscription: {
    eventtest: {
      subscribe: () => {
        return pubsub.asyncIterator(["event"]);
      },
      resolve: (data) => {
        return data;
      },
    },
  },
};

setInterval(() => {
  pubsub.publish("event", A);
}, 1000);

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

// create express
const app = express();

// apply middleware
apolloServer.applyMiddleware({ app });

// create a http server using express
const server = https.createServer(app);

// create websocket server
const wsServer = new ws.Server({
  server,
  path: "/graphql",
});

app.listen(3002, () => {
  useServer(
    {
      schema: apolloServer.schema,
      execute,
      subscribe,
    },
    wsServer
  );
  console.log("source is listening http://localhost:3002");
});
