---
title: "Excepciones chequeadas y no chequeadas."
description: "Aprende a dominar las excepciones chequeadas y no chequeadas en Java en este artículo detallado. Descubre las diferencias clave entre ambas, cuándo y cómo usarlas, y las mejores prácticas para un manejo de errores eficiente. Optimiza tu código Java y mejora la robustez de tus aplicaciones con un enfoque sólido en el manejo de excepciones chequeadas y no chequeadas."
pubDate: 2023-04-27T12:21:00Z
tags: ["java", "manejo de excepciones"]
---

# Excepciones chequeadas y no chequeadas  
Como hablamos en el [anterior post](/es/blog/manejo-de-excepciones/) acerca del manejo de excepciones las excepciones son eventos anormales que ocurren durante la ejecución de un programa y pueden alterar su flujo normal. Java proporciona un mecanismo de manejo de excepciones para capturar y manejar estas situaciones.  

Y dentro de estos mecanismos, Java nos ofrece dos tipo de excepciones, unas son capturadas en tiempo de compilación y otras son capturadas en tiempo de ejecución donde todo parte de la clase `Exception`.

![diagrama de excepciones chequeadas y no chequeadas](/assets/manejo-de-excepciones-assets/excepciones-chequeadas-no-chequeadas.png)  

## Excepciones chequeadas  
Son aquellas que el compilador de Java verifica durante la compilación y requiere que sean manejadas con el `try/catch` o lanzandola en un método, es decir propagar la excepción a los otros métodos que están llamando ese método. Un ejemplo de excepción chequeada:  

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

Dentro del main se encuentra un bloque try que intenta leer el contenido de un archivo llamado archivo.txt e imprimirlo en la consola. Si ocurre alguna excepción durante la lectura del archivo, se maneja en los bloques catch siguientes.

En el primer bloque catch, se maneja la excepción FileNotFoundException. Si el archivo no se encuentra, se imprime un mensaje en la consola que indica que el archivo no se encontró, seguido del mensaje de error asociado. Por otro lado, en el segundo bloque catch, se maneja la excepción IOException.

El método leerArchivo toma como parámetro una cadena que representa la ruta del archivo (rutaArchivo). Este método lanza excepciones FileNotFoundException e IOException, lo que indica que puede haber problemas al abrir o leer el archivo y que es necesario manejar estas excepciones.

## Expciones no chequeadas  
Son aquellas que no son chequeadas a la hora de compilar, normalmente son errores de programación como puede ser acceder a un índice fuera de rango, una operación incorrecta y se espera que sea corregido por el propio programador durante el desarrollo.  

Todas las excepciones no chequeadas heredan de la clase `RuntimeException` y algunos ejemplos son la casle `NullPointerException` o `ArrayIndexOutOfBoundsException`.  

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

En el siguiente ejemplo tenemos un método que se encarga de realizar una división, sin embargo estamos intentando acceder a una posición fuera del array, lo que va a provocar una excepción del tipo `ArrayIndexOutOfBoundsException`.