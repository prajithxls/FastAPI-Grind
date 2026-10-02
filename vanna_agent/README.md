# Vanna AI Agent Service

This directory contains a modular, production-ready implementation of **Vanna.ai (2.0 Agent Architecture)** integrated with **Anthropic Claude (Sonnet 4.5)**, **SQLite**, and **Pinecone Vector Memory**.

## Architecture & Directory Structure

```
vanna_agent/
├── .env.example              # Template for API keys & database paths
├── config.py                 # Pydantic Settings loading environment configurations
├── requirements.txt          # Python dependencies
├── main.py                   # Application entrypoint to run the Vanna FastAPI server
│
├── agent/                    # Agent Assembly
│   ├── __init__.py
│   └── factory.py            # create_vanna_agent() factory function
│
├── auth/                     # Authentication & User Resolvers
│   ├── __init__.py
│   └── user_resolver.py      # SimpleUserResolver (Cookie-based auth & RBAC groups)
│
├── services/                 # External Service Providers
│   ├── __init__.py
│   └── llm_memory.py         # Anthropic LLM & Pinecone Memory initialization
│
└── tools/                    # Tool definitions & Access Control Registry
    ├── __init__.py
    ├── database.py           # SQL runner and data visualization tools
    └── registry.py           # ToolRegistry configuring role access (admin vs user)
```

## Setup & Running

1. **Navigate to the directory**:
   ```bash
   cd vanna_agent
   ```

2. **Set up virtual environment & install requirements**:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1    # On Windows
   pip install -r requirements.txt
   ```

3. **Configure your environment**:
   Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

4. **Start the server**:
   ```bash
   python main.py
   ```
   The Vanna FastAPI server will start on port `8001` (by default).
