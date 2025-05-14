from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import food_items, meal_plans
from .database import engine, Base

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(food_items.router)
app.include_router(meal_plans.router)

@app.get("/")
async def root():
    return {"message": "Nutrition Tracker API"} 