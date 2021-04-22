var express = require("express");
var router = express.Router();
var pool = require("../db_connect");
var upload = require("./multer");
var flash = require("connect-flash");
const { check, validationResult, matchedData } = require("express-validator");
/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.session.secret) {
    res.render("FarmerPoliciesInterface", {
      title: "Farmer Policies Interface",
      message: req.flash("message"),
      data: "",
      errors: "",
    });
  } else {
    req.flash("message", "Please login first!");
    res.redirect("/admin");
  }
});

router.get("/fetchpolicies", function (req, res, next) {
  if (req.session.secret) {
    pool.query("select * from policies", function (error, result) {
      if (error) {
        //   console.log(err);
        res.status(500).json([]);
      } else {
        res.status(200).json(result);
      }
    });
  } else {
    req.flash("message", "Please login first!");
    res.redirect("/admin");
  }
});

router.post(
  "/addfarmerpolicies",
  [
    check("kisanid")
      .notEmpty()
      .withMessage("Kisan ID should not be blank")
      .matches(/^[a-zA-Z]*$/)
      .withMessage("Only Characters and white space are not allowed"),
  ],
  [check("fpdate").notEmpty().withMessage("Month should not be blank")],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("FarmerPoliciesInterface", {
        data: req.body,
        errors: errors.mapped(),
        message: "",
        title: "",
      });
    }
    sql =
      "insert into farmerpolicies(kisanid,policyid,dateapply,status)values('" +
      req.body.kisanid +
      "','" +
      req.body.policyid +
      "','" +
      req.body.fpdate +
      "','" +
      req.body.status +
      "')";
    pool.query(sql, function (error, result) {
      if (error) {
        //console.log(error);
        res.status(500).json([]);
      } else {
        console.log(sql);
        req.flash("message", "Record Registered Successfully");
        res.redirect("/farmerpolicies");
      }
    });
  }
);

router.get("/farmerpoliciesdisplay", function (req, res, next) {
  if (req.session.secret) {
    pool.query(
      "select fp.*,(select p.policiesname from policies p where p.policies_id=fp.policyid)as pname from farmerpolicies fp",
      function (error, result) {
        if (error) {
          res.render("farmerpoliciesdisplay", {
            data: [],
          });
        } else {
          res.render("farmerpoliciesdisplay", {
            data: result,
            message: req.flash("message"),
          });
        }
      }
    );
  } else {
    req.flash("message", "Please login first!");
    res.redirect("/admin");
  }
});

router.get("/farmerpoliciesupdatedelete", function (req, res, next) {
  if (req.session.secret) {
    pool.getConnection(function (err) {
      sql =
        "select fp.*,(select p.policiesname from policies p where p.policies_id=fp.policyid)as pname from farmerpolicies fp where fp.transactionid=" +
        req.query.fpid +
        "";
      pool.query(sql, function (error, result) {
        if (error) {
          res.render("farmerpoliciesupdatedelete", {
            data: [],
            message: "Record Not Found...",
          });
        } else {
          res.render("farmerpoliciesupdatedelete", {
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

router.post("/farmerpoliciesupdesubmit", function (req, res, next) {
  if (req.body.btn == "Edit") {
    sql =
      "update farmerpolicies set kisanid='" +
      req.body.kisanid +
      "',policyid='" +
      req.body.policyid +
      "',dateapply='" +
      req.body.fpdate +
      "' where transactionid='" +
      req.body.tid +
      "'";
    pool.query(sql, function (error, result) {
      if (error) {
        res.status(500).json([]);
      } else {
        req.flash(
          "message",
          "ID: " + req.body.tid + " Record Update Successfully"
        );
        res.redirect("/farmerpolicies/farmerpoliciesdisplay");
      }
    });
  } else {
    var sql =
      "delete from farmerpolicies where transactionid=" + req.body.tid + "";
    pool.query(sql, function (err, result) {
      req.flash(
        "message",
        "ID: " + req.body.tid + " Record Delete Successfully"
      );
      res.redirect("/farmerpolicies/farmerpoliciesdisplay");
    });
  }
});

//// For App..


router.post("/addFarmerPolicy",function(req, res){
  console.log(req.body)
  pool.query('insert into farmerpolicies(kisanid,policyid,dateapply,status) values(?,?,?,?)',[req.body.kisanid,req.body.policyid,req.body.dateapply,req.body.status],(err,result)=>{
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


router.post("/displayPolicies",function(req, res){
  console.log(req.body)
  pool.query('select fp.*,(select p.policiesicon from policies p where p.policies_id=fp.policyid) as policy_image , (select p.policiesname from policies p where p.policies_id=fp.policyid) as policy_name from farmerpolicies as fp where kisanid=?',[req.body.kisanid],(err,result)=>{
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



module.exports = router; 
