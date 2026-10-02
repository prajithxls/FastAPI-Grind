import os
from openai import OpenAI
from vanna.integrations.openai import OpenAILlmService
from vanna.integrations.pinecone.agent_memory import PineconeAgentMemory

from config import settings


def get_llm_service() -> OpenAILlmService:
    """
    Initializes Groq LLM using the OpenAI-compatible service interface.
    """
    os.environ["OPENAI_BASE_URL"] = "https://api.groq.com/openai/v1"
    os.environ["OPENAI_API_KEY"] = settings.groq_api_key

    service = OpenAILlmService(
        model=settings.groq_model,
        api_key=settings.groq_api_key,
        base_url="https://api.groq.com/openai/v1",
    )
    service._client = OpenAI(
        api_key=settings.groq_api_key,
        base_url="https://api.groq.com/openai/v1",
    )
    return service


def get_agent_memory() -> PineconeAgentMemory:
    """
    Initializes Pinecone-backed Agent Memory.
    Memories are persisted in the cloud and survive server restarts.
    Index is auto-created if it doesn't exist.

    Configured via .env:
      PINECONE_API_KEY       - Your Pinecone API key
      PINECONE_ENVIRONMENT   - Pinecone cloud region (e.g. us-east-1)
      PINECONE_INDEX_NAME    - Index name to store memories in
    """
    if not settings.pinecone_api_key:
        raise ValueError(
            "PINECONE_API_KEY is not set. Add it to your .env file."
        )

    return PineconeAgentMemory(
        api_key=settings.pinecone_api_key,
        index_name=settings.pinecone_index_name,
        environment=settings.pinecone_environment,
        dimension=384,   # matches all-MiniLM-L6-v2 embeddings
        metric="cosine",
    )
