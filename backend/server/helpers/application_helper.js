exports.tokenVerify = tokenVerify2

// This is not needed anymore
function tokenVerify2(req) {
  var jwt = require('jsonwebtoken')
  return jwt.verify(req.headers['authorization'], process.env.SECRET, function (err, decoded) {
    if (err) {
      return {verified: false, data: null}
    } else {
      return {verified: true, data: decoded}
    }
  })

}


