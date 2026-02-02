function LanguageCard({ name, native, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 mb-3
        border rounded-xl
        text-left
        transition
        ${
          selected
            ? "border-primary bg-green-50"
            : "border-gray-300"
        }
      `}
    >
      <p className="font-medium">{native}</p>
      <p className="text-sm text-gray-500">{name}</p>
    </button>
  );
}

export default LanguageCard;
