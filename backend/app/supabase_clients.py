from functools import lru_cache

from supabase import Client, create_client

from app.config import settings


@lru_cache
def get_admin_client() -> Client:
    """Service-role client: bypasses RLS. Used for every actual data operation —
    authorization is enforced in Python (see app.authz) before these calls run."""
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


@lru_cache
def get_anon_client() -> Client:
    """Anon-key client, used only to verify a user's access token against Supabase Auth."""
    return create_client(settings.supabase_url, settings.supabase_anon_key)
