require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3500;

//connect to mongoDB function
connectDB();

//custom middleware
app.use(logger);

//built-in middleware
app.use(express.json());

//third-party middleware
app.use(cors(corsOptions));

//use cookieParser
app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", require("./routes/root"));
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html"))
    res.sendFile(path.join(__dirname, "views", "404.html"));
  else if (req.accepts("json")) res.json({ message: "404 not found" });
  else res.type("txt").send("404 not Found");
});

//using errorhandler middleware
app.use(errorHandler);

//mongoDB connecting
mongoose.connection.once("open", () => {
  console.log("MongoDB connection established.");
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
});

//if there is connecting problem while connecting MongoDB
mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
