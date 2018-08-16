# queue-playground

Exploratory repository for RabbitMQ + TS + CQRS. Still early-stage.

## Goals

* Create a service interface for working with the queue, this will allow for swapping out of the queue when needed without making changes
* Explore using gRPC for the interface

## Run

```
docker-compose up --build
```

or

```
docker-compose up rabbit
docker-compose up  --build client
```
