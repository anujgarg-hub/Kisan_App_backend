var express = require("express");
const app = require("../app");
var router = express.Router();
var flash = require("connect-flash");
// const { json } = require('body-parser');
const pool = require("../db_connect");
const upload = require("./multer");

const { check, validationResult, matchedData } = require("express-validator");

router.get("/", function (req, res, next) {
  res.render("admin", {
    message: req.flash("message"),
    errors: "",
    data: "",
    title: "Kissan Login",
  });
});

// Registration
router.post(
  "/addnewkissan",
  upload.single("picture"),
  [
    check("ctype")
      .notEmpty()
      .withMessage("Crop should not be blank")
      .matches(/^[a-zA-Z]*$/)
      .withMessage("Only Characters and white space are not allowed"),
  ],
  [
    check("cname")
      .notEmpty()
      .withMessage("should not be blank")
      .matches(/^[a-zA-Z]*$/)
      .withMessage("Only Characters and white space are not allowed"),
  ],
  [check("fmonth").notEmpty().withMessage("should not be blank")],
  [check("tmonth").notEmpty().withMessage("should not be blank")],
  [check("cdesc").notEmpty().withMessage("Description should not be blank")],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("CropInterface", {
        data: req.body,
        errors: errors.mapped(),
        message: "",
        title: "",
      });
    }
    sql =
      "insert into kissan(name,fname,mobileno,emailid,state,city,password,address)values('" +
      req.body.name +
      "','" +
      req.body.fname +
      "','" +
      req.body.mobileno +
      "','" +
      req.body.emailid +
      "','" +
      req.body.state +
      "','" +
      req.body.city +
      "','" +
      req.file.originalname +
      "','" +
      req.body.password +
      "','" +
      req.body.address +
      "')";
    pool.query(sql, function (error, result) {
      if (error) {
        //console.log(error);
        res.status(500).json([]);
      } else {
        console.log(sql);
        req.flash("message", "Record Submitted Successfully");
        res.redirect("/kissan");
      }
    });
  }
);

//display login page
router.get("/login", function (req, res, next) {
  // render to views/user/add.ejs
  res.render("kissan", {
    title: "Kissan Login",
    message: req.flash("message"),
    data: "",
    errors: "",
  });
});
//authenticate user
router.post("/authentication", function (req, res, next) {
  var kissanid = req.body.kissanid;
  var password = req.body.password;
  pool.query(
    "select * from kissan where kissanid = ? and password = ?",
    [kissanid, password],
    function (err, rows, fields) {
      if (err) throw err;
      // if user not found
      if (rows.length <= 0) {
        req.flash("message", "Please correct enter kissan-id and Password!");
        res.redirect("/kissan");
      } else {
        req.session.secret = true;
        req.session.email = email;
        res.redirect("/kissan/dashboard");
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
    res.redirect("/kissan");
  }
});
// Logout user
router.get("/logout", function (req, res) {
  if (req.session.secret) {
    req.session.destroy();
    // req.flash("message", "Login Again Here");
    res.render("kissan", { message: "Logout Successfully..." });
  } else {
    req.flash("message", "Session Expire...");
    res.redirect("/kissan");
  }
});

/////17/04/2021

router.post("/addKisan",upload.single("picture"),function(req, res){
  console.log(req.body)
  // console.log('req.file',req.file.originalname)
  pool.query('insert into kissan(name,fname,mobileno,emailid,state,city,password,address) values(?,?,?,?,?,?,?,?)',[req.body.name,req.body.fname,req.body.mobileno,req.body.emailid,req.body.state,req.body.city,req.body.password,req.body.address],(err,result)=>{
    // console.log('bodddyyy',req.body);
    // console.log('file',req.file);
    
    if(err)
    {
      console.log(err)
      return res.status(400).json([]);
    }
    else
    {
      return res.status(200).json(result);

    }
  })
})


/// Log in

router.post('/login',function(req,res){
  console.log(req.body)
  pool.query('select * from kissan where mobileno=? and password=?',[req.body.mobile,req.body.password],function(err,reslt){
    if(err)
    {
      console.log('errorr',err)
      return res.status(400).json([])
    }
    else
    {
      if(reslt.length==1)
      {
        return res.status(200).json({status:true,reslt:reslt})
      }
      else
      {
        return res.status(401).json({status:false,reslt:[]})

      }
    }
  })
})



router.post('/displayProfile',function(req,res){
  console.log(req.body)
  pool.query('select * from kissan where kissanid=?',[req.body.kissanid],function(err,result){
    if(err)
    {
      console.log('errorr',err)
      return res.status(400).json([])
    }
    else
    {
       return res.status(200).json(result)
    }
    
  })
})




module.exports = router;
