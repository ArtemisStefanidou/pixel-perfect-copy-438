from typing import Literal, Optional

from pydantic import BaseModel

Role = Literal["student", "sme", "hei_admin", "platform_admin"]
CompanyStatus = Literal["pending", "approved", "rejected"]
ListingStatus = Literal["active", "closed"]
ApplicationStatus = Literal["submitted", "reviewed", "interview", "accepted", "rejected"]


class Profile(BaseModel):
    id: str
    email: Optional[str] = None
    full_name: str
    institution: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    skills: list[str] = []
    avatar_url: Optional[str] = None


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    institution: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    skills: Optional[list[str]] = None


class Company(BaseModel):
    id: str
    owner_id: str
    name: str
    sector: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    status: CompanyStatus
    is_mentor: bool
    created_at: Optional[str] = None


class MeResponse(BaseModel):
    profile: Optional[Profile]
    roles: list[Role]
    company: Optional[Company]


class CompanyStatusUpdate(BaseModel):
    status: CompanyStatus


class ListingCreate(BaseModel):
    title: str
    description: str
    sector: Optional[str] = None
    listing_type: str = "Internship"
    work_mode: str = "On-site"
    required_skills: list[str] = []
    duration: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    deadline: Optional[str] = None


class ListingStatusUpdate(BaseModel):
    status: ListingStatus


class ApplicationCreate(BaseModel):
    listing_id: str
    cover_note: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class GrantRoleRequest(BaseModel):
    email: str
    role: Literal["hei_admin", "platform_admin"]


class PlatformStats(BaseModel):
    total_users: int
    total_students: int
    total_companies: int
    pending_companies: int
    approved_companies: int
    total_listings: int
    active_listings: int
    total_applications: int


class InstitutionStats(BaseModel):
    student_count: int
    application_count: int
    status_breakdown: dict[str, int]
