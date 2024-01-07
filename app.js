if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
} 


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport"); 
const LocalStrategy = require("passport-local"); 
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter  = require("./routes/review.js");
const userRouter  = require("./routes/user.js");

const { Session } = require("inspector");


// const MONGODB_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connecterd to db");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true})); // used to extract the data using express (id)
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate); 
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () =>{
    console.log("error in mongo",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,

    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    },
};



app.get("/listings/filter", (req, res) => {
    res.render("listings/filter.ejs");
});

app.get("/listings/:id/book", (req, res) => { //new
    res.render("listings/book.ejs");
});

app.get("/listings/bookcnf", (req, res) => { //new
    res.render("listings/bookconf.ejs");
});

app.get("/privacy", (req, res) => { //new
    res.render("listings/privacy.ejs");
});
app.get("/terms", (req, res) => { //new
    res.render("listings/terms.ejs");
});



// app.get("/listings/default", (req, res) => {  //////chageeeeeeeeeeee
//     res.render("hii iam the root");
// });

// app.get("/listings/default", (req, res, next) => {
//     next(new ExpressError(404, "page not found!"));
// });
 

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next ) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


// app.get("/demouser", async(req, res) => {
//     let fakeuser = new User({
//         email: "nithin@gmail.com",
//         username: "nithin3"
//     });

//     let registeredUser  = await User.register(fakeuser, "helloo");
//     res.send(registeredUser); 
// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get("/listings/:id/edit", (req, res)=>{
    res.redirect("/listings/:id/edit");
});







app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found!"));
});


app.use((err, req, res, next) => {
    let {statusCode = 500, message = "something went wrong! "} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
});

// app.use((err, req, res, next) => {
//     res.send("something went wrong");
// });

app.listen(8085, () => {
    console.log("listenig");
});