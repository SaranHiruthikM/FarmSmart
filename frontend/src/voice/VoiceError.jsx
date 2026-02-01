import Card from "../components/Card";
import Button from "../components/Button";

export default function VoiceError({ onRetry }) {
  return (
    <Card>
      <div className="page-title">Could Not Understand</div>
      <div className="page-subtitle">Please try again.</div>

      <Button onClick={onRetry}>Retry</Button>
    </Card>
  );
}
