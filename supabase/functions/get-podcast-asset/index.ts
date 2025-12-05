import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, podcastId, episodeId } = await req.json();
    const apiKey = Deno.env.get('AZURA_API_KEY');

    if (!apiKey) {
      console.error('AZURA_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let url: string;
    
    if (type === 'art') {
      url = `https://azura.rbctelevision.org/api/station/rbcradio/podcast/${podcastId}/art`;
    } else if (type === 'episode') {
      url = `https://azura.rbctelevision.org/api/station/rbcradio/public/podcast/${podcastId}/episode/${episodeId}`;
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid asset type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching podcast asset from:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Podcast API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch asset', status: response.status }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For art, return the image URL; for episode, return the JSON data
    if (type === 'art') {
      // Return the URL directly since the art endpoint redirects to the image
      return new Response(
        JSON.stringify({ url: response.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-podcast-asset:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
