const { ApolloServer, gql, PubSub } = require("apollo-server");

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

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen({ port: 3002 }).then(() => {
  console.log("source is listening http://localhost:3002");
});
