from fastapi import APIRouter, Depends, HTTPException

from typing import List

from models.product import ProductResponse,ProductCreate,ProductUpdate,product_table
from sqlmodel import Session, select
from database import get_db


router =APIRouter()





@router.get("/",response_model=List[ProductResponse])
def get_all_products(db:Session=Depends(get_db)):
    products=db.exec(select(product_table)).all()
    return products


@router.get("/{product_id}",response_model=ProductResponse)
def get_product(product_id: int,db:Session=Depends(get_db)):
    product=db.get(product_table,product_id)
    if not product:
        return {"error" :"Invalid Product ID; no such product in warehouse"}
    return product

from typing import List

@router.post("/bulk", response_model=List[ProductResponse])
def create_multiple_products(products: List[ProductCreate], db: Session = Depends(get_db)):

    db_products = [product_table.model_validate(p) for p in products]
    db.add_all(db_products)
    
 
    db.commit()
 
    for db_product in db_products:
        db.refresh(db_product)
        
    return db_products

@router.post("/",response_model=ProductResponse)
def create_product(product:ProductCreate,db:Session=Depends(get_db)):
    db_product = product_table.model_validate(product)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, updates: ProductUpdate,db:Session=Depends(get_db)):
    product = db.get(product_table, product_id)
    if not product:
       return "product not found"
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product




@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int,db:Session=Depends(get_db)):
    product = db.get(product_table, product_id)
    if not product:
       return "product not found"
    db.delete(product)
    db.commit()
    
