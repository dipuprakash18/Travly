const Listing = require('../models/listing');

module.exports.index = async (req, res) => {
    let { category, search } = req.query;
    let allListings;

    if (search && category) {
        allListings = await Listing.find({
            category: category,
            $or: [
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ]
        });

    } else if (category) {
        allListings = await Listing.find({
            category: category
        });

    } else if (search) {
        allListings = await Listing.find({
            $or: [
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ]
        });

    } else {

        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req,res)=>{
      console.log(req.user);
      res.render('listings/new.ejs');
};

module.exports.showListing = async (req,res)=>{
      let {id} = req.params;
      const listingOne = await Listing.findById(id)
         .populate({
            path: 'reviews',
            populate: {
               path: "author",
            },
         })
         .populate("owner");
      if(!listingOne){
            req.flash("error","Listing you requested does not exist!");
            return res.redirect("/listings");
      }
      console.log(listingOne);
      res.render('listings/show.ejs',{listingOne});
};

module.exports.createListing = async(req,res,next)=>{
      let url = req.file.path;
      let filename = req.file.filename;
      let listing = req.body.listing;
      let listingOne = new Listing(listing);
      console.log(req.user);
      listingOne.owner = req.user._id;
      listingOne.image = {url, filename};
      await listingOne.save();
      req.flash("success","New Listing Created!");
      res.redirect('/listings');
};

module.exports.editListing = async(req,res)=>{
      let {id} = req.params;
      let listingOne = await Listing.findById(id);
      if(!listingOne){
            req.flash("error","Listing you requested does not exist!");
            return res.redirect("/listings");
      }
      let  originalImageUrl = listingOne.image.url;
      originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");

      res.render('listings/edit.ejs',{listingOne,originalImageUrl});
};

module.exports.updateListing = async(req,res) =>{
      let {id} = req.params;
     let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
     
     if(typeof req.file !== "undefined"){
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = {url , filename};
      await listing.save();
     }

     req.flash("success","Listing Updated!");
     res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res) =>{
     let {id} = req.params;
     let deletedListing = await Listing.findByIdAndDelete(id);
     console.log(deletedListing);
     req.flash("success","Listing is deleted!");
     res.redirect('/listings');
};