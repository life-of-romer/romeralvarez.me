---
title: "Getting to know Keycloak: a secure, open source authentication and authorization system"
description: "Goodbye to complex authentication systems. See how Keycloak saves time and effort and improves security in your development."
pubDate: 2023-08-12T14:00:00Z
tags: ["Java", "Keycloak"]
image: /assets/keycloak/keycloak-logo.png
---

# An introduction to Keycloak: a secure, open source authentication and authorization system

Building **enterprise applications takes more than good programming practices**. **Security and user management have become core pillars**: sensitive data is exposed, money changes hands and personal data is stored. So **you need a robust, secure authentication and authorization system.**  

There are many authentication and authorization systems, such as [Auth0](https://auth0.com/), [Okta](https://www.okta.com/), [AWS Cognito](https://aws.amazon.com/cognito/) and [Firebase](https://firebase.google.com/). In this post we'll focus on Keycloak, an open source authentication and authorization system developed by Red Hat.

![Keycloak](/assets/keycloak/keycloak-logo.png)

## **What is Keycloak and why does it help developers?**
**Keycloak is an open source identity and access management solution.** It lets developers add security features to their applications **with little effort and without writing code.** Keycloak supports the **most widely used authentication and authorization protocols**, such as **OpenID Connect, OAuth 2.0 and SAML 2.0.** It also supports the latest security standards, such as **JSON Web Token (JWT)** and **Security Assertion Markup Language (SAML).**

## **How does Keycloak work?**
To understand the value Keycloak offers, we need to know how it works behind the scenes.

### **Basic architecture:**
Keycloak is made of **two main parts:** the **authentication** server and the **administration server.** The authentication server handles the **authentication and authorization** of users. The administration server handles the **management of users, clients, roles and so on.**  

**Keycloak follows a modular architecture.** At its core, it acts as an **authentication and authorization** server. Applications and services that want to authenticate a user send requests to the Keycloak server (**a REST server**), which validates the user and returns an **access token.**

![Diagram of the Keycloak architecture](/assets/keycloak/keycloak-scheme.png)

### **Key concepts:**

To understand how Keycloak works, you need to know these concepts:

* **Realm:** a **realm** in **Keycloak** is an **administration domain, essentially an isolated space where all the users, roles, clients and other security-related settings are defined.** When an application (or "client") tries to authenticate a user, it refers to a specific realm, so only that realm's settings and permissions apply.  

* **Claim:** a **claim** is a **statement or attribute about a user.** For example, the **username, email address or role can be claims.** When a user authenticates successfully, Keycloak generates an authentication token that can hold several claims, giving information about the **authenticated user.**  

* **Client:** a **client** in **Keycloak** is an **application or service that wants to authenticate a user.** Configuring it in **Keycloak** essentially registers it inside a specific **realm**. Each **client** **can have roles associated with it, which decide which users have access and which permissions they get.**

* **Roles:** **roles** define certain privileges or permissions for users. Within a realm, you can have roles that apply to several clients or roles specific to one client. When it authenticates a user, Keycloak checks which roles they have and, based on that, decides which claims to include in the authentication token, which in turn sets the user's permissions in the application.

![Keycloak authentication flow](/assets/keycloak/keycloak-token-flow.png)

## **The advantages of using Keycloak:**

* **Centralized authentication:** with Keycloak you can have a single authentication point for many applications and services, avoiding duplication.

* **Works across platforms:** from web applications to cloud services and mobile apps, Keycloak integrates smoothly.

* **Modular and customizable:** Keycloak can be extended and customized, so you can adapt it to specific needs.

* **Stronger security:** it brings modern security practices, such as two-factor authentication and advanced encryption protocols.

## **What do you save by not building your own authentication system?**

Building an authentication system from scratch is a considerable challenge, because it really is very complicated. There is the risk of what you don't know, and entire companies are dedicated to these services to keep them secure. Here are some problems Keycloak spares you:

* **Security vulnerabilities:** every line of code is a chance for a bug, and in authentication bugs can be expensive.
* **Maintenance and updates:** security standards and practices evolve. Maintaining your own system means updating it regularly, which takes time and resources.
* **Interoperability:** because it follows recognized standards, Keycloak works with other tools and services without trouble.  

To sum up, when you build applications that go to production, you need a **robust, secure authentication and authorization system.** I see no reason not to use one like this, since **Keycloak is open source and free.** A service like **Keycloak** also saves us time, hands security to a system built for it and lets us focus on the business logic.  

For more information about Keycloak, visit its [website](https://www.keycloak.org/). 

You can also look at this example of how to [implement Keycloak](https://github.com/RomerEnr/spring-example-keycloak) in a Spring Boot web application. There will be a post explaining it in the future.
