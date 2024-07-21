const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const csrf = require("csurf");
const errorController = require("./controllers/error");
const User = require("./models/user");
const flash = require("connect-flash");
const encodedPassword = encodeURIComponent("0712");
const MONGODB_URI = `mongodb+srv://sycung9001:0712@cluster0.gkwkpjj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

const csurfProtection = csrf();

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  User.findById("5bab316ce0a7c75f783cb8a8")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});
app.use(csurfProtection);
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(flash());

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(3000);
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.log("Error connecting to the database:", err);
  });