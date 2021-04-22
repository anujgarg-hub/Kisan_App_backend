var express = require("express");
var router = express.Router();
var pool = require("../db_connect");
var upload = require("./multer");
var flash = require("connect-flash");
const { check, validationResult, matchedData } = require("express-validator");
/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.session.secret) {
    res.render("CropInterface", {
      title: "Crop Interface",
      message: req.flash("message"),
      data: "",
      errors: "",
    });
  } else {
    req.flash("message", "Please login first!");
    res.redirect("/admin");
  }
});
router.post(
  "/addnewcrop",
  upload.single("image"),
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
      "insert into crop(croptype,cropname,cropdesc,from_month,to_month,states,image)values('" +
      req.body.ctype +
      "','" +
      req.body.cname +
      "','" +
      req.body.cdesc +
      "','" +
      req.body.fmonth +
      "','" +
      req.body.tmonth +
      "','" +
      req.body.states +
      "','" +
      req.file.originalname +
      "')";
    pool.query(sql, function (error, result) {
      if (error) {
        //console.log(error);
        res.status(500).json([]);
      } else {
        console.log(sql);
        req.flash("message", "Record Submitted Successfully");
        res.redirect("/crop");
      }
    });
  }
);

router.get("/cropdisplay", function (req, res, next) {
  if (req.session.secret) {
    pool.query("select * from crop", function (error, result) {
      if (error) {
        res.render("cropdisplay", {
          data: [],
        });
      } else {
        res.render("cropdisplay", {
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

router.get("/cropupdatedelete", function (req, res, next) {
  if (req.session.secret) {
    pool.getConnection(function (err) {
      sql = "select * from crop where cropid=" + req.query.cropid + "";
      pool.query(sql, function (error, result) {
        if (error) {
          res.render("cropupdatedelete", {
            data: [],
            message: "Record Not Found...",
          });
        } else {
          res.render("cropupdatedelete", {
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

router.post("/cropupdesubmit", function (req, res, next) {
  if (req.body.btn == "Edit") {
    sql =
      "update crop set croptype='" +
      req.body.ctype +
      "',cropname='" +
      req.body.cname +
      "',cropdesc='" +
      req.body.cdesc +
      "',from_month='" +
      req.body.fmonth +
      "',to_month='" +
      req.body.tmonth +
      "',states='" +
      req.body.states +
      "' where cropid='" +
      req.body.cropid +
      "'";
    pool.query(sql, function (error, result) {
      if (error) {
        res.status(500).json([]);
      } else {
        req.flash(
          "message",
          "ID: " + req.body.cropid + " Record Update Successfully"
        );
        res.redirect("/crop/cropdisplay");
      }
    });
  } else {
    var sql = "delete from crop where cropid=" + req.body.cropid + "";
    pool.query(sql, function (err, result) {
      req.flash(
        "message",
        "ID: " + req.body.cropid + " Record Delete Successfully"
      );
      res.redirect("/crop/cropdisplay");
    });
  }
});
router.get("/displaypicture", function (req, res, next) {
  if (req.session.secret) {
    sql = "select * from crop where cropid=?";
    pool.query(sql, [req.query.cid], function (error, result) {
      if (error) {
        res.render("cropeditpicture", {
          data: [],
        });
      } else {
        res.render("cropeditpicture", {
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
      "update crop set image=? where cropid=?",
      [req.file.originalname, req.body.cid],
      function (error, result) {
        if (error) {
          res.redirect("/crop/cropdisplay");
        } else {
          res.redirect("/crop/cropdisplay");
        }
      }
    );
  }
);
module.exports = router;
