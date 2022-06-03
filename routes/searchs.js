//importing
const express = require("express");
const router = express.Router();
const Song = require("../model/Song");
const Playlist = require("../model/Playlist");
const auth = require("../middleware/auth");

//search route
router.get("/", auth, async (req, res) => {
  try {
    const search = req.query.search;
    if (search !== "") {
      const songs = await Song.find({
        name: { $regex: search, $options: "i" },
      }).limit(10);

      const playlists = await Playlist.find({
        name: { $regex: search, $options: "i" },
      }).limit(10);
      const result = { songs, playlists };
      res.status(200).send(result);
    } else {
      res.status(200).send({});
    }
  } catch (error) {
    console.log(error);
    
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

module.exports = router;
