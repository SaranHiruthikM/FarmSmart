import { useState } from "react";
import { useNavigate } from "react-router-dom";

import languages from "../mock/languages.json";
import LanguageCard from "../components/common/LanguageCard";

function LanguageSetup() {
  const [selected, setSelected] = useState("en");

  const navigate = useNavigate();

  const handleContinue = () => {
    localStorage.setItem("lang", selected);
    navigate("/");
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
      "
    >
      <div className="max-w-md mx-auto">

        <h2 className="text-2xl font-semibold text-primary text-center mb-2">
          Choose Your Language
        </h2>

        <p className="text-center text-gray-500 text-sm mb-6">
          உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்
        </p>

        {languages.map((lang) => (
          <LanguageCard
            key={lang.code}
            name={lang.name}
            native={lang.native}
            selected={selected === lang.code}
            onClick={() => setSelected(lang.code)}
          />
        ))}

        <button
          onClick={handleContinue}
          className="
            w-full mt-4 py-2.5
            bg-primary text-white
            rounded-lg font-medium
            shadow
          "
        >
          Continue
        </button>

      </div>
    </div>
  );
}

export default LanguageSetup;
