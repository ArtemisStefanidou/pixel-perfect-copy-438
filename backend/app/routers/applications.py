from fastapi import APIRouter, Depends, HTTPException, status

from app.authz import require_role
from app.deps import CurrentUser, get_current_user
from app.routers.listings import LISTING_SELECT
from app.schemas import ApplicationCreate, ApplicationStatusUpdate
from app.supabase_clients import get_admin_client

router = APIRouter(tags=["applications"])

PROFILE_SUMMARY_SELECT = "full_name, email, institution, skills, headline"


@router.post("/applications", status_code=status.HTTP_201_CREATED)
def apply_to_listing(
    body: ApplicationCreate, user: CurrentUser = Depends(get_current_user)
) -> dict:
    require_role(user, "student")
    admin = get_admin_client()
    payload = {
        "listing_id": body.listing_id,
        "student_id": user.id,
        "cover_note": body.cover_note or None,
    }
    res = admin.table("applications").insert(payload).execute()
    return res.data[0]


@router.get("/applications/mine")
def list_my_applications(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    require_role(user, "student")
    res = (
        get_admin_client()
        .table("applications")
        .select(f"*, listings({LISTING_SELECT})")
        .eq("student_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


@router.get("/applications/by-listing/{listing_id}")
def get_my_application_for_listing(
    listing_id: str, user: CurrentUser = Depends(get_current_user)
) -> dict | None:
    if not user.has_role("student"):
        return None
    res = (
        get_admin_client()
        .table("applications")
        .select("*")
        .eq("listing_id", listing_id)
        .eq("student_id", user.id)
        .maybe_single()
        .execute()
    )
    return res.data if res else None


@router.get("/applications/for-owner")
def list_applications_for_owner(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    admin = get_admin_client()
    my_listings = admin.table("listings").select("id").eq("owner_id", user.id).execute()
    ids = [l["id"] for l in (my_listings.data or [])]
    if not ids:
        return []
    res = (
        admin.table("applications")
        .select(
            f"*, listings(id, title, city, country), "
            f"profiles!applications_student_id_fkey({PROFILE_SUMMARY_SELECT})"
        )
        .in_("listing_id", ids)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


def _load_application(admin, application_id: str) -> dict:
    res = (
        admin.table("applications")
        .select("*, listings(owner_id)")
        .eq("id", application_id)
        .maybe_single()
        .execute()
    )
    if not res or not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found")
    return res.data


def _can_manage(application: dict, user: CurrentUser) -> bool:
    """Mirrors 'Student or listing owner updates application' RLS policy."""
    if application["student_id"] == user.id:
        return True
    if (application.get("listings") or {}).get("owner_id") == user.id:
        return True
    return user.has_role("platform_admin")


@router.patch("/applications/{application_id}/status")
def update_application_status(
    application_id: str,
    body: ApplicationStatusUpdate,
    user: CurrentUser = Depends(get_current_user),
) -> dict:
    admin = get_admin_client()
    application = _load_application(admin, application_id)
    if not _can_manage(application, user):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not allowed to update this application")

    admin.table("applications").update({"status": body.status}).eq("id", application_id).execute()
    res = (
        admin.table("applications").select("*").eq("id", application_id).single().execute()
    )
    return res.data


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def withdraw_application(
    application_id: str, user: CurrentUser = Depends(get_current_user)
) -> None:
    admin = get_admin_client()
    application = _load_application(admin, application_id)
    if application["student_id"] != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only withdraw your own application")
    admin.table("applications").delete().eq("id", application_id).execute()
