import React from "react";

export default function VoiceFlowDiagram() {
    return (
        <div className="mermaid">
            {`
      graph TD
        A[Start Voice] --> B[Listening State]
        B --> C{Speech Recognized?}
        C -- Yes --> D[Confirmation State]
        C -- No / Error --> E[Failure Fallback]
        D --> F{User Confirms?}
        F -- Yes --> G[Trigger Action]
        F -- No --> B
        E --> H{Retry?}
        H -- Yes --> B
        H -- No --> I[Manual Input]
      `}
        </div>
    );
}
