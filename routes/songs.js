const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Song = require("../model/Song");
const validObjectID = require("../middleware/validObjectID");
const auth = require("../middleware/auth");
const axios = require("axios");
// const client_id = "1d7ae6fb9e7947a8bc49ca82b84069a1";
// const client_secret = "0f7cdc8801454a29878f54b5a5f1e330";

// router.get("/spotify", async (req, res) => {
//   const params = new URLSearchParams();
//   params.append("grant_type", "client_credentials");
//   axios
//     .post("https://accounts.spotify.com/api/token", params, {
//       headers: {
//         Authorization:
//           "Basic " +
//           new Buffer.from(client_id + ":" + client_secret).toString("base64"),
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     })
//     .then((song) => {
//       const token = song.data.access_token;
//       axios
//         .get(`https://api.spotify.com/v1/tracks`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params: {
//             // q: searchKey,
//             // type: "track",
//           },
//         })
//         .then((songs) => {
//           res.json(songs.data);
//         })
//         .catch(console.error);
//     });
// });
// get all the songs
router.get("/", async (req, res) => {
  try {
    const songs = await Song.find();
    res.status(200).send({ data: songs });
  } catch (error) {
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

// create a new song
router.post("/", async (req, res) => {
  try {
    // user input for the songs
    const { name, artist, img } = req.body;

    //validate empty string
    if (!(name && artist && img)) {
      throw "inputError";
    }

    const music = await Song.create({
      name,
      artist,
      img,
    });
    //send message user was created
    return res.status(201).json({
      music,
      status: 201,
      message: "Song was created successfully",
      requestedAt: new Date().toLocaleString(),
    });
  } catch (error) {
    console.log(error);
    //input error
    if (error === "inputError") {
      return res.status(400).json({
        status: 400,
        message: "Invalid Credentials",
        requestAt: new Date().toLocaleString(),
      });
    }
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

// update a song by id
router.put("/:id", async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send({ data: song, message: "Song has been Updated" });
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

// delete song by id
router.delete("/:id", async (req, res) => {
  try {
    await Song.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: "Song has been deleted" });
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

// route for liked song
router.put("/likedsong/:id", [validObjectID, auth], async (req, res) => {
  const song = await Song.findById(req.params.id);
  if (!song) {
    res.status(400).send({ message: "Unable to find Song" });
  }

  console.log(req.body.user_id);
  const user = await User.findById(req.user._id);
  console.log(user);
  const indexOfSong = user.likedSongs.indexOf(song._id);

  let msg = "";
  if (indexOfSong == -1) {
    user.likedSongs.push(song._id);
    msg = "Song as been added to LIKED songs";
  } else {
    user.likedSongs.splice(indexOfSong, 1);
    msg = "Song as been removed from LIKED songs";
  }
  console.log(user);
  await user.save();
  res.status(200).json({
    status: 200,
    message: msg,
    requestAt: new Date().toLocaleString(),
  });
});

// show all the liked songs

router.get("/likedsongs/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const songs = await Song.find({ _id: user.likedSongs });
    res.status(200).send({ data: songs });
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
