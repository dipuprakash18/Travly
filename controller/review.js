const Listing = require('../models/listing');
const Review = require('../models/review');

module.exports.postReview = async(req,res) => {
    let {id} = req.params;
    let listingOne = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listingOne.reviews.push(newReview);

    await newReview.save();
    await listingOne.save();
    console.log('Review is add.')
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req,res) =>{
    let {id, reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};