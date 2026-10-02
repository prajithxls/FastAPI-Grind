from vanna.core.registry import ToolRegistry
from vanna.tools.agent_memory import (
    SaveQuestionToolArgsTool,
    SearchSavedCorrectToolUsesTool,
    SaveTextMemoryTool,
)

from tools.database import get_db_tool, get_visualization_tool


def build_tool_registry() -> ToolRegistry:
    """
    Registers all tools with their respective role-based access control groups.
    """
    tools = ToolRegistry()

    # Database runner tool
    tools.register_local_tool(get_db_tool(), access_groups=['admin', 'user'])

    # Memory management tools
    tools.register_local_tool(SaveQuestionToolArgsTool(), access_groups=['admin'])
    tools.register_local_tool(SearchSavedCorrectToolUsesTool(), access_groups=['admin', 'user'])
    tools.register_local_tool(SaveTextMemoryTool(), access_groups=['admin', 'user'])

    # Data visualization tool
    tools.register_local_tool(get_visualization_tool(), access_groups=['admin', 'user'])

    return tools
