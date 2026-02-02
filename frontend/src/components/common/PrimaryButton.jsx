function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        w-full py-2.5 mt-2
        bg-primary
        text-white
        font-medium
        rounded-lg
        shadow-md
        hover:bg-green-600
        hover:shadow-lg
        transition
        disabled:opacity-50
      "
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
