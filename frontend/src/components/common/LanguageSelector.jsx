import { useTranslation } from "react-i18next";

function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <div className="mb-4">

      <select
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="
          w-full p-2
          border border-gray-300
          rounded-lg
          text-sm
          focus:ring-2 focus:ring-primary
        "
      >
        <option value="en">🌐 English</option>
        <option value="hi">🌐 हिन्दी (Hindi)</option>
        <option value="ta">🌐 தமிழ் (Tamil)</option>
        <option value="te">🌐 తెలుగు (Telugu)</option>
        <option value="kn">🌐 ಕನ್ನಡ (Kannada)</option>
        <option value="ml">🌐 മലയാളം (Malayalam)</option>
      </select>

    </div>
  );
}

export default LanguageSelector;
