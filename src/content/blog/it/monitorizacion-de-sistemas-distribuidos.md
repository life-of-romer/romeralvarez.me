---
title: "Monitoraggio dei sistemi distribuiti"
description: "Le strategie degli esperti SRE di Google per monitorare bene i sistemi distribuiti, dall'importanza del monitoraggio white-box e black-box ai quattro segnali d'oro dell'infrastruttura cloud."
pubDate: 2023-12-06T21:20:25Z
tags: ["Cloud", "DevOps", "sistemi-distribuiti"]
image: /assets/Azure/monitoring-distribuited-systems.png
---

# Monitoraggio dei sistemi distribuiti

Oggi **i sistemi distribuiti sono la norma**, non l'eccezione. La maggior parte delle applicazioni moderne si basa su **microservizi**, che girano in **container**, che girano su **cluster di orchestrazione** di **container**, che girano nel **cloud**. La complessità di questi sistemi distribuiti rende difficile capire dove sia il problema quando qualcosa va storto.

Per un SRE **l'osservabilità è fondamentale**. I dati **non solo alimentano un'ottima esperienza di sviluppo, ma danno anche un supporto critico agli stakeholder**, offrendo metriche essenziali e spunti preziosi per le decisioni di business.

![Un sistema distribuito su Azure](/assets/Azure/architecture-telehealth-system.png)

Il monitoraggio e gli alert **permettono a un sistema di dirci quando qualcosa si è rotto o, magari, quando sta per rompersi.**  
Monitorare un'applicazione complessa **è di per sé un notevole lavoro di ingegneria**. Anche con un'infrastruttura di monitoraggio importante, può essere un compito molto complesso.

Quando si affronta il monitoraggio dei sistemi distribuiti è **fondamentale fissare aspettative ragionevoli**. Significa riconoscere la portata di ciò che il **monitoraggio può e deve fare, come si deve rispondere agli alert e quale livello di precisione e complessità è gestibile senza sovraccaricare le persone o il sistema**. L'obiettivo è bilanciare il bisogno di una sorveglianza dettagliata con l'efficienza operativa, così che il team possa concentrarsi sui problemi reali e non sui falsi allarmi. 

Il monitoraggio **non deve diventare un'impresa titanica**; al contrario, **deve essere un processo ingegnoso e ben orchestrato**. Nei team SRE di Google, da 10 a 12 persone, di solito una o due si dedicano a costruire e mantenere i sistemi di monitoraggio.

In questo senso, i sistemi di monitoraggio devono essere abbastanza robusti da segnalare le anomalie critiche, senza cadere nella trappola del sovraccarico informativo con gerarchie di dipendenze complesse o alert basati su "magia" automatizzata. L'obiettivo è mantenere il monitoraggio così semplice e comprensibile che qualsiasi membro del team possa rispondere in modo efficiente, dal primo sintomo all'analisi approfondita della causa principale. È un principio fondamentale per avere un sistema di alert efficace: massimizzare il segnale e minimizzare il rumore, facendo in modo che ogni alert sia significativo e che ogni risposta richieda un'azione intelligente e informata.

## Sintomi vs cause

Il nostro sistema di monitoraggio deve rispondere a due domande: cosa sta succedendo? E perché sta succedendo?  

Per esempio:

| Sintomo    | Causa                      |
| ---------------- | ----------------------------- |
|   Sto restituendo errori 500 o 400   | Si scopre che il database rifiuta le connessioni    |
| Le mie risposte sono molto lente  | La CPU è sovraccarica                   |

## Monitoraggio white-box vs monitoraggio black-box

### Monitoraggio white-box

È il **monitoraggio basato su metriche esposte dalle parti interne del sistema**, inclusi i log, interfacce come la Java Virtual Machine Profiling Interface o un handler HTTP che emette segnali interni.

### Monitoraggio black-box

Si concentra sul **comportamento esterno del sistema**, **senza considerarne il funzionamento interno**. Questo approccio è fondamentale per valutare l'esperienza dell'**utente finale** e garantire che il sistema rispetti i requisiti operativi e di business.

Combinare i due approcci è essenziale per una **strategia di monitoraggio completa.** Mentre il monitoraggio white-box è **proattivo e orientato alla prevenzione,** quello black-box è reattivo e centrato sull'**esperienza dell'utente.**

## I quattro segnali d'oro

Nel suo libro [Site Reliability Engineering](https://landing.google.com/sre/sre-book/toc/), Google presenta **i quattro segnali d'oro** del monitoraggio e **consiglia di concentrarsi su questi quattro parametri**:

### Latenza

È il tempo necessario per **elaborare una richiesta**. È importante distinguere tra le richieste servite con successo e quelle fallite. Per esempio, un errore **HTTP 500** dovuto alla perdita di connessione con un database o un altro backend può essere elaborato rapidamente, ma resta un **segnale di guasto**. Includere questi errori nel calcolo della latenza complessiva può quindi portare a **interpretazioni sbagliate**. Inoltre un errore lento è ancora più problematico di uno veloce, per questo è essenziale **tracciare la latenza degli errori**.


### Traffico

Misura **quanta domanda viene esercitata sul sistema**. Per un servizio web si traduce di solito in **richieste HTTP al secondo**, suddivise per tipo di richiesta (contenuto statico o dinamico). Per altri sistemi, come lo streaming audio o lo storage chiave-valore, il traffico si potrebbe misurare come **tasso di I/O di rete** o **transazioni al secondo**.

### Errori

Questa metrica **misura il tasso di richieste fallite**. Gli errori possono essere espliciti (come gli **errori HTTP 500**), impliciti (per esempio una risposta HTTP 200 corretta ma con contenuto sbagliato) o definiti da una policy (per esempio, ogni richiesta che supera un tempo di risposta concordato conta come errore). Monitorare gli errori richiede una strategia che va dal **rilevamento dei guasti completi** sul load balancer ai **test di sistema end-to-end** per gli errori più sottili.

### Saturazione

Indica quanto è **"pieno"** il servizio. Si concentra sulle **risorse più limitate del sistema** (per esempio la memoria nei sistemi con vincoli di memoria, o l'I/O in quelli con vincoli di I/O). La saturazione non si misura solo con l'uso attuale, ma anche con la **capacità del sistema di gestire carichi crescenti**. La latenza è spesso un **segnale anticipato di saturazione**, e misurare i tempi di risposta ai percentili alti (come il 99°) in finestre di tempo brevi può avvisare in anticipo di una possibile saturazione. È importante anche prevedere **la saturazione imminente**, come un disco che si riempirà nel giro di qualche ora.

Monitorando questi quattro segnali d'oro e avvisando i responsabili a ogni segnale di problema (o di potenziale problema, nel caso della saturazione), si ottiene una copertura di monitoraggio **adeguata ed efficace per il servizio**.


### **Preoccuparsi della "coda" delle richieste: strumentazione e prestazioni**

Quando si costruisce un sistema di monitoraggio da zero, viene la tentazione di basarlo sulla media di qualche grandezza: la latenza media, l'uso medio della CPU dei nodi o il riempimento medio dei database. Il pericolo negli ultimi due casi è evidente: CPU e database possono essere usati in modo molto disomogeneo. Lo stesso vale per la latenza. Se gestisci un servizio web con una latenza media di 100 ms a 1.000 richieste al secondo, l'1% delle richieste potrebbe facilmente richiedere 5 secondi. Se i tuoi utenti dipendono da diversi servizi web di questo tipo per visualizzare la pagina, il 99° percentile di un backend può facilmente diventare la risposta mediana del tuo frontend.

Il modo più semplice per distinguere una media lenta da una "coda" di richieste molto lenta è raccogliere i conteggi delle richieste raggruppati per latenza (adatti a disegnare un istogramma), invece delle latenze reali: quante richieste ho servito che hanno impiegato tra 0 e 10 ms, tra 10 e 30 ms, tra 30 e 100 ms, tra 100 e 300 ms e così via? Distribuire i limiti dell'istogramma in modo più o meno esponenziale (in questo caso con fattori di circa 3) è spesso un modo semplice per visualizzare la distribuzione delle richieste.

### Scegliere la giusta risoluzione di monitoraggio

Aspetti diversi di un sistema vanno misurati con livelli di granularità diversi. Per esempio:

* Osservare **il carico della CPU** nell'arco di un minuto non rivelerà i picchi prolungati che possono causare latenze elevate nella "coda" delle richieste.

* D'altra parte, per un servizio web che punta a non più di **9 ore di inattività all'anno** (99,9% di uptime annuo), verificare uno stato 200 più di una o due volte al minuto è probabilmente eccessivo.

* Allo stesso modo, controllare il riempimento del disco più di una volta ogni 1-2 minuti per un servizio che punta a una disponibilità del **99,9%** è probabilmente superfluo.

Bisogna fare attenzione a come si struttura la granularità delle misure. Raccogliere il carico della CPU ogni secondo può dare dati interessanti, ma misure così frequenti possono essere molto costose da raccogliere, conservare e analizzare. Se il tuo obiettivo di monitoraggio richiede un'alta risoluzione ma non una latenza estremamente bassa, puoi ridurre questi costi campionando internamente sul server e poi configurando un sistema esterno che raccolga e aggreghi quella distribuzione nel tempo o tra i server. Potresti:

* Registrare l'**utilizzo attuale della CPU** ogni secondo.

* Usando **bucket con granularità del 5%**, incrementare ogni secondo il bucket di utilizzo della CPU corrispondente.

* Aggregare quei valori **ogni minuto**.

Questa strategia ti permette di vedere i brevi picchi di CPU senza costi troppo alti per la raccolta e la conservazione dei dati.

Sommare tutti questi requisiti può portare a un sistema di monitoraggio estremamente complesso. Il tuo sistema potrebbe ritrovarsi con questi livelli di complessità:

* **Alert** su diverse soglie di latenza, a diversi percentili, su ogni tipo di metrica.

* **Codice aggiuntivo** per rilevare ed esporre le possibili cause.

* **Dashboard associate** a ciascuna di queste possibili cause.

Le fonti di potenziale complessità sono infinite. Come ogni sistema software, il monitoraggio può diventare così complesso da risultare fragile, difficile da cambiare e un peso da mantenere.

Per questo, progetta il tuo sistema di monitoraggio puntando sulla **semplicità**. Nello scegliere cosa monitorare, tieni presenti queste linee guida:

* Le regole che rilevano più spesso gli incidenti reali devono essere il più **semplici, prevedibili e affidabili possibile**.

* I segnali che vengono raccolti ma non compaiono in nessuna dashboard predefinita né vengono usati da alcun alert andrebbero eliminati, perché non servono.

## Conclusione

Una pipeline di monitoraggio e alert sana è **semplice e facile da capire**. Si concentra soprattutto **sui sintomi per le chiamate di reperibilità**, tenendo le euristiche orientate alle cause come aiuto per il debug. **Monitorare i sintomi è più facile quanto più "in alto" nello stack li si monitora, anche se il monitoraggio della saturazione e delle prestazioni di sottosistemi come i database spesso va fatto direttamente sul sottosistema**. Gli **alert via email hanno un valore molto limitato** e si riempiono facilmente di rumore; meglio preferire una **dashboard che tenga sotto controllo tutti i problemi subcritici in corso, per il tipo di informazioni che di solito finisce negli alert via email**. Una dashboard si può anche abbinare a un log, per analizzare le correlazioni storiche.

Nel lungo periodo, una rotazione di reperibilità e un prodotto di successo nascono dallo scegliere di segnalare sintomi o problemi reali imminenti, dall'adattare gli obiettivi a traguardi davvero raggiungibili e dall'assicurarsi che il monitoraggio favorisca una diagnosi rapida.
