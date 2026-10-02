import uuid

from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage, HumanMessage

from models.product import product_table
from database import get_db, engine
from config import settings

router = APIRouter()

# ── LLM ──────────────────────────────────────────────────────────────
# temperature=0: for tool-calling, we want the model reliably picking
# the right tool + exact arguments, not being "creative" about it.
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.google_api_key,
    temperature=0,
)

SYSTEM_PROMPT = (
    "You are the warehouse assistant for a company's inventory system. "
    "Use the available tools to look up or modify inventory data. "
    "Never claim you changed something unless a tool result confirms it. "
    "Answer in under 30 words, no special characters or emojis."
)

# ── Tools ────────────────────────────────────────────────────────────
# Each tool opens its own DB session because tools run outside FastAPI's
# request-scoped Depends(get_db) — they're invoked by LangChain, not by
# a route handler.

@tool
def get_product_by_name(name: str) -> str:
    """Look up current stock and price for products matching a name
    (partial match allowed). Always use this before update_stock or
    delete_product to confirm the product exists and get its exact ID."""
    with Session(engine) as session:
        stmt = select(product_table).where(product_table.name.ilike(f"%{name}%"))
        results = session.exec(stmt).all()
        if not results:
            return f"No product found matching '{name}'."
        return "\n".join(
            f"id={p.id}, name={p.name}, stock={p.stock}, price={p.price}"
            for p in results
        )


@tool
def list_low_stock(threshold: int = 10) -> str:
    """List products with stock at or below the given threshold (default 10)."""
    with Session(engine) as session:
        stmt = select(product_table).where(product_table.stock <= threshold)
        results = session.exec(stmt).all()
        if not results:
            return f"No products at or below {threshold} units."
        return "\n".join(f"id={p.id}, name={p.name}, stock={p.stock}" for p in results)


class UpdateStockArgs(BaseModel):
    product_id: int = Field(description="Exact numeric ID of the product, from get_product_by_name")
    new_stock: int = Field(description="New stock quantity to set", ge=0)


@tool(args_schema=UpdateStockArgs)
def update_stock(product_id: int, new_stock: int) -> str:
    """Set a product's stock to an exact quantity by product ID."""
    with Session(engine) as session:
        product = session.get(product_table, product_id)
        if not product:
            return f"No product with id={product_id} exists."
        product.stock = new_stock
        session.add(product)
        session.commit()
        return f"Updated '{product.name}' (id={product_id}) stock to {new_stock}."


class DeleteProductArgs(BaseModel):
    product_id: int = Field(description="Exact numeric ID of the product to delete, from get_product_by_name")


@tool(args_schema=DeleteProductArgs)
def delete_product(product_id: int) -> str:
    """Permanently delete a product from inventory by product ID."""
    with Session(engine) as session:
        product = session.get(product_table, product_id)
        if not product:
            return f"No product with id={product_id} exists."
        name = product.name
        session.delete(product)
        session.commit()
        return f"Deleted '{name}' (id={product_id})."


TOOLS = [get_product_by_name, list_low_stock, update_stock, delete_product]
TOOLS_BY_NAME = {t.name: t for t in TOOLS}
DESTRUCTIVE_TOOLS = {"update_stock", "delete_product"}

llm_with_tools = llm.bind_tools(TOOLS)

# ── Pending-action store (HITL) ─────────────────────────────────────
# In-memory for now — Phase 3/4 will move this to a session- and
# user-scoped store so approvals can't cross users.
PENDING_ACTIONS: dict[str, dict] = {}


# ── Schemas ──────────────────────────────────────────────────────────
class AskRequest(BaseModel):
    question: str


class ConfirmRequest(BaseModel):
    action_id: str
    approve: bool


# ── Routes ───────────────────────────────────────────────────────────
@router.post("/ask")
async def ask_about_warehouse(request: AskRequest, db: Session = Depends(get_db)):
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=request.question),
    ]

    ai_msg = await llm_with_tools.ainvoke(messages)

    if not ai_msg.tool_calls:
        return {"type": "answer", "content": ai_msg.content}

    call = ai_msg.tool_calls[0]  # one call at a time for now (Phase 3 handles multi-step)

    if call["name"] in DESTRUCTIVE_TOOLS:
        action_id = str(uuid.uuid4())
        PENDING_ACTIONS[action_id] = call
        return {
            "type": "confirmation_required",
            "action_id": action_id,
            "tool": call["name"],
            "args": call["args"],
            "message": f"About to run {call['name']} with {call['args']}. Confirm?",
        }

    # Safe/read-only tool — execute immediately
    result = TOOLS_BY_NAME[call["name"]].invoke(call["args"])
    return {"type": "answer", "content": result}


@router.post("/ask/confirm")
async def confirm_action(request: ConfirmRequest):
    call = PENDING_ACTIONS.pop(request.action_id, None)
    if call is None:
        return {"type": "error", "content": "Action expired or not found."}

    if not request.approve:
        return {"type": "cancelled", "content": "Action cancelled."}

    result = TOOLS_BY_NAME[call["name"]].invoke(call["args"])
    return {"type": "answer", "content": result}