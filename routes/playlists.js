// variables
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Song = require("../model/Song");
const Playlist = require("../model/Playlist");
const validObjectID = require("../middleware/validObjectID");
const auth = require("../middleware/auth");

//Routes for Playlists////

// get all the playlists
router.get("/", async (req, res) => {
  try {
    const playlists = await Playlist.find();
    res.status(200).send({ data: playlists });
  } catch (error) {
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

// create a new playlist
router.post("/", auth, async (req, res) => {
  try {
    //user input for the playlists
    const { name, desc, img } = req.body;

    //validation
    if (!(name && desc && img)) {
      res.status(400).send("Please enter all required fields");
    }

    //find user
    const user = await User.findById(req.user._id).select("-password -__v");

    //match user that is logged in with with user._id
    // add playlist to the DB with user ID
    const playlist = await Playlist.create({
      name,
      desc,
      img,
      user: user._id,
    });

    // add playlist to user.playlist
    user.playlists.push(playlist._id);
    await user.save();
    res.status(201).send({ data: playlist });
  } catch (error) {
    console.log(error);
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

// update playlist by id
router.put("/editplaylist/:id", auth, async (req, res) => {
  try {
    //user input for the playlists
    const { name, desc, img } = req.body;

    //validation
    if (!(name && desc && img)) {
      res.status(400).send("Please enter all required fields");
    }

    //find the playlist by ID
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist)
      return res.status(404).send({ message: "Playlist was not found!" });

    //find the user by ID
    const user = await User.findById(req.user._id);

    //confirm user is the user that created this playlist
    if (!user._id.equals(playlist.user))
      return res
        .status(403)
        .send({ message: "User does not have access to this playlist" });

    playlist.name = req.body.name;
    playlist.desc = req.body.desc;
    playlist.img = req.body.img;
    await playlist.save();

    res.status(200).send({ message: "Playlist was Updated" });
  } catch (error) {
    console.log(error);
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

// add a song to the playlist route
router.put("/addsong/", auth, async (req, res) => {
  try {
    //user input for the playlists
    const { songID, playlistID } = req.body;

    //validation
    if (!(songID && playlistID)) {
      res.status(400).send("Please enter all required fields");
    }
    //get user and playlist data
    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.body.playlistID);

    // check if this is the user that created this playlist
    if (!user._id.equals(playlist.user))
      return res
        .status(403)
        .send({ message: "This User does not have access to this Playlist" });

    //find the index of the song to add
    const index = playlist.songs.indexOf(songID);

    //add song to the playlist
    if (index == -1) {
      playlist.songs.push(songID);
    }

    await playlist.save();
    res
      .status(200)
      .send({ data: playlist, message: "Song has been added to the playlist" });
  } catch (error) {
    console.log(error);
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

//remove a song from the playlist
router.put("/removesong/", auth, async (req, res) => {
  try {
    //user input for the playlists
    const { songID, playlistID } = req.body;

    //validation
    if (!(songID && playlistID)) {
      res.status(400).send("Please enter all required fields");
    }
    //get user and playlist data
    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.body.playlistID);
    // check if this is the user that created this playlist
    if (!user._id.equals(playlist.user))
      return res
        .status(403)
        .send({ message: "This User does not have access to this Playlist" });

    //find the index of the song to add
    const index = playlist.songs.indexOf(songID);

    //add song to the playlist
    playlist.songs.splice(index, 1);

    await playlist.save();
    res.status(200).send({
      data: playlist,
      message: "Song has been removed from the playlist",
    });
  } catch (error) {
    console.log(error);
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

//get playlist by the ID
router.get("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const playlist = await Playlist.findById(id);

    if (!playlist)
      return res.status(404).send({ message: "No playlist found" });

    const songs = await Song.find({ _id: playlist.songs });
    res.status(200).send({ data: { playlist, songs } });
  } catch (error) {
    console.log(error);
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

// delete playlist by the ID
router.delete("/:id", auth, async (req, res) => {
  try {
    //get user and playlist
    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.params.id);
    if (!user._id.equals(playlist.user))
      return res.status(403).send({
        message: "You dont havess permission to delete this playlist",
      });
    //get index of the playlist in the users playlist array
    const index = user.playlists.indexOf(req.params.id);
    user.playlists.splice(index, 1);
    await user.save();
    await playlist.remove();
    res.status(200).send({ message: "Playlist was removed" });
  } catch (error) {
    console.log(error);
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});
module.exports = router;
