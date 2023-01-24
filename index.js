const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./server/db");
const api = require("./server/api");
const app = express();
const apiPort = 8000;
const path = require("path");
const build = path.join(__dirname, "..", "..", "build");

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(build));
app.use(cors());
app.use(express.json());

app.get("/hello", (req, res) => {
  res.send({ express: "Hello From Express" });
});

app.use("/api", api);
app.get("*", (req, res) => {
  res.sendFile(path.join(build, "index.html"));
});
app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));
module.exports = app;
