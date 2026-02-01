import React from "react";
import Button from "../Button";

export default function ConfirmationState({ command, onConfirm, onRetry }) {
    return (
        <div className="voice-container">
            <p className="voice-text-secondary">Did you mean...</p>
            <h3 className="voice-command-text">"{command}"</h3>
            <div className="voice-actions">
                <Button variant="primary" onClick={onConfirm}>
                    Yes, Go Ahead
                </Button>
                <Button variant="secondary" onClick={onRetry}>
                    No, Retry
                </Button>
            </div>
        </div>
    );
}
