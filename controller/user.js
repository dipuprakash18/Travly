const User = require('../models/user');

module.exports.renderSignup = (req,res)=>{
     res.render("users/signup.ejs");
};

module.exports.signup = async(req,res)=>{
      try{
            let {username, email, password} = req.body;
            const  newUser = new User({email, username});
            const registerUser = await User.register(newUser,password);
            console.log(registerUser);
            req.login(registerUser,(err) =>{
                  if(err){
                      return next(err);
                  }
                  req.flash('success',"Welcome to Veyora!");
                  res.redirect("/listings")
            });
      } catch(e){
            req.flash("error", e.message);
            res.redirect("/signup");
      }
};

module.exports.renderLogin = (req,res)=>{
      res.render("users/login.ejs");
};

module.exports.logout = (req,res)=>{
      req.logout((err) => {
          if(err){
            return next(err);
          }
          req.flash("success","logged you out!");
          res.redirect("/listings");
      });
};

module.exports.login = async(req,res) =>{
       req.flash("success","welcome to Veyora!");
       let redirectUrl = res.locals.redirectUrl || "/listings";
       res.redirect(redirectUrl);   // we not use req.session.redirectUrl  --> b/c when passport.authenticate  call then it delete the req.session.redircetUrl
};