---
title: "Exception handling in Java: an introduction."
description: "An introduction to exception handling in Java: the advantages and features of exceptions, how to use try-catch-finally blocks, keeping error handling apart from the rest of the logic, and running smoothly even when the unexpected happens."
pubDate: 2023-04-25T20:36:00Z
tags: ["java", "exception handling"]
---
# Exceptions
When we write programs, it's normal for them to have errors. Sometimes unexpected things happen while the program is running, and they can interrupt its normal flow. That is what we call an exception.

In Java, exceptions are how we handle these errors. Exceptions are special objects that make error handling simple and decoupled.

Exceptions give us several advantages:  
* **They keep the error-handling code apart from the program's main code:** exceptions let us handle errors without mixing them into the main code. That makes the code cleaner and easier to read, because we can tell which part handles errors and which part is business logic.
* **They let us handle the error and keep the program running:** thanks to exceptions, we decide what to do when an error happens. For example, we can show the user a message, log the error to a file or even try an alternative action.
* **They group and tell apart different kinds of errors:** Java offers a hierarchy of exception classes that lets us identify each kind of exception and treat it in its own way.
* **They propagate errors up the stack trace:** when an exception is thrown, the system stores in the exception object the sequence of calls that led to the error. That lets us trace the error back to its origin and understand which method or line of code caused the problem.  

## try/catch/finally syntax  
```java
try {
  [block that throws the exception]
} catch(Exception e) {
  [block where the error is handled]
} finally {
  [optional block that always runs]
}
```  

## The Exception class  

Throwing an exception means throwing an instance of the Exception class or of one of its subclasses. The Exception class has two constructors and two important methods.  

* We can pass a string to the Exception constructor, but we can also leave it out, and then the message is `null`.

```java
// Empty constructor
Exception e = new Exception();

// Constructor with a message
String mensaje = "Mensaje de error";
Exception e = new Exception(mensaje);
```

* We also have two important methods: `getMessage()`, which returns a summary of the error, and `printStackTrace`, which prints the whole stack of the exception, from the point where everything started and the exception was thrown. We get the full trace.
  
```java
// Summary of the message
String mensaje = e.getMessage();

// The whole stack where the error started
e.printStackTrace();
```  


In the next post we go deeper into the kinds of exceptions there are: [checked and unchecked exceptions](/blog/excepciones-chequeadas-y-no-chequeadas-java/).
