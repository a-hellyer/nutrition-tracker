from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models.meal_plan import MealPlan, meal_plan_foods
from ..models.food_item import FoodItem
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class MealFoodCreate(BaseModel):
    food_id: int
    quantity: float
    meal_type: str

class MealPlanCreate(BaseModel):
    name: str
    foods: List[MealFoodCreate]

class MealFoodResponse(BaseModel):
    food_id: int
    name: str
    quantity: float
    meal_type: str
    calories: float
    protein: float
    carbohydrates: float
    fats: float
    fiber: Optional[float]
    sugar: Optional[float]

class MealPlanResponse(BaseModel):
    id: int
    name: str
    date: datetime
    foods: List[MealFoodResponse]
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float
    total_fiber: float
    total_sugar: float

@router.post("/meal-plans/", response_model=MealPlanResponse)
def create_meal_plan(meal_plan: MealPlanCreate, db: Session = Depends(get_db)):
    db_meal_plan = MealPlan(name=meal_plan.name)
    db.add(db_meal_plan)
    db.flush()  # Get the ID without committing

    # Add foods with quantities and meal types
    for food_item in meal_plan.foods:
        db_food = db.query(FoodItem).filter(FoodItem.id == food_item.food_id).first()
        if not db_food:
            raise HTTPException(status_code=404, detail=f"Food with id {food_item.food_id} not found")
        
        # Add to association table with quantity and meal type
        stmt = meal_plan_foods.insert().values(
            meal_plan_id=db_meal_plan.id,
            food_item_id=db_food.id,
            quantity=food_item.quantity,
            meal_type=food_item.meal_type
        )
        db.execute(stmt)

    db.commit()
    db.refresh(db_meal_plan)
    return db_meal_plan

@router.get("/meal-plans/", response_model=List[MealPlanResponse])
def get_meal_plans(db: Session = Depends(get_db)):
    return db.query(MealPlan).all()

@router.get("/meal-plans/{meal_plan_id}", response_model=MealPlanResponse)
def get_meal_plan(meal_plan_id: int, db: Session = Depends(get_db)):
    meal_plan = db.query(MealPlan).filter(MealPlan.id == meal_plan_id).first()
    if not meal_plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    return meal_plan

@router.delete("/meal-plans/{meal_plan_id}")
def delete_meal_plan(meal_plan_id: int, db: Session = Depends(get_db)):
    meal_plan = db.query(MealPlan).filter(MealPlan.id == meal_plan_id).first()
    if not meal_plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    db.delete(meal_plan)
    db.commit()
    return {"message": "Meal plan deleted"} 