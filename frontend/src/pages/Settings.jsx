import { useState, useEffect } from "react";
import SettingsCard from "../components/common/SettingsCard";
import ToggleSwitch from "../components/common/ToggleSwitch";
import notificationService from "../services/notification.service";
import { Loader2 } from "lucide-react";

function Settings() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        sms: false,
        call: false,
        priceAlerts: false,
        auctionAlerts: false,
        deliveryAlerts: false
    });

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
        fetchSettings();
    }, []);

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

                {/* Header */}
                <h2 className="text-2xl font-semibold text-primary mb-6 text-center">
                    Notification Settings
                </h2>

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
