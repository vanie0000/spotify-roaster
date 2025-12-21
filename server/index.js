require("dotenv").config();
const express = require("express");
const querystring = require("querystring");
const axios = require("axios");
const mongoose = require("mongoose");
const UserStats = require("./models/UserStats");
const cors = require("cors");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.get("/login", (req, res) => {
  const scope = "user-top-read";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
      })
  );
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  try {
    const response = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      data: querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${new Buffer.from(
          `${CLIENT_ID}:${CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    });
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    res.redirect(
      `http://localhost:5173/?access_token=${accessToken}&refresh_token=${refreshToken}`
    );
  } catch (error) {
    res.send(error);
  }
});

app.post("/save-stats", async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).send("No access token provided");

  try {
    const artistsResponse = await axios.get(
      "https://api.spotify.com/v1/me/top/artists?limit=10",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const tracksResponse = await axios.get(
      "https://api.spotify.com/v1/me/top/tracks?limit=10",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const topArtists = artistsResponse.data.items.map((item) => item.name);
    const topTracks = tracksResponse.data.items.map((item) => item.name);

    const genres = artistsResponse.data.items.map((item) => item.genres).flat();
    const topGenres = [...new Set(genres)].slice(0, 5);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
            You are a brutal, sarcastic music critic. 
            Here is a user's listening history:
            Top Artists: ${topArtists.join(", ")}.
            Top Tracks: ${topTracks.join(", ")}.
            
            Roast their music taste in 2-3 short, punchy sentences. 
            Be specific about the artists they listen to. Make it funny.
        `;

    const result = await model.generateContent(prompt);
    const roastText = result.response.text();

    console.log("🔥 Roast Generated:", roastText);

    const newStats = new UserStats({
      username: "User",
      topArtists,
      topTracks,
      topGenres,
      roast: roastText,
    });

    await newStats.save();

    res.json(newStats);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Failed to process data");
  }
});

app.listen(8888, () => {
  console.log("✅ Server running on http://127.0.0.1:8888");
});
