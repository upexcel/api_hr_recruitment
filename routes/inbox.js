let express = require('express'); // Require express module
let app = express()
let mongoose = require('mongoose'); //Require mongoose module
let router = express.Router(); //creatig insatnce of express function


<!----------- INBOX PAGIANATON--------->

router.get('/inbox/:page', function(req, res, next) {
    let page = req.params.page;
    let per_page = 21;
    req.email.find().skip((page - 1) * per_page).limit(per_page).exec(function(err, data) {
        if (err) {
            req.err = "invalid page"
            next(req.err);
        } else {
            res.json({ data: data });
        }
    });
});

router.get('/get/:uid', function(req, res, next) {
    let uid = parseInt(req.params.uid);
    req.email.findOne({ uid: uid }, function(err, data) {
        if (err) {
            req.err = "Invalid UID";
            next(req.err);
        } else {
            res.json({ data: data });
        }
    })
});


module.exports = router;
