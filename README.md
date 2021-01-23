To run:
```
yarn
yarn start
```

Check the subscription to the source:
1. Go to `http://localhost:3002/graphql`
2. Run query 
```
subscription {
  eventtest {
    a
  }
}
```

Then go to `http://localhost:3001/api` and try the same query.
It returns an error: `Cannot read property 'eventtest' of undefined`