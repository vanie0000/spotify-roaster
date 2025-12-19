import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [roast, setRoast] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const accessToken = urlParams.get("access_token");

    if (accessToken) {
      setToken(accessToken);
      window.history.pushState({}, null, "/");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!token) return;

    setStatus("🔥 Roasting your music taste... (this might take a second)");
    setRoast(null);

    try {
      const response = await fetch("http://localhost:8888/save-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      });

      if (!response.ok) throw new Error("Backend failed");

      const data = await response.json();

      setTopArtists(data.topArtists);
      setRoast(data.roast);
      setStatus("✅ Done!");
    } catch (error) {
      console.error("Error:", error);
      setStatus("❌ Something went wrong.");
    }
  };

  return (
    <div
      className="App"
      style={{
        textAlign: "center",
        padding: "50px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Spotify Stats Roaster 🔥</h1>

      {!token ? (
        <a href="http://127.0.0.1:8888/login">
          <button
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              cursor: "pointer",
              backgroundColor: "#1DB954",
              color: "white",
              border: "none",
              borderRadius: "25px",
            }}
          >
            Login with Spotify
          </button>
        </a>
      ) : (
        <div>
          <button
            onClick={handleAnalyze}
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              cursor: "pointer",
              backgroundColor: "black",
              color: "white",
              border: "none",
              borderRadius: "25px",
            }}
          >
            Roast My Taste
          </button>

          <p style={{ marginTop: "20px", fontWeight: "bold" }}>{status}</p>

          {/* NEW: The Roast Box */}
          {roast && (
            <div
              style={{
                backgroundColor: "#ffcccc",
                border: "2px solid #ff0000",
                borderRadius: "10px",
                padding: "20px",
                margin: "30px auto",
                maxWidth: "600px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h2 style={{ margin: "0 0 10px 0", color: "#cc0000" }}>
                💀 The Verdict
              </h2>
              <p
                style={{
                  fontSize: "1.3em",
                  fontStyle: "italic",
                  lineHeight: "1.5",
                }}
              >
                "{roast}"
              </p>
            </div>
          )}

          {topArtists.length > 0 && (
            <div style={{ marginTop: "40px" }}>
              <h3>Based on these artists:</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {topArtists.slice(0, 5).map((artist, index) => (
                  <li key={index} style={{ fontSize: "18px", margin: "5px 0" }}>
                    🎵 {artist}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
