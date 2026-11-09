---
title: "Checked and unchecked exceptions."
description: "Learn to master checked and unchecked exceptions in Java: the key differences between them, when and how to use each one, and good practices for handling errors well. Make your Java code more robust with a solid approach to exception handling."
pubDate: 2023-04-27T12:21:00Z
tags: ["java", "exception handling"]
---

# Checked and unchecked exceptions  
As we saw in the [previous post](/blog/manejo-de-excepciones/) on exception handling, exceptions are abnormal events that happen while a program runs and can change its normal flow. Java provides an exception-handling mechanism to catch and handle these situations.  

Within that mechanism, Java offers two kinds of exceptions: some are caught at compile time and others at runtime, and all of them start from the `Exception` class.

![Diagram of checked and unchecked exceptions](/assets/manejo-de-excepciones-assets/excepciones-chequeadas-no-chequeadas.png)  

## Checked exceptions  
These are the exceptions the Java compiler checks at compile time. It requires them to be handled with `try/catch` or thrown from the method, that is, propagated to the methods that call it. An example of a checked exception:  

```java

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

public class EjemploExcepciones {
    public static void main(String[] args) {
        try {
            System.out.println(leerArchivo("archivo.txt"));
        } catch (FileNotFoundException e) {
            System.out.println("Archivo no encontrado: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("Error de entrada/salida: " + e.getMessage());
        }
    }

    public static String leerArchivo(String rutaArchivo) throws FileNotFoundException, IOException {
        FileReader fileReader = new FileReader(rutaArchivo);
        BufferedReader bufferedReader = new BufferedReader(fileReader);
        StringBuilder sb = new StringBuilder();
        String linea;

        while ((linea = bufferedReader.readLine()) != null) {
            sb.append(linea).append("\n");
        }

        bufferedReader.close();
        return sb.toString();
    }
}
```

Inside `main` there is a try block that tries to read the contents of a file called archivo.txt and print it to the console. If an exception happens while reading the file, it is handled in the catch blocks that follow.

The first catch block handles `FileNotFoundException`. If the file isn't found, it prints a message to the console saying so, followed by the error message. The second catch block handles `IOException`.

The `leerArchivo` method takes a string with the path to the file (`rutaArchivo`). It throws `FileNotFoundException` and `IOException`, which tells us that opening or reading the file can fail and that those exceptions must be handled.

## Unchecked exceptions  
These are not checked at compile time. They are usually programming errors, such as accessing an index out of range or an invalid operation, and the programmer is expected to fix them during development.  

All unchecked exceptions inherit from the `RuntimeException` class. Some examples are `NullPointerException` and `ArrayIndexOutOfBoundsException`.  

```java
public class EjemploExcepcionesNoChequeadasSinManejo {

    public static void main(String[] args) {
        int[] numeros = {1, 2, 3, 4, 5};
        int indice = 5;
        int resultado = dividir(numeros, indice);
        System.out.println("Resultado: " + resultado);
    }

    public static int dividir(int[] arr, int indice) {
        int resultado = arr[indice] / arr[indice - 1];
        return resultado;
    }
}
```

In this example we have a method that performs a division, but we are trying to access a position outside the array, which will cause an `ArrayIndexOutOfBoundsException`.
