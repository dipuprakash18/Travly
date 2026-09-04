const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const {isOwner,isLoggedIn,validateListing} = require("../middleware.js");
const listingController = require("../controller/listings.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

router
   .route("/")
   .get(wrapAsync(listingController.index))
   .post(
      isLoggedIn,
      validateListing, 
      upload.single("listing[image]"),
      wrapAsync(listingController.createListing)
);

// router.get("/listings", async(req,res)=>{
//       let {search} = req.query;
//       let allListings;
//       if(search){
//           allListings = await Listing.find({
//             $or: [
//             { location: { $regex: search, $options: "i" } },
//             { country: { $regex: search, $options: "i" } }
//             ]
//           }); 
//       }else{
//           allListings = await Listing.find({});
//       }
//       res.render("listings/indes.ejs",{allListings});
// })


// New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router
     .route("/:id")
     .get(wrapAsync(listingController.showListing))
     .put(
      isLoggedIn,
      isOwner,
      upload.single("listing[image]"),
      validateListing,
      wrapAsync(listingController.updateListing)
     )
     .delete(
      isLoggedIn, 
      isOwner,
      wrapAsync(listingController.destroyListing));

// Edit Route
router.get(
      '/:id/edit',
      isLoggedIn, 
      isOwner,
      wrapAsync(listingController.editListing)
);



module.exports = router;