-- Create request_logs table for detailed IP logging
CREATE TABLE public.request_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('song', 'message', 'voice')),
  user_agent TEXT,
  requester_name TEXT NOT NULL,
  content_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (logs should only be insertable, not readable by users)
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;

-- No SELECT policy - admins can query via service role
-- Allow inserts from edge functions (no user auth needed)
CREATE POLICY "Allow inserts from edge functions"
ON public.request_logs
FOR INSERT
WITH CHECK (true);