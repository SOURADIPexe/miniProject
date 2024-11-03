const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const Customer = require("../models/customers.js");
const { Redirect } = require("twilio/lib/twiml/VoiceResponse.js");
const accountSid = "AC3faf10aa9c05c4ac70e7e7616ed30c89"
const authToken = "0e255e85a8942d3a47e25fce4051bf27"
const client = require('twilio')(accountSid, authToken);

let otp = "";
function generateOtp(){
  otp = "";
  let digits = "0123456789"
  for(let i=0; i<4; i++){
    otp += digits[Math.floor(Math.random()*10)]
  }

  client.messages
  .create({
    body: `Your One Time Password is ${otp}. Valid for 2 minutes. Please do not share the OTP. --The Grand Eclat`,
    from: '+14066620709',
    to: '+917086552655', // Text your number
  })
  .then((message) => console.log(message.sid))
}


// Landing Page
router.get("/home", ((req, res) => {
  res.render("home.ejs");
}));

// Login Page
router.get("/login", ((req, res) => {
  res.render("login.ejs");
}));

// Sign up Page
router.get("/signup", ((req, res) => {
  res.render("signUp.ejs");
}));

router.get("/login3", ((req, res) => {
  res.render("login3.ejs");
}));

router.post("/login",  passport.authenticate("local", {failureRedirect : "/login", failureFlash : true}),
  wrapAsync( async (req, res) => {
    let user = await Customer.findOne({contactNo : req.body.username})
    req.session.userId = user._id;
    req.flash("success", "Login Successfull")
    res.redirect("/menu")

}));

router.post("/signup", ((req, res) => {
    req.session.name = req.body.name,
    req.session.contactNo = "91" + req.body.contactNo
    res.redirect("/auth-otp")
  }
));

router.get("/auth-otp", (req, res) =>{
  generateOtp();
  res.render("otp_auth.ejs")
})

router.post("/auth-otp", async (req, res) =>{
  console.log(req.body);
  console.log(otp);
  
  try{
    if(otp == req.body.otp){
      let newCustomer = new Customer({
        name : req.session.name,
        username : req.session.contactNo,
        contactNo : req.session.contactNo
      })
      let registeredUser = await Customer.register(newCustomer, req.body.password)
      let user = await Customer.findOne({contactNo : req.session.contactNo})
      req.login(registeredUser, async (err) => {
        if(err){
          return next(err);
        }
        console.log(user);
        req.session.userId = user._id;
        res.redirect("/menu")
      })
    }else{
      req.flash("error", "Incorrect OTP. Please try again.")
      res.redirect("/auth-otp")
    }
  }catch(err){
    req.flash("error", err.message);
    res.redirect("/Signup")
  }
})

// Table Booking Page
router.get("/booking", ((req, res) => {
  res.render("booking.ejs");
}));

// Rating Page
router.get("/ratings", ((req, res) => {
  res.render("ratings.ejs");
}));

module.exports = router;