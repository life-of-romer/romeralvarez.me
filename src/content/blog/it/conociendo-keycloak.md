---
title: "Conoscere Keycloak: un sistema di autenticazione e autorizzazione sicuro e open source"
description: "Addio ai sistemi di autenticazione complessi. Scopri come Keycloak fa risparmiare tempo e fatica e migliora la sicurezza nel tuo sviluppo."
pubDate: 2023-08-12T14:00:00Z
tags: ["Java", "Keycloak"]
image: /assets/keycloak/keycloak-logo.png
---

# Introduzione a Keycloak: un sistema di autenticazione e autorizzazione sicuro e open source

Sviluppare **applicazioni a livello enterprise richiede più delle sole buone pratiche di programmazione**. **La sicurezza e la gestione degli utenti sono diventate pilastri fondamentali**: si espongono dati sensibili, si eseguono transazioni economiche e si conservano dati personali. Per questo **serve un sistema di autenticazione e autorizzazione robusto e sicuro.**  

Esistono molti sistemi di autenticazione e autorizzazione, come [Auth0](https://auth0.com/), [Okta](https://www.okta.com/), [AWS Cognito](https://aws.amazon.com/cognito/) e [Firebase](https://firebase.google.com/). In questo articolo ci concentriamo su Keycloak, un sistema di autenticazione e autorizzazione open source sviluppato da Red Hat.

![Keycloak](/assets/keycloak/keycloak-logo.png)

## **Cos'è Keycloak e perché aiuta gli sviluppatori?**
**Keycloak è una soluzione open source per la gestione delle identità e degli accessi.** Permette agli sviluppatori di aggiungere funzioni di sicurezza alle loro applicazioni **con poco sforzo e senza scrivere codice.** Keycloak supporta i **protocolli di autenticazione e autorizzazione più usati**, come **OpenID Connect, OAuth 2.0 e SAML 2.0.** Supporta inoltre gli standard di sicurezza più recenti, come **JSON Web Token (JWT)** e **Security Assertion Markup Language (SAML).**

## **Come funziona Keycloak?**
Per capire il valore che Keycloak ci offre, bisogna sapere come lavora dietro le quinte.

### **Architettura di base:**
Keycloak è composto da **due parti principali:** il server di **autenticazione** e il **server di amministrazione.** Il server di autenticazione si occupa dell'**autenticazione e dell'autorizzazione** degli utenti. Il server di amministrazione si occupa della **gestione di utenti, client, ruoli e così via.**  

**Keycloak segue un'architettura modulare.** Nel suo nucleo funziona come server di **autenticazione e autorizzazione**. Le applicazioni e i servizi che vogliono autenticare un utente inviano richieste al server Keycloak (**un server REST**), che convalida l'utente e restituisce un **token di accesso.**

![Schema dell'architettura di Keycloak](/assets/keycloak/keycloak-scheme.png)

### **Concetti chiave:**

Per capire come funziona Keycloak bisogna conoscere questi concetti:

* **Realm:** un **realm** in **Keycloak** è un **dominio di amministrazione, in sostanza uno spazio isolato in cui si definiscono tutti gli utenti, i ruoli, i client e gli altri aspetti legati alla sicurezza.** Quando un'applicazione (o "client") prova ad autenticare un utente, fa riferimento a un realm specifico, così valgono solo le impostazioni e i permessi di quel realm.  

* **Claim:** un **claim** è una **dichiarazione o un attributo su un utente.** Per esempio, il **nome utente, l'indirizzo email o il ruolo possono essere claim.** Quando un utente si autentica con successo, Keycloak genera un token di autenticazione che può contenere diversi claim, con informazioni sull'**utente autenticato.**  

* **Client:** un **client** in **Keycloak** è un'**applicazione o un servizio che vuole autenticare un utente.** Configurarlo in **Keycloak** significa in pratica registrarlo all'interno di un **realm** specifico. Ogni **client** **può avere ruoli associati, che stabiliscono quali utenti hanno accesso e quali permessi ricevono.**

* **Ruoli:** i **ruoli** definiscono determinati privilegi o permessi per gli utenti. In un realm puoi avere ruoli che valgono per più client o ruoli specifici di un singolo client. Quando autentica un utente, Keycloak verifica quali ruoli ha e, in base a questi, decide quali claim includere nel token di autenticazione, stabilendo così i permessi dell'utente nell'applicazione.

![Flusso di autenticazione di Keycloak](/assets/keycloak/keycloak-token-flow.png)

## **I vantaggi di usare Keycloak:**

* **Autenticazione centralizzata:** con Keycloak puoi avere un unico punto di autenticazione per più applicazioni e servizi, evitando duplicazioni.

* **Adattabile a più piattaforme:** dalle applicazioni web ai servizi cloud e alle app mobili, Keycloak si integra senza problemi.

* **Modulare e personalizzabile:** Keycloak si può estendere e personalizzare, quindi puoi adattarlo a esigenze specifiche.

* **Sicurezza rafforzata:** integra pratiche di sicurezza moderne, come l'autenticazione a due fattori e protocolli di crittografia avanzati.

## **Cosa risparmi non creando un sistema di autenticazione tuo?**

Sviluppare un sistema di autenticazione da zero è una sfida notevole, perché è davvero molto complicato. C'è il rischio di ciò che non si conosce, e ci sono intere aziende dedicate a questi servizi per garantirne la sicurezza. Ecco alcuni problemi che Keycloak ti evita:

* **Vulnerabilità di sicurezza:** ogni riga di codice è un'occasione per un errore, e nell'autenticazione gli errori possono costare cari.
* **Manutenzione e aggiornamenti:** gli standard e le pratiche di sicurezza evolvono. Mantenere un sistema proprio significa aggiornarlo regolarmente, il che richiede tempo e risorse.
* **Interoperabilità:** seguendo standard riconosciuti, Keycloak può dialogare con altri strumenti e servizi senza problemi.  

In conclusione, quando sviluppi applicazioni che vanno in produzione serve un sistema di **autenticazione e autorizzazione robusto e sicuro.** Non vedo motivi per non usarne uno così, visto che **Keycloak è open source e gratuito.** Inoltre un servizio come **Keycloak** ci fa risparmiare tempo, affida la sicurezza a un sistema fatto apposta e ci permette di concentrarci sulla logica di business.  

Per saperne di più su Keycloak, puoi visitare il suo [sito web](https://www.keycloak.org/). 

Puoi anche vedere questo esempio di come [implementare Keycloak](https://github.com/RomerEnr/spring-example-keycloak) in un'applicazione web con Spring Boot. In futuro ci sarà un articolo che lo spiega.
