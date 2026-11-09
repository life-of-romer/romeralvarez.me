---
title: "Conoscere Keycloak: rivedere, rifattorizzare e aggiornare l'implementazione."
description: "Revisione e refactoring di Keycloak: aggiorniamo la nostra implementazione in Spring Boot per seguire (o provare a seguire) le buone pratiche di programmazione."
pubDate: 2023-08-14T17:42:00Z
tags: ["Java", "Keycloak", "OOP"]
image: /assets/keycloak/keycloak-logo.png
---

# Conoscere Keycloak: rivedere, rifattorizzare e aggiornare l'implementazione.

Ciao di nuovo! Se ricordate, nel mio [articolo precedente](/it/blog/conociendo-keycloak/) ci siamo buttati a capofitto su Keycloak con Spring Boot. Sì, lo so, l'implementazione è stata un po' frettolosa e, lo ammetto, ho saltato i test unitari. 😅 Ma a chi non è mai capitato, giusto?

Quindi in questo articolo rivediamo e rifattorizziamo il codice per provare a seguire le buone pratiche di programmazione, e aggiorniamo l'implementazione della nostra piccola app con Keycloak.

## Rivedere il codice.

Per prima cosa, diamo un'occhiata a com'è il progetto in questo momento:

```bash
.
├── HELP.md
├── mvnw
├── mvnw.cmd
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── me
    │   │       └── romeralvarez
    │   │           └── springexamplekeycloak
    │   │               ├── SpringExampleKeycloakApplication.java
    │   │               ├── clients
    │   │               │   └── KeycloakClient.java
    │   │               ├── commons
    │   │               │   └── Constants.java
    │   │               ├── configuration
    │   │               │   ├── JwtAuthenticationConverter.java
    │   │               │   └── SecurityConfiguration.java
    │   │               ├── controllers
    │   │               │   ├── KeycloakAuthController.java
    │   │               │   ├── KeycloakController.java
    │   │               │   └── requests
    │   │               │       ├── UserLoginRequest.java
    │   │               │       └── UserRequest.java
    │   │               └── services
    │   │                   ├── KeycloakAuthServiceImpl.java
    │   │                   ├── KeycloakServiceImpl.java
    │   │                   └── interfaces
    │   │                       ├── KeycloakAuthService.java
    │   │                       └── KeycloakService.java
    │   └── resources
    │       ├── application.yaml
    │       ├── banner.txt
    │       ├── static
    │       └── templates
    └── test
        └── java
            └── me
                └── romeralvarez
                    └── springexamplekeycloak
                        └── SpringExampleKeycloakApplicationTests.java
```

* Per cominciare, una modifica molto semplice: abbiamo cartelle che non ci servono, come `static` e `templates` dentro `resources`, dato che non useremo template né niente del genere. Quindi le eliminiamo.
* Un'altra modifica semplice: trasformiamo il package `me.romeralvarez.springexamplekeycloak.controllers.requests` in un package di DTO, rinominandolo in `me.romeralvarez.springexamplekeycloak.dtos`.

## Constants.java

Questa classe contiene le costanti dell'applicazione. Però contiene credenziali, URL e altri dati che non dovrebbero stare nel codice, quindi li spostiamo in un file di configurazione.

Nel nostro caso spostiamo le costanti in un file `application.yaml` nella cartella `resources`, ma l'ideale sarebbe usare un servizio per i segreti come **Vault** o **AWS Secrets Manager**.

La decisione sarà quindi eliminare questa classe e spostare le costanti in un file `application.yaml` nella cartella `resources`.

```yaml
keycloak:
  url: http://localhost:8080/
  realm-name: spring-boot-realm-dev
  realm-master: master
  admin-cli: admin-cli
  user-console: admin
  user-password: admin
  client-secret: DdWW14rqntQlMvr2AtgCZ1GD7kGSBWsw
  client-id: spring-client-api-rest
```



## KeycloakClient.java

Rivediamo il codice della classe `KeycloakClient.java`.

La classe `KeycloakClient` fa da client e semplifica l'interazione con il server Keycloak:

* Inizializzazione dell'istanza di **Keycloak:**

  * La classe ha un'istanza statica di Keycloak **(keycloakInstance)** inizializzata con il **KeycloakBuilder**.
Questa istanza viene configurata con dati come l'**URL del server Keycloak (KEYCLOAK_URL)**, **il realm (REALM_MASTER)**, l'**ID del client (ADMIN_CLI)**, il **nome utente (USER_CONSOLE)**, la **password (USER_PASSWORD)**, il **secret del client (CLIENT_SECRET)** e altri dettagli relativi al client REST (resteasyClient).

* Ottenere la risorsa del realm (RealmResource): il metodo **getRealmResource()** restituisce una risorsa del realm che offre le funzioni per amministrare quel realm specifico in **Keycloak**.

* Ottenere la risorsa degli utenti **(UsersResource):** il metodo `getUsersResource()` restituisce una risorsa che offre le funzioni per amministrare gli utenti all'interno di un realm specifico.

* Creare un'istanza di **KeycloakBuilder:** `createKeycloakBuilder(String username, String password)` crea e restituisce una nuova istanza di **KeycloakBuilder** configurata con username e password indicati.

* Ottenere il **token di accesso di un utente:** `getAccessTokenForUser(String username, String password)` crea una nuova istanza di Keycloak con `createKeycloakBuilder`, poi richiede e restituisce un token di accesso per l'utente indicato.


```java
public class KeycloakClient {

  private static final Keycloak keycloakInstance = KeycloakBuilder.builder()
      .serverUrl(KEYCLOAK_URL)
      .realm(REALM_MASTER)
      .clientId(ADMIN_CLI)
      .username(USER_CONSOLE)
      .password(USER_PASSWORD)
      .clientSecret(CLIENT_SECRET)
      .resteasyClient(new ResteasyClientBuilderImpl()
          .connectionPoolSize(10).build())
      .build();

  public static RealmResource getRealmResource() {
    return keycloakInstance.realm(REALM_NAME);
  }

  public static UsersResource getUsersResource() {
    RealmResource realmResource = getRealmResource();
    return realmResource.users();
  }

  public static KeycloakBuilder createKeycloakBuilder(String username, String password) {
    return KeycloakBuilder.builder()
        .realm(REALM_NAME)
        .serverUrl(KEYCLOAK_URL)
        .clientId(CLIENT_ID)
        .clientSecret(CLIENT_SECRET)
        .username(username)
        .password(password);
  }

  public static AccessTokenResponse getAccessTokenForUser(String username, String password) {
    return createKeycloakBuilder(username, password)
        .build()
        .tokenManager()
        .getAccessToken();
  }

}
```

* La prima modifica qui è aggiornare il costruttore e i metodi che usavano le costanti, per via del cambiamento appena fatto.

```java
@Component
public class KeycloakClient {

   @Value("${keycloak.url}")
  private String keycloakUrl;

  @Value("${keycloak.realm-name}")
  private String realmName;

  @Value("${keycloak.realm-master}")
  private String realmMaster;

  @Value("${keycloak.admin-cli}")
  private String adminCli;

  @Value("${keycloak.user-console}")
  private String userConsole;

  @Value("${keycloak.user-password}")
  private String userPassword;

  @Value("${keycloak.client-secret}")
  private String clientSecret;

  @Value("${keycloak.client-id}")
  private String clientId;

  private Keycloak keycloakInstance;

  @PostConstruct
  public void init() {
    this.keycloakInstance = createKeycloakInstance();
  }

  protected Keycloak createKeycloakInstance() {
    return KeycloakBuilder.builder()
        .serverUrl(keycloakUrl)
        .realm(realmMaster)
        .clientId(adminCli)
        .username(userConsole)
        .password(userPassword)
        .clientSecret(clientSecret)
        .resteasyClient(new ResteasyClientBuilderImpl().connectionPoolSize(10).build())
        .build();
  }

  public RealmResource getRealmResource() {
    return keycloakInstance.realm(realmName);
  }

  public UsersResource getUsersResource() {
    RealmResource realmResource = getRealmResource();
    return realmResource.users();
  }

  public KeycloakBuilder createKeycloakBuilder(String username, String password) {
    return KeycloakBuilder.builder()
        .realm(realmName)
        .serverUrl(keycloakUrl)
        .clientId(clientId)
        .clientSecret(clientSecret)
        .username(username)
        .password(password);
  }

  public AccessTokenResponse getAccessTokenForUser(String username, String password) {
    return createKeycloakBuilder(username, password)
        .build()
        .tokenManager()
        .getAccessToken();
  }

}
```

* Innanzitutto abbiamo **usato l'annotazione** `@Value` per iniettare le proprietà dal file di configurazione.
* L'altra modifica è **l'annotazione** `@PostConstruct`, che indica il metodo da eseguire dopo l'iniezione delle dipendenze. In altre parole, una volta che **Spring ha iniettato tutti i valori (da application.yml) nei nostri campi, chiama il metodo** `init()`. In questo metodo inizializziamo l'istanza di Keycloak con i valori di configurazione iniettati.
* Il primo passo prima di rifattorizzare è avere una buona batteria di test (che non abbiamo), quindi il passo precedente è rendere il codice testabile. Abbiamo fatto queste modifiche:
  * Abbiamo spostato la logica che crea l'istanza di `Keycloak` in un nuovo metodo protetto, `createKeycloakInstance()`. Lo scopo è disaccoppiare la creazione dell'istanza di `Keycloak` dall'inizializzazione del bean. Così otteniamo diverse cose:
    * **Separazione delle responsabilità:** il metodo `init()` ora si occupa solo di inizializzare il bean, mentre la logica di creazione dell'istanza di `Keycloak` sta in un metodo separato.
    * **Migliore testabilità:** avendo la creazione in un metodo a sé, possiamo sovrascrivere o fare il mock di quel metodo nei test. È particolarmente utile quando vogliamo evitare connessioni reali a servizi esterni (come Keycloak) nei test unitari.
  * **Abbiamo eliminato i metodi statici** e li abbiamo trasformati in **metodi d'istanza.** Non dipendendo più direttamente da metodi statici per creare le istanze, e potendo iniettarle o sovrascriverle, la classe diventa meno accoppiata e più modulare.

## KeycloakServiceImpl.java

* Ora che abbiamo rifattorizzato la classe `KeycloakClient`, possiamo rifattorizzare `KeycloakServiceImpl` perché usi la nuova classe `KeycloakClient` invece dell'istanza di `Keycloak` direttamente.

Diamo un'occhiata a com'era prima la classe:

```java
@Service
@Slf4j
public class KeycloakServiceImpl implements KeycloakService {

  @Override
  public List<UserRepresentation> findAllUsers() {
    log.info("Finding all users");
    log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
    return KeycloakClient.getRealmResource().users().list();
  }

  @Override
  public List<UserRepresentation> searchByUsername(String username) {
    return KeycloakClient.getRealmResource().users().searchByUsername(username, true);
  }

  @Override
  public String createUser(@NonNull UserRequest userRequest) {
    log.info("Creating user");
    int status = 0;

    log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
    UsersResource usersResource = KeycloakClient.getUsersResource();
    UserRepresentation userRepresentation = new UserRepresentation();

    log.info("Setting user attributes");
    userRepresentation.setFirstName(userRequest.firstName());
    userRepresentation.setLastName(userRequest.lastName());
    userRepresentation.setEmail(userRequest.email());
    userRepresentation.setUsername(userRequest.username());
    userRepresentation.setEnabled(true);
    userRepresentation.setEmailVerified(true);

    Response response = usersResource.create(userRepresentation);
    status = response.getStatus();

    if (status == 201) {
      log.info("User created");
      String path = response.getLocation().getPath();
      String userId = path.substring(path.lastIndexOf('/') + 1);
      log.info("User id: {}", userId);

      log.info("Setting user password");
      CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
      credentialRepresentation.setTemporary(false);
      credentialRepresentation.setType(OAuth2Constants.PASSWORD);
      credentialRepresentation.setValue(userRequest.password());

      log.info("Resetting user password");
      usersResource.get(userId).resetPassword(credentialRepresentation);

      log.info("Assigning user roles");
      RealmResource realmResource = KeycloakClient.getRealmResource();
      List<RoleRepresentation> roles = null;
      
      if(userRequest.roles() == null || userRequest.roles().isEmpty()){
        roles = List.of(realmResource.roles().get("user").toRepresentation());
      } else {
        roles = realmResource
            .roles()
            .list()
            .stream()
            .filter(role -> userRequest.roles()
                .stream()
                .anyMatch(roleName -> roleName.equalsIgnoreCase(role.getName())))
            .toList();
      }
      realmResource
          .users()
          .get(userId)
          .roles()
          .realmLevel()
          .add(roles);

      return "User created";
    } else if (status == 409) {
      log.error("User already exists");
      return "User already exists";
    } else {
      log.error("Error creating user");
      return "Error creating user";
    }

  }

  @Override
  public void deleteUser(String userId) {
    log.info("Deleting user");
    log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
    KeycloakClient.getUsersResource().get(userId).remove();
  }

  @Override
  public void updateUser(String userId, UserRequest userRepresentation) {
    log.info("Updating user");
    log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
    CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
    credentialRepresentation.setTemporary(false);
    credentialRepresentation.setType(OAuth2Constants.PASSWORD);
    credentialRepresentation.setValue(userRepresentation.password());

    UserRepresentation user = new UserRepresentation();
    user.setFirstName(userRepresentation.firstName());
    user.setLastName(userRepresentation.lastName());
    user.setEmail(userRepresentation.email());
    user.setUsername(userRepresentation.username());
    user.setEnabled(true);
    user.setEmailVerified(true);
    user.setCredentials(Collections.singletonList(credentialRepresentation));

    UserResource userResource = KeycloakClient.getUsersResource().get(userId);
    userResource.update(user);
  }
}
```

A colpo d'occhio si vedono molto codice ripetuto, metodi lunghissimi, numeri magici, **code smell** e così via. Vediamo cosa succede:

* **Metodi lunghi:** i metodi lunghi sono un problema perché sono difficili da leggere e da capire. Inoltre di solito indicano che la classe fa troppe cose. Qui i metodi `createUser()` e `updateUser()` sono molto lunghi e fanno troppo. Per esempio, `createUser()` fa tutto questo:
  * Crea un utente
  * Gli assegna una password
  * Gli assegna i ruoli
* **Codice duplicato:** la logica per ottenere il realm si ripete in diversi metodi (`findAllUsers`, `createUser`, `deleteUser`, `updateUser`).
* **Mancanza di astrazione:** la logica per creare la rappresentazione dell'utente e delle credenziali si ripete in `createUser` e `updateUser`. Si potrebbe estrarre in metodi separati o persino in una classe di supporto.
* **Usa un'interfaccia che in realtà non aggiunge nulla:** per questo progetto ci sarà una sola implementazione, quella di **Keycloak**. È un progetto molto piccolo e non cambieremo nemmeno provider di autenticazione.

Ora che abbiamo visto alcuni dei problemi, rifattorizziamo la classe:

* Per prima cosa eliminiamo l'implementazione dell'interfaccia e rinominiamo la classe in `KeycloakService`.
* Definiamo delle costanti per i codici di stato HTTP.
* Rendiamo `KeycloakClient` un attributo della classe.

```java 
public class KeycloakService {
  private final static int STATUS_CREATED = 201;
  private final static int STATUS_CONFLICT = 409;
  private KeycloakClient keycloakClient;
}
```
Ora rifattorizziamo metodo per metodo:

### findAllUsers()

```java
public List<UserRepresentation> findAllUsers() {
  log.info("Finding all users");
  log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
  return KeycloakClient.getRealmResource().users().list();
}
```

* L'unica cosa che cambiamo qui è la riga 2. Visto che si ripete in tutto il codice, definiamo un metodo privato:

```java
private void logRealmInfo(){
  log.info("Realm: {}", keycloakClient.getRealmResource().toRepresentation().getRealm());
}
```

* Il nostro metodo diventa così:

```java
public List<UserRepresentation> findAllUsers() {
  log.info("Finding all users");
  logRealmInfo();
  return keycloakClient.getRealmResource().users().list();
}
```

### createUser(@NonNull UserRequest userRequest)

```java
public String createUser(@NonNull UserRequest userRequest) {
  log.info("Creating user");
  int status = 0;

  log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
  UsersResource usersResource = KeycloakClient.getUsersResource();
  UserRepresentation userRepresentation = new UserRepresentation();

  log.info("Setting user attributes");
  userRepresentation.setFirstName(userRequest.firstName());
  userRepresentation.setLastName(userRequest.lastName());
  userRepresentation.setEmail(userRequest.email());
  userRepresentation.setUsername(userRequest.username());
  userRepresentation.setEnabled(true);
  userRepresentation.setEmailVerified(true);

  Response response = usersResource.create(userRepresentation);
  status = response.getStatus();

  if (status == 201) {
    log.info("User created");
    String path = response.getLocation().getPath();
    String userId = path.substring(path.lastIndexOf('/') + 1);
    log.info("User id: {}", userId);

    log.info("Setting user password");
    CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
    credentialRepresentation.setTemporary(false);
    credentialRepresentation.setType(OAuth2Constants.PASSWORD);
    credentialRepresentation.setValue(userRequest.password());

    log.info("Resetting user password");
    usersResource.get(userId).resetPassword(credentialRepresentation);

    log.info("Assigning user roles");
    RealmResource realmResource = KeycloakClient.getRealmResource();
    List<RoleRepresentation> roles = null;
    
    if(userRequest.roles() == null || userRequest.roles().isEmpty()){
      roles = List.of(realmResource.roles().get("user").toRepresentation());
    } else {
      roles = realmResource
          .roles()
          .list()
          .stream()
          .filter(role -> userRequest.roles()
              .stream()
              .anyMatch(roleName -> roleName.equalsIgnoreCase(role.getName())))
          .toList();
    }
    realmResource
        .users()
        .get(userId)
        .roles()
        .realmLevel()
        .add(roles);

    return "User created";
  } else if (status == 409) {
    log.error("User already exists");
    return "User already exists";
  } else {
    log.error("Error creating user");
    return "Error creating user";
  }

}
```

Come vediamo, questo metodo è molto lungo e fa molte cose. Analizziamo cosa abbiamo fatto per renderlo più leggibile:

```java
public String createUser(@NonNull UserRequest userRequest) {
  log.info("Creating user");
  logRealmInfo();
  Response response = createUserInKeycloak(userRequest);

  if (response.getStatus() == STATUS_CREATED) {
    handleUserCreated(response, userRequest);
    return "User created";
  } else if (response.getStatus() == STATUS_CONFLICT) {
    log.error("User already exists");
    return "User already exists";
  } else {
    log.error("Error creating user");
    return "Error creating user";
  }

}
```
1. **Estrazione della logica di creazione dell'utente:**
   * **Prima:** la logica per creare un utente in Keycloak era incorporata nel metodo.
   * **Dopo:** se ne occupa il metodo privato createUserInKeycloak(UserRequest userRequest).
```java
private Response createUserInKeycloak(UserRequest userRequest){
  UsersResource userResource = keycloakClient.getUsersResource();
  UserRepresentation userRepresentation = createUserRepresentationFromRequest(userRequest);
  return userResource.create(userRepresentation);
}
```
2. **Estrazione della logica di mappatura dell'utente:**
   * **Prima:** la logica per mappare un utente dalla richiesta a un oggetto UserRepresentation era interamente incorporata nel metodo.
   * **Dopo:** se ne occupa il metodo privato createUserRepresentationFromRequest(UserRequest userRequest).
```java
private UserRepresentation createUserRepresentationFromRequest(UserRequest userRequest){
  UserRepresentation userRepresentation = new UserRepresentation();
  userRepresentation.setFirstName(userRequest.firstName());
  userRepresentation.setLastName(userRequest.lastName());
  userRepresentation.setEmail(userRequest.email());
  userRepresentation.setUsername(userRequest.username());
  userRepresentation.setEnabled(true);
  userRepresentation.setEmailVerified(true);
  userRepresentation.setCredentials(Collections.singletonList(createCredentialRepresentation(userRequest)));
  return userRepresentation;
}
```
3. **Estrazione della logica di creazione delle credenziali:**
   * **Prima:** la logica per creare le credenziali di un utente era incorporata nel metodo.
   * **Dopo:** se ne occupa il metodo privato `createCredentialRepresentation(UserRequest userRequest)`.
```java
private CredentialRepresentation createCredentialRepresentation(UserRequest userRequest) {
  CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
  credentialRepresentation.setTemporary(false);
  credentialRepresentation.setType(OAuth2Constants.PASSWORD);
  credentialRepresentation.setValue(userRequest.password());
  return credentialRepresentation;
}
```
4. **Estrazione della logica post-creazione:**
   * **Prima:** dopo aver creato un utente c'era altra logica per impostare la password e assegnare i ruoli.
   * **Dopo:** se ne occupa il metodo privato `handleUserCreated(Response response, UserRequest userRequest)`.
```java
private void handleUserCreated(Response response, UserRequest userRequest) {
  String userId = extractUserIdFromResponse(response);
  log.info("User id: {}", userId);

  setUserPassword(userId, userRequest);
  assignUserRoles(userId, userRequest);
}
```
5. **Estrazione della logica per ottenere l'ID dell'utente:**
   * **Prima:** anche la logica per ottenere l'ID dell'utente stava nello stesso metodo.
   * **Dopo:** se ne occupa il metodo privato `extractUserIdFromResponse(Response response)`.
```java
private String extractUserIdFromResponse(Response response) {
  String path = response.getLocation().getPath();
  return path.substring(path.lastIndexOf('/') + 1);
}
```
6. **Estrazione della logica per impostare la password dell'utente:**
   * **Prima:** anche la logica per impostare la password dell'utente stava nello stesso metodo.
   * **Dopo:** se ne occupa il metodo privato `setUserPassword(String userId, UserRequest userRequest)`.
```java
private void setUserPassword(String userId, UserRequest userRequest) {
  UsersResource usersResource = keycloakClient.getUsersResource();
  usersResource.get(userId).resetPassword(createCredentialRepresentation(userRequest));
}
```
7. **Estrazione della logica per assegnare i ruoli all'utente:**
   * **Prima:** anche la logica per assegnare i ruoli all'utente stava nello stesso metodo.
   * **Dopo:** se ne occupa il metodo privato `assignUserRoles(String userId, UserRequest userRequest)`.
```java
private void assignUserRoles(String userId, UserRequest userRequest) {
  RealmResource realmResource = keycloakClient.getRealmResource();
  List<RoleRepresentation> roles = determineRolesToAssign(userRequest, realmResource);
  realmResource.users().get(userId).roles().realmLevel().add(roles);
}
```
8. **Estrazione della logica per decidere quali ruoli assegnare:**
   * **Prima:** anche la logica per decidere quali ruoli assegnare all'utente stava nello stesso metodo.
   * **Dopo:** se ne occupa il metodo privato `determineRolesToAssign(UserRequest userRequest, RealmResource realmResource)`.
```java
private List<RoleRepresentation> determineRolesToAssign(UserRequest userRequest, RealmResource realmResource) {
  if (userRequest.roles() == null || userRequest.roles().isEmpty()) {
    return List.of(realmResource.roles().get("user").toRepresentation());
  } else {
    return realmResource.roles().list().stream()
        .filter(role -> userRequest.roles().stream().anyMatch(roleName -> roleName.equalsIgnoreCase(role.getName())))
        .collect(Collectors.toList());
  }
}
```

Alla fine abbiamo un metodo molto più leggibile e facile da capire.

### updateUser(String userId, UserRequest userRequest)

Vediamo com'è implementato il metodo `updateUser(String userId, UserRequest userRequest)`:

```java
public void updateUser(String userId, UserRequest userRepresentation) {
  log.info("Updating user");
  log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
  CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
  credentialRepresentation.setTemporary(false);
  credentialRepresentation.setType(OAuth2Constants.PASSWORD);
  credentialRepresentation.setValue(userRepresentation.password());

  UserRepresentation user = new UserRepresentation();
  user.setFirstName(userRepresentation.firstName());
  user.setLastName(userRepresentation.lastName());
  user.setEmail(userRepresentation.email());
  user.setUsername(userRepresentation.username());
  user.setEnabled(true);
  user.setEmailVerified(true);
  user.setCredentials(Collections.singletonList(credentialRepresentation));

  UserResource userResource = KeycloakClient.getUsersResource().get(userId);
  userResource.update(user);
}
```

Applichiamo gli stessi passi del metodo precedente e vediamo come rendere questo metodo un po' più leggibile:

1.  **Estrazione della logica di mappatura dell'utente:**
    * **Prima:** la logica per mappare un utente dalla richiesta a un oggetto UserRepresentation stava nel metodo.
    * **Dopo:** usiamo il metodo privato createUserRepresentationFromRequest(UserRequest userRequest), riutilizzando la logica che avevamo già in createUser.
2. **Estrazione della logica di creazione delle credenziali:**
   * **Prima:** la logica per creare la rappresentazione delle credenziali era incorporata in updateUser.
   * **Dopo:** usiamo il metodo privato createCredentialRepresentation(UserRequest userRequest), riutilizzando il codice già estratto in createUser.

Alla fine il nostro metodo diventa così, con molte meno righe di codice e sfruttando il codice precedente:

```java
public void updateUser(String userId, UserRequest userRepresentation) {
  log.info("Updating user");
  logRealmInfo();
  UserResource userResource = keycloakClient.getUsersResource().get(userId);
  userResource.update(createUserRepresentationFromRequest(userRepresentation));
}
```

E alla fine abbiamo una classe più leggibile e più facile da capire:

```java
@Service
@Slf4j
@AllArgsConstructor
public class KeycloakService {
private final static int STATUS_CREATED = 201;
private final static int STATUS_CONFLICT = 409;
private KeycloakClient keycloakClient;

public List<UserRepresentation> findAllUsers() {
  log.info("Finding all users");
  logRealmInfo();
  return keycloakClient.getRealmResource().users().list();
}

public List<UserRepresentation> searchByUsername(String username) {
  return keycloakClient.getRealmResource().users().searchByUsername(username, true);
}

public String createUser(@NonNull UserRequest userRequest) {
  log.info("Creating user");
  logRealmInfo();
  Response response = createUserInKeycloak(userRequest);

  if (response.getStatus() == STATUS_CREATED) {
    handleUserCreated(response, userRequest);
    return "User created";
  } else if (response.getStatus() == STATUS_CONFLICT) {
    log.error("User already exists");
    return "User already exists";
  } else {
    log.error("Error creating user");
    return "Error creating user";
  }

}

public void deleteUser(String userId) {
  log.info("Deleting user");
  logRealmInfo();
  keycloakClient.getUsersResource().get(userId).remove();
}

public void updateUser(String userId, UserRequest userRepresentation) {
  log.info("Updating user");
  logRealmInfo();
  UserResource userResource = keycloakClient.getUsersResource().get(userId);
  userResource.update(createUserRepresentationFromRequest(userRepresentation));
}

private void logRealmInfo(){
  log.info("Realm: {}", keycloakClient.getRealmResource().toRepresentation().getRealm());
}

private Response createUserInKeycloak(UserRequest userRequest){
  UsersResource userResource = keycloakClient.getUsersResource();
  UserRepresentation userRepresentation = createUserRepresentationFromRequest(userRequest);
  return userResource.create(userRepresentation);
}

private UserRepresentation createUserRepresentationFromRequest(UserRequest userRequest){
  UserRepresentation userRepresentation = new UserRepresentation();
  userRepresentation.setFirstName(userRequest.firstName());
  userRepresentation.setLastName(userRequest.lastName());
  userRepresentation.setEmail(userRequest.email());
  userRepresentation.setUsername(userRequest.username());
  userRepresentation.setEnabled(true);
  userRepresentation.setEmailVerified(true);
  userRepresentation.setCredentials(Collections.singletonList(createCredentialRepresentation(userRequest)));
  return userRepresentation;
}

private CredentialRepresentation createCredentialRepresentation(UserRequest userRequest) {
  CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
  credentialRepresentation.setTemporary(false);
  credentialRepresentation.setType(OAuth2Constants.PASSWORD);
  credentialRepresentation.setValue(userRequest.password());
  return credentialRepresentation;
}

private void handleUserCreated(Response response, UserRequest userRequest) {
  String userId = extractUserIdFromResponse(response);
  log.info("User id: {}", userId);

  setUserPassword(userId, userRequest);
  assignUserRoles(userId, userRequest);
}

private String extractUserIdFromResponse(Response response) {
  String path = response.getLocation().getPath();
  return path.substring(path.lastIndexOf('/') + 1);
}

private void setUserPassword(String userId, UserRequest userRequest) {
  UsersResource usersResource = keycloakClient.getUsersResource();
  usersResource.get(userId).resetPassword(createCredentialRepresentation(userRequest));
}

private void assignUserRoles(String userId, UserRequest userRequest) {
  RealmResource realmResource = keycloakClient.getRealmResource();
  List<RoleRepresentation> roles = determineRolesToAssign(userRequest, realmResource);
  realmResource.users().get(userId).roles().realmLevel().add(roles);
}

private List<RoleRepresentation> determineRolesToAssign(UserRequest userRequest, RealmResource realmResource) {
  if (userRequest.roles() == null || userRequest.roles().isEmpty()) {
    return List.of(realmResource.roles().get("user").toRepresentation());
  } else {
    return realmResource.roles().list().stream()
        .filter(role -> userRequest.roles().stream().anyMatch(roleName -> roleName.equalsIgnoreCase(role.getName())))
        .collect(Collectors.toList());
  }
}
```

## KeycloakController.java

Nel controller non c'è molto da fare, ma possiamo correggere qualche piccolo errore:

```java
@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class KeycloakController {
private KeycloakService keycloakService;

@GetMapping("/all")
@PreAuthorize("hasRole('admin_client_role')")
public ResponseEntity<?> findAllUsers() {
  return ResponseEntity.ok(keycloakService.findAllUsers());
}

@GetMapping("/user/{username}")
@PreAuthorize("hasRole('admin_client_role')")
public ResponseEntity<?> searchByUsername(@PathVariable String username) {
  return ResponseEntity.ok(keycloakService.searchByUsername(username));
}

@PostMapping("/user/create")
@PreAuthorize("hasRole('admin_client_role')")
public ResponseEntity<?> createUser(@RequestBody UserRequest userRequest) throws URISyntaxException {
  String response = keycloakService.createUser(userRequest);
  return ResponseEntity.created(new URI("/api/users/user/create")).body(response);
}

@PutMapping("/user/update/{userId}")
@PreAuthorize("hasRole('admin_client_role')")
public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody UserRequest userRequest) {
  keycloakService.updateUser(userId, userRequest);
  return ResponseEntity.ok("User updated successfully");
}
```

Ci sono alcune cose che possiamo migliorare:

1. **Coerenza delle rotte dell'API:**
   * **Prima:** rotte come /user/{username}, /user/create, /user/update/{userId}.
   * **Dopo:** eliminiamo il segmento /user e usiamo rotte come /{username}, /create, /update/{userId}. Dato che il controller è già mappato su /api/users, è ridondante.
2. **Risposte dell'API:**
   * **Prima:** restituisce ResponseEntity<?>.
   * **Dopo:** specifichiamo il tipo di risposta invece di usare un carattere jolly. Per esempio, ResponseEntity<List<UserRepresentation>> per findAllUsers().

E alla fine diventa così:

```java
@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class KeycloakController {
  private KeycloakService keycloakService;

  @GetMapping("/all")
  @PreAuthorize("hasRole('admin_client_role')")
  public ResponseEntity<List<UserRepresentation>> findAll() {
    return ResponseEntity.ok(keycloakService.findAllUsers());
  }

  @GetMapping("/{username}")
  @PreAuthorize("hasRole('admin_client_role') or hasRole('user_client_role')")
  public ResponseEntity<UserRepresentation> searchByUsername(@PathVariable String username) {
    return ResponseEntity.ok(keycloakService.searchByUsername(username).get(0));
  }

  @PostMapping("/create")
  @PreAuthorize("hasRole('admin_client_role')")
  public ResponseEntity<ApiResponse> createUser(@RequestBody UserRequest userRequest) throws URISyntaxException {
    String userId = keycloakService.createUser(userRequest);
    URI location = new URI("/api/users/" + userId);
    return ResponseEntity.created(location).body(new ApiResponse("User created successfully", HttpStatus.CREATED.value()));
  }

  @PutMapping("/update/{userId}")
  @PreAuthorize("hasRole('admin_client_role')")
  public ResponseEntity<ApiResponse> updateUser(@PathVariable String userId, @RequestBody UserRequest userRequest) {
    keycloakService.updateUser(userId, userRequest);
    return ResponseEntity.ok(new ApiResponse("User updated successfully", HttpStatus.OK.value()));
  }
}
```

## SecurityConfiguration.java

In questa classe faremo qualche piccola modifica:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

  private final JwtAuthenticationConverter jwtAuthenticationConverter;

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(authorize -> {
          authorize
              .requestMatchers("/api/auth/login").permitAll()
              .anyRequest().authenticated();
        })
        .oauth2ResourceServer(oauth2 -> {
          oauth2.jwt(jwtConfigurer -> {
            jwtConfigurer.jwtAuthenticationConverter(jwtAuthenticationConverter);
          });
        })
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .build();
  }
}
```

L'unica cosa che faremo è rimuovere alcune parentesi graffe non necessarie.

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

  private final JwtAuthenticationConverter jwtAuthenticationConverter;

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(authorize ->
          authorize
              .requestMatchers("/api/auth/login").permitAll()
              .anyRequest().authenticated())
        .oauth2ResourceServer(oauth2 ->
          oauth2.jwt(jwtConfigurer ->
            jwtConfigurer.jwtAuthenticationConverter(jwtAuthenticationConverter)))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .build();
  }
}
```

Dopo queste modifiche, possiamo passare l'applicazione allo scanner di SonarQube e vedere che non ci sono più errori e che la qualità del codice è migliorata in modo sostanziale.

![Analisi di SonarQube](/assets/keycloak/sonar.png)

Di sicuro ci sono molte cose che si potrebbero migliorare in questa implementazione. Non sono un esperto di refactoring, né ha senso fare over-engineering su questo progetto, ma è senza dubbio un bel miglioramento e un buon punto di partenza per continuare a migliorare.
