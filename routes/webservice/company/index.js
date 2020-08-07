let express = require('express');
let router = new express.Router();
let moneyModel = require("../../../model/moneys");
let moneyLogModel = require("../../../model/moneylogs");


router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.get('origin'));
    res.header("Access-Control-Allow-Credentials", true);
     res.header("Access-Control-Allow-Headers", "*");
    res.header(    "Access-Control-Allow-Methods", "Get ,PUT ,DELETE ,POST, OPTIONS");
    next();
});


//////// money Router ////////////////////////////////////////////////////////////
//create Company
router.post('/money/createCompany', require("../mand/Company").createCompany);
//edit Company
router.post('/money/editCompany',checkmoneyheader, require("../mand/Company").editCompany);

module.exports = router;

async function checkmoneyheader(req, res, next) {
    let ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
    ip=ip.split("::ffff:").length>1?ip.split("::ffff:")[1]:ip;
    var obj = {};
    if (req.header("id") && req.header("token")) {
        await moneyModel.findOneAndUpdate({
            _id: req.header("id"),
            token: req.header("token"),
            lastLogin: {$gte: new Date(new Date().getTime() - 6000000000)},
            status: {$ne: "inactive"}
        },{
            lastLogin:new Date()}, async function (err,res2) {
            if (err) {
                moneyLogModel({
                    ip:ip,
                    body:req.body,
                    header:req.headers,
                    query:req.query,
                    url:req.url,
                    method:req.method,
                    response:{message: "message error.", data: null, code: 500},
                    helperLog:"message error company"
                }).save()
                res.send({message: "try again", data: null, code: 500});
                return
            }
            else {
                if (res2 != null) {
                    let permitted = false;

                    if (req.url.includes("check") ) {
                        permitted = true
                    }
                    if (permitted) {
                        moneyLogModel({
                            ip:ip,
                            body:req.body,
                            header:req.headers,
                            query:req.query,
                            url:req.url,
                            method:req.method,
                            userInfo: res2,
                            helperLog:"success"
                        }).save((err,response)=>{
                            req.body.logreponse=response;
                            next();
                        })
                        req.body.userinfo = res2;
                    } else {
                        let data = {};
                        data.name = "";
                        data.phone = "";
                        data.codemeli = "";
                        data.registered = false;
                        obj.code = 403;
                        obj.message = " .";
                        obj.data = data;
                        res.send(obj);
                        return
                    }
                }
            }
        });
    }
}
