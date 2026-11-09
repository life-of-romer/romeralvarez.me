---
title: "Comunicazione tra sistemi distribuiti. Kafka vs RabbitMQ."
description: "Nelle architetture basate sugli eventi e nei sistemi distribuiti, scegliere il message broker giusto è fondamentale per una comunicazione efficiente e scalabile. Due dei contendenti più popolari sono Kafka e RabbitMQ. In questo articolo vediamo alcuni casi d'uso comuni per entrambi e ti aiutiamo a decidere quale usare."
pubDate: 2024-03-28T22:00:00Z
tags: ["sistemi-distribuiti", "Kafka", "RabbitMQ"]
image: /assets/comunicacion-entre-sistemas-distribuidos/kafka-vs-rabbitmq.png
---

# Kafka vs RabbitMQ: scegliere il message broker giusto

Quando parliamo di sistemi distribuiti, alta concorrenza, applicazioni che devono scalare a un volume elevato di richieste al secondo e operazioni asincrone, entrano in gioco le code di messaggi. Da lì esistono diverse tecnologie con i loro pro e contro, e le principali sono `Kafka` e `RabbitMQ`. In questo articolo esploriamo entrambe, con alcuni casi d'uso che ci aiuteranno a capire quando è "meglio" usare l'una o l'altra.

## Capire Kafka: un sistema di streaming distribuito

Apache Kafka è una piattaforma open source di streaming di eventi distribuita, nota per l'alto throughput, la tolleranza ai guasti e l'elaborazione dei dati in tempo reale. Kafka segue un modello publish-subscribe in cui i producer scrivono messaggi nei `topic` e i consumer si iscrivono a quei `topic` per riceverli. Kafka conserva i messaggi in un `distributed commit log`, che gli garantisce alta scalabilità e tolleranza ai guasti. Questo permette un throughput elevato e la riproduzione dei messaggi, rendendolo ideale per l'elaborazione dei dati in tempo reale e l'`event sourcing`.

L'architettura di Kafka ha tre componenti principali: `producer`, `broker` e `consumer`. I `producer` pubblicano messaggi nei `topic` di Kafka e i `broker` si occupano di conservare e replicare i dati nel cluster Kafka. I `consumer` leggono i dati da uno o più `topic`, il che permette l'elaborazione in parallelo e la scalabilità.

## RabbitMQ: un message broker flessibile e affidabile

RabbitMQ è un `message broker` open source e flessibile che implementa il protocollo `AMQP`. Segue un modello tradizionale di `message queue`, che permette alle applicazioni di comunicare in modo asincrono inviando e ricevendo messaggi, con la consegna in ordine a consumer specifici. Questo garantisce un ordinamento affidabile dei messaggi e flessibilità nel `message routing`, rendendolo adatto all'elaborazione di task e alla comunicazione tra microservizi.

L'architettura di RabbitMQ ruota attorno a un `message broker` centrale, che fa da intermediario tra producer e consumer. Per la replica e la conservazione dei messaggi, i producer inviano i messaggi agli `exchange`, e gli `exchange` li instradano verso le `queue` in base a regole predefinite. I consumer poi prelevano i messaggi dalle code e li elaborano.

## Differenze fondamentali: architettura e modello di consumo

Da una parte c'è il `Broker`, l'intermediario: l'infrastruttura e il funzionamento interno di ciascuna di queste tecnologie. Dall'altra c'è il `Consumer`, cioè come consumiamo da quel `Broker`, e qui le cose cambiano molto.

### RabbitMQ

* In RabbitMQ il `Broker` è considerato uno `Smart Broker` perché svolge molto lavoro, come l'instradamento dei messaggi, la persistenza e la consegna ai consumer giusti. 

* Il `Broker` usa gli `Exchange` per ricevere i messaggi dai producer. Ogni messaggio contiene una `Routing Key`, che l'`Exchange` esamina per decidere a quali `Queue` inviarlo, in base alle regole di `Binding` stabilite.

* Un `Binding` è una relazione tra un `Exchange` e una `Queue`, e definisce quali messaggi devono essere instradati verso una `Queue` specifica. La relazione si stabilisce tramite una `Binding Key`.

* RabbitMQ supporta diversi tipi di `Exchange`, come `Direct`, `Fanout`, `Topic` e `Headers`, ciascuno con il proprio algoritmo per confrontare la `Routing Key` del messaggio con le `Binding Key` e decidere l'instradamento.

* Una caratteristica potente di RabbitMQ è il `Multiplexing` dei messaggi: un singolo messaggio può essere consegnato a più `Queue` se le loro `Binding Key` corrispondono alla `Routing Key` del messaggio. Così più `Consumer` possono gestire lo stesso messaggio per scopi diversi.

* Al contrario dello `Smart Broker`, i `Consumer` in RabbitMQ sono considerati `Dumb Consumer`, perché la loro unica responsabilità è consumare i messaggi dalle `Queue` a cui sono iscritti. Di default RabbitMQ distribuisce i messaggi ai `Consumer` in modo equo con un algoritmo `Round-Robin`.

* Questo design `Smart Broker` e `Dumb Consumer` dà un sistema di messaggistica molto flessibile e scalabile, in cui i componenti possono essere modificati o sostituiti in modo indipendente, purché rispettino le convenzioni di messaggistica stabilite.

![Diagramma di flusso RabbitMQ](/assets/comunicacion-entre-sistemas-distribuidos/rabbit-flow.png)

In questo diagramma vediamo un esempio del flusso dei messaggi in RabbitMQ. Il `Producer` invia diversi eventi (`sales_event`, `inventory_update`, `price_change`) all'`Exchange`. L'`Exchange` instrada questi messaggi verso le `Queue` appropriate in base alle `Routing Key` e ai `Binding`. 

I messaggi vengono poi consumati da diversi `Consumer` per svolgere vari compiti, come aggiornare il database delle vendite (`CRM`), elaborare gli aggiornamenti di magazzino (`Inventory`), aggiornare i prezzi sul sito (`Website`) e generare report di vendita (`Analytics`).

Questo esempio mostra come RabbitMQ faciliti una comunicazione disaccoppiata tra i diversi componenti di un sistema, permettendo un'elaborazione asincrona e scalabile di eventi e task.

### Kafka

* In Kafka i messaggi non vanno a un `Broker` centrale, ma vengono conservati nei `Topic` in un `Log` distribuito. Kafka segue un modello `Publish-Subscribe`, in cui i `Producer` pubblicano messaggi nei `Topic` e i `Consumer` si iscrivono a quei `Topic` per riceverli. 

* Un `Topic` in Kafka è una categoria o un feed con un nome, in cui vengono pubblicati i record. I `Topic` in Kafka sono sempre multi-producer e multi-consumer: un `Topic` può avere zero, uno o molti `Producer` che vi scrivono e zero, uno o molti `Consumer` che lo leggono.

* Per ogni `Topic`, il cluster Kafka mantiene un `Log` partizionato. Ogni partizione è una sequenza ordinata e immutabile di record, aggiunti continuamente a un commit log strutturato. A ogni record della partizione viene assegnato un numero identificativo sequenziale chiamato `Offset`, che lo identifica in modo univoco all'interno della partizione.

* Kafka è un sistema distribuito, quindi un `Topic` di solito ha diverse partizioni distribuite su più server del cluster Kafka. Questo permette di scalare oltre la capacità di un singolo server.

* I `Consumer` si etichettano con il nome di un `Consumer Group`, e ogni record pubblicato in un `Topic` viene consegnato a un'istanza consumer all'interno di ciascun `Consumer Group` iscritto. Le `Consumer Instance` possono trovarsi in processi o macchine separati.

* Se tutte le istanze `Consumer` hanno lo stesso `Consumer Group`, i record vengono di fatto bilanciati tra di esse. Se tutte le istanze `Consumer` hanno `Consumer Group` diversi, ogni record viene trasmesso a tutti i processi `Consumer`.

![Diagramma di flusso Kafka](/assets/comunicacion-entre-sistemas-distribuidos/kafka-flow.png)

1. Il `Producer` pubblica messaggi in tre `Topic`: `sales_topic`, `inventory_topic` e `price_topic`.

2. Ogni `Topic` ha il proprio `Consumer Group`: `sales_consumer_group`, `inventory_consumer_group` e `price_consumer_group`. I `Consumer Group` si iscrivono ai `Topic` per consumare i messaggi.

3. All'interno di ogni `Consumer Group` ci sono singoli `Consumer` che svolgono azioni specifiche:

   - `Analytics` elabora le vendite.
   - `CRM` aggiorna le informazioni sul cliente.
   - `Inventory` aggiorna il `magazzino`.
   - `Website` aggiorna i prezzi.

4. I `Topic` in `Kafka` sono `partizionati` e `replicati` per la `scalabilità` e la `tolleranza ai guasti`. Ogni `partizione` è un `log` ordinato e immutabile di messaggi.

5. I `Consumer` mantengono il proprio `offset` (posizione) in ogni `partizione` che consumano, così ognuno può consumare in modo indipendente e al proprio ritmo.


## Prestazioni e scalabilità: Kafka vs RabbitMQ

Quanto alle prestazioni, Kafka e RabbitMQ offrono funzionalità simili ma hanno punti di forza diversi.

### Kafka

Eccelle negli scenari di streaming di dati in tempo reale e ad alto throughput, con un'ottima scalabilità e una bassa latenza. Può gestire milioni di messaggi al secondo, il che lo rende adatto ai casi d'uso che richiedono un'elaborazione dei dati rapida e continua. La sua architettura scala orizzontalmente distribuendo il carico su più `broker`, gestendo grandi volumi di dati in modo efficiente. Offre inoltre solide garanzie di durabilità salvando i messaggi su disco, assicurando tolleranza ai guasti e durabilità dei dati.

### RabbitMQ

Offre una consegna affidabile dei messaggi grazie a funzioni come gli `acknowledgement` e la persistenza dei messaggi. Può gestire migliaia di messaggi al secondo, il che lo rende adatto a casi d'uso con requisiti di throughput moderati. La sua architettura centralizzata può introdurre un certo overhead, ma offre robustezza e integrità dei messaggi. Scala verticalmente, ma la scalabilità orizzontale è limitata rispetto a Kafka.

## Casi d'uso ideali per Kafka e RabbitMQ

### Kafka

Ideale per un'ampia varietà di casi d'uso:

- Analisi in tempo reale e applicazioni di `streaming`
- `Event sourcing`, ingestione e `log aggregation`, soprattutto con i `big data`.
- `Data pipeline` e comunicazione tra microservizi con elaborazione di messaggi ad alto volume
- Applicazioni che richiedono alta scalabilità e tolleranza ai guasti

### RabbitMQ

Adatto per:

- `Task processing`, integrazione di servizi, `workflow orchestration` e gestione dei flussi di lavoro, incluse metriche e notifiche.
- Comunicazione asincrona tra microservizi
- Sistemi di messaggistica aziendale con consegna affidabile dei messaggi, comprese priorità dei messaggi ed esigenze di instradamento complesse.

La flessibilità di RabbitMQ nel supportare pattern di messaggistica come `point-to-point`, `publish-subscribe` e `request-response` lo rende utile in molti scenari applicativi.

## Una guida per scegliere bene

In definitiva, la scelta migliore dipende dalle tue esigenze specifiche:

- Dai priorità all'alto throughput e all'elaborazione dei dati in tempo reale? Usa Kafka.
- Hai bisogno di una consegna affidabile dei messaggi e di un instradamento flessibile per carichi moderati? Usa RabbitMQ.
- Stai valutando il `message replay` e la `log aggregation`? Kafka è il candidato forte.
- Cerchi una scalabilità senza intoppi per la comunicazione tra microservizi ad alto volume? Kafka la supporta.

**Ricorda**: nessuno dei due è intrinsecamente "migliore". Analizzare i tuoi requisiti specifici e considerare fattori come ridondanza, scalabilità, alto throughput, alta disponibilità, un'API su larga scala e sicurezza è fondamentale per prendere una decisione informata.

## Altri aspetti da considerare

- **Complessità**: l'architettura distribuita e il log `append-only` di Kafka possono richiedere più esperienza operativa rispetto all'approccio più semplice basato su code di RabbitMQ.
- **Comunità e supporto**: entrambe le piattaforme hanno comunità ampie e uno sviluppo attivo.
- **Integrazione**: valuta le integrazioni disponibili con la tua infrastruttura e i tuoi strumenti esistenti.

## Scegliere la strada giusta per la tua architettura basata sugli eventi

Con una comprensione chiara delle differenze architetturali, dei benchmark di prestazioni e dei casi d'uso ideali, puoi scegliere tra Kafka e RabbitMQ con sicurezza. Quindi immergiti nelle esigenze specifiche del tuo progetto e parti verso un'architettura basata sugli eventi robusta ed efficiente.
