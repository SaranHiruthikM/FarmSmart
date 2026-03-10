function PrimaryButton({ children, onClick, disabled, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-nature-600
        text-white
        font-bold
        rounded-xl
        shadow-lg shadow-nature-600/20
        hover:bg-nature-700
        hover:-translate-y-0.5
        hover:shadow-xl hover:shadow-nature-600/30
        transition-all duration-200
        disabled:opacity-70
        disabled:hover:translate-y-0
        disabled:hover:shadow-none
        flex items-center justify-center
        py-3 px-6
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
