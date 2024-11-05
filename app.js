const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const { error } = require("console");
const cookieParser = require('cookie-parser');
const session = require('express-session')
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/customers.js")
const defaultPassword = "QW79ASPO"
const flash = require("connect-flash")


// Importing routes
const cart = require("./routes/cart.js");
const dashboard = require("./routes/dashboard.js");
const menu = require("./routes/menu.js");
const profile = require("./routes/profile.js");
const landing = require("./routes/landing.js");
const order = require("./routes/order.js");
const dashboardApi = require("./routes/dashboardApi.js")
// const payment = require("./routes/paymentGateway.js")

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser())

const sessionOptions ={
  secret : "VK1880",
  resave : false,
  saveUninitialized : true,
  cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true
  }
}

app.use(session(sessionOptions))
app.use(flash())
app.use((req, res, next) => {
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  next();
})

// passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const port = 8080;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

main()
  .then((res) => {
    console.log("connection successful");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/restaurent");
}

app.get("/demoUser", async (req, res) => { 
  let fakeUser = {
    name : "Ranadip Das",
    username : "9957416364",
    contactNo : 9957416364
  }

  let regUser = await User.register(fakeUser, defaultPassword);
  res.send(regUser);

});

app.get

// Routing
app.use("/", landing)
app.use("/cart", cart);
app.use("/dashboard", dashboard);
app.use("/menu", menu);
app.use("/profile", profile);
app.use("/order", order)
app.use("/getDashboardData", dashboardApi)
// app.use("/payment", payment)

// Middlewares
app.use((err, req, res, next) => {
  let { status = 500, message = "some error" } = err;
  res.status(status).send(message);
});