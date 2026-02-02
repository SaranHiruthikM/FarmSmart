import { useState } from "react";

import SettingsCard from "../components/common/SettingsCard";
import ToggleSwitch from "../components/common/ToggleSwitch";

import notificationData from "../mock/notifications.json";

function Notifications() {
  const [sms, setSms] = useState(notificationData.sms);
  const [call, setCall] = useState(notificationData.call);
  const [price, setPrice] = useState(notificationData.priceAlerts);
  const [auction, setAuction] = useState(notificationData.auctionAlerts);
  const [delivery, setDelivery] = useState(notificationData.deliveryAlerts);

  const handleSave = () => {
    alert("Notification preferences saved ✅");
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
              checked={sms}
              onChange={setSms}
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
              checked={call}
              onChange={setCall}
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
              checked={price}
              onChange={setPrice}
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
              checked={auction}
              onChange={setAuction}
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
              checked={delivery}
              onChange={setDelivery}
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

export default Notifications;
