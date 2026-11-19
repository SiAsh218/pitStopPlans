# Security and Authentication Guide

## Purpose and scope

This document describes how security and authentication are currently
implemented in Pit Stop Plans.

This application uses a Node.js HTTP server, a browser frontend, and a local
SQLite database. The frontend does not connect directly to SQLite and has no
database credentials.

## Trust boundaries

The server is the authority for authentication and authorization:

1. The browser collects credentials and calls `/api/auth/login`.
2. The server validates and transforms the login request.
3. The server compares the supplied password with a bcrypt password hash.
4. The server issues an access JWT and a refresh token.
5. Protected API routes verify the JWT and the authenticated user's current
   account status.
6. Route middleware checks whether the authenticated user has the required
   role.
7. Repositories issue parameterized SQLite statements to the local database.

## Authentication flow

### Password storage

- User passwords are stored as bcrypt hashes in `users.password`.
- The authentication service uses bcrypt with `BCRYPT_ROUNDS`, defaulting to
  12 rounds, for registration and login.
- User-management password hashing uses `BCRYPT_SALT`, defaulting to 10 rounds.
- Password creation and update operations require at least eight characters,
  a letter, a number, and a special character.
- The login request itself allows a password string but does not hash or store
  the plaintext password.

Plaintext passwords must not be added to application logs or audit details.

### Login

The login route is `POST /api/auth/login`.

The route pipeline:

1. Applies the global JSON content-type check.
2. Runs Zod validation from `loginSchema`.
3. Calls `AuthController.login`.
4. Looks up the account by email.
5. Checks that the account is active.
6. Compares the password with the bcrypt hash.
7. Creates an access JWT and refresh session.

Failed attempts are stored by email in `login_attempts`. The defaults allow five
failed attempts and a 15-minute lockout. They can be configured with:

- `MAX_LOGIN_ATTEMPTS`
- `LOGIN_LOCKOUT_MINUTES`

The access token expires after `ACCESS_TOKEN_EXPIRES_IN`, defaulting to 15
minutes.

### JWT access tokens

The access token is a signed HS256 JWT. It contains:

- `sub`: user ID
- `role`: application role
- `jobRoles`: operational job-role IDs
- `tokenVersion`: user token-version value

JWT verification uses:

- `JWT_SECRET`
- `JWT_ISSUER`, defaulting to `pit-stop-plans`
- `JWT_AUDIENCE`, defaulting to `pit-stop-plans-api`
- The HS256 algorithm

`JWT_SECRET` is mandatory and the application refuses to start if it is
missing.

Protected browser requests send the access token in the `accessToken` HttpOnly
cookie. The middleware also retains bearer-token compatibility for existing
API clients:

```text
Authorization: Bearer <access-token>
```

The authentication middleware:

- Accepts an access token from the `accessToken` HttpOnly cookie.
- Retains bearer-header compatibility and requires exactly `Bearer` plus a
  token when that header is used.
- Verifies signature, algorithm, issuer, audience, and expiry.
- Confirms that the token subject is a positive integer.
- Reloads the user account.
- Rejects inactive accounts.
- Rejects tokens whose `tokenVersion` differs from the current database value.
- Limits accounts with `must_change_password` to password change, logout, and
  validate operations.

The access token is stored in an `HttpOnly` cookie, so JavaScript cannot read
or modify it. Basic user information used by the interface remains in
`localStorage`. The CSP below is therefore an important XSS defense, but it does
not replace secure coding and dependency review.

### Refresh sessions

The refresh token is a cryptographically random 64-byte hex value. The
application stores only a SHA-256 hash of the refresh token in `auth_sessions`,
not the token itself.

Refresh sessions contain:

- User ID
- Token hash
- Expiration
- Creation and last-use timestamps
- Optional revocation timestamp

Session rotation occurs on every successful refresh:

1. The browser sends the refresh cookie.
2. The server hashes the supplied token.
3. The server finds an unrevoked, unexpired matching session.
4. The server generates a completely new refresh token.
5. The old session row is updated with the new token hash.
6. The new refresh token replaces the browser cookie.
7. The old refresh token becomes invalid.

The refresh session lifetime defaults to 30 days and is controlled by
`SESSION_EXPIRES_IN_DAYS`.

Logout finds the matching session and marks it revoked.

Disabling or deleting a user must be considered separate from password reset:

- Disabling a user increments `token_version` and rejects existing access
  tokens.
- Role changes increment `token_version` and reject existing access tokens.
- Password changes increment `token_version` and revoke all refresh sessions.

### Forced password change

The `users.must_change_password` flag is set when:

- An administrator creates a new user.
- An administrator resets or changes an existing user's password.
- A seeded administrator or user is created during database seeding.

After login, the response identifies the flag in `user.mustChangePassword`.
The interface redirects that account to `/change-password`.

The password-change endpoint is `POST /api/auth/change-password`. It:

- Uses the authenticated user's ID from the access token or access cookie.
- Requires the user's current password.
- Requires the new password to pass complexity validation.
- Requires the new password to differ from the current password.
- Clears `must_change_password`.
- Increments `token_version`.
- Revokes all refresh sessions.
- Requires CSRF validation.

Accounts with the flag cannot access protected application routes until they
change their password. They may use the password-change, logout, and validate
endpoints. A password change can only be submitted for the currently
authenticated account.

Administrators can also see temporary login-lockout status on the protected
Users page. The server adds `login_lockout` to the admin user DTO with the
locked state, failed-attempt count, remaining minutes, and lockout expiry.
An administrator can explicitly clear the lockout from that page. This action
clears that user's login-attempt record, is separate from resetting the
password, and is recorded in the audit log.

## Cookie protections

The access-token cookie is named `accessToken` and is configured with:

- `HttpOnly`: JavaScript cannot read or change it.
- `SameSite=Strict`: cross-site submission is restricted.
- `Path=/`: protected application and event endpoints receive it.
- `Secure`: enabled in production.

The refresh-token cookie is configured with:

- `HttpOnly`: JavaScript cannot read or change it.
- `SameSite=Strict`: cross-site submission is restricted.
- `Path=/api/auth`: the browser sends it only to authentication API routes.
- `Secure`: enabled in production.
- `Max-Age=2592000`: a 30-day browser lifetime.

The CSRF cookie is named `csrfToken` and is configured with:

- `SameSite=Strict`
- `Path=/`
- `Secure`: enabled in production.

The CSRF middleware compares a random cookie value with the `X-CSRF-Token`
request header using `crypto.timingSafeEqual`. Refresh, logout, and
password-change routes require this check.

The login route is not CSRF-protected, because it creates the session. CSRF
hardening should still be reviewed if deployment conditions allow cross-site
requests or embedded contexts.

## Authorization

Authorization is role-based:

- `auth` authenticates the request and loads `req.user`.
- `requireRole(...)` restricts the route to the allowed application roles.
- `admin` routes manage users and audit logs.
- Routes can require `admin`, `editor`, or `user`, depending on the operation.
- Operational job roles are also stored in JWTs and used in application
  workflow logic.

Route handlers must not rely only on hiding a control in the frontend.
Authorization is enforced again on the server by route middleware.

Examples:

- `/api/users` requires authentication and the `admin` role.
- `/api/audit-logs` requires authentication and the `admin` role.
- `/api/auth/register` requires authentication and the `admin` role.
- `/api/auth/validate` requires a valid access token.
- Reporting endpoints require `REPORTING_API_KEY` instead of a user JWT.

Reporting API keys are separate bearer capabilities, and direct access to the
reporting endpoints requires the `X-API-Key` header to match
`REPORTING_API_KEY`. The key must be kept server-side and must not be stored in
frontend source or browser storage.

## Request validation and database safety

The server has the following request safeguards:

- JSON parsing rejects malformed JSON.
- POST and PUT requests must use `application/json`.
- Requests are limited to 1 MiB.
- Zod validates bodies, parameters, and strict object shapes.
- Email addresses are trimmed, validated, lowercased, and limited to 254
  characters.
- Numeric ID schemas require positive integers.
- Array sizes and string lengths are constrained where relevant.
- Validation failures return generic `400 Invalid request` responses.

SQLite repositories use prepared statements and bound parameters. The generic
repository also validates supplied update and insert columns against the actual
table schema. This prevents arbitrary database column names from being used
through its generic field mechanism.

Foreign-key enforcement is enabled, WAL journaling is enabled, and migrations
initialize the database schema at startup.

## HTTP security headers

Every response receives:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- A restrictive Content Security Policy:
  - self-only default and connection sources
  - self-only scripts and styles
  - no objects
  - no framing
  - self-only form actions

These headers reduce framing, MIME-sniffing, referrer, feature, injection, and
resource-loading risks. They do not eliminate XSS or unsafe dependency code.

The application server itself uses plain HTTP. HTTPS must be provided by a
reverse proxy or another production HTTPS listener. The `Secure` cookie flag
only activates in `NODE_ENV=production`.

## Logging and audit data

The Pino logger redacts password, token, access-token, refresh-token, and
authorization fields. It is configured by `LOG_LEVEL`.

Operational audit entries record:

- Acting user
- Action
- Entity type
- Entity ID
- JSON details

Audit retrieval is restricted to administrators. Audit records should not be
used to store passwords or complete credentials.

## Environment configuration

The application loads environment variables through `dotenv`.

Required or deployment-critical variables:

| Variable                  | Purpose                                        |
| ------------------------- | ---------------------------------------------- |
| `JWT_SECRET`              | Signs and verifies access JWTs; required       |
| `REPORTING_API_KEY`       | Protects reporting API endpoints               |
| `NODE_ENV`                | Enables production behavior and secure cookies |
| `PORT`                    | Optional HTTP server port                      |
| `JWT_ISSUER`              | Expected JWT issuer                            |
| `JWT_AUDIENCE`            | Expected JWT audience                          |
| `ACCESS_TOKEN_EXPIRES_IN` | Access-token lifetime                          |
| `SESSION_EXPIRES_IN_DAYS` | Refresh-session lifetime                       |
| `BCRYPT_ROUNDS`           | Login/authentication bcrypt cost               |
| `BCRYPT_SALT`             | User creation/password bcrypt cost             |
| `MAX_LOGIN_ATTEMPTS`      | Failed-login limit                             |
| `LOGIN_LOCKOUT_MINUTES`   | Account lockout duration                       |
| `ADMIN_EMAIL`             | Initial administrator seed email               |
| `ADMIN_PASSWORD`          | Initial administrator seed password            |
| `SNDM_USER_EMAIL`         | Optional seeded user email                     |
| `SNDM_USER_PASSWORD`      | Optional seeded user password                  |
| `BASIC_USER_EMAIL`        | Optional seeded user email                     |
| `BASIC_USER_PASSWORD`     | Optional seeded user password                  |
| `LOG_LEVEL`               | Pino log level                                 |

`JWT_SECRET`, `REPORTING_API_KEY`, and seed passwords must be high entropy,
unique to the deployment, stored outside source control, and changed if
exposed.

There is no built-in secret vault or secret rotation process.

## Known Limitations

- Login responses use a generic `401 Invalid credentials` response for unknown,
 disabled, incorrect-password, and lockout cases. Per-account lockout state
 remains an internal control and is not returned to the browser.
- Login throttling is tracked per email in SQLite. It does not provide
  application-level IP-based throttling or distributed rate limiting.
- The application server does not terminate TLS itself. Production deployments
  must place it behind an HTTPS reverse proxy or add a TLS listener.
- There is no built-in MFA or self-service password-recovery flow. Forced
  first-login password changes are now implemented for administrator-created
  users, seeded users, and password resets.
- Access tokens are protected from JavaScript by `HttpOnly` cookies, but a
  successful XSS attack can still perform actions as the authenticated user
  while the access and refresh sessions remain valid.
- There is no built-in JWT-secret or reporting-API-key rotation mechanism.
- SQLite database backups, restore procedures, encryption at rest, OS file
  permissions, and database-file access control are deployment responsibilities.
- The application does not provide built-in monitoring or alerts for repeated
  login failures, lockouts, session activity, or secret exposure.
- CSP, secure cookies, request validation, and server-side authorization reduce
  attack risk but do not replace dependency review, secure coding, and periodic
  security testing.
