import { Link } from "react-router-dom";

function IconMenu() {
  return (
    <div
      className="
        fixed bottom-0 left-0 right-0
        bg-white border-t
        flex justify-around py-2
        shadow-md
      "
    >
      <Link to="/dashboard" className="text-center text-sm">
        🏠
        <p>Home</p>
      </Link>

      <Link to="/voice-help" className="text-center text-sm">
        🎤
        <p>Voice</p>
      </Link>

      <Link to="/notifications" className="text-center text-sm">
        📩
        <p>Alerts</p>
      </Link>

      <Link to="/accessibility" className="text-center text-sm">
        ⚙️
        <p>Settings</p>
      </Link>
    </div>
  );
}

export default IconMenu;
