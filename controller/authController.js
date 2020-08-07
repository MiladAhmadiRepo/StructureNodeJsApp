/* eslint no-underscore-dangle: 0 */
let dotenv =require( 'dotenv');
let bcrypt =require( 'bcrypt');
let jwt =require( 'jsonwebtoken');

dotenv.config();

exports.create=(req, res, next) =>{
    const { fullname, email, password } = req.body;
    bcrypt.hash(password, 10)
        .then((hash) => {
            let newUser=new fuserModel({fullname: fullname,email:email.toLowerCase(),passwod:hash})
            newUser.save().then((err,reponse)=>{
                if(err) {
                    err.status = 409;
                    err.message = 'Sorry, an account with this email already exist';
                    next(err);
                }else {
                    res.status(201)
                        .json({
                            status: 'success',
                            data: reponse,
                        });
                }
            });
        })
        .catch((err) => {
            next(err);
        });
}
exports.login=(req, res, next) =>{
    const { email, password } = req.body;
    mUserModel.findOne({email:email}).then((err,data)=>{
        if(data!=null){
            bcrypt.compare(password, data.password)
                .then((val) => {
                    if (val) {
                        const token = jwt.sign(
                            {
                                id: data.id,
                                email: data.email,
                                fullname: data.fullname,
                                // fav_quote: data.fav_quote,
                            },
                            "mIOSDIARY",
                            {
                                expiresIn: 9999999,
                            },
                        );
                        delete data.password;
                        data.token = token;
                        res.status(200)
                            .json({
                                status: 'success',
                                data,
                            });
                    } else {
                        const error = new Error('Credentials do not match any record');
                        error.status = 401;
                        next(error);
                    }
                })
                .catch((err) => {
                    next(err);
                });
        }else{
            const error = new Error('Credentials do not match any record');
            error.status = 401;
            next(error);
        }
    })
}

