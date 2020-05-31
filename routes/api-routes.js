// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================
require('dotenv').config();
const passport = require('passport');
const db = require("../models")
const axios = require("axios")

// Routes
// =============================================================
module.exports = function (app) {

  // Get all Categorys
  app.get("/api/category/all", function (req, res) {

    // Finding all Categorys, and then returning them to the user as JSON.
    // Sequelize queries are asynchronous, which helps with perceived speed.
    // If we want something to be guaranteed to happen after the query, we'll use
    // the .then function
    Category.findAll({}).then(function (results) {
      // results are available to us inside the .then
      res.json(results);
    });

  });


  // Add a Category
  app.post("/api/category/new", function (req, res) {

    console.log("Category Data:");
    console.log(req.body);

    Category.create({
      name: req.body.name,
      color: req.body.color,
      created_at: req.body.created_at
    }).then(function (results) {
      // `results` here would be the newly created Category
      res.end();
    });

  });


  //=================== Authentication ==============================//
  app.get("/auth/facebook/",passport.authenticate('facebook'))

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }), function (req, res) {
      console.log("in the /auth/facebook/callback route")
      res.redirect('/members');
    });


  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function (req, res) {
    console.log({req})
    db.User.findOne({where: { email: req.body.email }})
    .then(function (existingUser) {
      if (existingUser === null){
        console.log(req.body)
        db.User.create(req.body)
          .then(function () {
            res.redirect(307, "/api/login");
          })
          .catch(function (err) {
            //the error returned from sequalize is a big object so need to get the actual error message
            res.status(401).json(err.errors[0].message);
          });
      } else {
        res.status(401).json('There is already a user with this email address')
      } 
    })
    .catch(function (err) {
      //the error returned from sequalize is a big object so need to get the actual error message
      res.status(401).json(err.errors[0].message);
    });

    
  });

  // Route for logging user out
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    console.log("user_data api")
    console.log(req.user)
    if (!req.user) {
      console.log("no req.user object")
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      db.User.findOne({where: { id: req.user.id, }})
      .then((user) => {
        console.log(user)
        res.json(user)
      })
      .catch((error) => res.status(500).json(error))
    }
  });
};