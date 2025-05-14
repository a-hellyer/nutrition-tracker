from sqlalchemy import Column, Integer, String, ForeignKey, Float, Table, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# Association table for meal plans and food items
meal_plan_foods = Table(
    'meal_plan_foods',
    Base.metadata,
    Column('meal_plan_id', Integer, ForeignKey('meal_plans.id')),
    Column('food_item_id', Integer, ForeignKey('food_items.id')),
    Column('quantity', Float, default=1.0),  # quantity in servings
    Column('meal_type', String)  # breakfast, lunch, dinner, snack
)

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    foods = relationship("FoodItem", secondary=meal_plan_foods, backref="meal_plans")

    @property
    def total_calories(self):
        return sum(food.calories for food in self.foods)

    @property
    def total_protein(self):
        return sum(food.protein for food in self.foods)

    @property
    def total_carbs(self):
        return sum(food.carbohydrates for food in self.foods)

    @property
    def total_fats(self):
        return sum(food.fats for food in self.foods)

    @property
    def total_fiber(self):
        return sum(food.fiber for food in self.foods)

    @property
    def total_sugar(self):
        return sum(food.sugar for food in self.foods) 