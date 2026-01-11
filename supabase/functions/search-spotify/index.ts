import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit: 30 searches per minute per IP
const RATE_LIMIT_COUNT = 30;
const RATE_LIMIT_MINUTES = 1;

// In-memory rate limiting (resets on function cold start)
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

// Clean up old entries periodically
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  external_urls: { spotify: string };
  explicit: boolean;
}

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
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
      // Cleanup old entries occasionally
      cleanupRateLimitMap();
      
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please try again in a minute.", 
          tracks: [] 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(RATE_LIMIT_MINUTES * 60)
          } 
        }
      );
    }

    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ tracks: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getSpotifyAccessToken();

    // Search for tracks only (not podcasts, audiobooks, etc.)
    const searchUrl = new URL("https://api.spotify.com/v1/search");
    searchUrl.searchParams.set("q", query.trim());
    searchUrl.searchParams.set("type", "track");
    searchUrl.searchParams.set("limit", "20");
    searchUrl.searchParams.set("market", "US");

    const response = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to search Spotify");
    }

    const data = await response.json();
    
    // Filter out explicit tracks and format the response
    const tracks = (data.tracks?.items || [])
      .filter((track: SpotifyTrack) => !track.explicit)
      .map((track: SpotifyTrack) => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(", "),
        album: track.album.name,
        albumArt: track.album.images[0]?.url || "",
        spotifyUrl: track.external_urls.spotify,
      }));

    return new Response(
      JSON.stringify({ tracks }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(rateLimit.remaining)
        } 
      }
    );
  } catch (error: unknown) {
    console.error("Spotify search error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message, tracks: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
