# MyCard | Backend

Welcome to the MyCard backend application! This project is built using TypeScript and NestJS, providing a robust and scalable backend for the MyCard application. Below, you'll find detailed information about the project, how to get started, and various other details.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Authentication](#authentication)
- [Database](#database)
- [Image Storage](#image-storage)
- [API Documentation](#api-documentation)
- [Dockerization](#dockerization)
- [License](#license)

## Features

- **NestJS Framework:** Built with NestJS for a modular and maintainable structure.
- **TypeScript:** Written entirely in TypeScript for type safety and better developer experience.
- **JWT Authentication:** Secure authentication using JSON Web Tokens, with support for both local accounts and Google OAuth.
- **PostgreSQL with Prisma ORM:** Database interactions are handled via Prisma ORM, connected to a PostgreSQL database.
- **Firestore for Image Storage:** Images are stored in Google Firestore, ensuring scalable and secure storage.
- **OpenAPI 3 Documentation:** API documentation is automatically generated using OpenAPI 3 standards.
- **Dockerized:** The entire application is containerized with Docker for easy deployment and environment management.

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js** (v14.x or later)
- **npm** (v6.x or later) or **yarn** (v1.x or later)
- **Docker** and **Docker Compose** installed for containerization
- **Google Cloud Account** with Firestore access (for image storage)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AtroxEGO/my-card-backend.git
   cd mycard-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

### Running the Application

#### Without Docker

1. **Set up environment variables:**

   Create a `.env` file in the root directory and configure the necessary environment variables:

   ```plaintext
   JWT_SECRET = your_jwt_secret
   DATABASE_HOST = "postgresql://user:password@localhost/database"
   POSTGRES_USER = user
   POSTGRES_PASSWORD = password
   FIREBASE_API_KEY = your_firebase_api_key
   GOOGLE_OAUTH_CLIENT_ID = your_google_oauth_client_id
   GOOGLE_OAUTH_SECRET_KEY = your_google_oauth_secret_key
   FRONTEND_HOST = 'http://localhost:4200'
   ```

2. **Run database migrations:**

   ```bash
   npx prisma migrate deploy
   ```

3. **Start the application:**

   ```bash
   npm run start:dev
   ```

   The application will be available at `http://localhost:3000`.

#### With Docker

1. **Build and start the Docker containers:**

   ```bash
   docker compose up --build
   ```

   This command will build the Docker images and start the containers. The application will be available at `http://localhost:3000`.

## Authentication

The application supports JWT-based authentication with two methods:

- **Local Accounts:** Users can register and log in using an email and password.
- **Google OAuth:** Users can authenticate using their Google account.

Authentication logic is implemented in the `auth` module, with separate services for local and Google authentication. JWT tokens are issued upon successful login and are required for accessing protected routes.

## Database

Prisma ORM is used to interact with a PostgreSQL database. The Prisma schema is defined in `prisma/schema.prisma`, and migrations can be managed using the Prisma CLI.

### Running Migrations

To apply migrations to your database, run:

```bash
npx prisma migrate deploy
```

## Image Storage

Images are stored in Google Firestore. The `storage.service.ts` service handles all interactions with Firestore, including uploading, retrieving, and deleting images.

Ensure that your Firebase project credentials are properly configured in the `.env` file.

## API Documentation

The API is documented using OpenAPI 3 standards. Once the application is running, you can access the automatically generated documentation at:

```
http://localhost:3000/docs
```

This documentation is interactive, allowing you to test API endpoints directly from the browser.

## Dockerization

The application is fully containerized using Docker. The `docker-compose.yml` file defines services for the application and the database. This setup allows for easy deployment and consistent environment configuration across different systems.

### Docker Commands

- **Build and start containers:**

  ```bash
  docker compose up --build
  ```

- **Stop containers:**

  ```bash
  docker compose down
  ```

- **Rebuild without cache:**

  ```bash
  docker compose build --no-cache
  ```

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---
