const mongoose = require("mongoose");

const UserStatsSchema = new mongoose.Schema({
  username: String,
  topArtists: [String], 
  topTracks: [String],
  topGenres: [String], 
  roast: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserStats", UserStatsSchema);
