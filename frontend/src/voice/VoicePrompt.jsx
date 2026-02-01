import Button from "../components/Button";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

export default function VoicePrompt({ onTranscript }) {
  const { listening, transcript, startListening, error } = useSpeechRecognition();

  if (transcript) {
    onTranscript(transcript);
  }

  return (
    <div>
      <div className="input-label">Voice Input</div>

      <Button variant="secondary" onClick={startListening}>
        {listening ? "Listening..." : "Start Voice Input"}
      </Button>

      {transcript && (
        <div className="page-subtitle" style={{ marginTop: "16px" }}>
          You said: {transcript}
        </div>
      )}

      {error && (
        <div style={{ marginTop: "16px", color: "#DC2626", fontSize: "14px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
