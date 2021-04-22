var express = require("express");
const app = require("../app");
var router = express.Router();
var flash = require("connect-flash");
// const { json } = require('body-parser');
const pool = require("../db_connect");

const { check, validationResult, matchedData } = require("express-validator");

router.get("/", function (req, res, next) {
  res.render("admin", {
    message: req.flash("message"),
    errors: "",
    data: "",
    title: "Admin Login",
  });
});
//display login page
router.get("/login", function (req, res, next) {
  // render to views/user/add.ejs
  res.render("admin", {
    title: "Admin Login",
    message: req.flash("message"),
    data: "",
    errors: "",
  });
});
//authenticate user
router.post("/authentication", function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  pool.query(
    "select * from authorise where emailid = ? and apassword = ?",
    [email, password],
    function (err, rows, fields) {
      if (err) throw err;
      // if user not found
      if (rows.length <= 0) {
        req.flash("message", "Please correct enter email/mob and Password!");
        res.redirect("/admin");
      } else {
        req.session.secret = true;
        req.session.email = email;
        res.redirect("/admin/dashboard");
      }
    }
  );
});
//display home page
router.get("/dashboard", function (req, res, next) {
  if (req.session.secret) {
    res.render("dashboard", {
      title: "Dashboard",
      email: req.session.email,
      message: req.flash("message"),
    });
  } else {
    req.flash("message", "Please login first!");
    res.redirect("/admin");
  }
});
// Logout user
router.get("/logout", function (req, res) {
  if (req.session.secret) {
    req.session.destroy();
    // req.flash("message", "Login Again Here");
    res.render("admin", { message: "Logout Successfully..." });
  } else {
    req.flash("message", "Session Expire...");
    res.redirect("/admin");
  }
});
module.exports = router;
