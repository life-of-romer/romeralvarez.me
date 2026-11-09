---
title: "Communication between distributed systems. Kafka vs RabbitMQ."
description: "In event-driven architectures and distributed systems, choosing the right message broker is crucial for efficient, scalable communication. Two of the most popular contenders are Kafka and RabbitMQ. In this post we look at some common use cases for both and help you decide which one to use."
pubDate: 2024-03-28T22:00:00Z
tags: ["distributed-systems", "Kafka", "RabbitMQ"]
image: /assets/comunicacion-entre-sistemas-distribuidos/kafka-vs-rabbitmq.png
---

# Kafka vs RabbitMQ: choosing the right message broker

When we talk about distributed systems, high concurrency, applications that have to scale to a high volume of requests per second and asynchronous operations, message queues come into play. From there, there are several technologies with their pros and cons, and the main ones are `Kafka` and `RabbitMQ`. In this post we'll explore both, along with some use cases that will help us decide when it's "better" to use one or the other.

## Understanding Kafka: a distributed streaming system

Apache Kafka is an open source distributed event streaming platform known for its high throughput, fault tolerance and real-time data processing. Kafka follows a publish-subscribe model where producers write messages to `topics` and consumers subscribe to those `topics` to receive them. Kafka stores messages in a `distributed commit log`, which gives it high scalability and fault tolerance. This enables high throughput and message replay, making it ideal for real-time data processing and `event sourcing`.

Kafka's architecture has three main components: `producers`, `brokers` and `consumers`. `Producers` publish messages to Kafka `topics`, and `brokers` store and replicate the data across the Kafka cluster. `Consumers` read data from one or more `topics`, which allows parallel processing and scalability.

## RabbitMQ: a flexible, reliable message broker

RabbitMQ is a flexible, open source `message broker` that implements the `AMQP` protocol. It follows a traditional `message queue` model, letting applications communicate asynchronously by sending and receiving messages, with messages delivered in order to specific consumers. This guarantees reliable message ordering and flexible `message routing`, making it a good fit for task processing and microservice communication.

RabbitMQ's architecture centres on a central `message broker` that acts as an intermediary between producers and consumers. For replication and message retention, producers send messages to `exchanges`, and those `exchanges` route the messages to `queues` based on predefined rules. Consumers then pick up the messages from the queues and process them.

## Fundamental differences: architecture and consumption model

On one side there's the `Broker`, the intermediary: the infrastructure and how each of these technologies works inside. On the other side there's the `Consumer`, which is how we consume from that `Broker`, and that changes a lot.

### RabbitMQ

* In RabbitMQ, the `Broker` is considered a `Smart Broker` because it does a lot of work, such as routing messages, persisting them and delivering them to the right consumers. 

* The `Broker` uses `Exchanges` to receive messages from producers. Each message carries a `Routing Key`, which the `Exchange` examines to decide which `Queues` to send the message to, based on the `Bindings` that have been set up.

* A `Binding` is a relationship between an `Exchange` and a `Queue`, and it defines which messages should be routed to a specific `Queue`. The relationship is established with a `Binding Key`.

* RabbitMQ supports different types of `Exchanges`, such as `Direct`, `Fanout`, `Topic` and `Headers`, each with its own algorithm for comparing the message's `Routing Key` with the `Binding Keys` to decide the routing.

* A powerful feature of RabbitMQ is message `Multiplexing`, where a single message can be delivered to several `Queues` if their `Binding Keys` match the message's `Routing Key`. This lets several `Consumers` handle the same message for different purposes.

* In contrast to the `Smart Broker`, `Consumers` in RabbitMQ are considered `Dumb Consumers`, because their only responsibility is to consume messages from the `Queues` they're subscribed to. By default, RabbitMQ delivers messages to `Consumers` evenly using a `Round-Robin` algorithm.

* This `Smart Broker` and `Dumb Consumer` design gives a highly flexible and scalable messaging system, where components can be changed or replaced independently as long as they follow the agreed messaging conventions.

![RabbitMQ flow diagram](/assets/comunicacion-entre-sistemas-distribuidos/rabbit-flow.png)

This diagram shows an example of the message flow in RabbitMQ. The `Producer` sends several events (`sales_event`, `inventory_update`, `price_change`) to the `Exchange`. The `Exchange` routes these messages to the right `Queues` based on the `Routing Keys` and `Bindings`. 

The messages are then consumed by different `Consumers` to carry out various tasks, such as updating the sales database (`CRM`), processing inventory updates (`Inventory`), updating prices on the website (`Website`) and generating sales reports (`Analytics`).

This example shows how RabbitMQ enables decoupled communication between the different components of a system, allowing asynchronous, scalable processing of events and tasks.

### Kafka

* In Kafka, messages don't go to a central `Broker`; they're stored in `Topics` in a distributed `Log`. Kafka follows a `Publish-Subscribe` model, where `Producers` publish messages to `Topics` and `Consumers` subscribe to those `Topics` to receive them. 

* A `Topic` in Kafka is a named category or feed that records are published to. `Topics` in Kafka are always multi-producer and multi-consumer: a `Topic` can have zero, one or many `Producers` writing to it, and zero, one or many `Consumers` reading from it.

* For each `Topic`, the Kafka cluster keeps a partitioned `Log`. Each partition is an ordered, immutable sequence of records that is continually appended to a structured commit log. Each record in the partition gets a sequential ID number called the `Offset`, which uniquely identifies it within the partition.

* Kafka is a distributed system, so a `Topic` usually has several partitions spread across several servers in the Kafka cluster. This allows it to scale beyond the capacity of a single server.

* `Consumers` label themselves with a `Consumer Group` name, and each record published to a `Topic` is delivered to one consumer instance within each subscribed `Consumer Group`. `Consumer Instances` can be in separate processes or on separate machines.

* If all the `Consumer` instances share the same `Consumer Group`, records are effectively load-balanced across them. If all the `Consumer` instances have different `Consumer Groups`, each record is broadcast to every `Consumer` process.

![Kafka flow diagram](/assets/comunicacion-entre-sistemas-distribuidos/kafka-flow.png)

1. The `Producer` publishes messages to three `Topics`: `sales_topic`, `inventory_topic` and `price_topic`.

2. Each `Topic` has its own `Consumer Group`: `sales_consumer_group`, `inventory_consumer_group` and `price_consumer_group`. The `Consumer Groups` subscribe to the `Topics` to consume messages.

3. Inside each `Consumer Group` there are individual `Consumers` that perform specific actions:

   - `Analytics` processes sales.
   - `CRM` updates customer information.
   - `Inventory` updates the `inventory`.
   - `Website` updates prices.

4. `Topics` in `Kafka` are `partitioned` and `replicated` for `scalability` and `fault tolerance`. Each `partition` is an ordered, immutable `log` of messages.

5. `Consumers` keep their own `offset` (position) in each `partition` they consume, so each can consume independently at its own pace.


## Performance and scalability: Kafka vs RabbitMQ

In terms of performance, Kafka and RabbitMQ offer similar functionality but have different strengths.

### Kafka

It excels at real-time, high-throughput data streaming, with excellent scalability and low latency. It can handle millions of messages per second, which suits use cases that need fast, continuous data processing. Its architecture scales horizontally by spreading the workload across several `brokers`, handling large volumes of data efficiently. It also gives strong durability guarantees by persisting messages to disk, ensuring fault tolerance and data durability.

### RabbitMQ

It offers reliable message delivery through features such as `acknowledgements` and message persistence. It can handle thousands of messages per second, which suits use cases with moderate throughput requirements. Its centralized architecture can add some performance overhead, but it offers robustness and message integrity. It scales vertically, but its horizontal scaling is limited compared with Kafka.

## Ideal use cases for Kafka and RabbitMQ

### Kafka

Ideal for a wide variety of use cases:

- Real-time analytics and `streaming` applications
- `Event sourcing`, ingestion and `log aggregation`, especially with `big data`.
- `Data pipelines` and microservice communication with high-volume message processing
- Applications that need high scalability and fault tolerance

### RabbitMQ

A good fit for:

- `Task processing`, service integration, `workflow orchestration` and workflow management, including metrics and notifications.
- Asynchronous communication between microservices
- Enterprise messaging systems with reliable message delivery, including message priority and specific complex routing needs.

RabbitMQ's flexibility in supporting messaging patterns such as `point-to-point`, `publish-subscribe` and `request-response` makes it useful in many application scenarios.

## A guide to making the right choice

In the end, the best choice depends on your specific needs:

- Do you prioritize high throughput and real-time data processing? Use Kafka.
- Do you need reliable message delivery and flexible routing for moderate workloads? Use RabbitMQ.
- Are you considering `message replay` and `log aggregation`? Kafka is the strong candidate.
- Are you looking for seamless scalability for high-volume microservice communication? Kafka supports it.

**Remember**: neither is inherently "better". Analyzing your specific requirements and weighing factors such as redundancy, scalability, high throughput, high availability, a large-scale API and security is vital to making an informed decision.

## Other things to consider

- **Complexity**: Kafka's distributed architecture and `append-only` log may need more operational experience than RabbitMQ's simpler queue-based approach.
- **Community and support**: both platforms have large communities and active development.
- **Integration**: evaluate the integrations available with your existing infrastructure and tools.

## Choosing the right path for your event-driven architecture

With a clear understanding of the architectural differences, the performance benchmarks and the ideal use cases, you can choose between Kafka and RabbitMQ with confidence. So dig into your project's specific needs and set off towards a robust, efficient event-driven architecture.
