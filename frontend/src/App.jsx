import { useState } from "react";

import PageLayout from "./components/PageLayout";
import Card from "./components/Card";
import FallbackMenu from "./voice/FallbackMenu";
import VoicePrompt from "./voice/VoicePrompt";
import VoiceError from "./voice/VoiceError";
import "./App.css";


// Voice command logic
import { processVoiceCommand } from "./utils/commandProcessor";

export default function App() {
  const [screen, setScreen] = useState("VOICE"); // VOICE, PRICE, LISTING, SEARCH, HELP, UNKNOWN

  const handleTranscript = (text) => {
    const action = processVoiceCommand(text);

    switch (action) {
      case "PRICE":
        setScreen("PRICE");
        break;

      case "LISTING":
        setScreen("LISTING");
        break;

      case "SEARCH":
        setScreen("SEARCH");
        break;

      case "HELP":
        setScreen("HELP");
        break;

      default:
        setScreen("UNKNOWN");
    }
  };

  return (
    <PageLayout title="FarmSmart" subtitle="Speak or tap icons to navigate">

      {/* ------------------- Voice Screen ------------------- */}
      {screen === "VOICE" && (
        <>
          <Card>
            <VoicePrompt onTranscript={handleTranscript} />
          </Card>

          <FallbackMenu onNavigate={(s) => setScreen(s)} />
        </>
      )}

      {/* ------------------- Price Screen ------------------- */}
      {screen === "PRICE" && (
        <Card>
          <h2 className="page-title">Prices</h2>
          <p className="page-subtitle">Market price information will appear here.</p>

          <button className="button button-primary" onClick={() => setScreen("VOICE")}>
            Back
          </button>
        </Card>
      )}

      {/* ------------------- Listing Screen ------------------- */}
      {screen === "LISTING" && (
        <Card>
          <h2 className="page-title">Crop Listings</h2>
          <p className="page-subtitle">Your crop listings will appear here.</p>

          <button className="button button-primary" onClick={() => setScreen("VOICE")}>
            Back
          </button>
        </Card>
      )}

      {/* ------------------- Search Screen ------------------- */}
      {screen === "SEARCH" && (
        <Card>
          <h2 className="page-title">Search</h2>
          <p className="page-subtitle">Search for crops, prices, and offers.</p>

          <button className="button button-primary" onClick={() => setScreen("VOICE")}>
            Back
          </button>
        </Card>
      )}

      {/* ------------------- Help Screen ------------------- */}
      {screen === "HELP" && (
        <Card>
          <h2 className="page-title">Help</h2>
          <p className="page-subtitle">Say “check price”, “list crop”, “search”.</p>

          <button className="button button-primary" onClick={() => setScreen("VOICE")}>
            Back
          </button>
        </Card>
      )}

      {/* ------------------- Unknown Command Screen ------------------- */}
      {screen === "UNKNOWN" && (
        <Card>
          <VoiceError onRetry={() => setScreen("VOICE")} />
        </Card>
      )}
    </PageLayout>
  );
}
