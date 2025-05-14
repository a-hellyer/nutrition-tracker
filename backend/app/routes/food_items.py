from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.food_item import FoodItem
from ..schemas.food_item import FoodItemCreate, FoodItemUpdate, FoodItem as FoodItemSchema

router = APIRouter(
    prefix="/food-items",
    tags=["food-items"]
)

@router.get("/", response_model=List[FoodItemSchema])
def get_food_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    items = db.query(FoodItem).offset(skip).limit(limit).all()
    return items

@router.post("/", response_model=FoodItemSchema)
def create_food_item(
    food_item: FoodItemCreate,
    db: Session = Depends(get_db)
):
    db_item = FoodItem(**food_item.dict())
    db_item.price_per_unit = (db_item.price / db_item.serving_size) * 100
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/{item_id}", response_model=FoodItemSchema)
def get_food_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    item = db.query(FoodItem).filter(FoodItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Food item not found")
    return item

@router.put("/{item_id}", response_model=FoodItemSchema)
def update_food_item(
    item_id: int,
    food_item: FoodItemUpdate,
    db: Session = Depends(get_db)
):
    db_item = db.query(FoodItem).filter(FoodItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Food item not found")
    
    for key, value in food_item.dict().items():
        setattr(db_item, key, value)
    
    db_item.price_per_unit = (db_item.price / db_item.serving_size) * 100
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
def delete_food_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    db_item = db.query(FoodItem).filter(FoodItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Food item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Food item deleted successfully"} 