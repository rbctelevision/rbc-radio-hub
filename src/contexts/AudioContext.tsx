import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

interface AudioContextType {
  isPlaying: boolean;
  volume: number[];
  audioRef: React.RefObject<HTMLAudioElement>;
  togglePlay: () => void;
  setVolume: (volume: number[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState([80]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  // Preload the audio resource on mount so it's ready to play when user clicks.
  useEffect(() => {
    if (audioRef.current) {
      try {
        audioRef.current.preload = "auto";
        // call load to make the browser begin fetching metadata/stream
        audioRef.current.load();
      } catch (e) {
        // ignore any load errors (browsers may block fetches until user gesture)
      }
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const setVolume = (newVolume: number[]) => {
    setVolumeState(newVolume);
  };

  return (
    <AudioContext.Provider value={{ isPlaying, volume, audioRef, togglePlay, setVolume }}>
      <audio
        ref={audioRef}
        src="https://azura.rbctelevision.org/listen/rbcradio/radio.mp3"
        preload="auto"
      />
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
