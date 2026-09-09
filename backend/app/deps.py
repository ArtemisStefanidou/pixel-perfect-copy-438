from dataclasses import dataclass, field
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schemas import Role
from app.supabase_clients import get_admin_client, get_anon_client

_bearer = HTTPBearer(auto_error=False)

_ROLE_PRIORITY: list[Role] = ["platform_admin", "hei_admin", "sme", "student"]


@dataclass
class CurrentUser:
    id: str
    email: Optional[str]
    profile: Optional[dict]
    company: Optional[dict]
    roles: list[Role] = field(default_factory=list)

    @property
    def primary_role(self) -> Optional[Role]:
        for role in _ROLE_PRIORITY:
            if role in self.roles:
                return role
        return None

    def has_role(self, *roles: Role) -> bool:
        return any(r in self.roles for r in roles)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")

    token = credentials.credentials
    try:
        user_response = get_anon_client().auth.get_user(token)
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")

    if user_response is None or user_response.user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")

    user = user_response.user
    admin = get_admin_client()

    profile_res = admin.table("profiles").select("*").eq("id", user.id).maybe_single().execute()
    roles_res = admin.table("user_roles").select("role").eq("user_id", user.id).execute()
    company_res = (
        admin.table("companies").select("*").eq("owner_id", user.id).maybe_single().execute()
    )

    return CurrentUser(
        id=user.id,
        email=user.email,
        profile=profile_res.data if profile_res else None,
        company=company_res.data if company_res else None,
        roles=[r["role"] for r in (roles_res.data or [])],
    )
