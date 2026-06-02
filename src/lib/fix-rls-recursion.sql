-- Fix infinite recursion in RLS policies
-- company_members and user_profiles policies were self-referencing, causing 409 errors
-- Run this in Supabase SQL Editor if needed

-- Helper functions (SECURITY DEFINER bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION public.get_user_company_ids(check_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT company_id FROM public.company_members WHERE user_id = check_user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = uid AND is_super_admin = true);
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_role(uid UUID, cid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.company_members WHERE user_id = uid AND company_id = cid;
$$;

-- Fix user_profiles policy (was self-referencing)
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Super admins can view all profiles" ON public.user_profiles FOR SELECT USING (
  public.is_super_admin(auth.uid())
);

-- Fix company_members policies (were self-referencing)
DROP POLICY IF EXISTS "Company members visible to company users" ON public.company_members;
DROP POLICY IF EXISTS "Owner can manage members" ON public.company_members;
DROP POLICY IF EXISTS "Owner can update members" ON public.company_members;
DROP POLICY IF EXISTS "Owner can delete members" ON public.company_members;

CREATE POLICY "Company members visible to company users" ON public.company_members FOR SELECT USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  OR public.is_super_admin(auth.uid())
);
CREATE POLICY "Owner can manage members" ON public.company_members FOR INSERT WITH CHECK (
  public.get_user_company_role(auth.uid(), company_id) IN ('owner', 'admin')
  OR public.is_super_admin(auth.uid())
);
CREATE POLICY "Owner can update members" ON public.company_members FOR UPDATE USING (
  public.get_user_company_role(auth.uid(), company_id) IN ('owner', 'admin')
  OR public.is_super_admin(auth.uid())
);
CREATE POLICY "Owner can delete members" ON public.company_members FOR DELETE USING (
  public.get_user_company_role(auth.uid(), company_id) IN ('owner', 'admin')
  OR public.is_super_admin(auth.uid())
);
