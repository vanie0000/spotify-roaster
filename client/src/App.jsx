import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
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

    setStatus("Fetching data from Spotify and saving to DB...");

    try {
      const response = await fetch("http://127.0.0.1:8888/save-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken: token }),
      });

      if (!response.ok) {
        throw new Error("Backend failed to save data");
      }

      const data = await response.json();

      console.log("Success! Data from backend:", data);

      setTopArtists(data.topArtists);
      setStatus("Data saved to MongoDB! Here are your top artists:");
    } catch (error) {
      console.error("Error:", error);
      setStatus("Something went wrong. Check console.");
    }
  };

  return (
    <div className="App" style={{ textAlign: "center", padding: "50px" }}>
      <h1>Spotify Stats Roaster 🔥</h1>

      {!token ? (
        <a href="http://127.0.0.1:8888/login">
          <button
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            Login with Spotify
          </button>
        </a>
      ) : (
        <div>
          <p>
            ✅ <strong>Connected to Spotify</strong>
          </p>

          <button
            onClick={handleAnalyze}
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            Analyze My Taste & Save to DB
          </button>

          <p style={{ marginTop: "20px", fontWeight: "bold" }}>{status}</p>

          {topArtists.length > 0 && (
            <div
              style={{
                marginTop: "30px",
                textAlign: "left",
                display: "inline-block",
              }}
            >
              <h3>Your Top Artists:</h3>
              <ul>
                {topArtists.map((artist, index) => (
                  <li
                    key={index}
                    style={{ fontSize: "18px", marginBottom: "5px" }}
                  >
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
