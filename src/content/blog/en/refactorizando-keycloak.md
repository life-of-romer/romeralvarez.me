---
title: "Getting to know Keycloak: reviewing, refactoring and updating the implementation."
description: "Reviewing and refactoring Keycloak: updating our Spring Boot implementation to follow (or try to follow) good programming practices."
pubDate: 2023-08-14T17:42:00Z
tags: ["Java", "Keycloak", "OOP"]
image: /assets/keycloak/keycloak-logo.png
---

# Getting to know Keycloak: reviewing, refactoring and updating the implementation.

Hello again! If you remember, in my [previous post](/blog/conociendo-keycloak/) we dived straight into Keycloak with Spring Boot. Yes, I know, the implementation was a bit rushed and, I admit, I skipped the unit tests. 😅 But who hasn't done that at some point, right?

So in this post we'll review and refactor the code to try to follow good programming practices, and update the implementation of our little Keycloak app.

## Reviewing the code.

First, let's look at what our project looks like right now:

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

* To start with, a very simple change: we have directories we don't need, such as `static` and `templates` inside `resources`, since we won't use templates or anything like that. So we'll delete them.
* Another simple change: we'll turn the `me.romeralvarez.springexamplekeycloak.controllers.requests` package into a DTO package, so we'll rename it to `me.romeralvarez.springexamplekeycloak.dtos`.

## Constants.java

This class holds the application's constants. However, it has credentials, URLs and other data that shouldn't live in the code, so we'll move them to a configuration file.

In our case we'll move the constants to an `application.yaml` file in the `resources` directory, but ideally you'd use a secrets store such as **Vault** or **AWS Secrets Manager**.

The decision we'll make is to delete this class and move the constants to an `application.yaml` file in the `resources` directory.

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

Let's review the code of the `KeycloakClient.java` class.

The `KeycloakClient` class acts as a client that makes it easier to talk to the Keycloak server:

* Initializing the **Keycloak** instance:

  * The class has a static Keycloak instance **(keycloakInstance)** that is initialized with the **KeycloakBuilder**.
This instance is configured with details such as the **Keycloak server URL (KEYCLOAK_URL)**, **the realm (REALM_MASTER)**, the **client ID (ADMIN_CLI)**, the **username (USER_CONSOLE)**, the **password (USER_PASSWORD)**, the **client secret (CLIENT_SECRET)** and extra details for the REST client (resteasyClient).

* Getting the realm resource (RealmResource): the **getRealmResource()** method returns a realm resource that provides the functionality to manage that particular realm in **Keycloak**.

* Getting the users resource **(UsersResource):** the `getUsersResource()` method returns a resource that provides the functionality to manage users within a specific realm.

* Creating a **KeycloakBuilder** instance: `createKeycloakBuilder(String username, String password)` creates and returns a new **KeycloakBuilder** instance configured with the given username and password.

* Getting a user's **access token:** `getAccessTokenForUser(String username, String password)` creates a new Keycloak instance with `createKeycloakBuilder`, then requests and returns an access token for the given user.


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

* The first change here is to update the constructor and the methods that used the constants, because of the change we just made.

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

* First, we've **used the** `@Value` **annotation** to inject the properties from our configuration file.
* The other change is **the** `@PostConstruct` **annotation**, which marks the method to run once dependency injection is done. In other words, once **Spring has injected all the values (from application.yml) into our fields, it calls the** `init()` **method**. In that method we initialize our Keycloak instance with the injected configuration values.
* The first step before refactoring is to have a good set of tests (which we don't have), so the step before that is to make the code testable. We've made these changes:
  * We've moved the logic that creates the `Keycloak` instance into a new protected method, `createKeycloakInstance()`. The reason is to decouple creating the `Keycloak` instance from initializing the bean. That gives us several things:
    * **Separation of concerns:** the `init()` method now only initializes the bean, while the logic that creates the `Keycloak` instance lives in a separate method.
    * **Better testability:** with the creation in its own method, we can override or mock that specific method in a test. That's especially useful when we want to avoid real connections to external services (such as Keycloak) in unit tests.
  * **We've removed the static methods** and turned them into **instance methods.** By not depending directly on static methods to create instances, and being able to inject or override those instances, the class becomes less coupled and more modular.

## KeycloakServiceImpl.java

* Now that we've refactored the `KeycloakClient` class, we can refactor `KeycloakServiceImpl` so it uses the new `KeycloakClient` class instead of the `Keycloak` instance directly.

Let's look at what the class looked like before:

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

At a glance you can see plenty of repeated code, very long methods, magic numbers, **code smells** and so on. Let's go through what's going on:

* **Long methods:** long methods are a problem because they're hard to read and understand. They also usually mean the class is doing too many things. Here, the `createUser()` and `updateUser()` methods are very long and do too much. For example, `createUser()` does all of this:
  * Creates a user
  * Sets their password
  * Assigns their roles
* **Duplicated code:** the logic to get the realm is repeated in several methods (`findAllUsers`, `createUser`, `deleteUser`, `updateUser`).
* **Lack of abstraction:** the logic to build a user representation and credentials is repeated in `createUser` and `updateUser`. It could be pulled out into separate methods or even a helper class.
* **It uses an interface that doesn't really add anything:** for this project there will only ever be one implementation, **Keycloak**. It's a very small project and we won't switch authentication providers either.

Now that we've looked at some of the problems, let's refactor the class:

* First we'll drop the interface implementation and rename the class to `KeycloakService`.
* We'll define constants for the HTTP status codes.
* We'll make `KeycloakClient` a field of the class.

```java 
public class KeycloakService {
  private final static int STATUS_CREATED = 201;
  private final static int STATUS_CONFLICT = 409;
  private KeycloakClient keycloakClient;
}
```
Now we'll go method by method:

### findAllUsers()

```java
public List<UserRepresentation> findAllUsers() {
  log.info("Finding all users");
  log.info("Realm: {}", KeycloakClient.getRealmResource().toRepresentation().getRealm());
  return KeycloakClient.getRealmResource().users().list();
}
```

* The only thing we'll change here is line 2. Since it's repeated all over the code, we'll define a private method:

```java
private void logRealmInfo(){
  log.info("Realm: {}", keycloakClient.getRealmResource().toRepresentation().getRealm());
}
```

* Which leaves our method like this:

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

As you can see, this method is very long and does a lot. Let's look at what we've done to make the code more readable:

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
1. **Extracting the user creation logic:**
   * **Before:** the logic to create a user in Keycloak was embedded in the method.
   * **After:** the private method createUserInKeycloak(UserRequest userRequest) handles it.
```java
private Response createUserInKeycloak(UserRequest userRequest){
  UsersResource userResource = keycloakClient.getUsersResource();
  UserRepresentation userRepresentation = createUserRepresentationFromRequest(userRequest);
  return userResource.create(userRepresentation);
}
```
2. **Extracting the user mapping logic:**
   * **Before:** the logic to map a user from the request to a UserRepresentation object was fully embedded in the method.
   * **After:** the private method createUserRepresentationFromRequest(UserRequest userRequest) handles it.
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
3. **Extracting the credential creation logic:**
   * **Before:** the logic to create a user's credentials was embedded in the method.
   * **After:** the private method `createCredentialRepresentation(UserRequest userRequest)` handles it.
```java
private CredentialRepresentation createCredentialRepresentation(UserRequest userRequest) {
  CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
  credentialRepresentation.setTemporary(false);
  credentialRepresentation.setType(OAuth2Constants.PASSWORD);
  credentialRepresentation.setValue(userRequest.password());
  return credentialRepresentation;
}
```
4. **Extracting the post-creation logic:**
   * **Before:** after creating a user, there was extra logic to set the password and assign roles.
   * **After:** the private method `handleUserCreated(Response response, UserRequest userRequest)` handles it.
```java
private void handleUserCreated(Response response, UserRequest userRequest) {
  String userId = extractUserIdFromResponse(response);
  log.info("User id: {}", userId);

  setUserPassword(userId, userRequest);
  assignUserRoles(userId, userRequest);
}
```
5. **Extracting the logic that gets the user ID:**
   * **Before:** the logic to get the user ID was also handled in the same method.
   * **After:** the private method `extractUserIdFromResponse(Response response)` handles it.
```java
private String extractUserIdFromResponse(Response response) {
  String path = response.getLocation().getPath();
  return path.substring(path.lastIndexOf('/') + 1);
}
```
6. **Extracting the logic that sets the user's password:**
   * **Before:** the logic to set the user's password was also handled in the same method.
   * **After:** the private method `setUserPassword(String userId, UserRequest userRequest)` handles it.
```java
private void setUserPassword(String userId, UserRequest userRequest) {
  UsersResource usersResource = keycloakClient.getUsersResource();
  usersResource.get(userId).resetPassword(createCredentialRepresentation(userRequest));
}
```
7. **Extracting the logic that assigns roles to the user:**
   * **Before:** the logic to assign roles to the user was also handled in the same method.
   * **After:** the private method `assignUserRoles(String userId, UserRequest userRequest)` handles it.
```java
private void assignUserRoles(String userId, UserRequest userRequest) {
  RealmResource realmResource = keycloakClient.getRealmResource();
  List<RoleRepresentation> roles = determineRolesToAssign(userRequest, realmResource);
  realmResource.users().get(userId).roles().realmLevel().add(roles);
}
```
8. **Extracting the logic that decides which roles to assign:**
   * **Before:** the logic to decide which roles to assign to the user was also handled in the same method.
   * **After:** the private method `determineRolesToAssign(UserRequest userRequest, RealmResource realmResource)` handles it.
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

In the end we have a much more readable method that's easier to understand.

### updateUser(String userId, UserRequest userRequest)

Let's look at how the `updateUser(String userId, UserRequest userRequest)` method is implemented:

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

We'll apply the same steps as in the previous method and see how to make this one a bit more readable:

1.  **Extracting the user mapping logic:**
    * **Before:** the logic to map a user from the request to a UserRepresentation object was in the method.
    * **After:** we use the private method createUserRepresentationFromRequest(UserRequest userRequest), reusing the logic we already had in createUser.
2. **Extracting the credential creation logic:**
   * **Before:** the logic to build the credential representation was embedded in updateUser.
   * **After:** we use the private method createCredentialRepresentation(UserRequest userRequest), reusing code we'd already extracted in createUser.

In the end our method looks like this, with far fewer lines of code and making use of the earlier code:

```java
public void updateUser(String userId, UserRequest userRepresentation) {
  log.info("Updating user");
  logRealmInfo();
  UserResource userResource = keycloakClient.getUsersResource().get(userId);
  userResource.update(createUserRepresentationFromRequest(userRepresentation));
}
```

And we end up with a class that's more readable and easier to understand:

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

There isn't much to do in our controller, but we can fix a few small issues:

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

There are a few things we can improve:

1. **Consistent API routes:**
   * **Before:** routes such as /user/{username}, /user/create, /user/update/{userId}.
   * **After:** drop the /user segment and use routes such as /{username}, /create, /update/{userId}. Since the controller is already mapped to /api/users, it's redundant.
2. **API responses:**
   * **Before:** it returns ResponseEntity<?>.
   * **After:** specify the response type instead of using a wildcard. For example, ResponseEntity<List<UserRepresentation>> for findAllUsers().

And it ends up like this:

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

In this class we'll make some minor changes:

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

All we'll do is remove some braces that aren't needed.

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

After these changes, we can run the application through our SonarQube scanner and see there are no more issues and the quality of our code has improved substantially.

![SonarQube analysis](/assets/keycloak/sonar.png)

There are certainly many things that could be improved in this implementation. I'm not an expert at refactoring code, and there's no point over-engineering this project, but it's definitely a good improvement and a good starting point to keep improving.
