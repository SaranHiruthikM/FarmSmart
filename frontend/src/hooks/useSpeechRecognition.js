import { useState } from "react";

export default function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const startListening = () => {
    setError("");
    setTranscript("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.start();
    setListening(true);

    recognition.onresult = (e) => {
      setTranscript(e.results[0][0].transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setError("Could not process voice input.");
      setListening(false);
    };
  };

  return { listening, transcript, startListening, error };
}
