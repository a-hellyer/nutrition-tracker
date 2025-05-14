from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class FoodItemBase(BaseModel):
    name: str
    brand: Optional[str] = None
    serving_size: float = Field(default=100.0, gt=0)
    calories: float = Field(ge=0)
    protein: float = Field(ge=0)
    carbohydrates: float = Field(ge=0)
    fats: float = Field(ge=0)
    fiber: Optional[float] = Field(default=None, ge=0)
    sugar: Optional[float] = Field(default=None, ge=0)
    price: float = Field(gt=0)
    store: Optional[str] = None

class FoodItemCreate(FoodItemBase):
    pass

class FoodItemUpdate(FoodItemBase):
    pass

class FoodItem(FoodItemBase):
    id: int
    price_per_unit: float
    created_at: datetime
    updated_at: Optional[datetime]
    calories_per_dollar: float
    protein_per_dollar: float
    fiber_to_sugar_ratio: Optional[float]

    class Config:
        from_attributes = True 