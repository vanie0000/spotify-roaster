require("dotenv").config();
const express = require("express");
const querystring = require("querystring");
const axios = require("axios");
const app = express();
const mongoose = require('mongoose');
const UserStats = require('./models/UserStats');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

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
  console.log("CALLBACK HIT", req.query);

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
    console.error(
      "Error getting token:",
      error.response ? error.response.data : error.message
    );
    res.send("Error getting token. Check console for details.");
  }
});

app.post('/save-stats', async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) return res.status(400).send('No access token provided');

    try {
        // A. Fetch Top Artists from Spotify
        const artistsResponse = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=10', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // B. Fetch Top Tracks from Spotify
        const tracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=10', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // C. Clean the Data
        const topArtists = artistsResponse.data.items.map(item => item.name);
        const topTracks = tracksResponse.data.items.map(item => item.name);
        
        // Extract Genres 
        const genres = artistsResponse.data.items.map(item => item.genres).flat();
        // Count top genres 
        const topGenres = [...new Set(genres)].slice(0, 5); 
        // D. Save to MongoDB
        const newStats = new UserStats({
            username: 'User',
            topArtists,
            topTracks,
            topGenres
        });

        await newStats.save();
        console.log("Data saved to MongoDB!");

        // E. Send data back to Frontend so we can display it
        res.json(newStats);

    } catch (error) {
        console.error("Error fetching/saving data:", error.message);
        res.status(500).send('Failed to process data');
    }
});

app.listen(8888, () => {
    console.log('Server running on http://127.0.0.1:8888');
});