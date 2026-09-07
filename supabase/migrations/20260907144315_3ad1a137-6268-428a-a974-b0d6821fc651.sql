CREATE TYPE public.app_role AS ENUM ('student','sme','hei_admin','platform_admin');
CREATE TYPE public.company_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.listing_status AS ENUM ('active','closed');
CREATE TYPE public.application_status AS ENUM ('submitted','reviewed','interview','accepted','rejected');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL DEFAULT '',
  institution TEXT,
  headline TEXT,
  bio TEXT,
  city TEXT,
  country TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- COMPANIES
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  sector TEXT,
  website TEXT,
  description TEXT,
  city TEXT,
  country TEXT,
  logo_url TEXT,
  status public.company_status NOT NULL DEFAULT 'pending',
  is_mentor BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_approved_company(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.companies WHERE owner_id = _user_id AND status = 'approved');
$$;

-- LISTINGS
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sector TEXT,
  listing_type TEXT NOT NULL DEFAULT 'Internship',
  work_mode TEXT NOT NULL DEFAULT 'On-site',
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  duration TEXT,
  city TEXT,
  country TEXT,
  deadline DATE,
  status public.listing_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- APPLICATIONS
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  cover_note TEXT,
  status public.application_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- POLICIES: profiles
CREATE POLICY "Profiles are viewable by signed-in users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'platform_admin')) WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(),'platform_admin'));

-- POLICIES: user_roles
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin') OR public.has_role(auth.uid(),'hei_admin'));

-- POLICIES: companies
CREATE POLICY "Approved companies visible to all signed-in" ON public.companies FOR SELECT TO authenticated USING (status = 'approved' OR owner_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin') OR public.has_role(auth.uid(),'hei_admin'));
CREATE POLICY "Company owners create own company" ON public.companies FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(),'sme'));
CREATE POLICY "Company owners update own company" ON public.companies FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin'));

-- POLICIES: listings
CREATE POLICY "Active listings from approved companies are visible" ON public.listings FOR SELECT TO authenticated USING (
  (status = 'active' AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = listings.company_id AND c.status = 'approved'))
  OR owner_id = auth.uid()
  OR public.has_role(auth.uid(),'platform_admin')
  OR public.has_role(auth.uid(),'hei_admin')
);
CREATE POLICY "Approved companies create listings" ON public.listings FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.is_approved_company(auth.uid()) AND EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_id = auth.uid()));
CREATE POLICY "Owners update own listings" ON public.listings FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin'));
CREATE POLICY "Owners delete own listings" ON public.listings FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin'));

-- POLICIES: applications
CREATE POLICY "Students read own applications" ON public.applications FOR SELECT TO authenticated USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.listings l WHERE l.id = applications.listing_id AND l.owner_id = auth.uid())
  OR public.has_role(auth.uid(),'platform_admin')
);
CREATE POLICY "Students apply" ON public.applications FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() AND public.has_role(auth.uid(),'student'));
CREATE POLICY "Student or listing owner updates application" ON public.applications FOR UPDATE TO authenticated USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.listings l WHERE l.id = applications.listing_id AND l.owner_id = auth.uid())
  OR public.has_role(auth.uid(),'platform_admin')
) WITH CHECK (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.listings l WHERE l.id = applications.listing_id AND l.owner_id = auth.uid())
  OR public.has_role(auth.uid(),'platform_admin')
);
CREATE POLICY "Students withdraw own application" ON public.applications FOR DELETE TO authenticated USING (student_id = auth.uid());

-- SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
BEGIN
  _role := CASE WHEN NEW.raw_user_meta_data->>'role' = 'sme' THEN 'sme'::public.app_role ELSE 'student'::public.app_role END;

  INSERT INTO public.profiles (id, email, full_name, institution)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.raw_user_meta_data->>'institution')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role) ON CONFLICT DO NOTHING;

  IF _role = 'sme' THEN
    INSERT INTO public.companies (owner_id, name, sector, status)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'full_name', 'New company'), NEW.raw_user_meta_data->>'sector', 'pending')
    ON CONFLICT (owner_id) DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();