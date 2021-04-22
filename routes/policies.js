var express = require("express");
var router = express.Router();
var pool = require("../db_connect");
var upload = require("./multer");
var flash = require("connect-flash");
const { check, validationResult, matchedData } = require("express-validator");
/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.session.secret) {
    res.render("PoliciesInterface", {
      title: "Policies Interface",
      message: req.flash("message"),
      errors: "",
      data: "",
    });
  } else {
    req.flash("message", "Please login first!");
    res.redirect("/admin");
  }
});
router.post(
  "/addpolicies",
  upload.single("picon"),
  [
    check("pname")
      .notEmpty()
      .withMessage("Policies Name should not be blank")
      .matches(/^[a-zA-Z]*$/)
      .withMessage("Only Characters and white space are not allowed"),
  ],
  [
    check("porg")
      .notEmpty()
      .withMessage("Organization should not be blank")
      .matches(/^[a-zA-Z]*$/)
      .withMessage("Only Characters and white space are not allowed"),
  ],
  [
    check("pweblink")
      .notEmpty()
      .withMessage("Website Link should not be blank")
      .matches(
        "((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)"
      )
      .withMessage("Example for https://www.google.com/"),
  ],
  [
    check("pvideolink")
      .notEmpty()
      .withMessage("Video Link should not be blank")
      .matches(
        "((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)"
      )
      .withMessage("Example for https://www.google.com/"),
  ],
  [check("pdesc").notEmpty().withMessage("Description should not be blank")],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("PoliciesInterface", {
        data: req.body,
        errors: errors.mapped(),
        message: "",
        title: "",
      });
    }
    if (req.session.secret) {
      sql =
        "insert into policies(policiesname,policiesbyorg,policiesweblink,policiesvideolink,policiesicon,policiesdescription)values('" +
        req.body.pname +
        "','" +
        req.body.porg +
        "','" +
        req.body.pweblink +
        "','" +
        req.body.pvideolink +
        "','" +
        req.file.originalname +
        "','" +
        req.body.pdesc +
        "')";
      pool.query(sql, function (error, result) {
        if (error) {
          //console.log(error);
          res.status(500).json([]);
        } else {
          console.log(sql);
          req.flash("message", "Registration Successfully");
          res.redirect("/policies");
        }
      });
    } else {
      req.flash("message", "Please login first!");
      res.redirect("/admin");
    }
  }
);

router.get("/policiesdisplay", function (req, res, next) {
  if (req.session.secret) {
    pool.query("select * from policies", function (error, result) {
      if (error) {
        res.render("policiesdisplay", {
          data: [],
        });
      } else {
        res.render("policiesdisplay", {
          data: result,
          message: req.flash("message"),
        });
      }
    });
  } else {
    req.flash("message", "Please login first!");
    res.redirect("/admin");
  }
});

router.get("/policiesupdatedelete", function (req, res, next) {
  if (req.session.secret) {
    pool.getConnection(function (err) {
      sql = "select * from policies where policies_id=" + req.query.pid + "";
      pool.query(sql, function (error, result) {
        if (error) {
          res.render("policiesupdatedelete", {
            data: [],
            message: "Record Not Found...",
          });
        } else {
          res.render("policiesupdatedelete", {
            data: result,
            message: "",
          });
        }
      });
    });
  } else {
    req.flash("message", "Please login first!");
    res.redirect("/admin");
  }
});

router.post("/policiesupdesubmit", function (req, res, next) {
  if (req.session.secret) {
    if (req.body.btn == "Edit") {
      sql =
        "update policies set policiesname='" +
        req.body.pname +
        "',policiesbyorg='" +
        req.body.porg +
        "',policiesweblink='" +
        req.body.pweblink +
        "',policiesvideolink='" +
        req.body.pvideolink +
        "',policiesdescription='" +
        req.body.pdesc +
        "' where policies_id='" +
        req.body.pid +
        "'";
      pool.query(sql, function (error, result) {
        if (error) {
          res.status(500).json([]);
        } else {
          req.flash(
            "message",
            "ID: " + req.body.pid + " Record Update Successfully"
          );
          res.redirect("/policies/policiesdisplay");
        }
      });
    } else {
      var sql = "delete from policies where policies_id=" + req.body.pid + "";
      pool.query(sql, function (err, result) {
        req.flash(
          "message",
          "ID: " + req.body.pid + " Record Delete Successfully"
        );
        res.redirect("/policies/policiesdisplay");
      });
    }
  } else {
    req.flash("message", "Please login first!");
    res.redirect("/admin");
  }
});

router.get("/displaypicture", function (req, res, next) {
  if (req.session.secret) {
    sql = "select * from policies where policies_id=?";
    pool.query(sql, [req.query.pid], function (error, result) {
      if (error) {
        res.render("policieseditpicture", {
          data: [],
        });
      } else {
        res.render("policieseditpicture", {
          data: result,
        });
      }
    });
  } else {
    req.flash("message", "Please login first!");
    res.redirect("/admin");
  }
});
router.post(
  "/editpicture",
  upload.single("picture"),
  function (req, res, next) {
    pool.query(
      "update policies set policiesicon=? where policies_id=?",
      [req.file.originalname, req.body.pid],
      function (error, result) {
        if (error) {
          res.redirect("/policies/policiesdisplay");
        } else {
          res.redirect("/policies/policiesdisplay");
        }
      }
    );
  }
);




//// For App..

router.get('/displayPolicies',function(req,res){
  pool.query('select * from policies',function(err,result){
    if(err)
    {
      return res.status(400).json([])
    }
    else
    {
      return res.status(200).json(result)
    }
  })
})


module.exports = router;
