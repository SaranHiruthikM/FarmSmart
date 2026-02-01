import React from "react";
import Button from "../Button";

export default function VoiceFailureFallback({ onRetry, onManual }) {
    return (
        <div className="voice-container voice-error">
            <div className="voice-icon-error">!</div>
            <p className="voice-text">We couldn't hear you clearly.</p>
            <div className="voice-actions">
                <Button variant="primary" onClick={onRetry}>
                    Try Again
                </Button>
                <Button variant="secondary" onClick={onManual}>
                    Type Instead
                </Button>
            </div>
        </div>
    );
}
