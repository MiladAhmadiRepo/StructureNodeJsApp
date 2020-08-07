let spendmndModel = require('../model/spendmand');
let moneyHelper = require('./moneyHelper');
let q = require('q');

//spend money
exports.spend = async (spendType, phoneNumber, amount, mndId, RestOfmndAll, index, receiverId) => {
    let checkExpire = await moneyHelper.checkExpiremndDate(mndId);
    let usermndState = await moneyHelper.getUsermndState(null, phoneNumber, mndId);
    let spender = await moneyHelper.getUserByPhoneNumber(phoneNumber);
    if (checkExpire && usermndState)
        return new Promise(async (resolve, reject) => {
            if (RestOfmndAll >= amount) {
                let restOfArray = spender.mndRestOfmnd;
                restOfArray[index] = RestOfmndAll - amount;
                let newValues = {
                    $set: {
                        mandRestOfAsd: restOfArray,
                    },
                };
                let finalReceiverId = kiBankAddress;
                let finalReceiverName = moneyHelper.getFarsiStringBaseOnTypeOfSpendOrSettlement("con_organization");
                if (receiverId !== null) {
                    finalReceiverId = receiverId;
                    finalReceiverName = await userModel.findOne({_id: receiverId}, {_id: 0, name: 1});
                    finalReceiverName = finalReceiverName.name;
                }
                let query = {phone: phoneNumber};
                userModel.updateOne(query, newValues, function (err, response) {

                    let newRow = new spendmndModel({
                        mnadId: mndId,
                        amount: amount,
                        mndaSpenderId: spender._id,
                        mndaSpenderName: spender.name,
                        mndaReceiverId: finalReceiverId,
                        mndReceiverName: finalReceiverName,
                        typeOfSpendOrSettlement: spendType
                    });
                    return newRow.save();
                }).then(function (docsInserted) {
                    resolve({code: 200, data: docsInserted, message: "success operation"});
                }).catch(function (error) {
                    resolve({code: 500, data: null, message: "get error"});
                });
            } else {
                resolve({code: 500, data: null, message: "not money"})
            }

        });
    else
        return new Promise((resolve, reject) => {
            resolve({code: 500, data: null, message: "not money"})
        });

}


function getError(res, error) {
    if (error === 400) {
        res.send({
            code: 400,
            message: "incorrect parameter",
            data: null
        })
    } else if (error === 404) {
        res.send({
            code: 404,
            message: "not found",
            data: null
        })
    } else {
        res.send({
            code: 500,
            message: "get error",
            data: null
        });
    }
}

exports.top_skip_query = (top, skip) => {
    let topSkip;
    if (!isNaN(skip) && !isNaN(top)) {
        topSkip = {limit: parseInt(top), skip: parseInt(skip)};
    } else {
        topSkip = {};
    }
    return topSkip;
}

Array.prototype.rotateLeft = function (n) {
    this.unshift(...this.splice(-(n), n));
    return this
}

