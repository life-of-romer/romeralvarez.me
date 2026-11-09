---
title: "Thread: introduzione a thread e concorrenza in Java"
description: "La concorrenza e la programmazione multithread sono tecniche potenti per migliorare le prestazioni e la reattività delle applicazioni, ma portano anche sfide particolari. Ecco alcune buone pratiche e considerazioni da tenere presenti quando usi thread e concorrenza nei tuoi progetti Java."
pubDate: 2023-04-30T14:00:00Z
tags: ["java", "thread e concorrenza", "OOP"]
---
# Thread e concorrenza

I **thread** sono oggetti che ci permettono di svolgere più di un compito alla volta.

### Caratteristiche dei thread

- La macchina virtuale Java è un sistema **multithread** in grado di eseguire più compiti contemporaneamente.
- Java supporta i **thread** con alcune classi e interfacce e con metodi specifici della classe `Object`.
- La JVM gestisce tutti i dettagli, come l'assegnazione dei tempi di esecuzione e le priorità, in modo simile a un sistema operativo.

```java
class MiHilo extends Thread {
    private String nombre;

    public MiHilo(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(nombre + " - Contador: " + i);
            try {
                // Pausamos el hilo por 500 milisegundos
                Thread.sleep(500);
            } catch (InterruptedException e) {
                System.out.println("Error en la pausa del hilo: " + e.getMessage());
            }
        }
    }
}

public class EjemploThread {
    public static void main(String[] args) {

        MiHilo hilo1 = new MiHilo("Hilo 1");
        MiHilo hilo2 = new MiHilo("Hilo 2");

        hilo1.start();
        hilo2.start();
    }
}
```

Estendendo la classe `Thread` possiamo **sovrascrivere** il metodo `.run()`, che però **non viene mai chiamato esplicitamente**: lo si invoca tramite il metodo `.start()`. Sono compiti che vengono eseguiti all'interno di un processo.

Questo esempio crea due thread **(hilo1 e hilo2)** che **stampano il loro contatore fino a 5, con una pausa di 500 millisecondi tra un'iterazione e l'altra.** La classe `MiHilo` estende `Thread` e **sovrascrive** il metodo `run()` con il codice da eseguire in ogni thread. Per avviare i thread si chiama il metodo `start()` sulle istanze di `MiHilo`.

### L'interfaccia Runnable

Esiste anche **un modo più disaccoppiato** per fare la stessa cosa: l'**interfaccia** `Runnable`, che implementa anch'essa il metodo `.run()`.

```java
class MiTarea implements Runnable {
    private String nombre;

    public MiTarea(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(nombre + " - Contador: " + i);
            try {
                // Pausamos el hilo por 500 milisegundos
                Thread.sleep(500);
            } catch (InterruptedException e) {
                System.out.println("Error en la pausa del hilo: " + e.getMessage());
            }
        }
    }
}

public class EjemploRunnable {
    public static void main(String[] args) {
        // Creamos instancias de la clase MiTarea
        MiTarea tarea1 = new MiTarea("Tarea 1");
        MiTarea tarea2 = new MiTarea("Tarea 2");

        // Creamos instancias de la clase Thread y le pasamos las tareas como argumento
        Thread hilo1 = new Thread(tarea1);
        Thread hilo2 = new Thread(tarea2);

        // Iniciamos la ejecución de los hilos con el método start()
        hilo1.start();
        hilo2.start();
    }
}
```

In questo caso la classe `MiTarea` **implementa l'interfaccia** `Runnable` invece di **estendere la classe `Thread`**. Invece di usare direttamente le istanze di `MiTarea`, **creiamo istanze della classe** `Thread`, passiamo al costruttore gli oggetti `MiTarea` e le avviamo con il metodo `.start()`.

### Cosa guadagniamo implementando i thread in questo modo?

Implementare l'**interfaccia** `Runnable` ci dà diversi vantaggi:

- Ci permette di **mantenere la nostra gerarchia di classi**. Cosa significa? Se **stai già estendendo una classe, non puoi estendere anche** `Thread`, perché Java non ha l'ereditarietà multipla.
    
    Implementando l'**interfaccia `Runnable`**, **puoi continuare a ereditare dall'altra classe** e, allo stesso tempo, **avere un thread nella tua classe.**
    
- L'**interfaccia** **`Runnable`** **separa la logica del thread** (il metodo `run()`) dalla logica di controllo del thread (`Thread`, con `start()`, `sleep()` e così via). In questo modo **puoi riutilizzare la logica** del thread (`Runnable`) in contesti diversi.
- **Semplifica l'uso di framework e API moderni:** molti framework e API di concorrenza moderni in **Java**, come **ExecutorService** o **CompletableFuture**, lavorano con oggetti `Runnable` o `Callable` (**una variante di Runnable che può restituire un valore**) invece che con istanze della classe Thread.

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

class MiTarea implements Runnable {
    private String nombre;

    public MiTarea(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(nombre + " - Contador: " + i);
            try {

                Thread.sleep(500);
            } catch (InterruptedException e) {
                System.out.println("Error en la pausa del hilo: " + e.getMessage());
            }
        }
    }
}

public class EjemploRunnableExecutorService {
    public static void main(String[] args) {

        MiTarea tarea1 = new MiTarea("Tarea 1");
        MiTarea tarea2 = new MiTarea("Tarea 2");
        MiTarea tarea3 = new MiTarea("Tarea 3");

        ExecutorService executor = Executors.newFixedThreadPool(3);

        executor.submit(tarea1);
        executor.submit(tarea2);
        executor.submit(tarea3);

        executor.shutdown();
    }
}
```

### Ciclo di vita di un thread: New

- È un **thread** che è stato creato ma non ancora avviato con il metodo `start()`:

```java
Runnable runnable = new Tarea();
Thread t = new Thread(runnable);

System.out.printl(t.getState()); // NEW  
```

### Ciclo di vita di un thread: Runnable

- La fase successiva è **RUNNABLE**: il thread è in **stato eseguibile**, creato e avviato con `start()`:

```java
Runnable runnable = new Tarea();
Thread t = new Thread(runnable);

t.start();

System.out.printl(t.getState()); // RUNNABLE
```

### Ciclo di vita di un thread: Blocked

- Lo stato successivo è **BLOCKED**, quando il thread è idoneo a essere eseguito.
- È un thread che **non può proseguire perché sta aspettando l'accesso a una risorsa condivisa** o il rilascio di un lock. **Un thread può entrare in questo stato in diverse situazioni, per esempio quando**:
    - Aspetta **di acquisire un lock per entrare in una sezione sincronizzata**: un thread può bloccarsi **quando prova a entrare in un blocco di codice sincronizzato che un altro thread sta già eseguendo.** In questo caso **aspetta finché il thread che detiene il lock non lo rilascia.**
    - Aspetta che un altro thread lo notifichi: **un thread può bloccarsi chiamando il metodo `wait()`** su un oggetto. In questo caso **aspetta finché un altro thread non chiama** `notify()` o `notifyAll()` sullo stesso oggetto.

```java
class Contador {
    private int cuenta;

    public synchronized void incrementar() {
        cuenta++;
        System.out.println("Cuenta incrementada a: " + cuenta);
    }
}

class TareaIncremento implements Runnable {
    private Contador contador;

    public TareaIncremento(Contador contador) {
        this.contador = contador;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            contador.incrementar();
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

public class EjemploBloqueoSincronizado {
    public static void main(String[] args) {
        Contador contador = new Contador();
        TareaIncremento tarea1 = new TareaIncremento(contador);
        TareaIncremento tarea2 = new TareaIncremento(contador);

        Thread hilo1 = new Thread(tarea1);
        Thread hilo2 = new Thread(tarea2);

        hilo1.start();
        hilo2.start();
    }
}
```

In questo esempio abbiamo una classe `Contador` con un metodo sincronizzato `incrementar()`. La classe `TareaIncremento` implementa `Runnable` e nel suo metodo `run()` **chiama** `incrementar()` sull'istanza condivisa di `Contador`. **Eseguendo in parallelo due istanze di** `TareaIncremento`, **uno dei thread potrebbe restare bloccato** cercando di entrare in `incrementar()` mentre l'altro lo sta già eseguendo.

```java
class Mensaje {
    private String contenido;
    private boolean disponible = false;

    public synchronized String recibir() {
        while (!disponible) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        disponible = false;
        notifyAll();
        return contenido;
    }

    public synchronized void enviar(String mensaje) {
        while (disponible) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        contenido = mensaje;
        disponible = true;
        notifyAll();
    }
}

class Emisor implements Runnable {
    private Mensaje mensaje;

    public Emisor(Mensaje mensaje) {
        this.mensaje = mensaje;
    }

    @Override
    public void run() {
        String[] mensajes = {
            "Mensaje 1",
            "Mensaje 2",
            "Mensaje 3",
            "Mensaje 4",
            "Mensaje 5"
        };

        for (String msg : mensajes) {
            mensaje.enviar(msg);
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

class Receptor implements Runnable {
    private Mensaje mensaje;

    public Receptor(Mensaje mensaje) {
        this.mensaje = mensaje;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            String msgRecibido = mensaje.recibir();
            System.out.println("Mensaje recibido: " + msgRecibido);
        }
    }
}

public class EjemploBloqueoNotificacion {
    public static void main(String[] args) {
        Mensaje mensaje = new Mensaje();
        Emisor emisor = new Emisor(mensaje);
        Receptor receptor = new Receptor(mensaje);

        Thread hiloEmisor = new Thread(emisor);
        Thread hiloReceptor = new Thread(receptor);

        hiloEmisor.start();
        hiloReceptor.start();
    }
}
```

In questo esempio abbiamo una classe `Mensaje` con un metodo sincronizzato `enviar()` e un metodo sincronizzato `recibir()`. Usano `wait()` e `notifyAll()` per coordinare la comunicazione tra un mittente e un destinatario. Il mittente invia messaggi e il destinatario li riceve.

La classe `Emisor` implementa `Runnable` e, nel suo metodo `run()`, invia messaggi tramite l'oggetto condiviso `Mensaje`. Anche la classe `Receptor` implementa `Runnable` e, nel suo metodo `run()`, riceve i messaggi inviati dall'`Emisor`.

Quando i thread `Emisor` e `Receptor` vengono eseguiti in parallelo, possono bloccarsi chiamando `wait()` se aspettano una notifica per proseguire. Per esempio, il `Receptor` potrebbe bloccarsi chiamando `recibir()` se non ci sono messaggi disponibili, mentre l'`Emisor` potrebbe bloccarsi chiamando `enviar()` se il `Receptor` non ha ancora ricevuto il messaggio precedente. In entrambi i casi i thread riprendono non appena ricevono la notifica tramite `notifyAll()`.

### Ciclo di vita di un thread: Waiting

- Un thread è nello stato **WAITING** quando aspetta che un altro thread compia un'azione precisa.
- Un thread può entrare in questo stato chiamando uno dei due metodi `wait()` e `join()`.
- Questi metodi servono a sincronizzare più thread, spesso quando un thread dipende dal risultato o dal completamento di un altro.

```java
class Mensaje {
    private String contenido;

    public synchronized String recibir() {
        while (contenido == null) {
            try {
                wait();
            } catch (InterruptedException e) {
                System.out.println("Error en la espera del hilo: " + e.getMessage());
            }
        }
        String mensaje = contenido;
        contenido = null;
        notify();
        return mensaje;
    }

    public synchronized void enviar(String mensaje) {
        while (contenido != null) {
            try {
                wait();
            } catch (InterruptedException e) {
                System.out.println("Error en la espera del hilo: " + e.getMessage());
            }
        }
        contenido = mensaje;
        notify();
    }
}

class Emisor implements Runnable {
    private Mensaje mensaje;

    public Emisor(Mensaje mensaje) {
        this.mensaje = mensaje;
    }

    @Override
    public void run() {
        String[] mensajes = {"Hola", "¿Cómo estás?", "Hasta luego"};
        for (String m : mensajes) {
            mensaje.enviar(m);
        }
    }
}

class Receptor implements Runnable {
    private Mensaje mensaje;

    public Receptor(Mensaje mensaje) {
        this.mensaje = mensaje;
    }

    @Override
    public void run() {
        for (int i = 0; i < 3; i++) {
            String m = mensaje.recibir();
            System.out.println("Mensaje recibido: " + m);
        }
    }
}

public class EjemploWaiting {
    public static void main(String[] args) {
        Mensaje mensaje = new Mensaje();
        new Thread(new Emisor(mensaje)).start();
        new Thread(new Receptor(mensaje)).start();
    }
}
```

In questo esempio la classe **`Mensaje`** ha due metodi sincronizzati, **`enviar()`** e **`recibir()`**, che usano **`Object.wait()`** e **`Object.notify()`** per coordinare la comunicazione tra un thread mittente e un thread destinatario. Quando un thread chiama **`recibir()`**, aspetta finché non c'è un messaggio disponibile (contenido != null). Allo stesso modo, quando un thread chiama **`enviar()`**, aspetta finché il messaggio precedente non è stato ricevuto (contenido == null). Quando queste condizioni si verificano, i thread usano **`Object.notify()`** per avvisare l'altro thread che può proseguire. Qui i thread entrano nello stato "waiting" quando chiamano **`Object.wait()`** e ne escono quando un altro thread chiama **`Object.notify()`** sullo stesso oggetto.

Il metodo principale della classe **`EjemploWaiting`** crea un oggetto **`Mensaje`**, un thread **`Emisor`** e un thread **`Receptor`**. Il thread mittente invia messaggi al thread destinatario tramite l'oggetto **`Mensaje`**. Il thread destinatario riceve e stampa i messaggi inviati dal mittente. Entrambi i thread girano in parallelo e usano l'oggetto **`Mensaje`** per coordinarsi.

In sintesi, lo stato "waiting" è utile quando devi sincronizzare più thread che dipendono l'uno dall'altro. Nell'esempio, i metodi **`Object.wait()`** e **`Object.notify()`** realizzano questa sincronizzazione, mettendo un thread in attesa finché un altro non segnala che può proseguire.

### Ciclo di vita di un thread: Terminated

- È un thread che ha completato la sua esecuzione. In altre parole, ha finito il suo compito e non è più attivo né pronto a eseguire nulla.
- Un thread diventa terminated per questi motivi:
    1. Il metodo **`run()`** del thread è terminato normalmente, cioè ha eseguito tutte le istruzioni ed è arrivato alla fine del metodo.
    2. Nel metodo **`run()`** si è verificata un'eccezione non gestita con un blocco **`try-catch`**. In questo caso il thread si ferma bruscamente ed entra nello stato TERMINATED.
    3. Un altro thread lo ha interrotto chiamando il metodo **`interrupt()`**, e il thread interrotto ha gestito l'interruzione terminando l'esecuzione.

```java
class MiTarea implements Runnable {
    private String nombre;

    public MiTarea(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(nombre + " - Contador: " + i);
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                System.out.println(nombre + " fue interrumpido. " + e.getMessage());

                return;
            }
        }
    }
}

public class EjemploTerminated {
    public static void main(String[] args) throws InterruptedException {

        MiTarea tarea = new MiTarea("Tarea 1");

        Thread hilo = new Thread(tarea);

        hilo.start();

        Thread.sleep(2000);

        hilo.interrupt();

        hilo.join();

        System.out.println("Estado del hilo: " + hilo.getState());
    }
}
```

In questo esempio creiamo un compito chiamato "MiTarea" che implementa l'interfaccia Runnable. Il metodo **`run()`** del compito esegue un ciclo con un contatore fino a 5 e mette in pausa il thread per 500 millisecondi a ogni iterazione.

Nel metodo **`main`** creiamo un thread con il compito e lo avviamo. Dopo aver atteso 2 secondi, interrompiamo il thread chiamando **`interrupt()`**. Dentro **`run()`** gestiamo l'interruzione nel blocco **`catch`** e usciamo dal metodo con **`return`**. Poi aspettiamo che il thread finisca con **`join()`** e stampiamo il suo stato, che dovrebbe essere "TERMINATED".

## In conclusione

Per chiudere l'articolo, ecco alcuni consigli per usare i thread nel tuo codice Java.

La concorrenza e la programmazione multithread sono tecniche potenti per migliorare le prestazioni e la reattività delle applicazioni, ma portano anche sfide particolari. Ecco alcune buone pratiche e considerazioni da tenere presenti quando usi thread e concorrenza nei tuoi progetti Java.

1. **Evita di estendere la classe Thread**: invece di estendere Thread, implementa l'interfaccia Runnable o Callable. Così ottieni un design più disaccoppiato e flessibile, eviti problemi di ereditarietà e ti integri più facilmente con i framework moderni.
2. **Usa ExecutorService**: invece di creare e terminare i thread a mano, usa il framework ExecutorService. Rende più semplice controllare la concorrenza, riutilizzare i thread e gestire le risorse di sistema.
3. **Sincronizza l'accesso alle risorse condivise**: assicurati di sincronizzare l'accesso alle risorse condivise tra thread per evitare race condition e comportamenti imprevedibili. Puoi usare blocchi **`synchronized`**, classi di lock (**`Lock`**, **`ReentrantLock`**) o strutture dati concorrenti (**`ConcurrentHashMap`**, **`CopyOnWriteArrayList`** e così via).
4. **Evita i deadlock**: un deadlock si verifica quando due o più thread aspettano per sempre una risorsa bloccata da un altro thread. Per prevenirli, acquisisci i lock sempre nello stesso ordine e usa meccanismi di lock con timeout (**`tryLock()`**).
5. **Riduci al minimo la contesa**: quando possibile, riduci la contesa tra thread usando dati locali a ciascun thread, dividendo i compiti in unità indipendenti o usando strutture dati concorrenti ottimizzate.
6. **Gestisci bene le interruzioni**: quando usi **`Thread.sleep()`**, **`Thread.join()`** o **`Lock.lockInterruptibly()`**, assicurati di gestire correttamente l'eccezione **`InterruptedException`**. In generale dovresti propagare l'interruzione chiamando **`Thread.currentThread().interrupt()`** oppure terminare il thread in modo ordinato.
7. **Non usare `Thread.stop()`, `Thread.suspend()` o `Thread.resume()`**: questi metodi sono deprecati e possono causare problemi di coerenza e deadlock. Usa invece meccanismi di interruzione e di controllo dello stato per terminare e gestire i thread.
8. **Fai attenzione alle prestazioni**: la concorrenza non garantisce automaticamente prestazioni migliori. Usa strumenti di monitoraggio e profilazione per analizzare il comportamento della tua applicazione e regolare il numero di thread o la strategia di concorrenza.
9. **Testa e fai il debug con rigore**: la programmazione concorrente può produrre comportamenti imprevedibili e difficili da riprodurre. Usa strumenti di debug dei thread e test unitari per assicurarti che il tuo codice concorrente funzioni correttamente in scenari diversi.
10. **Documenta e comunica**: documenta bene l'uso di thread e concorrenza nel tuo codice. Ne facilita la comprensione, la manutenzione e la collaborazione con altri sviluppatori. Includi commenti nel codice e documentazione tecnica che spieghino la logica e le scelte di design.
11. **Preferisci l'immutabilità**: usa oggetti immutabili quando possibile. Gli oggetti immutabili sono quelli il cui stato non può cambiare dopo la creazione. Non potendo cambiare stato, spariscono i problemi di sincronizzazione e le race condition.
12. **Usa le API di concorrenza moderne**: Java offre API moderne e avanzate per la programmazione concorrente, come **`CompletableFuture`**, **`ForkJoinPool`** e **`StampedLock`**. Studiale e usale quando è il caso, perché di solito sono più efficienti e flessibili delle soluzioni più vecchie.
13. **Continua a formarti**: la programmazione concorrente e multithread è un campo in continua evoluzione. Tieniti aggiornato sulle novità delle API e dei framework di concorrenza e sulle buone pratiche che emergono nel settore. Corsi, conferenze e comunità online ti aiuteranno a restare aggiornato e a migliorare le tue competenze.
