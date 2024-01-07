const express = require('express');
const router = express.Router(); 
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });


router 
    .route("/")
    .get(wrapAsync(listingController.index) )
    .post(
         isLoggedIn,
          upload.single('listing[image]'),
          validateListing, 
          
    wrapAsync(listingController.createListing)
    );

   

    // 3.1 New route
router.get("/new", isLoggedIn, listingController.renderNewForm );

// search option 
router.get("/search/:name", listingController.searchByName);

router 
        .route("/:id")
        .get( wrapAsync(listingController.showListings))
        .put( 
            isLoggedIn, 
            isOwner,
            upload.single('listing[image]'), 
            validateListing, 
            wrapAsync(listingController.updateListing))

        .delete( isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));



 router.get("/:id/edit",  isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


// 1 index route (to display all the tittles of the data )
// router.get(
//     "/",
//      wrapAsync(listingController.index)
// );


// 2 show route 
// router.get("/:id", wrapAsync(listingController.showListings));



// // 3.2 create route (it will be in index file)
// router.post("/",  isLoggedIn, validateListing, 
//     wrapAsync(listingController.createListing));



// 4.1 edit route 




// 4.2 update route
// router.put("/:id",  isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));



// 5 delete route
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));



module.exports = router;