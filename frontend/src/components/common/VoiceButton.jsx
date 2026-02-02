function VoiceButton({ listening, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-24 h-24
        rounded-full
        flex items-center justify-center
        text-4xl
        shadow-lg
        transition
        ${
          listening
            ? "bg-red-100 text-secondary animate-pulse"
            : "bg-green-100 text-primary"
        }
      `}
    >
      🎤
    </button>
  );
}

export default VoiceButton;
