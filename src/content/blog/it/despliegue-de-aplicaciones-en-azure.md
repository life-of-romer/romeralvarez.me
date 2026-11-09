---
title: "Deploy di applicazioni di base su Azure Kubernetes Service (AKS)"
description: "Impara a fare il deploy di applicazioni in modo efficiente su Azure Kubernetes Service (AKS). Questa guida passo passo ti porta dalla creazione di un Azure Container Registry al deploy di immagini container su AKS, con esempi pratici e diagrammi."
pubDate: 2023-11-30T21:19:00Z
tags: ["Azure", "Cloud", "Kubernetes", "DevOps"]
---

# Deploy di applicazioni su Azure Kubernetes Service (AKS): introduzione di base.  

## Introduzione

In questo articolo vediamo come fare il deploy di applicazioni con Azure Kubernetes Service (AKS). Andremo dalla creazione di un **Azure Container Registry** al deploy di immagini container su AKS, con esempi pratici e diagrammi.

![Relazione tra ACR e AKS](/assets/Azure/acr-aks.png)

Faremo l'<a href="https://learn.microsoft.com/en-gb/training/modules/project-deploy-applications-azure-kubernetes-service/2-exercise-provision-azure-container-registry-azure-kubernet" target="_blank">esercizio proposto da Microsoft</a>.

Si compone di 4 esercizi: 

* Esercizio 1: provisioning di **Azure Container Registry (ACR)** e **Azure Kubernetes Service (AKS).**
* Esercizio 2: creare immagini container **Linux** e **Windows** e salvarle in **Azure Container Registry.**
* Esercizio 3: fare il deploy dei container su **Azure Kubernetes Service.**
* Esercizio 4: controllare il deploy ed **eliminare** tutte le risorse.

## Esercizio 1: provisioning di Azure Container Registry (ACR) e Azure Kubernetes Service (AKS)

### Passo 1: creare un Azure Container Registry (ACR)

1. Accedi al [portale di Azure](https://portal.azure.com/).
2. Cerca `Container Registries` nella barra di ricerca. Fai clic su `+ Create` e compila i seguenti dati:  

| Impostazione         | Valore                             |
| --------------------- | --------------------------------- |
| Subscription          | La tua sottoscrizione Azure           |
| Resource Group        | acr-01-RG                         |
| Registry name         | Deve essere un nome univoco; il nostro è romeralvarezme                    |
| Region                | Europe West                   |
| Availability zones    | Nessuna                           |
| SKU                   | Basic                             |

### Passo 2: creare una Azure Virtual Network e un cluster AKS

Creazione di una rete virtuale e di un cluster AKS.

1. Cerca `Virtual Network` nella barra di ricerca. Fai clic su `+ Create` e compila i seguenti dati:  

| Impostazione    | Valore                         |
| ---------------- | ----------------------------- |
| Subscription     | La tua sottoscrizione Azure    |
| Resource Group   | aks-01-RG                     |
| Virtual network name | vnet-01                  |
| Region           | [La stessa regione di prima]   |

* Passa per la scheda "Security" e accetta tutti i valori predefiniti. Poi vai su "IP Addresses", accetta i valori predefiniti, assicurati che l'address space sia `10.0.0.0/16` ed elimina la subnet predefinita.
* Seleziona `Review + Create` e poi `Create`.

2. Cerca `Kubernetes Service` nella barra di ricerca. Fai clic su `+ Create` e compila i seguenti dati:

| Impostazione              | Valore                   |
| -------------------------- | ----------------------- |
| Subscription               | La tua sottoscrizione Azure        |
| Resource Group             | aks-01-RG               |
| Cluster preset configuration    | Dev/Test                  |
| Kubernetes cluster name    | aks-01                  |
| Region                     | [La stessa regione di prima] |
| Availability zones         | Nessuna                 |
| AKS pricing tier           | Free                    |
| Kubernetes version         | [Valore predefinito]     |
| Automatic upgrade          | Disabled                |
| Node size                  | Standard B4ms           |
| Scale method               | Manual                  |
| Node count                 | 2                       |

* Nella scheda "Networking", seleziona `Azure CNI` e scegli la rete virtuale vnet-01.
* Crea una subnet (aks-subnet) con l'intervallo di indirizzi `10.0.0.0/20`.
* Poi compila i seguenti dati:

| Impostazione                        | Valore                   |
| ------------------------------------ | ----------------------- |
| Cluster subnet                       | aks-subnet (10.0.0.0/20)|
| Kubernetes service address range     | 172.16.0.0/22           |
| Kubernetes DNS service IP address    | 172.16.3.254            |
| DNS name prefix                      | aks-01-dns              |
| Enable private cluster               | Disabled                |
| Set authorized IP ranges             | Disabled                |
| Network policy                       | None                    |

3. Ora creiamo il node pool Windows:

* Nella finestra "Node Pools", aggiungi un nuovo node pool per Windows con i seguenti dati:

| Impostazione               | Valore          |
| --------------------------- | -------------- |
| Node pool name              | w1pool         |
| Mode                        | User           |
| OS type                     | Windows        |
| Availability zone           | Nessuna        |
| Enable Azure spot instances | Disabled       |
| Node size                   | Standard B4s_v2|
| Scale method                | Manual         |
| Node count                  | 2              |
| Max pods per node           | 30             |
| Enable public IP per node   | Disabled       |


4. Nella scheda `Integrations` selezioniamo il registry creato prima, ci assicuriamo di disattivare `Azure Monitor` e `Azure Policy` e selezioniamo `Review + Create` e poi `Create`.

Ora aspettiamo che le risorse vengano create, e l'esercizio 1 è concluso. Avremo:

* Creato un Azure Container Registry (ACR) e configurato una Azure Virtual Network e un cluster AKS.
* Creato un node pool Windows per il cluster AKS.
* Collegato l'Azure Container Registry (ACR) al cluster AKS.

Il risultato sarà qualcosa del genere:
![ACR e AKS](/assets/Azure/acr-aks-connected.png)

## Esercizio 2: creare immagini container Linux e Windows e salvarle in Azure Container Registry

In questo esercizio creeremo immagini container Linux e Windows e le salveremo in Azure Container Registry (ACR).

### Passo 1: preparare l'ambiente

* Apriamo Azure Cloud Shell dal portale di Azure e selezioniamo `Bash` come shell.
* Eseguiamo i seguenti comandi per creare una cartella e spostarci al suo interno:

```bash
mkdir ~/image-l01
cd ~/image-l01
```

* Creiamo il seguente file JavaScript con l'editor che preferiamo, nel mio caso `vim`:

```bash
vim server.js
```
### Passo 2: creare i file del progetto Linux 

* Dentro server.js incolliamo il seguente codice:

```javascript
const http = require('http')
const port = 80
const server = http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'})
  response.write('Hello World from Node\n')
  response.end('Version: ' + process.env.NODE_VERSION + '\n')
})
server.listen(port)
console.log(`Server running at http://localhost: ${port}`)
```

* Creiamo il seguente package.json, sempre con il nostro editor preferito:

```json
{
  "name": "helloworld",
  "version": "1.0.0",
  "description": "Sample app for ACR Build",
  "main": "server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js"
  },
  "license": "MIT"
}
```

* Creiamo il seguente Dockerfile con il nostro editor preferito:

```bash
FROM node:20.2-alpine
COPY . /src
RUN cd /src && npm install
EXPOSE 80
CMD ["node", "/src/server.js"]
```

* Nella sessione bash, troviamo il nome del nostro Azure Container Registry (ACR) e lo salviamo in una variabile d'ambiente:

```bash
ACR_RG='acr-01-RG'
ACR_NAME=$(az acr list --resource-group $ACR_RGNAME --query "[].name" --output tsv)
```

* Dalla sessione bash, costruiamo l'immagine Docker a partire dal Dockerfile creato e la carichiamo direttamente nel nostro Azure Container Registry (ACR), il cui nome è salvato nella variabile `ACR_NAME`:

```bash
az acr build --registry $ACR_NAME --image hellofromnode:v1.0 .
```

### Passo 3: creare i file del progetto Windows

* Creiamo la cartella del progetto Windows:

```bash
mkdir ~/image-w01
cd ~/image-w01
```

* Cloniamo questo repository, che contiene i file necessari per costruire un'immagine Windows con Docker:

```bash
git clone https://github.com/Azure-Samples/dotnetcore-docs-hello-world.git
cd ~/image-w01/dotnetcore-docs-hello-world
```

* Dentro la cartella eseguiamo questo comando per costruire l'immagine:

```bash
az acr build --registry $ACR_NAME --image hellofromdotnet:v1.0 --platform windows --file Dockerfile.windows .
```

Andando nel nostro registry, vedremo che ci sono entrambe le immagini:

![Repository ACR](/assets/Azure/acr-repository.png)

## Esercizio 3: deploy dei container su Azure Kubernetes Service

In questa attività creeremo due namespace nel nostro cluster AKS e faremo il deploy delle immagini create nell'esercizio precedente.

### Passo 1: creare i namespace

1. Nel portale di Azure, cerchiamo `Kubernetes Services` e selezioniamo il nostro cluster AKS.
2. Nella scheda `Kubernetes Resources` selezioniamo `Namespaces` e ne creiamo uno chiamato `dev-node` e un altro chiamato `dev-dotnet`.

### Passo 2: creare i manifest per il deploy delle immagini Linux e Windows

1. Nella Cloud Shell creiamo la seguente cartella:

```bash
mkdir ~/aks-l01
cd ~/aks-l01
```

2. Creiamo il seguente manifest Kubernetes, aks-deployment-l01.yaml:


```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hellofromnode-deployment
  labels:
    environment: dev
    app: hellofromnode
spec:
  replicas: 1
  template:
    metadata:
      name: hellofromnode
      labels:
        app: hellofromnode
    spec:
      nodeSelector:
        "kubernetes.io/os": linux
      containers:
      - name: hellofromnode
        image: ACR_NAME.azurecr.io/hellofromnode:v1.0
        resources:
          limits:
            cpu: 1
            memory: 800M
        ports:
          - containerPort: 80
  selector:
    matchLabels:
      app: hellofromnode
---
apiVersion: v1
kind: Service
metadata:
  name: hellofromnode-service
spec:
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 80
  selector:
    app: hellofromnode
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hellofromdotnet-deployment
  labels:
    environment: dev
    app: hellofromdotnet
spec:
  replicas: 1
  template:
    metadata:
      name: hellofromdotnet
      labels:
        app: hellofromdotnet
    spec:
      nodeSelector:
        "kubernetes.io/os": windows
      containers:
      - name: hellofromdotnet
        image: ACR_NAME.azurecr.io/hellofromdotnet:v1.0
        resources:
          limits:
            cpu: 1
            memory: 800M
        ports:
          - containerPort: 80
  selector:
    matchLabels:
      app: hellofromdotnet
---
apiVersion: v1
kind: Service
metadata:
  name: hellofromdotnet-service
spec:
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 80
  selector:
    app: hellofromdotnet
```

3. Sostituiamo `ACR_NAME` con il nome del nostro Azure Container Registry (ACR) ed eseguiamo il seguente comando per il deploy dell'immagine Linux:

```bash
sed -i "s/ACR_NAME/$ACR_NAME/" ./aks-deployment-w01.yaml
kubectl apply -f ./aks-deployment-w01.yaml -n dev-node
```

### Passo 3: deploy dei manifest nei rispettivi namespace:

1. Nella sessione bash, ci colleghiamo al cluster con i seguenti comandi:
    
```bash
AKSRG='aks-01-RG'
AKSNAME='aks-01'
az aks get-credentials --resource-group $AKSRG --name $AKSNAME
```

2. Verifichiamo che la connessione funzioni:

```bash
kubectl get nodes
```

3. Facciamo il deploy dei manifest nei rispettivi namespace:

```bash
kubectl apply -f aks-l01/aks-deployment-l01.yaml -n dev-node
kubectl apply -f aks-w01/aks-deployment-w01.yaml -n dev-dotnet
```

4. Verifichiamo che i pod siano stati creati:

```bash
kubectl get pods -n dev-node
kubectl get pods -n dev-dotnet
```

5. Verifichiamo che i servizi siano stati creati:

```bash
kubectl get services -n dev-node
kubectl get services -n dev-dotnet
```

E infine vediamo che pod e servizi sono stati creati correttamente:

```bash
romer [ ~ ]$ kubectl get pods -n dev-node
NAME                                READY   STATUS    RESTARTS   AGE
hellofromnode-deployment-65bb76d95f-8wp4c   1/1     Running   0          4m41s

romer [ ~ ]$ kubectl get pods -n dev-dotnet
NAME                                 READY   STATUS    RESTARTS   AGE
hellofromdotnet-deployment-66445d8f4-jwtv7   1/1     Running   0          4m39s

romer [ ~ ]$ kubectl get services -n dev-dotnet
NAME                           TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)          AGE
hellofromdotnet-service        LoadBalancer   172.16.0.112    4.175.193.225     80:30614/TCP     4m44s

romer [ ~ ]$ kubectl get services -n dev-node
NAME                         TYPE           CLUSTER-IP      EXTERNAL-IP       PORT(S)          AGE
hellofromnode-service        LoadBalancer   172.16.3.220    4.175.193.210     80:32568/TCP     4m53s
```

## Esercizio 4: eliminare tutte le risorse

È fondamentale eliminare tutte le risorse create per non sostenere costi inutili. Possiamo farlo così, nella stessa sessione bash:

```bash
az group delete --resource-group $ACR_RG --yes --no-wait
az group delete --resource-group $AKSRG --yes --no-wait
```
