require("dotenv").config();
const express = require("express");
const querystring = require("querystring");
const axios = require("axios");
const app = express();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// 1. LOGIN ROUTE
app.get("/login", (req, res) => {
  const scope = "user-top-read";

  // CORRECTION: This is the real Spotify URL
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

// 2. CALLBACK ROUTE
app.get("/callback", async (req, res) => {
  console.log("CALLBACK HIT", req.query);

  const code = req.query.code || null;

  try {
    // CORRECTION: This is the real Token URL
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

    // Redirect to your Frontend (Port 5173)
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

app.listen(8888, () => {
  console.log("✅ Server running on http://127.0.0.1:8888");
});
