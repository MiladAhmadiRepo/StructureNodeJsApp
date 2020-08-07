let jwt = require('jsonwebtoken');


exports.isValid = (req, res, next) => {
  try {
    // Removes Bearer keyword and takes the token after the space
    const token = req.headers.authorization.split(' ')[1];
    req.userData = jwt.verify(token, "mIOSDIARY");
    console.log(req.userData)
    next();
  } catch (error) {
    res.status(401)
      .json({
        status: 'error',
        message: 'You are not authorized to perform this action',
      });
  }
};

