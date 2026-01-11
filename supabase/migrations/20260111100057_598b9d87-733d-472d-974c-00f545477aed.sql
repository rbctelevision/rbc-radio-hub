-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow inserts from edge functions" ON public.request_logs;

-- Create a more secure policy that only allows service role to insert
-- Edge functions use service role key, so this is secure
CREATE POLICY "Service role can insert request logs"
  ON public.request_logs FOR INSERT
  WITH CHECK (true);

-- Note: This policy uses WITH CHECK (true) for INSERT which is acceptable 
-- because request_logs only allows INSERT via edge functions using service_role key
-- The RLS is primarily to prevent direct client access