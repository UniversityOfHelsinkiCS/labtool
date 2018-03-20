exports.tokenVerify = tokenVerify


function tokenVerify(req) {
  var jwt = require('jsonwebtoken')
  return jwt.verify(req.headers['authorization'], process.env.SECRET, function (err, decoded) {
    if (err) {
      return {verified: false, data: null}
    } else {
      return {verified: true, data: decoded}
    }
  })

}


