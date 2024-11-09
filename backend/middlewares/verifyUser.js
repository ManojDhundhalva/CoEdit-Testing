const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;

 
  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user; 
    next(); 
  });
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    const isUserAgentValid = String(req.user.userAgent) === String(req.headers["user-agent"]);
    const isFingerprintValid = String(req.user.fingerprint) === String(req.headers["x-fingerprint-id"]);
    const isUsernameValid = String(req.user.username) === String(req.cookies.username);

    if (isUserAgentValid && isFingerprintValid && isUsernameValid) {
      next(); 
    } else {
      return res.status(403).json({ message: "Access denied. Authorization failed." });
    }
  });
};

module.exports = {
  verifyTokenAndAuthorization,
  verifyToken,
};
