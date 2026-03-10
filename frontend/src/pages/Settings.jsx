import { useState, useEffect } from "react";
import SettingsCard from "../components/common/SettingsCard";
import ToggleSwitch from "../components/common/ToggleSwitch";
import notificationService from "../services/notification.service";
import { Loader2, Languages, Check } from "lucide-react";
import authService from "../services/auth.service";
import i18n from "../i18n/i18n";

function Settings() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        sms: false,
        call: false,
        priceAlerts: false,
        auctionAlerts: false,
        deliveryAlerts: false
    });
    const [preferredLanguage, setPreferredLanguage] = useState(i18n.language || "en");
    const [updatingLang, setUpdatingLang] = useState(false);

    const languages = [
        { code: "en", name: "English", native: "English" },
        { code: "ta", name: "Tamil", native: "தமிழ்" },
        { code: "hi", name: "Hindi", native: "हिन्दी" },
        { code: "ml", name: "Malayalam", native: "മലയാളം" },
        { code: "te", name: "Telugu", native: "తెలుగు" },
        { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
    ];

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await notificationService.getSettings();
                setSettings(data);
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setLoading(false);
            }
        };

        const loadProfile = async () => {
            try {
                const user = await authService.getProfile();
                if (user && user.preferredLanguage) {
                    setPreferredLanguage(user.preferredLanguage);
                    if (i18n.language !== user.preferredLanguage) {
                        i18n.changeLanguage(user.preferredLanguage);
                    }
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };

        fetchSettings();
        loadProfile();
    }, []);

    const handleLanguageChange = async (langCode) => {
        setUpdatingLang(true);
        try {
            await i18n.changeLanguage(langCode);
            setPreferredLanguage(langCode);
            await authService.updateProfile({ preferredLanguage: langCode });
        } catch (err) {
            console.error("Failed to update language", err);
        } finally {
            setUpdatingLang(false);
        }
    };

    const handleToggle = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings); // Optimistic UI update

        try {
            await notificationService.updateSettings({ [key]: value });
        } catch (err) {
            console.error("Failed to update setting", err);
            // Revert on failure could be implemented here
        }
    };

    const handleSave = () => {
        alert("Notification preferences saved ✅");
        // In a real app, this might explicitly save if we weren't auto-saving on toggle
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-green-50">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
    );

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

                <h2 className="text-2xl font-semibold text-primary mb-6 text-center">
                    Account Settings
                </h2>

                {/* Language Settings */}
                <SettingsCard title="Language Preferences">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <Languages className="w-5 h-5" />
                            <span className="text-sm font-semibold text-text-dark">Select UI Language</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    disabled={updatingLang}
                                    className={`
                                        flex items-center justify-between p-3 rounded-xl border transition-all duration-200
                                        ${preferredLanguage === lang.code
                                            ? "bg-primary/5 border-primary shadow-sm"
                                            : "bg-white border-accent/20 hover:border-primary/50 hover:bg-neutral-light"
                                        }
                                    `}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className={`font-bold text-sm ${preferredLanguage === lang.code ? "text-primary" : "text-text-dark"}`}>
                                            {lang.native}
                                        </span>
                                        <span className="text-[10px] text-accent font-medium">
                                            {lang.name}
                                        </span>
                                    </div>
                                    {preferredLanguage === lang.code && (
                                        <div className="bg-primary p-1 rounded-full">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </SettingsCard>

                {/* Notification Settings Header */}
                <h3 className="text-lg font-semibold text-primary mt-8 mb-4 text-center">
                    Notification Settings
                </h3>

                {/* SMS */}
                <SettingsCard title="SMS Alerts">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600 text-sm">
                            Receive updates via SMS
                        </p>

                        <ToggleSwitch
                            checked={settings.sms}
                            onChange={(val) => handleToggle('sms', val)}
                        />
                    </div>
                </SettingsCard>

                {/* Call */}
                <SettingsCard title="IVR / Call Alerts">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600 text-sm">
                            Get voice call notifications
                        </p>

                        <ToggleSwitch
                            checked={settings.call}
                            onChange={(val) => handleToggle('call', val)}
                        />
                    </div>
                </SettingsCard>

                {/* Price */}
                <SettingsCard title="Market Price Alerts">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600 text-sm">
                            Notify when prices change
                        </p>

                        <ToggleSwitch
                            checked={settings.priceAlerts}
                            onChange={(val) => handleToggle('priceAlerts', val)}
                        />
                    </div>
                </SettingsCard>

                {/* Auction */}
                <SettingsCard title="Auction Updates">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600 text-sm">
                            Updates on bidding activity
                        </p>

                        <ToggleSwitch
                            checked={settings.auctionAlerts}
                            onChange={(val) => handleToggle('auctionAlerts', val)}
                        />
                    </div>
                </SettingsCard>

                {/* Delivery */}
                <SettingsCard title="Delivery Notifications">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600 text-sm">
                            Transport & delivery status
                        </p>

                        <ToggleSwitch
                            checked={settings.deliveryAlerts}
                            onChange={(val) => handleToggle('deliveryAlerts', val)}
                        />
                    </div>
                </SettingsCard>

                {/* Save */}
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

export default Settings;
