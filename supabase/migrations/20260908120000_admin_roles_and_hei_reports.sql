-- Allow platform admins to grant/revoke roles (Platform Admin user/role management)
GRANT INSERT, DELETE ON public.user_roles TO authenticated;

CREATE POLICY "Platform admin grants roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

CREATE POLICY "Platform admin revokes roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'));

-- Let HEI admins read applications from students of their own institution
-- (aggregated reporting scoped to the admin's institution)
CREATE POLICY "HEI admins view applications from their institution" ON public.applications
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'hei_admin')
    AND EXISTS (
      SELECT 1 FROM public.profiles student, public.profiles me
      WHERE student.id = applications.student_id
        AND me.id = auth.uid()
        AND me.institution IS NOT NULL
        AND student.institution = me.institution
    )
  );
