function AuthCard({ title, children }) {
  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl px-6 py-8">

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-semibold text-primary">
          {title}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Welcome to FarmSmart
        </p>
      </div>

      {children}

    </div>
  );
}

export default AuthCard;
