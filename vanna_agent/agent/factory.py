from vanna import Agent

from auth.user_resolver import SimpleUserResolver
from tools.registry import build_tool_registry
from services.llm_memory import get_llm_service, get_agent_memory


def create_vanna_agent() -> Agent:
    """
    Factory function assembling the Vanna Agent with its LLM, tools, auth, and memory.
    """
    llm = get_llm_service()
    agent_memory = get_agent_memory()
    user_resolver = SimpleUserResolver()
    tool_registry = build_tool_registry()

    agent = Agent(
        llm_service=llm,
        tool_registry=tool_registry,
        user_resolver=user_resolver,
        agent_memory=agent_memory
    )
    return agent
