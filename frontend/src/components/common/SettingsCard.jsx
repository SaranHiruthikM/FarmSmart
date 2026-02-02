function SettingsCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-4">

      <h3 className="text-lg font-semibold text-primary mb-3">
        {title}
      </h3>

      {children}

    </div>
  );
}

export default SettingsCard;
