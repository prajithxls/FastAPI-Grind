from vanna.tools import RunSqlTool, VisualizeDataTool
from vanna.tools.agent_memory import (
    SaveQuestionToolArgsTool,
    SearchSavedCorrectToolUsesTool,
    SaveTextMemoryTool,
)
from vanna.integrations.sqlite import SqliteRunner

from config import settings


def get_db_tool() -> RunSqlTool:
    """Configures and returns the SQL execution tool for SQLite."""
    return RunSqlTool(
        sql_runner=SqliteRunner(database_path=settings.database_path)
    )


def get_visualization_tool() -> VisualizeDataTool:
    """Returns the data visualization tool."""
    return VisualizeDataTool()


def get_memory_tools() -> list:
    """Returns the set of memory management tools."""
    return [
        SaveQuestionToolArgsTool(),
        SearchSavedCorrectToolUsesTool(),
        SaveTextMemoryTool(),
    ]
