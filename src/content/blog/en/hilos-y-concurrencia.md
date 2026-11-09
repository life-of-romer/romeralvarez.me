---
title: "Threads: an introduction to threads and concurrency in Java"
description: "Concurrency and multithreaded programming are powerful techniques for improving the performance and responsiveness of applications, but they also bring their own challenges. Here are some good practices and things to keep in mind when using threads and concurrency in your Java projects."
pubDate: 2023-04-30T14:00:00Z
tags: ["java", "threads and concurrency", "OOP"]
---
# Threads and concurrency

**Threads** are objects that let us do more than one task at the same time.

### Features of threads

- The Java virtual machine is a **multithreaded** system able to run several tasks at the same time.
- Java supports **threads** through some classes and interfaces and through specific methods in the `Object` class.
- The JVM manages all the details, such as allocating execution time and priorities, much as an operating system does.

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

By extending the `Thread` class we can **override** the `.run()` method, but it **is never called explicitly**: it's invoked through the `.start()` method. These are tasks that run inside a process.

This example creates two threads **(hilo1 and hilo2)** that **print their counter up to 5, pausing 500 milliseconds between iterations.** The `MiHilo` class extends `Thread` and **overrides** the `run()` method with the code each thread should run. To start the threads, we call `start()` on the instances of `MiHilo`.

### The Runnable interface

There is also **a more decoupled way** of doing this: the `Runnable` **interface**, which also implements the `.run()` method.

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

Here the `MiTarea` class **implements the** `Runnable` **interface** instead of **extending the `Thread` class**. Instead of using the `MiTarea` instances directly, **we create instances of the** `Thread` **class**, pass the `MiTarea` objects to their constructor and start them with the `.start()` method.

### What do we gain by implementing threads this way?

Implementing the `Runnable` **interface** gives us several advantages:

- It lets us **keep our own class hierarchy**. What does that mean? If you're already **extending a class, you can't also extend** `Thread`, because Java has no multiple inheritance.
    
    By implementing the **`Runnable` interface**, **you can keep inheriting from the other class** and, at the same time, **have a thread in your class.**
    
- The **`Runnable`** **interface separates the thread's logic** (the `run()` method) from the thread control logic (`Thread`, with `start()`, `sleep()` and so on). That way **you can reuse the thread's logic** (`Runnable`) in different contexts.
- **It makes modern frameworks and APIs easier to use:** many modern concurrency frameworks and APIs in **Java**, such as **ExecutorService** or **CompletableFuture**, work with `Runnable` or `Callable` objects (**a variant of Runnable that can return a value**) rather than instances of the Thread class.

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

### Thread lifecycle: New

- This is a **thread** that has been created but not yet started with the `start()` method:

```java
Runnable runnable = new Tarea();
Thread t = new Thread(runnable);

System.out.printl(t.getState()); // NEW  
```

### Thread lifecycle: Runnable

- The next stage is **RUNNABLE**: the thread is in a **runnable state**, created and started with `start()`:

```java
Runnable runnable = new Tarea();
Thread t = new Thread(runnable);

t.start();

System.out.printl(t.getState()); // RUNNABLE
```

### Thread lifecycle: Blocked

- The next state is **BLOCKED**, when the thread is eligible to run.
- It's a thread that **can't continue because it's waiting for access to a shared resource** or for a lock to be released. **A thread can enter this state in different situations, for example when**:
    - It's waiting **to acquire a lock to enter a synchronized section**: a thread can become blocked **when it tries to enter a synchronized block of code that another thread is already running.** In that case, **it waits until the thread that holds the lock releases it.**
    - It's waiting for another thread to notify it: **a thread can become blocked by calling the `wait()` method** on an object. In that case, **it waits until another thread calls** `notify()` or `notifyAll()` on the same object.

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

In this example we have a `Contador` class with a synchronized `incrementar()` method. The `TareaIncremento` class implements `Runnable` and, in its `run()` method, **calls** `incrementar()` on the shared `Contador` instance. **When two instances of** `TareaIncremento` **run in parallel, one of the threads may be blocked** trying to enter `incrementar()` while the other thread is already running it.

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

In this example we have a `Mensaje` class with a synchronized `enviar()` method and a synchronized `recibir()` method. They use `wait()` and `notifyAll()` to coordinate the communication between a sender and a receiver. The sender sends messages and the receiver receives them.

The `Emisor` class implements `Runnable` and, in its `run()` method, sends messages through the shared `Mensaje` object. The `Receptor` class also implements `Runnable` and, in its `run()` method, receives the messages sent by the `Emisor`.

When the `Emisor` and `Receptor` threads run in parallel, they can become blocked by calling `wait()` if they're waiting for a notification to continue. For example, the `Receptor` could be blocked calling `recibir()` if there are no messages available, while the `Emisor` could be blocked calling `enviar()` if the `Receptor` hasn't received the previous message yet. In both cases, the threads continue once they get the corresponding notification through `notifyAll()`.

### Thread lifecycle: Waiting

- A thread is in the **WAITING** state when it's waiting for another thread to perform a particular action.
- A thread can enter this state by calling either of the `wait()` and `join()` methods.
- These methods are used to synchronize several threads, often when one thread depends on the result or the completion of another.

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

In this example, the **`Mensaje`** class has two synchronized methods, **`enviar()`** and **`recibir()`**, which use **`Object.wait()`** and **`Object.notify()`** to coordinate the communication between a sender thread and a receiver thread. When a thread calls **`recibir()`**, it waits until a message is available (contenido != null). Likewise, when a thread calls **`enviar()`**, it waits until the previous message has been received (contenido == null). When these conditions are met, the threads use **`Object.notify()`** to tell the other thread it can carry on. Here, the threads enter the "waiting" state when they call **`Object.wait()`** and leave it when another thread calls **`Object.notify()`** on the same object.

The main method in the **`EjemploWaiting`** class creates a **`Mensaje`** object, an **`Emisor`** thread and a **`Receptor`** thread. The sender thread sends messages to the receiver thread through the **`Mensaje`** object. The receiver thread receives and prints the messages sent by the sender. Both threads run in parallel and use the **`Mensaje`** object to coordinate.

In short, the "waiting" state is useful when you need to synchronize several threads that depend on each other. In this example, the **`Object.wait()`** and **`Object.notify()`** methods achieve that synchronization, putting one thread on hold until another thread signals that it can continue.

### Thread lifecycle: Terminated

- This is a thread that has finished running. In other words, the thread has completed its task and is no longer active or ready to run anything.
- A thread becomes terminated for these reasons:
    1. The thread's **`run()`** method finished normally, that is, it ran all its instructions and reached the end of the method.
    2. An uncaught exception happened in the **`run()`** method and wasn't handled with a **`try-catch`** block. In that case the thread stops abruptly and enters the TERMINATED state.
    3. Another thread interrupted it by calling the **`interrupt()`** method, and the interrupted thread handled the interruption and finished running.

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

In this example we create a task called "MiTarea" that implements the Runnable interface. The task's **`run()`** method loops with a counter up to 5 and sleeps the thread for 500 milliseconds on each iteration.

In the **`main`** method, we create a thread with the task and start it. After waiting 2 seconds, we interrupt the thread by calling **`interrupt()`**. Inside **`run()`**, we handle the interruption in the **`catch`** block and leave the method with **`return`**. Then we wait for the thread to finish with **`join()`** and print its state, which should be "TERMINATED".

## In conclusion

To wrap up, here are some recommendations for using threads in your Java code.

Concurrency and multithreaded programming are powerful techniques for improving the performance and responsiveness of applications, but they also bring their own challenges. Here are some good practices and things to keep in mind when using threads and concurrency in your Java projects.

1. **Avoid extending the Thread class**: instead of extending Thread, implement the Runnable or Callable interface. That gives you a more decoupled, flexible design, avoids inheritance problems and makes it easier to integrate with modern frameworks.
2. **Use ExecutorService**: instead of creating and stopping threads by hand, use the ExecutorService framework. It makes it easier to control concurrency, reuse threads and manage system resources.
3. **Synchronize access to shared resources**: make sure access to resources shared between threads is synchronized, to avoid race conditions and unpredictable behaviour. You can use **`synchronized`** blocks, lock classes (**`Lock`**, **`ReentrantLock`**) or concurrent data structures (**`ConcurrentHashMap`**, **`CopyOnWriteArrayList`** and so on).
4. **Avoid deadlocks**: a deadlock happens when two or more threads wait forever for a resource another thread has locked. To prevent them, acquire locks in a consistent order and use locking mechanisms with a timeout (**`tryLock()`**).
5. **Minimize contention**: where possible, reduce contention between threads by using data local to each thread, splitting tasks into independent units or using optimized concurrent data structures.
6. **Handle interruptions properly**: when you use **`Thread.sleep()`**, **`Thread.join()`** or **`Lock.lockInterruptibly()`**, make sure you handle **`InterruptedException`** correctly. In general, you should propagate the interruption by calling **`Thread.currentThread().interrupt()`** or end the thread in an orderly way.
7. **Don't use `Thread.stop()`, `Thread.suspend()` or `Thread.resume()`**: these methods are deprecated and can cause consistency problems and deadlocks. Use interruption and state control instead to stop and manage threads.
8. **Pay attention to performance**: concurrency doesn't automatically mean better performance. Use monitoring and profiling tools to analyze how your application behaves and adjust the number of threads or the concurrency strategy as needed.
9. **Test and debug rigorously**: concurrent programming can produce unpredictable behaviour that's hard to reproduce. Use thread debugging tools and unit tests to make sure your concurrent code works correctly in different scenarios.
10. **Document and communicate**: document how threads and concurrency are used in your code. That makes it easier to understand, maintain and collaborate with other developers. Include code comments and technical documentation explaining the logic and the design decisions.
11. **Prefer immutability**: use immutable objects whenever possible. Immutable objects are those whose state can't change once created. Since their state can't change, synchronization problems and race conditions disappear.
12. **Use modern concurrency APIs**: Java offers modern, advanced APIs for concurrent programming, such as **`CompletableFuture`**, **`ForkJoinPool`** and **`StampedLock`**. Study them and use them when appropriate, as they are usually more efficient and flexible than older solutions.
13. **Keep learning**: concurrent and multithreaded programming is a field that keeps evolving. Keep up with what's new in concurrency APIs and frameworks, and with the good practices emerging in the industry. Courses, conferences and online communities will help you stay current and sharpen your skills in this area.
