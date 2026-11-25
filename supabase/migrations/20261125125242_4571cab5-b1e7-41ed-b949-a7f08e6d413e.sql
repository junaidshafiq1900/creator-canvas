DROP POLICY IF EXISTS "Auth upload own thumbnails" ON storage.objects;
CREATE POLICY "Auth upload own thumbnails" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails'
  AND owner_id = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "Auth update own thumbnails" ON storage.objects;
CREATE POLICY "Auth update own thumbnails" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'thumbnails'
  AND owner_id = (SELECT auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'thumbnails'
  AND owner_id = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "Auth delete own thumbnails" ON storage.objects;
CREATE POLICY "Auth delete own thumbnails" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'thumbnails'
  AND owner_id = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "Anyone can read platform settings" ON public.platform_settings;
CREATE POLICY "Anyone can read active site appearance"
ON public.platform_settings
FOR SELECT TO anon, authenticated
USING (key = 'active_skin');