var MndScheme = new mongoose.Schema({
    mandName:{type: String},
    amount:{type: Number},
    type:{type: String},//organizationToEmployee-boomerangToOrganization
    additionalData:{},
    expireDate: {type: Date},
    comment:{type: String},
    created: {type: Date, default: Date.now},
});
MndScheme.plugin(autoIncrement.plugin, 'money');
module.exports = db.model('money', MndScheme);
