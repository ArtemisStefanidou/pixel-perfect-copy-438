from fastapi import HTTPException, status

from app.deps import CurrentUser


def require_role(user: CurrentUser, *roles: str) -> None:
    if not user.has_role(*roles):
        raise HTTPException(status.HTTP_403_FORBIDDEN, f"Requires role: {' or '.join(roles)}")


def require_approved_company(user: CurrentUser) -> dict:
    """Mirrors the 'Approved companies create listings' RLS policy."""
    require_role(user, "sme")
    if not user.company or user.company.get("status") != "approved":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Company is not approved yet")
    return user.company


def require_institution(user: CurrentUser) -> str:
    institution = (user.profile or {}).get("institution")
    if not institution:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Set your institution on your profile before viewing institution reports",
        )
    return institution
