const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./utils/dbConnection");
connectDB();

const PORT = process.env.PORT || 5000;

const playerRouter = require("./routes/players");
const bugsRouter = require("./routes/bugs");

app.use(express.json());
app.use("/api/players", playerRouter);
app.use("/api/bugs", bugsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
