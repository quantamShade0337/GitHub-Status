"use client";

// Global error boundary — replaces the root layout when it itself throws, so it
// must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#08080b",
          color: "#ededf2",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ color: "#9a9aa6", marginTop: "8px", fontSize: "14px" }}>
          A critical error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "20px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: "#a855f7",
            color: "white",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        {error.digest && (
          <p style={{ color: "#6b6b78", marginTop: "16px", fontSize: "12px" }}>
            Error ID: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
