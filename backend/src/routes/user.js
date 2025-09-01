const express = require("express");
const authMiddleware = require("../middleware/auth");
const db = require("../db/knex");

const router = express.Router();

// Apply auth middleware to all user routes
router.use(authMiddleware);

// Get current user profile and wallet
router.get("/me", async (req, res, next) => {
  try {
    const user = await db("users")
      .where({ id: req.user.id })
      .select(
        "id",
        "telegram_id",
        "username",
        "display_name",
        "role",
        "created_at"
      )
      .first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const wallet = await db("wallets")
      .where({ user_id: req.user.id })
      .select("balance", "currency", "updated_at")
      .first();

    res.status(200).json({
      user: {
        id: user.id,
        telegramId: user.telegram_id,
        displayName: user.display_name,
        username: user.username,
        role: user.role,
        createdAt: user.created_at,
      },
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency,
        updatedAt: wallet.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
