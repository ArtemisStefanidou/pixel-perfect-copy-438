from fastapi import APIRouter, Depends

from app.authz import require_role
from app.deps import CurrentUser, get_current_user
from app.schemas import Company, CompanyStatusUpdate
from app.supabase_clients import get_admin_client

router = APIRouter(tags=["companies"])


@router.get("/companies", response_model=list[Company])
def list_companies(user: CurrentUser = Depends(get_current_user)) -> list[Company]:
    require_role(user, "platform_admin")
    res = (
        get_admin_client()
        .table("companies")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


@router.patch("/companies/{company_id}/status", response_model=Company)
def set_company_status(
    company_id: str,
    body: CompanyStatusUpdate,
    user: CurrentUser = Depends(get_current_user),
) -> Company:
    require_role(user, "platform_admin")
    admin = get_admin_client()
    admin.table("companies").update({"status": body.status}).eq("id", company_id).execute()
    res = admin.table("companies").select("*").eq("id", company_id).single().execute()
    return res.data
