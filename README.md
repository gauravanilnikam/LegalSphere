Contract Sphere AI
===================

Contract Sphere AI is an end‑to‑end contract lifecycle assistant that combines a Spring Boot backend with a modern React + TypeScript frontend. It helps legal and business teams draft, manage, and track contracts using AI‑assisted workflows and structured templates.

The project is organized as a monorepo with separate Backend and Frontend applications.

- **Backend**: Java 17, Spring Boot 3, PostgreSQL, Spring AI with an Ollama model and pgvector for semantic search and AI‑driven contract drafting.
- **Frontend**: Vite, React, TypeScript, Tailwind CSS, shadcn/ui, and TanStack Router/Query for a responsive dashboard experience.

---

Project Structure
-----------------

At a high level, the repository is structured as follows:

- `Backend/` – Spring Boot REST API and persistence layer
  - `src/main/java/com/contract/Backend/`
    - `Config/` – configuration for chat/AI clients, data seeding, and web setup
    - `Controller/` – REST controllers for contracts, contract requests, drafts, templates, and users
    - `DTO/` – request/response data transfer objects for API endpoints
    - `Repository/` – Spring Data JPA repositories for core entities
    - `Service/` – business logic for contract drafting, requests, templates, and user operations
    - `model/` – JPA entities (contracts, contract requests, templates, users)
    - `BackendApplication.java` – main Spring Boot application entrypoint
  - `src/main/resources/application.properties` – application configuration (database, AI model, logging)
- `Frontend/` – React + TypeScript web client
  - `src/components/` – shared UI components, layouts, and common widgets
  - `src/features/` – feature‑oriented modules for legal and department workflows
  - `src/pages/` – routed pages (Dashboard, Analytics, Draft Contracts, Tasks, Department views, etc.)
  - `src/router.tsx` – route configuration using TanStack Router
  - `tailwind.config.ts` and `index.css` – styling and theme setup

---

Backend Overview
----------------

The backend is a Spring Boot application that exposes REST APIs to manage contracts and related workflows, and integrates with a local Ollama model via Spring AI.

### Key Technologies

- Java 17
- Spring Boot 3 (Web, Data JPA, Validation)
- Spring AI with Ollama (`spring-ai-starter-model-ollama`)
- pgvector integration (`spring-ai-starter-vector-store-pgvector`)
- PostgreSQL
- Lombok

### Main Responsibilities

- Manage contract drafts, templates, and contract requests.
- Persist and query structured contract data using PostgreSQL.
- Use Spring AI + Ollama to generate and improve contract drafts and responses.
- Provide REST endpoints consumed by the React frontend.

### Backend Configuration

Configuration is primarily controlled via `application.properties`:

- **Application and AI model**
  - `spring.application.name=Backend`
  - `spring.ai.ollama.base-url=http://localhost:11434`
  - `spring.ai.ollama.chat.model=gpt-oss:20b-cloud` (can be changed to any locally available model)

- **Database**
  - `spring.datasource.url=jdbc:postgresql://localhost:5432/contractdb`
  - `spring.datasource.username=postgres`
  - `spring.datasource.password=...`
  - `spring.jpa.hibernate.ddl-auto=update`
  - `spring.jpa.show-sql=true`

- **Server**
  - `server.port=3001`

Update these values to match your local PostgreSQL and Ollama setup before running the backend.

### Running the Backend

From the `Backend/` directory:

1. Ensure you have:
   - Java 17+
   - Maven
   - A running PostgreSQL instance with a database (e.g., `contractdb`)
   - Ollama installed with the configured model pulled (for example: `ollama pull gpt-oss:20b-cloud`)

2. Configure `src/main/resources/application.properties` for your environment (database credentials, AI model, ports).

3. Build and run:

   ```bash
   cd Backend
   ./mvnw spring-boot:run
   ```

   On Windows PowerShell you can also use:

   ```bash
   mvnw.cmd spring-boot:run
   ```

4. The backend will start on the configured port (default `http://localhost:3001`).

---

Frontend Overview
-----------------

The frontend is a single‑page application built with Vite and React that provides dashboards for legal teams and departments to manage contract requests, drafts, tasks, and analytics.

### Key Technologies

- React 18 + TypeScript
- Vite
- Tailwind CSS + tailwindcss‑animate
- shadcn/ui (Radix UI‑based component primitives under `src/components/ui`)
- TanStack Router and TanStack Query
- React Hook Form + Zod

### Main Responsibilities

- Provide dashboards for:
  - Overall contract analytics and KPIs
  - Draft contracts and templates
  - Requests and tasks for departments
  - Role‑based views for legal vs. department users
- Interact with the backend APIs to:
  - Create and manage contract drafts
  - Submit and track contract requests
  - View templates and AI‑generated content

### Running the Frontend

From the `Frontend/` directory:

1. Ensure you have:
   - Node.js (LTS recommended)
   - npm or another Node package manager

2. Install dependencies:

   ```bash
   cd Frontend
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the URL printed in the terminal (typically `http://localhost:5173`) in your browser.

5. For production builds:

   ```bash
   npm run build
   npm run preview
   ```

Ensure the frontend is configured to call the correct backend base URL (for example, `http://localhost:3001`) wherever API clients are defined.

---

Environment and Configuration
-----------------------------

Typical local setup:

- Backend Spring Boot server listening on `http://localhost:3001`
- PostgreSQL running locally (for example on port `5432`) with a database named `contractdb`
- Ollama running locally on `http://localhost:11434` with the chosen model pulled
- Frontend Vite dev server running on `http://localhost:5173`

Sensitive values such as database credentials and AI model names should be adjusted for each environment (development, staging, production) using appropriate configuration mechanisms (for example, externalized properties or environment variables).

---

Development Workflow
--------------------

- **Backend**
  - Update domain models in `model/` and corresponding repositories in `Repository/`
  - Add business logic in `Service/`
  - Expose REST endpoints via `Controller/`
  - Use DTOs in `DTO/` for request/response shapes

- **Frontend**
  - Add or update routes in `src/router.tsx` and page components in `src/pages/`
  - Use layout components from `src/components/layout/` for consistent dashboards
  - Build reusable UI elements under `src/components/ui/`
  - Encapsulate feature‑specific logic under `src/features/`
  - Use TanStack Query for data fetching and caching and React Hook Form for forms

---

Testing and Quality
-------------------

- **Backend**
  - Tests live under `Backend/src/test/java/...`
  - You can run them with:

    ```bash
    cd Backend
    ./mvnw test
    ```

- **Frontend**
  - Linting is configured via ESLint:

    ```bash
    cd Frontend
    npm run lint
    ```

Add unit and integration tests as you extend the application to keep contract workflows reliable.

---

API and Integration
-------------------

The backend exposes REST endpoints for core entities such as:

- Contracts and contract drafts
- Contract requests and their lifecycle
- Contract templates and template library operations
- Users and related metadata

A sample Postman collection is available in the repository (for example, `ContractManagementAPI.postman_collection.json.txt` or `postman-test-samples.json`). You can import these into Postman to explore and test the available endpoints.

---

Getting Started Quickly
-----------------------

1. Clone the repository.
2. Set up PostgreSQL and create a database (e.g., `contractdb`).
3. Install and start Ollama, then pull the configured model.
4. Configure `Backend/src/main/resources/application.properties` for your environment.
5. Start the backend (`mvnw spring-boot:run`).
6. Install frontend dependencies and start the dev server (`npm install` then `npm run dev` in `Frontend/`).
7. Open the frontend in your browser and begin exploring the Contract Sphere AI dashboards and workflows.

---

License
-------

This project is provided as‑is for demonstration and extension. Add your preferred license text here if you intend to distribute or open‑source it.

