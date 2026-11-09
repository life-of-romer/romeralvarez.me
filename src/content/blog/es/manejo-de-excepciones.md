---
title: "Manejo de excepciones en Java - introducción."
description: "Daremos una introducción al manejo de excepciones en Java, explora las ventajas y características de las excepciones, cómo utilizar bloques try-catch-finally, separar la lógica de manejo de errores, y garantizar una ejecución fluida incluso frente a imprevistos."
pubDate: 2023-04-25T20:36:00Z
tags: ["java", "manejo de excepciones"]
---
# Excepciones
Cuando programamos, es normal que nuestras aplicaciones tengan errores. A veces, cosas inesperadas pasan mientras el programa está en ejecución, y esto puede interrumpir el flujo normal del programa. A esto se le conoce como excepción.

En Java, se usan las excepciones para manejar estos errores. Las excepciones son objetos especiales que nos facilitan el manejo de errores de una forma sencilla y de manera desacoplada.

Las excepciones nos dan varias ventajas, como:  
* **Separar el código que gestiona los errores del código principal del programa:** Las excepciones permiten manejar erroes sin mezclar el código principal. Esto hace que el código sea más limpio y fácil de leer, dado que diferenciamos que parte se encarga de manejar errores y que es lógica de negocio.
* **Nos permite manejar el error y contonuar con la ejecución del programa:** Gracias a las excepciones, podemos decidir qué hacer cuando ocurre un error. Por ejemplo, podemos mostrar un mensaje al usuario, registrar el error en un archivo de logs o incluso intentar una acción alternativa.
* **Agrupar y diferenciar entre diferentes tipos de errores:** Java ofrece una jerarquía de clases de excepciones que nos permite identificar y tratar diferentes tipos de excepciones de manera específica.
* **Propagar errores hacia arriba en la StackTrace:** Cuando se lanza una excepción, el sistema guarda información sobre la secuencia de llamadas que condujo al error en el objeto de la excepción. Esto nos permite rastrear el origen del error y entender qué método o línea de código causó el problema.  

## Sintaxis try/catch/finally  
```java
try {
  [bloque que lanza la excepción]
} catch(Exception e) {
  [bloque donde se maneja el error]
} finally {
  [bloque opcional que siempre se ejecuta]
}
```  

## La clase Exception  

Cuando se lanza una excepción lo que se hace es lanzar una instancia de la clase Exception o una hija o derivada. La clase exception tiene dos constructores y dos métodos importantes.  

* Por el constructor de la clase Exception podemos pasar un string pero también podemos omitirlo y el mensaje sería `null`

```java
// Constructor vacío
Exception e = new Exception();

// Constructor con mensaje
String mensaje = "Mensaje de error";
Exception e = new Exception(mensaje);
```

* Por otro lado, tenemos dos métodos importantes. `getMessage()`que imprime un resumen del error o `printStackTrace` que imprime toda la pila completa de las excepciones, desde el origen donde todo comienza y se lanza esta excepción, tenemos toda la traza completa.
  
```java
// Resumen del mensaje
String mensaje = e.getMessage();

// Toda la pila completa donde se originó el error
e.printStackTrace();
```  


En el siguiente artículo hablaremos más en profundidad de el tipo de excepciones que existe [excepciones chequeadas y no chequeadas](/es/blog/excepciones-chequeadas-y-no-chequeadas-java/).

