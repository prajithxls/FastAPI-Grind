import os
from pathlib import Path

import uvicorn
from dotenv import load_dotenv
from fastapi import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from vanna import Agent
from vanna.core.registry import ToolRegistry
from vanna.core.user import UserResolver, User, RequestContext
from services.llm_memory import get_agent_memory
from vanna.integrations.openai import OpenAILlmService
from vanna.integrations.sqlite import SqliteRunner
from vanna.servers.fastapi import VannaFastAPIServer
from vanna.tools import RunSqlTool, VisualizeDataTool
from vanna.tools.agent_memory import (
    SaveQuestionToolArgsTool,
    SearchSavedCorrectToolUsesTool,
    SaveTextMemoryTool,
)

# ---------- Config (.env must be named exactly ".env") ----------
load_dotenv(Path(__file__).resolve().parent / ".env", override=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
DATABASE_PATH = os.getenv("DATABASE_PATH", "./warehouse.db")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8001"))

if not GROQ_API_KEY:
    raise SystemExit("GROQ_API_KEY missing. Copy .env.example to .env and set it.")
if not Path(DATABASE_PATH).exists():
    raise SystemExit(f"Database not found: {DATABASE_PATH}. Fix DATABASE_PATH in .env.")


# ---------- Auth ----------
class SimpleUserResolver(UserResolver):
    async def resolve_user(self, request_context: RequestContext) -> User:
        email = request_context.get_cookie("vanna_email") or "guest@example.com"
        group = "admin" if email == "admin@example.com" else "user"
        return User(id=email, email=email, group_memberships=[group])


# ---------- LLM (Groq via OpenAI-compatible API) ----------
llm = OpenAILlmService(
    model=GROQ_MODEL,
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

# ---------- Tools ----------
tools = ToolRegistry()
tools.register_local_tool(
    RunSqlTool(sql_runner=SqliteRunner(database_path=DATABASE_PATH)),
    access_groups=["admin", "user"],
)
tools.register_local_tool(SaveQuestionToolArgsTool(), access_groups=["admin"])
tools.register_local_tool(SearchSavedCorrectToolUsesTool(), access_groups=["admin", "user"])
tools.register_local_tool(SaveTextMemoryTool(), access_groups=["admin", "user"])
tools.register_local_tool(VisualizeDataTool(), access_groups=["admin", "user"])

# ---------- Agent + Server ----------
agent = Agent(
    llm_service=llm,
    tool_registry=tools,
    user_resolver=SimpleUserResolver(),
    agent_memory=get_agent_memory(),
)

server = VannaFastAPIServer(agent)
app = server.create_app()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginPayload(BaseModel):
    email: str


@app.post("/api/v0/auth/login")
@app.post("/auth/login")
@app.post("/login")
async def handle_login(payload: LoginPayload, response: Response):
    response.set_cookie(key="vanna_email", value=payload.email, httponly=False, samesite="lax", path="/")
    return {"status": "ok", "email": payload.email}


if __name__ == "__main__":
    print(f"Starting Vanna server on http://localhost:{PORT}")
    # Run OUR app (server.run() would build a new app and drop the login route + CORS)
    uvicorn.run(app, host=HOST, port=PORT)