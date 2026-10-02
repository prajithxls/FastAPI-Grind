from config import settings
from sqlmodel import SQLModel, create_engine, Session
from config import settings

DATABASE_URL = settings.database_url

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=settings.debug    )  

def create_db():
    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session