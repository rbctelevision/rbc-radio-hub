import { useState, useRef, useCallback, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MessageSquare, Mic, Send, Loader2, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MessageRequestTabProps {
  onSuccess: () => void;
}

const MAX_RECORDING_SECONDS = 60;

const MessageRequestTab = ({ onSuccess }: MessageRequestTabProps) => {
  const [name, setName] = useState("");
  const [messageType, setMessageType] = useState<"text" | "voice">("text");
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= MAX_RECORDING_SECONDS - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to access microphone. Please allow microphone access.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const deleteRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
  }, [audioUrl]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (messageType === "text" && !message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (messageType === "voice" && !audioBlob) {
      toast.error("Please record a voice memo");
      return;
    }

    setIsSubmitting(true);
    try {
      let payload: any;

      if (messageType === "text") {
        payload = {
          type: "message",
          name: name.trim(),
          message: message.trim(),
          comments: comments.trim() || undefined,
        };
      } else {
        // Convert audio blob to base64
        const reader = new FileReader();
        const base64Audio = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob!);
        });

        payload = {
          type: "voice",
          name: name.trim(),
          voiceData: base64Audio,
          comments: comments.trim() || undefined,
        };
      }

      const { data, error } = await supabase.functions.invoke("send-request", {
        body: payload,
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to submit request");

      toast.success("Request submitted!");
      onSuccess();
    } catch (error: any) {
      console.error("Request error:", error);
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  }, [name, messageType, message, audioBlob, comments, onSuccess]);

  const isValid = name.trim() && (
    (messageType === "text" && message.trim()) ||
    (messageType === "voice" && audioBlob)
  );

  return (
    <div className="space-y-4">
      {/* Name Input */}
      <div>
        <Label htmlFor="msg-name">Your Name *</Label>
        <Input
          id="msg-name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Message Type Toggle */}
      <Tabs value={messageType} onValueChange={(v) => setMessageType(v as "text" | "voice")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <MessageSquare size={16} />
            Text Message
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic size={16} />
            Voice Memo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-4">
          <Label htmlFor="msg-content">Your Message *</Label>
          <Textarea
            id="msg-content"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1"
            rows={4}
          />
        </TabsContent>

        <TabsContent value="voice" className="mt-4">
          <Label>Voice Memo * (Max 1 minute)</Label>
          <div className="mt-2 p-4 bg-muted rounded-lg">
            {!audioBlob ? (
              <div className="flex flex-col items-center gap-4">
                {isRecording ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                      <span className="text-lg font-mono">{formatDuration(recordingDuration)}</span>
                      <span className="text-sm text-muted-foreground">/ {formatDuration(MAX_RECORDING_SECONDS)}</span>
                    </div>
                    <Button variant="destructive" onClick={stopRecording}>
                      <Square className="mr-2" size={16} />
                      Stop Recording
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={startRecording}>
                    <Mic className="mr-2" size={16} />
                    Start Recording
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <audio src={audioUrl!} controls className="w-full" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={deleteRecording}>
                    <Trash2 className="mr-2" size={14} />
                    Delete
                  </Button>
                  <Button variant="outline" size="sm" onClick={startRecording}>
                    <Mic className="mr-2" size={14} />
                    Re-record
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Comments */}
      <div>
        <Label htmlFor="msg-comments">Additional Comments (Optional)</Label>
        <Textarea
          id="msg-comments"
          placeholder="Any additional notes..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !isValid}
        className="w-full bg-gradient-primary hover:opacity-90"
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin mr-2" size={18} />
        ) : (
          <Send className="mr-2" size={18} />
        )}
        Submit Request
      </Button>
    </div>
  );
};

export default MessageRequestTab;
