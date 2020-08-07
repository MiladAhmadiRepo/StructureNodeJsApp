const request = require("request");
let mndModel = require('../../../model/money');
let q = require('q');
var mutex = require('node-mutex')();

//get User Details
exports.getUserDetails = async (req, res) => {
    try {
        if (!isNaN(req.body.userId) || req.body.phoneNumber !== undefined) {
            let userQuery;
            if (req.body.userId !== undefined)
                userQuery = {_id: req.body.userId};
            else
                userQuery = {phone: req.body.phoneNumber};
            userModel.findOne(userQuery).then(async function (user) {
                    if (user == null) {
                        res.send({
                            code: 404,
                            message: "not exist user",
                            data: null
                        })
                    } else {
                        if (user.mndCompanyIds.length > 0) {
                            let payTimemnd;
                            let financialDebtAmount;
                            let Company = await CompanyModel.findOne({_id: user.mndCompanyIds[user.mndCompanyIds.length - 1]})
                            if(Company===null)
                            {
                                res.send({
                                    message: "get error", data: null, code: 500
                                });
                            }
                            let mndAllocateQuery = {creditAllocatorId: Company._id, creditReceiverId: user._id}
                            let mndAllocate = await allocatemndModel.findOne(mndAllocateQuery).sort("-created")
                            if(mndAllocate!==null)
                            {
                                payTimemnd= await mndModel.findOne({_id: mndAllocate.mndId}).sort("-created")
                                let index = user.mndmndIds.indexOf(mndAllocate.mndId);
                                financialDebtAmount = mndAllocate.allocateAmount - user.mndRestOfmnd[index];
                            }
                            else
                            {
                                mndAllocate={allocateAmount:""};
                                payTimemnd= {expireDate:""};
                                financialDebtAmount="";
                            }
                            res.send({
                                code: 200,
                                message: "success operation",
                                data: {
                                    id: user._id,
                                    userName: user.name,
                                    phone: user.phone,
                                    codeMeli: user.codemeli,
                                    email: user.email,
                                    birthDate: user.birthdate,
                                    personnelNumber: user.mnadPersonnelNumber,
                                    payTime: payTimemnd.expireDate,
                                    financialDebt: financialDebtAmount
                                }
                            });
                        } else {
                            res.send({
                                code: 400,
                                message: "not exist user",
                                data: null
                            })
                        }

                    }
                }
            );

        } else {
            res.send({
                code: 400,
                message: "incorrect parameter",
                data: null
            })
        }
    } catch (e) {
        console.log(e);
        res.send({
            message: "get error", data: null, code: 500
        });
    }
}





