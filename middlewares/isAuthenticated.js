const User = require("../Models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const BearerToken = req.headers.authorization.replace("Bearer ", "");
    const UserExist = await User.findOne({ token: BearerToken });
    if (UserExist) {
      req.user = UserExist;
      return next();
    } else {
      return res.status(400).json({ error: { message: "Unauthorized" } });
    }
  } else {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }
};

module.exports = isAuthenticated;
