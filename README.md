# Rock, Paper, Scissors, Lizard, Spock

### [See it live!](https://rpsls.sustare.com)

A game designed to play with serverless websockets using DynamoDB and API Gateway.

## Frontend

The front end is build using an old-school create react app. But the project would work with vite, esbuild etc.

For fun I decided to try out using `Rx.js` with websockets. For reasons why check out my [blog article on it](https://tyler.sustare.dev/articles/reactive-react-with-websockets-and-rxjs).

## Backend

The backend was written in `Go` mostly for a reason to play around with it. There are actual good reasons like it's fast, start up times in a "serverless" world, etc. as well.

The websockets are powered using DynamoDB and API Gateway. The DynamoDB table maintains the websocket connection state while API gateway keeps the connection open. This way we can send and receive messages to API Gateway in order to fire off the lambdas that respond to those messages (connect, disconnect, default).

The data layer for the project is also in DynamoDB with a single table design.

The backend is deployed with AWS SAM because I've already done this using the [Serverless Framework](https://serverless.com) and wanted to try something new.
