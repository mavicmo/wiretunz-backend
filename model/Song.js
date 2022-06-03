const mongoose = require("../db/connection");

const SongSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  song: { type: String, required: true },
  img: { type: String, required: true },
});

const Song = mongoose.model("Song", SongSchema);

module.exports = Song;
