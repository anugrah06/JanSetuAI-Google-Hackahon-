from fastapi import APIRouter
from app.api.v1.citizen import router as citizen_router
from app.api.v1.government import router as government_router
from app.api.v1.admin import router as admin_router

api_router = APIRouter()
api_router.include_router(citizen_router)
api_router.include_router(government_router)
api_router.include_router(admin_router)
