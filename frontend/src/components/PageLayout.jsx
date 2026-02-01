export default function PageLayout({ title, subtitle, children }) {
  return (
    <div className="page-layout">
      {title && <div className="page-title">{title}</div>}
      {subtitle && <div className="page-subtitle">{subtitle}</div>}
      {children}
    </div>
  );
}
