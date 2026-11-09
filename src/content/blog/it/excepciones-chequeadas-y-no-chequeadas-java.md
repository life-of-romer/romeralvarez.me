---
title: "Eccezioni checked e unchecked."
description: "Impara a padroneggiare le eccezioni checked e unchecked in Java: le differenze chiave tra le due, quando e come usarle e le buone pratiche per gestire bene gli errori. Rendi più robusto il tuo codice Java con un approccio solido alla gestione delle eccezioni."
pubDate: 2023-04-27T12:21:00Z
tags: ["java", "gestione delle eccezioni"]
---

# Eccezioni checked e unchecked  
Come abbiamo visto nell'[articolo precedente](/it/blog/manejo-de-excepciones/) sulla gestione delle eccezioni, le eccezioni sono eventi anomali che si verificano durante l'esecuzione di un programma e possono alterarne il flusso normale. Java fornisce un meccanismo di gestione delle eccezioni per catturare e gestire queste situazioni.  

All'interno di questo meccanismo, Java ci offre due tipi di eccezioni: alcune vengono rilevate in fase di compilazione e altre in fase di esecuzione, e tutte partono dalla classe `Exception`.

![Diagramma delle eccezioni checked e unchecked](/assets/manejo-de-excepciones-assets/excepciones-chequeadas-no-chequeadas.png)  

## Eccezioni checked  
Sono quelle che il compilatore Java verifica durante la compilazione e che devono essere gestite con `try/catch` oppure lanciate dal metodo, cioè propagate ai metodi che lo chiamano. Un esempio di eccezione checked:  

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

Nel `main` c'è un blocco try che prova a leggere il contenuto di un file chiamato archivo.txt e a stamparlo in console. Se durante la lettura si verifica un'eccezione, viene gestita nei blocchi catch successivi.

Il primo blocco catch gestisce `FileNotFoundException`: se il file non viene trovato, stampa in console un messaggio che lo indica, seguito dal messaggio di errore. Il secondo blocco catch gestisce `IOException`.

Il metodo `leerArchivo` riceve una stringa con il percorso del file (`rutaArchivo`). Lancia `FileNotFoundException` e `IOException`, il che indica che aprire o leggere il file può fallire e che queste eccezioni vanno gestite.

## Eccezioni unchecked  
Sono quelle che non vengono verificate in compilazione. Di solito sono errori di programmazione, come accedere a un indice fuori dai limiti o eseguire un'operazione non valida, e ci si aspetta che sia il programmatore a correggerli durante lo sviluppo.  

Tutte le eccezioni unchecked ereditano dalla classe `RuntimeException`. Alcuni esempi sono `NullPointerException` e `ArrayIndexOutOfBoundsException`.  

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

In questo esempio abbiamo un metodo che esegue una divisione, ma stiamo cercando di accedere a una posizione fuori dall'array, il che provocherà un'eccezione `ArrayIndexOutOfBoundsException`.
