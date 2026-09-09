from fastapi import APIRouter, Depends, HTTPException, status

from app.authz import require_approved_company
from app.deps import CurrentUser, get_current_user
from app.supabase_clients import get_admin_client
from app.schemas import ListingCreate, ListingStatusUpdate

router = APIRouter(tags=["listings"])

LISTING_SELECT = "*, companies(name, sector, status)"


def _visible(listing: dict, user: CurrentUser) -> bool:
    """Mirrors the 'Active listings from approved companies are visible' RLS policy."""
    if user.has_role("platform_admin", "hei_admin"):
        return True
    if listing["owner_id"] == user.id:
        return True
    company = listing.get("companies") or {}
    return listing["status"] == "active" and company.get("status") == "approved"


@router.get("/listings")
def list_listings(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    res = (
        get_admin_client()
        .table("listings")
        .select(LISTING_SELECT)
        .order("created_at", desc=True)
        .execute()
    )
    return [l for l in (res.data or []) if _visible(l, user)]


@router.get("/listings/mine")
def list_my_listings(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    res = (
        get_admin_client()
        .table("listings")
        .select(LISTING_SELECT)
        .eq("owner_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


@router.get("/listings/{listing_id}")
def get_listing(listing_id: str, user: CurrentUser = Depends(get_current_user)) -> dict:
    res = (
        get_admin_client()
        .table("listings")
        .select(LISTING_SELECT)
        .eq("id", listing_id)
        .maybe_single()
        .execute()
    )
    listing = res.data if res else None
    if not listing or not _visible(listing, user):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    return listing


@router.post("/listings", status_code=status.HTTP_201_CREATED)
def create_listing(body: ListingCreate, user: CurrentUser = Depends(get_current_user)) -> dict:
    company = require_approved_company(user)
    admin = get_admin_client()
    payload = {
        **body.model_dump(),
        "owner_id": user.id,
        "company_id": company["id"],
    }
    res = admin.table("listings").insert(payload).select(LISTING_SELECT).execute()
    return res.data[0]


@router.patch("/listings/{listing_id}/status")
def set_listing_status(
    listing_id: str,
    body: ListingStatusUpdate,
    user: CurrentUser = Depends(get_current_user),
) -> dict:
    admin = get_admin_client()
    existing = (
        admin.table("listings").select("owner_id").eq("id", listing_id).maybe_single().execute()
    )
    if not existing or not existing.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    if existing.data["owner_id"] != user.id and not user.has_role("platform_admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your listing")

    admin.table("listings").update({"status": body.status}).eq("id", listing_id).execute()
    res = (
        admin.table("listings")
        .select(LISTING_SELECT)
        .eq("id", listing_id)
        .single()
        .execute()
    )
    return res.data
