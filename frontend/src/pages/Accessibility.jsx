import { useState } from "react";

import SettingsCard from "../components/common/SettingsCard";
import ToggleSwitch from "../components/common/ToggleSwitch";
import FontSizeSelector from "../components/common/FontSizeSelector";

import preferencesData from "../mock/preferences.json";

function Accessibility() {
  const [language, setLanguage] = useState(preferencesData.language);
  const [voice, setVoice] = useState(preferencesData.voice);
  const [sms, setSms] = useState(preferencesData.sms);
  const [fontSize, setFontSize] = useState(preferencesData.fontSize);

  const handleSave = () => {
    alert("Preferences Saved Successfully ✅");
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

        {/* Page Header */}
        <h2 className="text-2xl font-semibold text-primary mb-6 text-center">
          Accessibility & Preferences
        </h2>

        {/* Language */}
        <SettingsCard title="Language Preference">

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="
              w-full p-2 border border-gray-300
              rounded-lg
              focus:ring-2 focus:ring-primary
            "
          >
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
            <option value="hi">हिंदी</option>
          </select>

        </SettingsCard>

        {/* Voice */}
        <SettingsCard title="Voice Assistance">

          <div className="flex items-center justify-between">

            <p className="text-gray-600 text-sm">
              Enable voice navigation
            </p>

            <ToggleSwitch
              checked={voice}
              onChange={setVoice}
            />

          </div>

        </SettingsCard>

        {/* SMS */}
        <SettingsCard title="SMS Notifications">

          <div className="flex items-center justify-between">

            <p className="text-gray-600 text-sm">
              Receive important alerts
            </p>

            <ToggleSwitch
              checked={sms}
              onChange={setSms}
            />

          </div>

        </SettingsCard>

        {/* Font */}
        <SettingsCard title="Font Size">

          <FontSizeSelector
            value={fontSize}
            onChange={setFontSize}
          />

        </SettingsCard>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="
            w-full mt-4 py-2.5
            bg-primary text-white
            rounded-lg font-medium
            shadow-md
            hover:bg-green-600
            transition
          "
        >
          Save Preferences
        </button>

      </div>
    </div>
  );
}

export default Accessibility;
