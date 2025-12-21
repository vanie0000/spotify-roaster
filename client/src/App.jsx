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

    setStatus("roasting your taste...");
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
      setStatus("");
    } catch (error) {
      console.error("Error:", error);
      setStatus("something went wrong.");
    }
  };

  return (
    <div className="brat-container">
      <h1 className="brat-header">spotify stats roaster</h1>

      {!token ? (
        <a href="http://127.0.0.1:8888/login">
          <button className="brat-button">login with spotify</button>
        </a>
      ) : (
        <div>
          <button onClick={handleAnalyze} className="brat-button">
            roast it
          </button>

          <p className="brat-status">{status}</p>

          {roast && (
            <div className="brat-roast-box">
              <h2 className="brat-subheader">the verdict</h2>
              <p className="roast-text">"{roast}"</p>
            </div>
          )}

          {topArtists.length > 0 && (
            <div className="receipts-section">
              <h3 className="brat-subheader">receipts</h3>
              <ul className="brat-list">
                {topArtists.slice(0, 5).map((artist, index) => (
                  <li key={index} className="brat-list-item">
                    {artist.toLowerCase()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <footer className="brat-footer">made with 💚 by a charli's angel</footer>
    </div>
  );
}

export default App;
