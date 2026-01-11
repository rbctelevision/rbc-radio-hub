import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 60 requests per minute per IP
const RATE_LIMIT_COUNT = 60;
const RATE_LIMIT_MINUTES = 1;

// In-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = RATE_LIMIT_MINUTES * 60 * 1000;
  
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: RATE_LIMIT_COUNT - 1 };
  }
  
  if (entry.count >= RATE_LIMIT_COUNT) {
    return { allowed: false, remaining: 0 };
  }
  
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_COUNT - entry.count };
}

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function searchSpotify(accessToken: string, title: string, artist: string): Promise<string | null> {
  const query = encodeURIComponent(`track:${title} artist:${artist}`);
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Spotify search failed:', await response.text());
    return null;
  }

  const data = await response.json();
  const track = data.tracks?.items?.[0];
  
  if (!track?.album?.images?.[0]?.url) {
    return null;
  }

  return track.album.images[0].url;
}

async function searchItunes(title: string, artist: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const response = await fetch(
      `https://itunes.apple.com/search?term=${query}&media=music&limit=1`
    );

    if (!response.ok) {
      console.error('iTunes search failed:', response.status);
      return null;
    }

    const data = await response.json();
    const track = data.results?.[0];
    
    if (!track?.artworkUrl100) {
      return null;
    }

    // Get higher resolution artwork (replace 100x100 with 600x600)
    return track.artworkUrl100.replace('100x100bb', '600x600bb');
  } catch (error) {
    console.error('iTunes search error:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     "unknown";

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0'
          } 
        }
      );
    }

    const { title, artist } = await req.json();
    console.log('Edge function called with:', { title, artist });

    if (!title || !artist) {
      console.error('Missing title or artist');
      return new Response(
        JSON.stringify({ error: 'Title and artist are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let albumArt: string | null = null;

    // Try Spotify first
    try {
      console.log('Trying Spotify...');
      const accessToken = await getSpotifyAccessToken();
      albumArt = await searchSpotify(accessToken, title, artist);
      console.log('Spotify result:', albumArt);
    } catch (spotifyError) {
      console.error('Spotify failed:', spotifyError);
    }

    // If Spotify failed, try iTunes
    if (!albumArt) {
      console.log('Trying iTunes...');
      albumArt = await searchItunes(title, artist);
      console.log('iTunes result:', albumArt);
    }

    return new Response(
      JSON.stringify({ albumArt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-spotify-album-art:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
