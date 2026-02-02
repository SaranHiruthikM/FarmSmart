import { useState } from "react";

import VoiceButton from "../components/common/VoiceButton";

function VoiceHelp() {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("Tap the mic and speak");

  const handleMic = () => {
    setListening(true);
    setMessage("Listening... 👂");

    // Fake listening
    setTimeout(() => {
      setListening(false);
      setMessage("Command received ✅");
    }, 3000);
  };

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-green-50
        via-white
        to-green-100
        px-4 py-6
        flex flex-col items-center justify-center
      "
    >
      {/* Title */}
      <h2 className="text-2xl font-semibold text-primary mb-2">
        Voice Assistance
      </h2>

      <p className="text-gray-600 text-sm mb-6 text-center">
        Use your voice to navigate easily
      </p>

      {/* Mic Button */}
      <VoiceButton
        listening={listening}
        onClick={handleMic}
      />

      {/* Status */}
      <p className="mt-4 text-sm text-gray-700">
        {message}
      </p>

      {/* Examples */}
      <div className="mt-8 w-full max-w-sm">

        <h3 className="font-medium text-primary mb-2">
          Try saying:
        </h3>

        <ul className="text-sm text-gray-600 space-y-2">

          <li className="bg-white p-3 rounded-lg shadow">
            “Check tomato price”
          </li>

          <li className="bg-white p-3 rounded-lg shadow">
            “Show my listings”
          </li>

          <li className="bg-white p-3 rounded-lg shadow">
            “Start auction”
          </li>

          <li className="bg-white p-3 rounded-lg shadow">
            “Help me sell”
          </li>

        </ul>

      </div>
    </div>
  );
}

export default VoiceHelp;
