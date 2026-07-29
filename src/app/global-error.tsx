"use client";

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
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Helvetica, Arial, sans-serif",
          background: "#fff",
          color: "#000",
          padding: "2rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#666",
              margin: 0,
            }}
          >
            Error
          </p>
          <h1
            style={{
              marginTop: "1rem",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            Something went wrong
          </h1>
          <p style={{ marginTop: "1.5rem", maxWidth: "28rem", color: "#666" }}>
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              background: "#000",
              color: "#fff",
              border: 0,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
