//require everything
const express = require("express");
const cors = require("cors");
const usersRoute = require("./routes/users");
const songsRoute = require("./routes/songs");
const playlistsRoute = require("./routes/playlists");
const searchRoute = require("./routes/searchs");
const app = express();

//Port to run backend server
// const port = 3001 || process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", (req, res) => {
  res.send("welcome to the server home page");
});

app.use("/users/", usersRoute);
app.use("/songs/", songsRoute);
app.use("/playlist/", playlistsRoute);
// app.use("/", searchRoute);

app.set("port", process.env.PORT || 3001);

app.listen(app.get("port"), () => {
  console.log(`✅ PORT: ${app.get("port")} 🌟`);
});
