export default function RoleLoading() {
  return (
    <div className="role-content" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Loading workspace</span>
      <div className="skeleton-block" style={{ height: 28, width: 220, marginBottom: 12 }} />
      <div className="skeleton-block" style={{ height: 40, width: 360, marginBottom: 28 }} />
      <div className="skeleton-block" style={{ height: 120, width: "100%" }} />
    </div>
  );
}
