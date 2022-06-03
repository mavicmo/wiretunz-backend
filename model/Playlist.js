const mongoose = require("../db/connection");

const ObjectId = mongoose.Schema.Types.ObjectId;

const PlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: ObjectId, ref: "User", required: true },
  desc: String,
  songs: { type: Array, default: [] },
  img: String,
});

const Playlist = mongoose.model("Playlist", PlaylistSchema);

module.exports = Playlist;
