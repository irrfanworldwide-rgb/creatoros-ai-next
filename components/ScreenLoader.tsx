export default function ScreenLoader() {
  return (
    <div
      className="screen active"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}
    >
      <span
        className="spinner"
        style={{ display: "inline-block", width: 28, height: 28, borderWidth: 3, borderColor: "var(--border2)", borderTopColor: "var(--primary)" }}
      />
    </div>
  );
}
