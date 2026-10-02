from pydantic import BaseModel
from sqlmodel import SQLModel, Field

from typing import Optional

class Product_BluePrint(SQLModel):
    name:str
    price:float=Field(gt=0, description="Must be greater than 0")
    stock:int=Field(ge=0, description="Must be Positive")

class product_table(Product_BluePrint,table=True):
    id: Optional[int]=Field(default=None,primary_key=True)

class ProductCreate(Product_BluePrint):
    pass

class ProductUpdate(SQLModel):
    name:  Optional[str]   = None
    price: Optional[float] = Field(default=None, gt=0)
    stock: Optional[int]   = Field(default=None, ge=0)

class ProductResponse(Product_BluePrint):
    id:int


# class ProductCreate(BaseModel):
#     name: str 
#     price: float =Field(gt=0, description="Must be greater than 0")
#     stock: int = Field(ge=0, description="Must be Positive")

# class ProductUpdate(BaseModel):
#     name: Optional[str] = None
#     price: Optional[float] = Field(default=None, gt=0)
#     stock: Optional[int] = Field(default=None, ge=0)

# class ProductResponse(BaseModel):
#     id:int
#     name:str
#     price:float
#     stock:int

