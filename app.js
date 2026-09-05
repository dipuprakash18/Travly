if(process.env.NODE_ENV != "production"){
     require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// const dburl = process.env.ATLASDB_URL;
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");    // new 
const session = require('express-session');
const {MongoStore} = require('connect-mongo');
const ExpressError = require("./utils/ExpressError.js");
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routers/listings.js");
const reviewRouter = require("./routers/review.js");
const userRouter = require("./routers/user.js")

app.engine('ejs', ejsMate);
app.use(methodOverride("_method"));
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,'/public')));

const dburl = process.env.ATLASDB_URL;

if (!dburl) {
    throw new Error("ATLASDB_URL is not defined");
}

if (!process.env.SECRET) {
    throw new Error("SECRET is not defined");
}

async function main() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(dburl);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

main();

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});
store.on("error", (err)=>{
   console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOption = {
      store,
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true,
     cookie: {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
      }
};

app.get('/',(req,res)=>{
      res.render("/listings");
});


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
      res.locals.success = req.flash("success");
      res.locals.error = req.flash("error");
      res.locals.currUser = req.user;
      next();
});

// app.get("/demouser", async(req,res)=>{
//       let fakeUser = new User({
//             email : "dipuprakash@gamil.com",
//             username : "dipu"
//       });
//       let registeredUser = await User.register(fakeUser,"helloworld");
//       res.send(registeredUser);
// });

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all('/{*splat}', (req, res, next) => {
      next(new ExpressError(404, "Page Not Found!!"));
});

app.use((err,req,res,next) =>{
     let{statusCode=500, message="Something went wrong!!"} = err;

     res.status(statusCode).render('listings/error.ejs',{message});
});

module.exports = app;