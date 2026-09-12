# CortexAI

CortexAI is an AI-powered platform built with a microservices architecture. The project is designed around separate services for authentication, chat, AI agents, billing, and API communication instead of putting everything into one backend.

The main goal of the project was to understand how a larger AI application can be structured, where different parts of the system have their own responsibility and can communicate with each other.

## What I Built

CortexAI includes:

* User authentication with Firebase/Google login
* JWT-based authentication and secure cookies
* AI chat functionality
* AI agent service
* RAG-based context retrieval
* Credit-based AI usage system
* Billing and plan management
* Redis integration
* MongoDB for application data
* API Gateway for handling requests between the frontend and backend services
* Docker-based development setup

## Architecture

The backend is divided into multiple services:

```text
                         ┌─────────────────┐
                         │     Frontend    │
                         │   React + Vite  │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   API Gateway   │
                         │      :8000      │
                         └────────┬────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
      │ Auth Service│      │ Chat Service│      │Agent Service│
      │    :8001    │      │    :8002    │      │    :8003    │
      └─────────────┘      └─────────────┘      └─────────────┘
                                  │                    │
                                  └─────────┬──────────┘
                                            ▼
                                      ┌───────────┐
                                      │ MongoDB   │
                                      └───────────┘

                         ┌─────────────────┐
                         │ Billing Service │
                         │      :8004      │
                         └─────────────────┘

                         ┌─────────────────┐
                         │      Redis      │
                         └─────────────────┘
```

The idea is simple: each service handles one particular part of the application instead of creating one large backend.

## Services

### Frontend

The frontend is built with React and Vite. It handles the user interface, authentication flow, chat interface, user plans and interaction with the backend.

### API Gateway

The gateway acts as the entry point for backend requests. Instead of the frontend directly communicating with every individual service, requests can go through the gateway and then be forwarded to the appropriate service.

### Auth Service

Responsible for:

* User registration/login
* Google authentication
* Firebase token verification
* JWT/session handling
* Cookies
* User information
* Plan and credit related operations

### Chat Service

Handles the application's chat-related functionality and communicates with the required backend services for processing user conversations.

### Agent Service

This service contains the AI-related logic. The project uses agent-based workflows and RAG concepts to make the AI responses more useful than a simple direct API call.

### Billing Service

Handles user plans and AI usage credits.

The credit system allows the application to control how much AI functionality a user can consume based on their plan.

## Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* Redux
* Axios

### Backend

* Node.js
* Express.js
* REST APIs
* Microservices architecture

### Database & Storage

* MongoDB
* Mongoose
* Redis

### Authentication

* Firebase Authentication
* Google OAuth
* JWT
* HTTP-only cookies

### AI

* LangGraph
* RAG
* AI/LLM integration

### Development & Deployment

* Docker
* Git
* GitHub
* Environment variables

## Project Structure

```text
CortexAI/
│
├── frontend/
│
├── backend/
│   │
│   ├── gateway/
│   │
│   └── services/
│       ├── auth/
│       ├── chat/
│       ├── agent/
│       └── billing/
│
├── docker-compose.yml
│
└── README.md
```

The exact structure may vary depending on the current version of the project.

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/aman6946/CortexAI.git
cd CortexAI
```

### 2. Install dependencies

Install dependencies inside the frontend and each backend service.

```bash
npm install
```

Do the same inside the required service directories.

### 3. Configure environment variables

Create the required `.env` files for the frontend, gateway and backend services.

Typical configuration includes:

```env
MONGO_URI=
JWT_SECRET=
REDIS_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

AI, billing and other service-specific variables should be added according to the service configuration.

> Do not commit your `.env` files or Firebase private keys to GitHub.

### 4. Start Redis

Make sure Redis is running locally if you are not using the Docker setup.

```bash
redis-server
```

### 5. Start the services

Run each service in its respective directory.

For example:

```bash
npm run dev
```

The main services use:

```text
Gateway  → 8000
Auth     → 8001
Chat     → 8002
Agent    → 8003
Billing  → 8004
```

### 6. Start the frontend

```bash
npm run dev
```

Then open the local URL shown by Vite in your browser.

## Environment Variables

CortexAI uses environment variables for credentials and service configuration.

Some of the important configuration areas are:

* MongoDB connection
* Redis connection
* Firebase credentials
* JWT secret
* AI provider/API configuration
* Billing configuration
* Frontend API URL
* Service URLs

Keep these values private and never push them directly to GitHub.

## Why Microservices?

I built CortexAI using separate services mainly to understand how microservices work in a real application.

For example, authentication shouldn't need to know how the AI agent works, and the billing service shouldn't contain the complete chat logic.

Separating these responsibilities makes the system easier to understand and gives each service a clear purpose.

It also helped me learn about:

* Service-to-service communication
* API gateways
* Redis
* Authentication between services
* Environment-based configuration
* Docker
* Debugging distributed applications

## What I Learned

This project was more than just building an AI chat interface. A major part of the work was understanding how the different pieces of the application communicate with each other.

While working on CortexAI, I worked with:

* Microservice architecture
* Authentication and cookies
* Firebase integration
* MongoDB and Mongoose
* Redis
* AI agent workflows
* RAG concepts
* API Gateway patterns
* Docker
* Backend debugging
* Environment configuration
* Frontend/backend integration

One of the biggest challenges was debugging issues that were not limited to a single service. A problem in one service could affect another service, so understanding the complete request flow became important.

## Current Status

CortexAI is an ongoing project and is being improved as I continue working on the AI and backend architecture.

Some parts of the project are still being refined, especially around AI workflows, service communication and deployment.

## Future Improvements

Some things I plan to improve:

* Better agent workflows
* Improved RAG pipeline
* More reliable service communication
* Better error handling
* Production deployment
* Monitoring and logging
* Improved UI/UX
* More AI tools and capabilities

## Author

**Aman Singh**

GitHub: `aman6946`

---

If you find the project useful or have suggestions, feel free to explore the repository and share your feedback.
