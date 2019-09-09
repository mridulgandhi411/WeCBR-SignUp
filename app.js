//jshint esversion:6

const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose= require("mongoose");
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const session = require("express-session");
const passport=require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app=express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret : "This is mah secret",
  resave : false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/cbrDB",{useNewUrlParser : true});

const cbrSchema = new mongoose.Schema({
  firstName : String,
  lastName : String,
  email : String,
  userName : String,
  password : String
});

cbrSchema.plugin(passportLocalMongoose);

const CBR = new mongoose.model("CBR",cbrSchema);


passport.use(CBR.createStrategy());

passport.serializeUser(CBR.serializeUser());
passport.deserializeUser(CBR.deserializeUser());


app.get("/",function(req,res){
  res.render("register");
});

app.get("/home",function(req,res){
  if(req.isAuthenticated) {
    res.render("home");
  } else {
    res.redirect("/login");
  }
});

app.get("/login",function(req,res){
     res.render("login");
});


app.post("/",function(req,res){
  if(req.body.password === req.body.confirmPassword) {
    CBR.register({username : req.body.userName},req.body.password,function(err){
      if(err) {
        console.log(err);
        res.redirect("/");
      } else {
        passport.authenticate("local")(req,res,function() {
                 res.redirect("/home");
        });
      }
    });
  } else {
    console.log("Password Mismatch");
    res.redirect("/");
  }

});






app.listen(3000,function(){
  console.log("Server started on port 3000");
});
