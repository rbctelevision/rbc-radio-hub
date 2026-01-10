import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SongRequest {
  type: "song";
  name: string;
  songTitle: string;
  songArtist: string;
  spotifyUrl: string;
  albumArt?: string;
  comments?: string;
}

interface MessageRequest {
  type: "message";
  name: string;
  message: string;
  comments?: string;
}

interface VoiceRequest {
  type: "voice";
  name: string;
  voiceData: string; // base64 audio data
  comments?: string;
}

type RequestPayload = SongRequest | MessageRequest | VoiceRequest;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL");
    if (!DISCORD_WEBHOOK_URL) {
      throw new Error("Discord webhook URL not configured");
    }

    const payload: RequestPayload = await req.json();

    // Get client IP and user agent
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build content summary for logging
    let contentSummary = "";
    if (payload.type === "song") {
      contentSummary = `Song: ${payload.songTitle} by ${payload.songArtist}`;
    } else if (payload.type === "message") {
      contentSummary = `Message: ${payload.message.substring(0, 100)}${payload.message.length > 100 ? "..." : ""}`;
    } else if (payload.type === "voice") {
      contentSummary = "Voice memo submitted";
    }

    // Log the request
    await supabase.from("request_logs").insert({
      ip_address: clientIP,
      request_type: payload.type,
      user_agent: userAgent,
      requester_name: payload.name,
      content_summary: contentSummary,
    });

    // Build Discord embed based on request type
    let embed: any;
    const files: { name: string; blob: Blob }[] = [];

    if (payload.type === "song") {
      embed = {
        title: "🎵 New Song Request",
        color: 0x1DB954, // Spotify green
        fields: [
          { name: "Requested By", value: payload.name, inline: true },
          { name: "Song", value: `[${payload.songTitle}](${payload.spotifyUrl})`, inline: true },
          { name: "Artist", value: payload.songArtist, inline: true },
        ],
        thumbnail: payload.albumArt ? { url: payload.albumArt } : undefined,
        timestamp: new Date().toISOString(),
      };
      if (payload.comments) {
        embed.fields.push({ name: "Additional Comments", value: payload.comments, inline: false });
      }
    } else if (payload.type === "message") {
      embed = {
        title: "💬 New Message",
        color: 0x5865F2, // Discord blurple
        fields: [
          { name: "From", value: payload.name, inline: true },
          { name: "Message", value: payload.message, inline: false },
        ],
        timestamp: new Date().toISOString(),
      };
      if (payload.comments) {
        embed.fields.push({ name: "Additional Comments", value: payload.comments, inline: false });
      }
    } else if (payload.type === "voice") {
      embed = {
        title: "🎤 New Voice Memo",
        color: 0xED4245, // Discord red
        fields: [
          { name: "From", value: payload.name, inline: true },
        ],
        timestamp: new Date().toISOString(),
      };
      if (payload.comments) {
        embed.fields.push({ name: "Additional Comments", value: payload.comments, inline: false });
      }

      // Convert base64 to blob for voice memo
      const base64Data = payload.voiceData.replace(/^data:audio\/\w+;base64,/, "");
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      files.push({ 
        name: `voice_memo_${Date.now()}.webm`, 
        blob: new Blob([binaryData], { type: "audio/webm" }) 
      });
    }

    // Send to Discord
    if (files.length > 0) {
      // Use multipart form for file uploads
      const formData = new FormData();
      formData.append("payload_json", JSON.stringify({ embeds: [embed] }));
      files.forEach((file, i) => {
        formData.append(`files[${i}]`, file.blob, file.name);
      });

      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Discord webhook error:", errorText);
        throw new Error("Failed to send to Discord");
      }
    } else {
      // Standard JSON request for text-only
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Discord webhook error:", errorText);
        throw new Error("Failed to send to Discord");
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Request submitted successfully!" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error processing request:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
