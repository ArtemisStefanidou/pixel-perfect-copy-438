from fastapi import APIRouter, Depends

from app.deps import CurrentUser, get_current_user
from app.schemas import MeResponse, ProfileUpdate
from app.supabase_clients import get_admin_client

router = APIRouter(tags=["me"])


@router.get("/me", response_model=MeResponse)
def get_me(user: CurrentUser = Depends(get_current_user)) -> MeResponse:
    return MeResponse(profile=user.profile, roles=user.roles, company=user.company)


@router.patch("/me/profile", response_model=MeResponse)
def update_my_profile(
    body: ProfileUpdate, user: CurrentUser = Depends(get_current_user)
) -> MeResponse:
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    admin = get_admin_client()
    if updates:
        admin.table("profiles").update(updates).eq("id", user.id).execute()
    profile_res = (
        admin.table("profiles").select("*").eq("id", user.id).maybe_single().execute()
    )
    return MeResponse(
        profile=profile_res.data if profile_res else None,
        roles=user.roles,
        company=user.company,
    )
