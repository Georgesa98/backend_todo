require("express-async-errors");
require("dotenv").config();
const express = require("express");
const { logger } = require("./middleware/logger.js");
const { errorHandler } = require("./middleware/errorHandler.js");
const { connectDB } = require("./config/dbConnect.js");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions.js");
const cors = require("cors");
const serverless = require("serverless-http");
const router = express.Router();
const bodyParser = require("body-parser");
const PORT = 3500;
connectDB();

const app = express();
app.use(logger);

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

// app.use("/", express.static(path.join(__dirname, "public"))); // Uncomment this if you want to use css files for html in "Views"
app.use(bodyParser.json());
app.use("/.netlify/functions/server", require("./routes/root.js"), router);
app.use(
  "/.netlify/functions/server/auth",
  require("./routes/authRoutes.js"),
  router
);
app.use(
  "/.netlify/functions/server/users",
  require("./routes/userRoutes.js"),
  router
);
app.use(
  "/.netlify/functions/server/todos",
  require("./routes/todoRoutes.js"),
  router
);

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});
mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${(err, hostname)}`,
    "mongoErrLog.log"
  );
});
module.exports = app;
module.exports.handler = serverless(app);
