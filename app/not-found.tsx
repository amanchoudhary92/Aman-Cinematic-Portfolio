export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#050508", color: "white", fontFamily: "system-ui" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ letterSpacing: ".18em", opacity: 0.55 }}>404 / ROUTE NOT FOUND</p>
        <h1>Nothing lives here.</h1>
        <a href="/" style={{ color: "#ff4b7a" }}>Back to portfolio →</a>
      </div>
    </main>
  );
}
