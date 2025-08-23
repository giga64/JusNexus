from fastapi import APIRouter, Depends
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/profile")
def get_user_profile(
    current_user = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }