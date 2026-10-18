# MERN TaskFlow DevOps

A lightweight task-management application designed to demonstrate an
end-to-end DevOps workflow using Docker, Docker Compose, GitHub Actions,
and Docker Hub.

> **Project focus:** containerization, automated quality checks, CI/CD,
> image publishing, secure configuration, and operational
> troubleshooting. The application is intentionally simple so
> infrastructure and delivery remain the main learning objectives.

## Table of Contents

-   [Project Goals](#project-goals)
-   [Technology Stack](#technology-stack)
-   [Architecture](#architecture)
-   [Application Features](#application-features)
-   [Repository Structure](#repository-structure)
-   [Run Locally](#run-locally)
-   [Environment Configuration](#environment-configuration)
-   [Docker and Docker Compose](#docker-and-docker-compose)
-   [CI/CD Pipeline](#cicd-pipeline)
-   [Testing and Code Quality](#testing-and-code-quality)
-   [Security Practices](#security-practices)
-   [Health Checks and
    Troubleshooting](#health-checks-and-troubleshooting)
-   [Roadmap](#roadmap)

## Project Goals

This project demonstrates practical DevOps skills:

-   Build production-oriented Docker images with multi-stage builds.
-   Run a multi-container application with Docker Compose.
-   Automate tests, linting, type checking, and builds with GitHub
    Actions.
-   Publish versioned frontend and backend images to Docker Hub.
-   Manage configuration and credentials safely.
-   Apply container security and vulnerability checks.
-   Use health checks, structured logs, and troubleshooting practices.
-   Document the system so another developer can run it.


## Technology Stack

  -----------------------------------------------------------------------
  Area                    Technology              Responsibility
  ----------------------- ----------------------- -----------------------
  Frontend                React, TypeScript, Vite Task-management
                                                  interface

  Web server              Nginx                   Serves the built
                                                  frontend

  Backend                 Node.js, Express,       REST API and
                          TypeScript              application logic

  ODM                     Mongoose                Backend access to
                                                  MongoDB

  Database                MongoDB                 Persistent task data

  Containerization        Docker                  Packages frontend and
                                                  backend

  Local orchestration     Docker Compose          Runs the application
                                                  services together

  CI/CD                   GitHub Actions          Automates validation
                                                  and image publishing

  Image registry          Docker Hub              Stores container images

  Source control          Git and GitHub          Source code and
                                                  workflow definitions
  -----------------------------------------------------------------------

## Architecture

```{=html}
<!-- ARCHITECTURE DIAGRAM TEMPLATE: Paste the project architecture diagram below. Keep this section as the high-level architecture reference. -->
```
![alt text](<MERN TaskFlow Runtime and CICD Architecture.png>)

```{=html}
<!-- END ARCHITECTURE DIAGRAM TEMPLATE -->
```
## Application Features

The intended application scope is deliberately small:

-   Create a task.
-   View the task list.
-   Mark a task as completed or incomplete.
-   Delete a task.
-   Display loading and error states.
-   Expose an API health endpoint.

Authentication, microservices, message queues, and Kubernetes are
outside the current scope.

## Repository Structure

This is the intended high-level layout. Update it if the implementation
changes.

``` text
mern-taskflow-devops/
├── Application-code/
│   ├── core/                    # Express + TypeScript backend
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── package.json
│   │   └── package-lock.json
│   └── web/                     # React + Vite frontend
│       ├── src/
│       ├── Dockerfile
│       ├── .dockerignore
│       ├── nginx.conf
│       ├── docker-entrypoint.sh
│       ├── package.json
│       └── package-lock.json
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # CI and image publishing workflow
├── docker-compose.yml           # Local multi-container application
├── .env.example                 # Example settings, if used
├── .gitignore
└── README.md
```

The actual repository may contain additional source, test, and
configuration files.

## Run Locally

### Prerequisites

Install Git, Node.js and npm, Docker Engine, and the Docker Compose
plugin.

Verify your installations:

``` bash
git --version
node --version
npm --version
docker --version
docker compose version
```

### 1. Clone the repository

``` bash
git clone https://github.com/Vijay8426/mern-taskflow-devops.git
cd mern-taskflow-devops
```

### 2. Configure environment variables

Create the local environment files required by the application and
Compose configuration. Use example files as a reference if present.

For Compose, the backend's MongoDB URI should use the database service
name, for example:

``` env
MONGODB_URI=mongodb://db:27017/taskflow
```

The frontend API URL must be reachable from the browser. If the backend
is exposed on host port `8000`, an example is:

``` env
API_BASE_URL=http://localhost:8000/api
```

Use the variable names and file paths defined by the current application
configuration. Do not commit real credentials or local `.env` files.

### 3. Validate and start the application

Run these commands from the repository root:

``` bash
docker compose config
docker compose up -d --build
docker compose ps
```

Follow logs:

``` bash
docker compose logs -f
```

Stop the services:

``` bash
docker compose down
```

A named MongoDB volume should preserve database data when containers are
recreated. `docker compose down -v` removes Compose-managed named
volumes; use it only when you intentionally want to delete the stored
data.

### 4. Access the application

The intended default local URLs are:

-   Frontend: `http://localhost:8080`
-   Backend health endpoint: `http://localhost:8000/api/health`

These URLs depend on the port mappings in `docker-compose.yml`.

## Environment Configuration

  -----------------------------------------------------------------------
  Variable                Purpose                 Recommended handling
  ----------------------- ----------------------- -----------------------
  `MONGODB_URI`           Backend database        Backend runtime
                          connection              configuration

  `PORT`                  Backend listening port  Backend runtime
                                                  configuration

  `NODE_ENV`              Runtime environment     Backend runtime
                                                  configuration

  `LOG_LEVEL`             Logging verbosity       Backend runtime
                                                  configuration

  `API_BASE_URL`          Browser-facing API base Frontend runtime
                          URL                     configuration, if
                                                  supported

  `DOCKERHUB_USERNAME`    Docker Hub account name GitHub Actions
                                                  repository variable

  `DOCKERHUB_TOKEN`       Authentication for      GitHub Actions
                          image publishing        repository secret
  -----------------------------------------------------------------------

The exact variable names must match the application and workflow
configuration.

Recommended practices:

-   Commit an `.env.example` with placeholder values only.
-   Add `.env` and other real local environment files to `.gitignore`.
-   Never put credentials in source code or public documentation.
-   Do not bake secrets into Docker images or build arguments.
-   Use GitHub Secrets for credentials and GitHub Variables for
    non-sensitive settings.
-   Keep tests independent of a developer's local database.

## Docker and Docker Compose

The Compose application contains three services:

  Service   Responsibility
  --------- ----------------------------------------------
  `web`     Serves the production frontend through Nginx
  `core`    Runs the Express REST API
  `db`      Stores task data in MongoDB

The intended container design uses separate frontend and backend images.
Multi-stage builds should keep build tooling out of production runtime
images where practical.

Docker Compose provides:

-   A shared network for service-to-service communication.
-   Service-name DNS for internal connections.
-   Runtime environment configuration.
-   Health checks and startup dependency handling.
-   A named volume for MongoDB data.
-   Host port mappings for browser access and local debugging.

A dependency declaration alone does not guarantee that an application is
ready. Health checks and application-level failure handling should be
considered.

## CI/CD Pipeline

The GitHub Actions workflow is intended to validate changes and publish
container images.

### Pull requests

The pull-request workflow should run required quality gates:

1.  Install frontend and backend dependencies from lockfiles.
2.  Run tests.
3.  Run linting and TypeScript checks.
4.  Build frontend and backend applications.
5.  Run configured security checks.

A failed required check should fail the workflow. Pull requests from
untrusted contexts should not receive image-publishing credentials.

### Pushes to `main`

After required validation succeeds, the publishing workflow should:

1.  Build frontend and backend Docker images.
2.  Run configured container image scans.
3.  Authenticate to Docker Hub using a GitHub Actions secret.
4.  Publish images with a stable tag and a commit-specific tag.

Example naming convention:

``` text
<dockerhub-username>/taskflow-web:latest
<dockerhub-username>/taskflow-web:<commit-sha>

<dockerhub-username>/taskflow-core:latest
<dockerhub-username>/taskflow-core:<commit-sha>
```

The `latest` tag is convenient for demos; the commit-specific tag
provides traceability to a source revision.

**CI and image publishing do not automatically deploy to a remote
server.** Deployment is a separate optional phase and should only be
described as implemented after it has been configured and verified.

## Testing and Code Quality

Suggested checks include:

-   Frontend tests.
-   Backend unit and route tests.
-   ESLint.
-   TypeScript type checking.
-   Production builds.
-   Docker image builds.
-   Dependency and container vulnerability scans.

Backend route tests should mock database operations when route behavior
does not require a real database. This keeps normal CI runs independent
of a developer's local MongoDB instance.

Integration tests that require a database can be added separately using
an isolated test database. Test data should not touch development or
production data.

Example commands, depending on scripts defined in each `package.json`:

``` bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

Run these from the relevant frontend or backend directory. If a script
is not defined, add and validate it before referencing it in CI.

## Security Practices

The project should demonstrate practical security controls:

-   Run production containers as non-root users where supported.
-   Use multi-stage builds and avoid shipping development dependencies
    unnecessarily.
-   Keep `.env` files and secrets out of source control.
-   Use lockfiles and automated dependency checks.
-   Scan container images for known vulnerabilities.
-   Restrict GitHub Actions permissions to what each job requires.
-   Avoid exposing MongoDB publicly by default.
-   Redact sensitive fields from logs.
-   Use commit-specific image tags for traceability.
-   Do not expose publishing credentials to untrusted pull requests.

Document scan failure criteria and review findings according to severity
rather than silently ignoring them.

## Health Checks and Troubleshooting

The backend exposes an API health endpoint at `/api/health`. Its
response should reflect the condition it checks; if database
connectivity is required, a disconnected database may result in an
unavailable status.

Useful diagnostic commands:

``` bash
# Show service status
docker compose ps

# Follow logs from all services
docker compose logs -f

# Inspect backend logs
docker compose logs -f core

# Inspect a container's configuration and state
docker inspect <container-name>

# Review resource usage
docker stats
```

Common problems:

-   **Backend cannot connect to MongoDB:** Verify the service name, URI,
    network, and database health.
-   **Frontend cannot reach the API:** Verify that the API URL is
    browser-accessible and the backend host port is mapped.
-   **Container exits during startup:** Inspect logs and environment
    configuration.
-   **Health check fails:** Confirm the endpoint, expected status code,
    startup timing, and dependencies.
-   **Changes do not appear:** Confirm the image was rebuilt and the
    container recreated as required.
-   **Database data disappears:** Check the named volume and ensure it
    was not removed.

Docker health checks and logs are useful operational signals, but they
do not replace a full metrics, alerting, and incident-response setup.

## Roadmap

Update these checkboxes as each milestone is completed and verified.

-   [ ] **Milestone 1 --- Application readiness:** Confirm
    functionality, tests, linting, type checking, and builds.
-   [ ] **Milestone 2 --- Docker images:** Build and run separate
    frontend and backend images.
-   [ ] **Milestone 3 --- Docker Compose:** Run the frontend, backend,
    and MongoDB together with networking, health checks, and persistent
    storage.
-   [ ] **Milestone 4 --- CI:** Automate tests, linting, type checks,
    and builds using GitHub Actions.
-   [ ] **Milestone 5 --- Image publishing:** Build, scan, tag, and
    publish images to Docker Hub.
-   [ ] **Milestone 6 --- Security hardening:** Validate secret
    handling, non-root execution, image scanning, and least-privilege
    workflow permissions.
-   [ ] **Milestone 7 --- Operations and documentation:** Verify health
    checks, logs, troubleshooting instructions, and data persistence.
-   [ ] **Milestone 8 --- Portfolio polish:** Complete the architecture
    diagram, screenshots, setup guide, and demo notes.

## Contributing

1.  Create a branch for your change.
2.  Make the change and add or update tests.
3.  Run the relevant quality checks locally.
4.  Open a pull request with a clear description and validation details.

Keep changes focused, document configuration changes, and never commit
secrets.

## License

Add a license before redistributing this project. If no license has been
selected, do not imply that reuse is automatically permitted.