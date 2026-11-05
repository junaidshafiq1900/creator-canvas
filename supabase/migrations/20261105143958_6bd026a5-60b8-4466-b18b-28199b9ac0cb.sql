-- Scope admin/moderator RLS policies to authenticated so anon queries
-- never evaluate private.has_role (which anon cannot execute).

-- ===== notifications =====
DROP POLICY IF EXISTS "Auth insert notifications" ON public.notifications;
CREATE POLICY "Auth insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = actor_id) AND private.can_send_notification(actor_id, user_id, type, target_type, target_id));

-- ===== platform_settings =====
DROP POLICY IF EXISTS "Admins can delete platform settings" ON public.platform_settings;
CREATE POLICY "Admins can delete platform settings" ON public.platform_settings
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert platform settings" ON public.platform_settings;
CREATE POLICY "Admins can insert platform settings" ON public.platform_settings
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Admins can update platform settings" ON public.platform_settings
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- ===== posts =====
DROP POLICY IF EXISTS "Admin delete posts" ON public.posts;
CREATE POLICY "Admin delete posts" ON public.posts
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS "Admin update posts" ON public.posts;
CREATE POLICY "Admin update posts" ON public.posts
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS "Admins read all posts" ON public.posts;
CREATE POLICY "Admins read all posts" ON public.posts
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'moderator'::app_role));

-- ===== reports =====
DROP POLICY IF EXISTS "Admin read reports" ON public.reports;
CREATE POLICY "Admin read reports" ON public.reports
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS "Admin update reports" ON public.reports;
CREATE POLICY "Admin update reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'moderator'::app_role));

-- ===== user_roles =====
DROP POLICY IF EXISTS "Admin manage roles" ON public.user_roles;
CREATE POLICY "Admin manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin read all roles" ON public.user_roles;
CREATE POLICY "Admin read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- ===== videos =====
DROP POLICY IF EXISTS "Admin delete videos" ON public.videos;
CREATE POLICY "Admin delete videos" ON public.videos
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS "Admin update videos" ON public.videos;
CREATE POLICY "Admin update videos" ON public.videos
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'moderator'::app_role));

DROP POLICY IF EXISTS "Admins read all videos" ON public.videos;
CREATE POLICY "Admins read all videos" ON public.videos
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'moderator'::app_role));