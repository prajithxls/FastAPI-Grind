# CLAUDE.md - Context & Instructions for Claude

## Overview
**FastAPI-Grind** is a full-stack **Warehouse Inventory Management System** featuring a **FastAPI** backend (SQLite database managed via **SQLModel**) and a **React + Vite** frontend UI (`warehouse-ui`). It incorporates a RAG-based **AI Assistant** using **LangChain** (`langchain-google-genai`) and **Google Gemini**.

---

## Technical Stack & Architecture

| Layer | Technologies & Tools |
|---|---|
| **Backend** | Python 3.12, FastAPI, SQLModel, Uvicorn |
| **Database** | SQLite (`warehouse.db`), SQLAlchemy engine underlying SQLModel |
| **AI / LLM** | LangChain (`langchain-google-genai`), Gemini Model (`gemini-2.5-flash`) |
| **Configuration** | `pydantic-settings`, loading root `.env` |
| **Frontend** | React 18, Vite, Vanilla CSS |

---

## Key Directories & Files

```
FastAPI-Grind/
├── CLAUDE.md                     # [THIS FILE] Claude metadata & developer instructions
├── PROJECT_META.md               # Detailed system architecture & feature roadmap
│
├── backend/                      # FastAPI Backend Server Root
│   ├── pyproject.toml            # Backend dependencies & metadata
│   ├── main.py                   # FastAPI initialization, CORS, router mounts
│   ├── config.py                 # Pydantic BaseSettings loading environment config
│   ├── database.py               # Engine creation & get_db dependency
│   ├── models/
│   │   └── product.py            # SQLModel entities (product_table, ProductCreate, etc.)
│   └── routers/
│       ├── products.py           # REST CRUD API endpoints for inventory
│       └── ai.py                 # RAG AI Endpoint (/ai/ask) using LangChain & Gemini
│
└── warehouse-ui/                 # React Frontend Application
    ├── package.json              # Frontend scripts & dependencies
    ├── vite.config.js            # Vite config (dev server port, proxies)
    └── src/
        ├── main.jsx              # React app mount point
        ├── App.jsx               # Primary layout, components & state
        └── index.css             # Main stylesheet
```

---

## Development Commands

### Backend Commands (run inside `backend/`)
- **Install Dependencies**: `pip install -e .` (or `poetry install` / `pip install -r requirements.txt` if configured)
- **Start Dev Server**: `uvicorn main:app --reload`
- **Database Console / Schema Sync**: Tables auto-created via `SQLModel.metadata.create_all(engine)` in `main.py`
- **Run Tests**: `pytest`

### Frontend Commands (run inside `warehouse-ui/`)
- **Install Dependencies**: `npm install`
- **Start Dev Server**: `npm run dev`
- **Build Bundle**: `npm run build`
- **Lint Code**: `npm run lint`

---

## API Summary & Endpoints

### 1. Products Endpoint (`/products`)
- `GET /products/`: List all items
- `GET /products/{id}`: Get item by ID
- `POST /products/`: Create single item
- `POST /products/bulk`: Bulk create items in a single transaction
- `PUT /products/{id}`: Update item details
- `DELETE /products/{id}`: Remove item (204 No Content)

### 2. AI Assistant Endpoint (`/ai/ask`)
- `POST /ai/ask`: Accepts JSON `{"question": "..."}`. Queries DB for current inventory, constructs context prompt, calls Gemini via LangChain, and returns a concise response (<30 words).

---

## Pending Work & Project Roadmap

1. **AI Agentic Tool Calling**: Enhance Gemini via LangChain tools to support direct DB modifications (e.g. creating/updating stock via chat).
2. **Auth & Security**: Add JWT Auth (`/auth/login`, `/auth/register`) with passlib/bcrypt password hashing and role-based permissions (Admin vs Viewer).
3. **Database Versioning**: Add Alembic for schema migrations and introduce relational entities (`Category`, `Supplier`).
4. **Frontend UX**: Floating AI chat widget, interactive modal dialogs for product management, dashboard analytics charts, toast notifications.
