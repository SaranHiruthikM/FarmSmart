function PrimaryButton({ children, onClick, disabled, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-primary
        text-white
        font-medium
        rounded-lg
        shadow-md
        hover:bg-green-600
        hover:shadow-lg
        transition
        disabled:opacity-50
        flex items-center justify-center
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
