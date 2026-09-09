from fastapi import APIRouter, Depends, HTTPException, status

from app.authz import require_institution, require_role
from app.deps import CurrentUser, get_current_user
from app.schemas import (
    ApplicationStatus,
    GrantRoleRequest,
    InstitutionStats,
    PlatformStats,
)
from app.supabase_clients import get_admin_client

router = APIRouter(prefix="/admin", tags=["admin"])


def _count(query) -> int:
    res = query.execute()
    return res.count or 0


@router.get("/platform-stats", response_model=PlatformStats)
def platform_stats(user: CurrentUser = Depends(get_current_user)) -> PlatformStats:
    require_role(user, "platform_admin")
    admin = get_admin_client()

    def count(table: str, **eq) -> int:
        q = admin.table(table).select("id", count="exact", head=True)
        for col, val in eq.items():
            q = q.eq(col, val)
        return _count(q)

    return PlatformStats(
        total_users=count("profiles"),
        total_students=count("user_roles", role="student"),
        total_companies=count("companies"),
        pending_companies=count("companies", status="pending"),
        approved_companies=count("companies", status="approved"),
        total_listings=count("listings"),
        active_listings=count("listings", status="active"),
        total_applications=count("applications"),
    )


@router.get("/institution-stats", response_model=InstitutionStats)
def institution_stats(user: CurrentUser = Depends(get_current_user)) -> InstitutionStats:
    require_role(user, "hei_admin")
    institution = require_institution(user)
    admin = get_admin_client()

    students = (
        admin.table("profiles").select("id").eq("institution", institution).execute()
    )
    student_ids = [s["id"] for s in (students.data or [])]

    breakdown: dict[ApplicationStatus, int] = {
        "submitted": 0,
        "reviewed": 0,
        "interview": 0,
        "accepted": 0,
        "rejected": 0,
    }
    if not student_ids:
        return InstitutionStats(student_count=0, application_count=0, status_breakdown=breakdown)

    apps = (
        admin.table("applications").select("status").in_("student_id", student_ids).execute()
    )
    for a in apps.data or []:
        breakdown[a["status"]] = breakdown.get(a["status"], 0) + 1

    return InstitutionStats(
        student_count=len(student_ids),
        application_count=len(apps.data or []),
        status_breakdown=breakdown,
    )


@router.post("/grant-role")
def grant_role(body: GrantRoleRequest, user: CurrentUser = Depends(get_current_user)) -> dict:
    require_role(user, "platform_admin")
    admin = get_admin_client()

    profile = (
        admin.table("profiles")
        .select("id, full_name")
        .eq("email", body.email.strip())
        .maybe_single()
        .execute()
    )
    if not profile or not profile.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No account found with that email")

    existing = (
        admin.table("user_roles")
        .select("id")
        .eq("user_id", profile.data["id"])
        .eq("role", body.role)
        .maybe_single()
        .execute()
    )
    if existing and existing.data:
        raise HTTPException(status.HTTP_409_CONFLICT, "This user already has that role")

    admin.table("user_roles").insert({"user_id": profile.data["id"], "role": body.role}).execute()
    return {"id": profile.data["id"], "full_name": profile.data["full_name"]}
