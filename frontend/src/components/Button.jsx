export default function Button({ variant = "primary", children, ...props }) {
  return (
    <button className={`button button-${variant}`} {...props}>
      {children}
    </button>
  );
}
