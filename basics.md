## Form validations
* when we enter data in the browser and\or the web server will check to see that the data is in the correct formate and within the constraints set by the application.


* we mark required the some items .
* brower ka default validations ko hatane ke liye --> `novalidate`
* new style ko apply karne ke liye --> `class="needs-validation"`
& `public/js/script` me js ka code paste .
and boilerplate me add -->  <script src="/js/script.js"></script>


## sucess & Failure

* Success  --> display msg when success
we add <div class="valid-feedback">title looks good. </div>

* Failure
<div class="invalid-feedback">Title should be valid.</div>


## npm i joi 
for schema validation .

const joi = require("joi");

module.exports.listingSchema = joi.object({
      listing : joi.object({
         title : joi.string().required(),
         description : joi.string().required(),
         price : joi.number().required().min(0),
         location : joi.string().required(),
         country : joi.string().required(),
         image : joi.string().allow("",null)
      }).required()
});

-------------------------------------------------------------
## project phase - 2

--------------------

Validation for Reviews 
1) Client side --> we marked the required things in form , by which user not submit empty data 

2) Server side --> 
  Steps:
  * Joi Schema
  * Schema validate function
  * function pass as a middleware 

  1) Joi Schema
const joi = require("joi");

module.exports.listingSchema = joi.object({
      listing : joi.object({
         title : joi.string().required(),
         description : joi.string().required(),
         price : joi.number().required().min(0),
         location : joi.string().required(),
         country : joi.string().required(),
         image : joi.string().allow("",null)
      }).required()
});
   2) Schema validate function
   const validateListing = (req, res, next) =>{
      let { error } = listingSchema.validate(req.body);
      if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg );
      }else{
            next();
      }
};
   
   3) function pass as a middleware
   //Create Route
app.post("/listings", validateListing, wrapAsync(async(req,res,next)=>{
let listing = req.body.listing;
let listingOne = new Listing(listing);
await listingOne.save();
res.redirect('/listings');
}));


## Deleting Reviews
--> delete review from listing ke inside reviews object ka review.

Mongo $pull operator 

* $pull 
The $pull operator removes from an existing array all instances of a value of values that match a specific condition.

Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});

* when we delete the listing then for deletion all reviews from from Review data bases we used post .

listingSchema.post("findOneAndDelete", async(listing)=>{
      if(listing){
          await Review.deleteMany({_id: {$in:listing.reviews}});
      }
      
});

## Express Router

* Express Routers are a way to organize your Express application such that our primary app.js file does not become bloated.

`const router = express.Router() ` // creates new  route object 

* Restructuring Listings

`app.use("/listings",listings);`

* Restructure Reviews 

`app.use("/listings/:id/reviews",reviews);`
`router = express.Router({mergeParams: true});`

* Cookies
Web Cookies 

HTTP cookies are small blocks of data created by a web serever while a user is browsing a website and placed on the user's computer or other decice by the user's web browser.

# Cookie Parser
* cookie-parser package
npm i cookie-parse
const cookieParse = require("cookie-parse");
app.use(cookieParser());

# Signed Cookies
Send Signed Cookie
--> this is used to check the cookies tempering.

app.use(cookieParser("secretcode"));

app.get("/getsignedcookie",(req,res)=>{
      res.cookie("made-in","India", {signed: true});
      res.send("signed cookie sent");
});

app.get("/verify",(req,res)=>{
      console.log(req.signedCookies);
      res.send("verified");
});

# What is State
* Stateful protocol
Stateful Protocol require server to save the status and session to save the status and session information.
eg. ftp
* Stateless Protocol
Stateless Protocol does not required the server to retain the server information or 
eg. http

## Express Sessions
* An attempt to make our session stateful

app.use(
   session({
      secret: "mysupersecretstring",
      resave: false,
      saveUninitialized: true,
   })
);

app.get("/reqcount",(req,res) =>{
      if(req.session.count){
            req.session.count++;
      }else{
            req.session.count = 1;
      }
      res.send(`you sent a request ${req.session.count} times`);
});

* Storing & Using info
app.get("/register", (req,res) =>{
      let {name = "anonymous"} = req.query;
      req.session.name = name;
      res.redirect('/hello');
});

app.get("/hello", (req,res) =>{
      res.send(`hello, ${req.session.name}`);
});

* Connect - flash
The flash is a special area of the session used for storing message. Messages are written to the flash and cleared after begin display to the user.

const flash = require('connect-flash');
app.use(flash());
app.get("/register", (req,res) =>{
      let {name = "anonymous"} = req.query;
      req.session.name = name;
      req.flash("success",'user registration  successfull');
      res.redirect('/hello');
});

app.get("/hello", (req,res) =>{
      res.render('page.ejs',{name : req.session.name, msg : req.flash('success')});
});

* res.local
app.use((req,res,next)=>{
     res.locals.successMsg = req.flash("success");
     res.locals.errorMsg = req.flash("error");
     next();
});


# Using Sessions
* Adding Cookie Options
steps:
1) npm i express-session

2) const sessionOption = {
      secret: "mysupersecretcode",
      resave: false,
      saveUninitialized: true,
     cookie: {
      expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge:  7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
     },
};

3) app.use(session(sessionOption));

# Using Flash
Steps:
1) npm i connect-flash

2) app.use(flash());
* Note : it come before the routes  app.use("/listings",listings);

3) app.use((req,res,next) =>{
      res.locals.success = req.flash("success");
      next();
});

4) in listing 
//Create Route
router.post("/", validateListing, wrapAsync(async(req,res,next)=>{
let listing = req.body.listing;
let listingOne = new Listing(listing);
await listingOne.save();
req.flash("success","New Listing Created!");
res.redirect('/listings');
}));

5) in index.ejs
<%= success %>

* Success partial


## Authentication V_S Authorization

* Authentication
Authentication is the process of verifying who someone is.

* Authorization
Authorization is the process of verifying what specific applications, files, and data a user has access to.


* Storing Passwords

We NEVER store the passwords as it is. We store their hashed form.

password
“helloworld”
        ↓
+------------------+
|     Hashing      |
|     Function     |
+------------------+
        ↓
how it is stored

“936a185caaa266bb9cbe981e905cb78cd732b0b3280
eb94412bb6f8f8f07af”

### Hashing
* What we need to know?

* For every input, there is a fixed output.
* They are one-way functions; we can't get the input from the output.
* For a different input, there is a different output but of the same length.
* Small changes in the input should bring large changes in the output.

## Salting

Password salting is a technique to protect passwords stored in databases by adding a string of 32 or more characters and then hashing them.

password = abc
salt = @!?
abc@!? ---> hashed form

# Passport

npm i passport
npm i passport-local
npm i passport-local-mongoose

## User Model
`user: username, password, email`

* You're free to define your User however you like. Passport-Local Mongoose will add a username, hash, and salt field to store the username, the hashed password, and the salt value.

* Additionally, Passport-Local Mongoose adds some methods to your schema.

## Configuring Strategy

`passport.initialize()`
A middle that initializes passport.

`passport.session()`
A web application needs the ability ti identify users as they browser as they browser from page . this series of requests and responses , each associated with the same user , is known as a session.

`passport.use(new localStrtegy(User.authenticate()))`

steps : 
const passport = require("passport");
const localStrategy = require("passport-local-mongoose");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(user.deserializeUser());

## Demo User

app.get("/demouser", async(req,res)=>{
      let fakeUser = new User({
            email : "dipuprakash@gamil.com",
            username : "dipu"
      });
      let registeredUser = await User.register(fakeUser,"helloworld");
      res.send(registeredUser);
});

## SingUp User
GET /signup
--> to render the 
POST /signup

## Connecting Login Route

How to check if User is logged in ?

req.isAuthenticate() // Passport method
---> check user is login or not 

module.exports.isLoggedIn = ((req,res,next)=> {
      if(!req.isAuthenticated()){
            req.flash("error","you should be logged in !");
            return res.redirect("/login");
      }
      next();
      
});

## Logout User 
--> passport ke pass req.logout method hota hai jo user ko automatically logout kar deta hai.

GET /logout  

router.get("/logout",(req,res)=>{
      req.logout((err) => {
          if(err){
            return next(err);
          }
          req.flash("success","logged you out!");
          res.redirect("/listings");
      });
});


## Add Styling 
---> add signup , login , logout .
<div class="navbar-nav ms-auto">
        <% if(!currUser){ %>
          <a class="nav-link " href="/signup">Sign up</a>
          <a class="nav-link" href="/login">Log in</a>
        <% } %>
        <% if(currUser){ %>
         <a class="nav-link" href="/logout">log out</a>
        <% } %>
</div>        

## Login after SignUp

Passport's login method  automatically establishes a login session.
we can invoke login to automatically login a user.


--> passport ke pass req.login method hota hai jo user ko automatically login kar deta hai.

req.login(registerUser,(err) =>{
                  if(err){
                      return next(err);
                  }
                  req.flash('success',"Welcome to Wanderlust!");
                  res.redirect("/listings")
});

## post-login Page 
add new listing --> login page ---> add new listing page .
* save redirect path.

## Listing Owner
---> each every listing have owner which is created it .

## Starting with Authorization 
---> set limit , such as delete and edit only done by owner of which create the listing .

## Setting Authorization 
* For Listings
-> control setup on delete , edit , update on listings.

* For Reviews
--> control setup on delete , edit , update on reviews.

