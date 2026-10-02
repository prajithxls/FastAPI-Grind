# Project Metadata & System Architecture: FastAPI-Grind

## Overview
**FastAPI-Grind** is a full-stack **Warehouse Inventory Management System** with an integrated **AI Assistant** powered by **Google Gemini** and **LangChain**. It features a RESTful FastAPI backend with SQLite persistence via SQLModel and a Vite + React frontend.

---

## Technical Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | FastAPI (Python 3.12) |
| **ORM / Database** | SQLModel (SQLAlchemy + Pydantic) / SQLite (`warehouse.db`) |
| **AI / LLM Integration** | LangChain (`langchain-google-genai`) + Google Gemini (`gemini-2.5-flash`) |
| **Configuration** | `pydantic-settings` (loading `.env`) |
| **Frontend Framework** | React 18 + Vite |
| **Styling** | Vanilla CSS (`App.css`, `index.css`) |

---

## Directory & File Structure

```
FastAPI-Grind/
├── PROJECT_META.md               # [THIS FILE] Complete project documentation & metadata
│
├── backend/                      # FastAPI Backend Server
│   ├── .env                      # Environment variables (API keys, DB URLs, Secret keys)
│   ├── .gitignore                # Git ignore rules for backend
│   ├── .python-version           # Python version pin (3.12)
│   ├── pyproject.toml            # Backend dependencies & metadata
│   ├── warehouse.db              # SQLite database file
│   ├── config.py                 # Pydantic BaseSettings configuration
│   ├── database.py               # Database engine & session dependency (get_db)
│   ├── main.py                   # FastAPI app initialization, CORS middleware, & router mounts
│   │
│   ├── models/                   # Data Models & Schemas
│   │   └── product.py            # SQLModel table schema & Pydantic DTOs
│   │
│   └── routers/                  # API Endpoint Routers
│       ├── products.py           # RESTful CRUD operations for inventory
│       └── ai.py                 # RAG AI Endpoint (/ai/ask) with LangChain + Gemini
│
└── warehouse-ui/                 # React Frontend Application
    ├── package.json              # Frontend scripts & dependencies
    ├── vite.config.js            # Vite bundler configuration
    ├── index.html                # Single Page Application HTML root
    ├── eslint.config.js          # ESLint configuration
    ├── public/                   # Static assets
    └── src/                      # React source code
        ├── main.jsx              # React app mounting point
        ├── App.jsx               # Main UI components & state
        ├── App.css               # Component specific styling
        └── index.css             # Global CSS styling
```

---

## Deep-Dive Component Architecture

### 1. Database & Models (`backend/models/product.py`)
- **`Product_BluePrint`**: Base SQLModel schema (`name: str`, `price: float > 0`, `stock: int >= 0`).
- **`product_table`**: Database table mapping (`id` primary key).
- **`ProductCreate`**: Schema for creating single/bulk products.
- **`ProductUpdate`**: Optional field schema for partial updates (`PUT`).
- **`ProductResponse`**: Output DTO for returning product objects.

### 2. Products API Router (`backend/routers/products.py`)
- `GET /products/`: Retrieve list of all inventory items.
- `GET /products/{product_id}`: Retrieve a single product by ID.
- `POST /products/`: Create a single product.
- `POST /products/bulk`: Create multiple products in a single database transaction.
- `PUT /products/{product_id}`: Partial update of a product.
- `DELETE /products/{product_id}`: Delete a product (204 response).

### 3. AI Router (`backend/routers/ai.py`)
- **`POST /ai/ask`**:
  1. Fetches real-time inventory from `warehouse.db`.
  2. Formats inventory records as context.
  3. Feeds context + user question to Gemini (`gemini-2.5-flash`) via LangChain pipeline (`prompt | llm`).
  4. Returns concise text answer (<30 words) answering queries based on live database data.

### 4. Configuration & Security (`backend/config.py` & `backend/main.py`)
- Configured via `.env` for:
  - `GOOGLE_API_KEY`: API key for Gemini.
  - `DATABASE_URL`: `sqlite:///warehouse.db`.
  - `ALLOWED_ORIGINS`: CORS whitelist (allows frontend access).
  - `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`: Security settings.

---

## Status Checklist: What is Built vs What is Missing

### ✅ Completed Features
- [x] SQLite database integration using SQLModel.
- [x] Complete RESTful CRUD API endpoints for product management (`GET`, `POST`, `POST /bulk`, `PUT`, `DELETE`).
- [x] AI Assistant RAG pipeline (`/ai/ask`) reading live inventory from the DB.
- [x] CORS middleware set up for frontend communication.
- [x] React single page UI (`warehouse-ui`) with Vite dev server.

---

### 🚀 Pending / Suggested Enhancements (What is Left)

#### 1. AI Capabilities
- [ ] **AI Tool Calling (Agentic CRUD)**: Allow Gemini to invoke DB tools (`add_product`, `update_stock`, `delete_product`) directly when asked in natural language.
- [ ] **Conversation History (Chat Memory)**: Retain chat context across multiple user questions.

#### 2. Security & User Management
- [ ] **User Authentication & Authorization**: Add JWT Login (`/auth/login`, `/auth/register`) with hashed passwords (bcrypt/passlib).
- [ ] **Role-Based Access Control (RBAC)**: Distinguish between `Admin` (full CRUD + AI) and `Customer`/`Staff` (view-only).

#### 3. API & Database Enhancements
- [ ] **Pagination, Filtering, & Search**: Add query params to `GET /products/` (`page`, `limit`, `category`, `search_query`, `min_price`).
- [ ] **Alembic Database Migrations**: Version control for database schema changes.
- [ ] **Category & Supplier Models**: Relational tables (`Category`, `Supplier`) linked to `Product`.

#### 4. Frontend UI/UX (React)
- [ ] **AI Chatbot Interface**: Modern floating chat widget connected to `/ai/ask`.
- [ ] **Modal Dialogs & Form Validation**: User-friendly popups for Adding/Editing items.
- [ ] **Toast Notifications**: Error/success alerts on product operations.
- [ ] **Dashboard Analytics**: Visual charts (recharts/chart.js) showing stock levels, low-stock warnings, and inventory total value.

#### 5. Testing & DevOps
- [ ] **Automated Testing**: Backend tests using `pytest` & `httpx`; Frontend tests using Vitest/Playwright.
- [ ] **Dockerization**: `Dockerfile` and `docker-compose.yml` for unified single-command deployment.
