import asyncio
import aiohttp
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os
from typing import Dict

# Add the parent directory to the Python path so we can import our app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.models.food_item import FoodItem
from app.database import engine, SessionLocal

def get_nutrient_value(nutrients, nutrient_name):
    """Extract nutrient value from nutrients list. Returns amount per 100g."""
    nutrient_map = {
        "Protein": ["Protein"],
        "Carbohydrate": ["Carbohydrate, by difference"],
        "Total lipid (fat)": ["Total lipid (fat)"],
        "Fiber": ["Fiber, total dietary"],
        "Sugar": ["Total Sugars", "Sugars, Total"]  # Updated to match USDA API field names
    }
    
    usda_names = nutrient_map.get(nutrient_name, [nutrient_name])
    
    # Debug print for sugar
    if nutrient_name == "Sugar":
        print(f"\nLooking for sugar in nutrient names:")
        for nutrient in nutrients:
            nutrient_data = nutrient.get("nutrient", {})
            name = nutrient_data.get("name", "")
            amount = nutrient.get("amount", 0)
            print(f"Found nutrient: {name} = {amount}")
    
    for nutrient in nutrients:
        nutrient_data = nutrient.get("nutrient", {})
        name = nutrient_data.get("name", "")
        if name in usda_names:
            val = nutrient.get("amount", 0)
            if nutrient_name == "Sugar":
                print(f"Found sugar value: {val}")
            return val
    return 0

def get_energy_value(nutrients):
    """
    Extract energy value from nutrients, handling different formats and units.
    In nutrition, 'calories' typically refers to kilocalories (kcal).
    1 kcal = 1 Calorie = 1,000 small calories = 4.184 kJ
    """
    # First try to find kilocalories (kcal)
    for nutrient in nutrients:
        nutrient_data = nutrient.get("nutrient", {})
        if "Energy" in nutrient_data.get("name", "") and nutrient_data.get("unitName", "") == "KCAL":
            return nutrient.get("amount", 0)  # USDA provides this in kcal
    
    # If no kcal found, try to find kJ and convert to kcal
    for nutrient in nutrients:
        nutrient_data = nutrient.get("nutrient", {})
        if "Energy" in nutrient_data.get("name", "") and nutrient_data.get("unitName", "") == "kJ":
            # Convert kilojoules to kilocalories (1 kcal = 4.184 kJ)
            return nutrient.get("amount", 0) / 4.184
    
    return 0

def get_serving_size(food):
    """Extract serving size information from food data. Returns serving size in grams."""
    portions = food.get("foodPortions", [])
    if portions:
        for portion in portions:
            amount = portion.get("gramWeight")
            if amount:
                return amount

    serving_size = food.get("servingSize")
    serving_size_unit = food.get("servingSizeUnit", "").upper()
    if serving_size and serving_size_unit:
        if serving_size_unit == "G":
            return serving_size
        elif serving_size_unit == "ML":
            return serving_size  # Assume density of 1g/ml for simplicity
    
    return 100.0  # Default to 100g if no serving size information found

async def fetch_food_data(session: aiohttp.ClientSession, food_name: str, fdc_id: str, api_key: str) -> Dict:
    """Fetch food data for a single food item."""
    url = f"https://api.nal.usda.gov/fdc/v1/food/{fdc_id}"
    headers = {"Content-Type": "application/json"}
    params = {"api_key": api_key}
    
    try:
        async with session.get(url, headers=headers, params=params) as response:
            if response.status == 200:
                food = await response.json()
                nutrients = food.get("foodNutrients", [])
                
                print(f"\nProcessing food: {food_name}")
                
                # Get raw nutrient values
                calories = get_energy_value(nutrients)
                protein = get_nutrient_value(nutrients, "Protein")
                carbs = get_nutrient_value(nutrients, "Carbohydrate")
                fats = get_nutrient_value(nutrients, "Total lipid (fat)")
                fiber = get_nutrient_value(nutrients, "Fiber")
                sugar = get_nutrient_value(nutrients, "Sugar")
                
                print(f"Extracted sugar value: {sugar}")
                
                # Normalize to per 100g if values seem too high
                # This handles cases where the API returns values per 1000g instead of 100g
                if calories > 900 or protein > 100 or carbs > 100 or fats > 100:
                    calories /= 10
                    protein /= 10
                    carbs /= 10
                    fats /= 10
                    fiber /= 10
                    sugar /= 10
                    print(f"Normalized sugar value: {sugar}")
                
                return {
                    "name": food_name,
                    "brand": "Generic",
                    "serving_size": 100.0,  # Always store per 100g in database
                    "calories": calories,
                    "protein": protein,
                    "carbohydrates": carbs,
                    "fats": fats,
                    "fiber": fiber,
                    "sugar": sugar,
                    "price": 5.00,  # Default price, update manually
                    "store": "Local Grocery",
                    "price_per_unit": 5.00
                }
            else:
                print(f"Failed to fetch {food_name}: {response.status}")
                return None
    except Exception as e:
        print(f"Error processing {food_name}: {str(e)}")
        return None

async def get_usda_foods():
    """Fetch data for all foods in parallel."""
    common_foods = {
        # Proteins
        "Chicken breast, raw": "171077",
        "Salmon, Atlantic, raw": "175139",
        "Ground beef, 80/20, raw": "174036",
        "Tofu, firm": "172451",
        "Pork chop, raw": "167760",
        "Tuna, canned in water": "172468",
        "Ribeye steak, raw": "168621",
        "Turkey breast, raw": "171507",
        "Lamb chop, raw": "174374",
        "Duck breast, raw": "172405",
        "Bison, ground, raw": "174791",
        "Chicken thigh, raw": "171068",
        "Pork tenderloin, raw": "168376",
        
        # Eggs and Dairy
        "Egg, whole, raw": "171287",
        "Greek yogurt, plain": "171284",
        "Milk, whole": "746779",
        "Cheese, cheddar": "173414",
        "Cottage cheese, 2%": "173420",
        "Yogurt, fruit flavored": "170889",
        "Ice cream, vanilla": "173591",
        
        # Grains
        "White rice, cooked": "169756",
        "Oatmeal, plain": "173904",
        "Bread, whole wheat": "172686",
        "Quinoa, cooked": "168917",
        "Pasta, wheat, cooked": "168928",
        "Cereal, corn flakes": "173845",
        "Granola": "173987",
        
        # Vegetables
        "Broccoli, raw": "170379",
        "Sweet potato, raw": "168482",
        "Spinach, raw": "168462",
        "Carrots, raw": "170393",
        "Bell pepper, red": "168478",
        "Avocado": "171705",
        "Cauliflower, raw": "169986",
        "Kale, raw": "169975",
        "Corn, sweet, cooked": "169998",
        
        # Fruits
        "Banana, raw": "173944",
        "Apple, raw": "171688",
        "Orange, raw": "169097",
        "Blueberries, raw": "171711",
        "Strawberries, raw": "167762",
        "Mango, raw": "169910",
        "Grapes, red": "174682",
        "Pineapple, raw": "169124",
        "Watermelon": "167765",
        
        # Legumes
        "Black beans, cooked": "172387",
        "Chickpeas, cooked": "173756",
        "Lentils, cooked": "172420",
        
        # Nuts and Seeds
        "Almonds": "170567",
        "Peanut butter": "172470",
        "Chia seeds": "170554",
        
        # Other
        "Olive oil": "171413",
        "Honey": "169640",
        "Maple syrup": "169661",
        "Chocolate, dark": "170272",
        "Raisins": "168165"
    }
    
    API_KEY = "hiaHEVhgwW2Z9PxFrp2KYsJyVScvXeOYUdDBkx03"
    
    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_food_data(session, food_name, fdc_id, API_KEY)
            for food_name, fdc_id in common_foods.items()
        ]
        foods_data = await asyncio.gather(*tasks)
        return [food for food in foods_data if food is not None]

def import_foods():
    """Import foods into the database and update existing ones with missing values."""
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Get all existing foods
        existing_foods = {food.name: food for food in session.query(FoodItem).all()}
        foods = asyncio.run(get_usda_foods())
        
        new_foods = []
        updated_count = 0
        
        for food_data in foods:
            food_name = food_data["name"]
            if food_name in existing_foods:
                # Update existing food if it has any null values
                existing_food = existing_foods[food_name]
                updated = False
                
                # Check each nutrient field and update if null
                nutrient_fields = ['sugar', 'fiber', 'protein', 'carbohydrates', 'fats', 'calories']
                for field in nutrient_fields:
                    current_value = getattr(existing_food, field)
                    new_value = food_data.get(field)
                    if (current_value is None or current_value == 0) and new_value:
                        setattr(existing_food, field, new_value)
                        updated = True
                
                if updated:
                    print(f"Updating {food_name} with missing nutrient values")
                    updated_count += 1
            else:
                # Add new food
                food_item = FoodItem(**food_data)
                new_foods.append(food_item)
                print(f"Adding new food: {food_data['name']}")
        
        if new_foods:
            session.bulk_save_objects(new_foods)
        
        if updated_count > 0 or new_foods:
            session.commit()
            print(f"\nSummary:")
            if new_foods:
                print(f"- Added {len(new_foods)} new foods")
            if updated_count > 0:
                print(f"- Updated {updated_count} existing foods with missing values")
        else:
            print("\nNo changes needed - all foods are up to date!")
        
    except Exception as e:
        print(f"Error importing/updating foods: {str(e)}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    print("Starting USDA food import and update...")
    import_foods()
    print("Import/update complete!") 