# Contributing

Thank you for your interest in contributing to the 1delta!

# Development

Before running anything, you'll need to install the dependencies:

```
yarn install
```

## Running the interface locally

```
yarn start
```

The interface should automatically open. If it does not, navigate to [http://localhost:3000].

## Creating a production build

```
yarn build
```

To serve the production build:

```
yarn serve
```

Then, navigate to [http://localhost:3000] to see it.

## Running unit tests

```
yarn test
```

By default, this runs only unit tests that have been affected since the last commit. To run _all_ unit tests:

```
yarn test --watchAll
```

## Running integration tests (cypress)

Integration tests require a server to be running. In order to see your changes quickly, run `start` in its own tab/window:

```
yarn start
```

Integration tests are run using `cypress`. When developing locally, use `cypress:open` for an interactive UI, and to inspect the rendered page:

```
yarn cypress:open
```

To run _all_ cypress integration tests _from the command line_:

```
yarn cypress:run
```

## Release process

Fix pull requests should be merged whenever ready and tested.
