from sqlalchemy import Column, Integer, Float, String, DateTime, func
from ..database import Base

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    brand = Column(String, nullable=True)
    
    # Nutritional information per 100g
    serving_size = Column(Float, nullable=False, default=100.0)  # in grams
    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=False)
    carbohydrates = Column(Float, nullable=False)
    fats = Column(Float, nullable=False)
    fiber = Column(Float, nullable=True)
    sugar = Column(Float, nullable=True)  # Added sugar content
    
    # Price information
    price = Column(Float, nullable=False)
    price_per_unit = Column(Float, nullable=False)  # price per 100g
    store = Column(String, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    @property
    def calories_per_dollar(self):
        """Calculate calories per dollar spent"""
        return self.calories / self.price if self.price > 0 else 0

    @property
    def protein_per_dollar(self):
        """Calculate protein per dollar spent"""
        return self.protein / self.price if self.price > 0 else 0

    @property
    def fiber_to_sugar_ratio(self):
        """Calculate fiber to sugar ratio"""
        if self.fiber is None or self.sugar is None:
            return None
        if self.sugar == 0:
            return float('inf') if self.fiber > 0 else 0
        return self.fiber / self.sugar 