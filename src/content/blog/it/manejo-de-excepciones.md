---
title: "Gestione delle eccezioni in Java: introduzione."
description: "Un'introduzione alla gestione delle eccezioni in Java: vantaggi e caratteristiche delle eccezioni, come usare i blocchi try-catch-finally, separare la gestione degli errori dal resto della logica e garantire un'esecuzione fluida anche davanti agli imprevisti."
pubDate: 2023-04-25T20:36:00Z
tags: ["java", "gestione delle eccezioni"]
---
# Eccezioni
Quando programmiamo, è normale che le nostre applicazioni abbiano errori. A volte succedono cose inattese mentre il programma è in esecuzione, e questo può interromperne il flusso normale. È quello che chiamiamo eccezione.

In Java le eccezioni servono a gestire questi errori. Le eccezioni sono oggetti speciali che rendono la gestione degli errori semplice e disaccoppiata.

Le eccezioni ci danno diversi vantaggi:  
* **Separano il codice che gestisce gli errori dal codice principale del programma:** le eccezioni permettono di gestire gli errori senza mescolarli al codice principale. Il codice diventa più pulito e facile da leggere, perché distinguiamo quale parte gestisce gli errori e quale è logica di business.
* **Ci permettono di gestire l'errore e continuare l'esecuzione del programma:** grazie alle eccezioni possiamo decidere cosa fare quando si verifica un errore. Per esempio mostrare un messaggio all'utente, registrare l'errore in un file di log o persino tentare un'azione alternativa.
* **Raggruppano e distinguono i diversi tipi di errore:** Java offre una gerarchia di classi di eccezioni che ci permette di riconoscere ogni tipo di eccezione e trattarlo in modo specifico.
* **Propagano gli errori verso l'alto nello stack trace:** quando viene lanciata un'eccezione, il sistema salva nell'oggetto dell'eccezione la sequenza di chiamate che ha portato all'errore. Così possiamo risalire all'origine dell'errore e capire quale metodo o riga di codice ha causato il problema.  

## Sintassi try/catch/finally  
```java
try {
  [blocco che lancia l'eccezione]
} catch(Exception e) {
  [blocco in cui si gestisce l'errore]
} finally {
  [blocco opzionale che viene sempre eseguito]
}
```  

## La classe Exception  

Lanciare un'eccezione significa lanciare un'istanza della classe Exception o di una sua sottoclasse. La classe Exception ha due costruttori e due metodi importanti.  

* Al costruttore della classe Exception possiamo passare una stringa, ma possiamo anche ometterla: in quel caso il messaggio sarà `null`.

```java
// Costruttore vuoto
Exception e = new Exception();

// Costruttore con messaggio
String mensaje = "Mensaje de error";
Exception e = new Exception(mensaje);
```

* Abbiamo poi due metodi importanti: `getMessage()`, che restituisce un riassunto dell'errore, e `printStackTrace`, che stampa l'intero stack dell'eccezione, dal punto in cui tutto comincia e l'eccezione viene lanciata. Abbiamo la traccia completa.
  
```java
// Riassunto del messaggio
String mensaje = e.getMessage();

// L'intero stack in cui è nato l'errore
e.printStackTrace();
```  


Nel prossimo articolo parliamo più a fondo dei tipi di eccezioni che esistono: [eccezioni checked e unchecked](/it/blog/excepciones-chequeadas-y-no-chequeadas-java/).
