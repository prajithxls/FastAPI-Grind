# pip install fastapi uvicorn
from config import settings
from fastapi import FastAPI
from routers import products


from database import create_db

from routers import ai

from config import settings




from fastapi.middleware.cors import CORSMiddleware

create_db()


app = FastAPI(
    title="WareHouse",
    description="To Manage Products",
    version="0.0.1"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),  # React dev server
    allow_methods=["*"],                       # GET, POST, PUT, DELETE
    allow_headers=["*"],
)


app.include_router(products.router, prefix="/products",tags=["products"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])

@app.get("/")
def root():
    return {"Warehouse is Open"}