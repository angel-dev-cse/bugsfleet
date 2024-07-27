const express = require("express");
const app = express();

// load the env variables
const dotenv = require("dotenv");
dotenv.config();

const cookieParser = require("cookie-parser");

// connect to mongoDB
const connectDB = require("./utils/dbConnection");
connectDB();

const PORT = process.env.PORT || 5000;

const playerRouter = require("./routes/playerRoute");
const bugsRouter = require("./routes/bugRoute");
const gameRouter = require("./routes/gameRoute");

app.use(express.json());
app.use(cookieParser());
app.use("/api/players", playerRouter);
app.use("/api/bugs", bugsRouter);
app.use("/api/game", gameRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

