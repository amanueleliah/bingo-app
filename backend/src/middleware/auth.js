const jwt = require("jsonwebtoken");
const db = require("../db/knex");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied. No valid token provided.",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists in database
    const user = await db("users").where({ id: decoded.userId }).first();

    if (!user) {
      return res.status(401).json({
        error: "Token is no longer valid. User not found.",
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      telegramId: user.telegram_id,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: "Access denied. Invalid token.",
    });
  }
};

module.exports = authMiddleware;
