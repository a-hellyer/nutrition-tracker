import sys
import os

# Add the parent directory to the Python path so we can import our app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.models.food_item import FoodItem
from app.database import SessionLocal

def verify_foods():
    """Verify nutritional data for all foods in the database."""
    session = SessionLocal()
    try:
        foods = session.query(FoodItem).all()
        print(f"\nVerifying {len(foods)} foods:")
        print("-" * 80)
        print(f"{'Name':<30} {'Cal':<8} {'Pro':<8} {'Carb':<8} {'Fat':<8} {'Fiber':<8}")
        print("-" * 80)
        
        for food in foods:
            # Basic sanity checks
            issues = []
            
            # Check for realistic calorie values (0-900 kcal per 100g)
            if not 0 <= food.calories <= 900:
                issues.append(f"Unusual calories: {food.calories:.1f}")
            
            # Check macronutrient ranges
            if not 0 <= food.protein <= 100:
                issues.append(f"Unusual protein: {food.protein:.1f}g")
            if not 0 <= food.carbohydrates <= 100:
                issues.append(f"Unusual carbs: {food.carbohydrates:.1f}g")
            if not 0 <= food.fats <= 100:
                issues.append(f"Unusual fats: {food.fats:.1f}g")
            if not 0 <= food.fiber <= 50:
                issues.append(f"Unusual fiber: {food.fiber:.1f}g")
            
            # Check if macronutrients sum is reasonable (should be less than 100g per 100g)
            macro_sum = food.protein + food.carbohydrates + food.fats
            if macro_sum > 100:
                issues.append(f"High macro sum: {macro_sum:.1f}g")
            
            # Verify calorie calculation (4 kcal/g protein, 4 kcal/g carbs, 9 kcal/g fat)
            calculated_calories = (food.protein * 4) + (food.carbohydrates * 4) + (food.fats * 9)
            calorie_diff = abs(calculated_calories - food.calories)
            if calorie_diff > 20:  # Allow for some rounding differences
                issues.append(f"Calorie mismatch: reported={food.calories:.1f}, calculated={calculated_calories:.1f}")
            
            # Print food data
            print(f"{food.name:<30} {food.calories:<8.1f} {food.protein:<8.1f} {food.carbohydrates:<8.1f} {food.fats:<8.1f} {food.fiber:<8.1f}")
            
            # Print any issues found
            if issues:
                print("  ⚠️  " + ", ".join(issues))
                print()
        
    finally:
        session.close()

if __name__ == "__main__":
    verify_foods() 