---
title: "Deploying basic applications to Azure Kubernetes Service (AKS)"
description: "Learn to deploy applications efficiently to Azure Kubernetes Service (AKS). This step-by-step guide takes you from creating an Azure Container Registry to deploying container images to AKS, with practical examples and diagrams."
pubDate: 2023-11-30T21:19:00Z
tags: ["Azure", "Cloud", "Kubernetes", "DevOps"]
---

# Deploying applications to Azure Kubernetes Service (AKS): a basic introduction.  

## Introduction

In this post we'll look at how to deploy applications with Azure Kubernetes Service (AKS). We'll go from creating an **Azure Container Registry** to deploying container images to AKS, with practical examples and diagrams.

![Relation between ACR and AKS](/assets/Azure/acr-aks.png)

We'll be doing the <a href="https://learn.microsoft.com/en-gb/training/modules/project-deploy-applications-azure-kubernetes-service/2-exercise-provision-azure-container-registry-azure-kubernet" target="_blank">exercise proposed by Microsoft</a>.

It has 4 exercises: 

* Exercise 1: Provision **Azure Container Registry (ACR)** and **Azure Kubernetes Service (AKS).**
* Exercise 2: Build **Linux** and **Windows** container images and store them in **Azure Container Registry.**
* Exercise 3: Deploy containers to **Azure Kubernetes Service.**
* Exercise 4: Review the deployment and **delete** all the resources.

## Exercise 1: Provision Azure Container Registry (ACR) and Azure Kubernetes Service (AKS)

### Step 1: Create an Azure Container Registry (ACR)

1. Sign in to the [Azure portal](https://portal.azure.com/).
2. Search for `Container Registries` in the search bar. Click `+ Create` and fill in the following:  

| Setting         | Value                             |
| --------------------- | --------------------------------- |
| Subscription          | Your Azure subscription           |
| Resource Group        | acr-01-RG                         |
| Registry name         | Must be a unique name; ours is romeralvarezme                    |
| Region                | Europe West                   |
| Availability zones    | None                           |
| SKU                   | Basic                             |

### Step 2: Create an Azure Virtual Network and an AKS cluster

Creating a virtual network and an AKS cluster.

1. Search for `Virtual Network` in the search bar. Click `+ Create` and fill in the following:  

| Setting    | Value                         |
| ---------------- | ----------------------------- |
| Subscription     | Your Azure subscription    |
| Resource Group   | aks-01-RG                     |
| Virtual network name | vnet-01                  |
| Region           | [The same region as before]   |

* Go through the "Security" tab and accept all the defaults. Then go to "IP Addresses", accept all the defaults, make sure the address space is set to `10.0.0.0/16` and delete the default subnet.
* Select `Review + Create` and then `Create`.

2. Search for `Kubernetes Service` in the search bar. Click `+ Create` and fill in the following:

| Setting              | Value                   |
| -------------------------- | ----------------------- |
| Subscription               | Your Azure subscription        |
| Resource Group             | aks-01-RG               |
| Cluster preset configuration    | Dev/Test                  |
| Kubernetes cluster name    | aks-01                  |
| Region                     | [The same region as before] |
| Availability zones         | None                 |
| AKS pricing tier           | Free                    |
| Kubernetes version         | [Default value]     |
| Automatic upgrade          | Disabled                |
| Node size                  | Standard B4ms           |
| Scale method               | Manual                  |
| Node count                 | 2                       |

* In the "Networking" tab, select `Azure CNI` and choose the vnet-01 virtual network.
* Create a subnet (aks-subnet) with the address range `10.0.0.0/20`.
* Then fill in the following:

| Setting                        | Value                   |
| ------------------------------------ | ----------------------- |
| Cluster subnet                       | aks-subnet (10.0.0.0/20)|
| Kubernetes service address range     | 172.16.0.0/22           |
| Kubernetes DNS service IP address    | 172.16.3.254            |
| DNS name prefix                      | aks-01-dns              |
| Enable private cluster               | Disabled                |
| Set authorized IP ranges             | Disabled                |
| Network policy                       | None                    |

3. Now we create the Windows node pool:

* In the "Node Pools" window, add a new node pool for Windows with the following:

| Setting               | Value          |
| --------------------------- | -------------- |
| Node pool name              | w1pool         |
| Mode                        | User           |
| OS type                     | Windows        |
| Availability zone           | None        |
| Enable Azure spot instances | Disabled       |
| Node size                   | Standard B4s_v2|
| Scale method                | Manual         |
| Node count                  | 2              |
| Max pods per node           | 30             |
| Enable public IP per node   | Disabled       |


4. In the `Integrations` tab, select the registry we created earlier, make sure `Azure Monitor` and `Azure Policy` are turned off, and select `Review + Create` and then `Create`.

Now we wait for the resources to be provisioned, and exercise 1 is done. We will have:

* Created an Azure Container Registry (ACR) and configured an Azure Virtual Network and an AKS cluster.
* Created a Windows node pool for the AKS cluster.
* Attached the Azure Container Registry (ACR) to the AKS cluster.

We'd end up with something like this:
![ACR and AKS](/assets/Azure/acr-aks-connected.png)

## Exercise 2: Build Linux and Windows container images and store them in Azure Container Registry

In this exercise we'll build Linux and Windows container images and store them in Azure Container Registry (ACR).

### Step 1: Set up the environment

* Open Azure Cloud Shell from the Azure portal and select `Bash` as the shell.
* Run the following commands to create a directory and move into it:

```bash
mkdir ~/image-l01
cd ~/image-l01
```

* Create the following JavaScript file with the editor you like best, in my case `vim`:

```bash
vim server.js
```
### Step 2: Create the files for the Linux project 

* Paste the following code into server.js:

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

* Create the following package.json, again with your favourite editor:

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

* Create the following Dockerfile with your favourite editor:

```bash
FROM node:20.2-alpine
COPY . /src
RUN cd /src && npm install
EXPOSE 80
CMD ["node", "/src/server.js"]
```

* In our bash session, find the name of our Azure Container Registry (ACR) and store it in an environment variable:

```bash
ACR_RG='acr-01-RG'
ACR_NAME=$(az acr list --resource-group $ACR_RGNAME --query "[].name" --output tsv)
```

* From our bash session, build the Docker image from the Dockerfile we created and push it straight to our Azure Container Registry (ACR), whose name we stored in the `ACR_NAME` variable:

```bash
az acr build --registry $ACR_NAME --image hellofromnode:v1.0 .
```

### Step 3: Create the files for the Windows project

* Create the directory for the Windows project:

```bash
mkdir ~/image-w01
cd ~/image-w01
```

* Clone this repository, which has the files needed to build a Windows image with Docker:

```bash
git clone https://github.com/Azure-Samples/dotnetcore-docs-hello-world.git
cd ~/image-w01/dotnetcore-docs-hello-world
```

* Inside the directory, run this command to build the image:

```bash
az acr build --registry $ACR_NAME --image hellofromdotnet:v1.0 --platform windows --file Dockerfile.windows .
```

If we go to our registry, we'll see both images there:

![ACR Repository](/assets/Azure/acr-repository.png)

## Exercise 3: Deploy containers to Azure Kubernetes Service

In this task we'll create two namespaces in our AKS cluster and deploy the images we built in the previous exercise.

### Step 1: Create namespaces

1. In the Azure portal, search for `Kubernetes Services` and select our AKS cluster.
2. In the `Kubernetes Resources` tab, select `Namespaces` and create one called `dev-node` and another called `dev-dotnet`.

### Step 2: Create manifests to deploy the Linux and Windows images

1. In our Cloud Shell, create the following directory:

```bash
mkdir ~/aks-l01
cd ~/aks-l01
```

2. Create the following Kubernetes manifest, aks-deployment-l01.yaml:


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

3. Replace `ACR_NAME` with the name of our Azure Container Registry (ACR) and run the following command to deploy the Linux image:

```bash
sed -i "s/ACR_NAME/$ACR_NAME/" ./aks-deployment-w01.yaml
kubectl apply -f ./aks-deployment-w01.yaml -n dev-node
```

### Step 3: Deploy the manifests to their namespaces:

1. In our bash session, connect to the cluster with the following commands:
    
```bash
AKSRG='aks-01-RG'
AKSNAME='aks-01'
az aks get-credentials --resource-group $AKSRG --name $AKSNAME
```

2. Check that the connection works:

```bash
kubectl get nodes
```

3. Deploy the manifests to their namespaces:

```bash
kubectl apply -f aks-l01/aks-deployment-l01.yaml -n dev-node
kubectl apply -f aks-w01/aks-deployment-w01.yaml -n dev-dotnet
```

4. Check that the pods were created:

```bash
kubectl get pods -n dev-node
kubectl get pods -n dev-dotnet
```

5. Check that the services were created:

```bash
kubectl get services -n dev-node
kubectl get services -n dev-dotnet
```

And finally we can see the pods and services up and running:

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

## Exercise 4: Delete all the resources

It's extremely important to delete all the resources we created so we don't run up unnecessary costs. We can do it like this, in the same bash session:

```bash
az group delete --resource-group $ACR_RG --yes --no-wait
az group delete --resource-group $AKSRG --yes --no-wait
```
