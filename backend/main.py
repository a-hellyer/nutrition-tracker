from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import food_items
from app.database import engine
from app.models import food_item

# Create database tables
food_item.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nutrition Tracker API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(food_items.router)

@app.get("/")
async def root():
    return {"message": "Nutrition Tracker API"} 