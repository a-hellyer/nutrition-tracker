import sys
import os

# Add the parent directory to the Python path so we can import our app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import SessionLocal
from app.models.food_item import FoodItem

def fix_food_data():
    session = SessionLocal()
    try:
        # Define realistic prices for common foods
        price_updates = {
            # Proteins
            "Chicken breast, raw": 3.99,
            "Salmon, Atlantic, raw": 12.99,
            "Ground beef, 80/20, raw": 4.99,
            "Tofu, firm": 2.99,
            "Pork chop, raw": 4.99,
            "Tuna, canned in water": 1.99,
            "Ribeye steak, raw": 15.99,
            "Turkey breast, raw": 4.99,
            "Lamb chop, raw": 12.99,
            "Duck breast, raw": 9.99,
            "Bison, ground, raw": 8.99,
            "Chicken thigh, raw": 2.99,
            "Pork tenderloin, raw": 5.99,
            
            # Eggs and Dairy
            "Egg, whole, raw": 0.33,  # per egg
            "Greek yogurt, plain": 3.99,
            "Milk, whole": 3.49,
            "Cheese, cheddar": 5.99,
            "Cottage cheese, 2%": 3.99,
            
            # Grains
            "White rice, cooked": 0.99,
            "Oatmeal, plain": 2.99,
            "Bread, whole wheat": 3.49,
            "Quinoa, cooked": 4.99,
            "Pasta, wheat, cooked": 1.99,
            
            # Vegetables
            "Broccoli, raw": 2.49,
            "Sweet potato, raw": 1.49,
            "Carrots, raw": 1.29,
            "Bell pepper, red": 0.99,
            "Avocado": 1.49,
            "Cauliflower, raw": 2.99,
            "Kale, raw": 2.49,
            
            # Fruits
            "Banana, raw": 0.29,
            "Apple, raw": 0.79,
            "Orange, raw": 0.69,
            "Blueberries, raw": 3.99,
            "Strawberries, raw": 3.49,
            
            # Legumes
            "Black beans, cooked": 1.29,
            "Chickpeas, cooked": 1.49,
            "Lentils, cooked": 1.99,
            
            # Nuts and Seeds
            "Almonds": 7.99,
            "Peanut butter": 3.99,
            "Chia seeds": 6.99,
            
            # Other
            "Olive oil": 8.99,
            "Honey": 4.99
        }

        print("\nUpdating food prices...")
        foods = session.query(FoodItem).all()
        for food in foods:
            # Update price if we have a specific price for this food
            if food.name in price_updates:
                food.price = price_updates[food.name]
                food.price_per_unit = (food.price / food.serving_size) * 100
                print(f"Updated price for {food.name} to ${food.price:.2f}")

        session.commit()
        print("\nPrice updates completed successfully!")
        
    except Exception as e:
        print(f"Error updating prices: {str(e)}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    fix_food_data() 