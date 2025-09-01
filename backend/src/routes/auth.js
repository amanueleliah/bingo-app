const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db/knex");
const {
  validateTelegramData,
  extractUserData,
} = require("../utils/telegramAuth");

const router = express.Router();

// Telegram authentication endpoint
router.post("/telegram", async (req, res, next) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: "initData is required" });
    }

    // Validate the Telegram data
    const isValid = validateTelegramData(initData);

    if (!isValid) {
      return res
        .status(401)
        .json({ error: "Invalid Telegram authentication data" });
    }

    // Extract user data from initData
    const telegramUser = extractUserData(initData);

    // Check if user exists
    let user = await db("users")
      .where({ telegram_id: telegramUser.id })
      .first();

    // Create or update user
    if (!user) {
      // Create new user and wallet
      const [userId] = await db("users")
        .insert({
          telegram_id: telegramUser.id,
          username: telegramUser.username,
          display_name: telegramUser.firstName || telegramUser.username,
          role: "user",
        })
        .returning("id");

      // Create wallet for the user
      await db("wallets").insert({
        user_id: userId,
        balance: 0.0,
        currency: "ETB",
      });

      user = await db("users").where({ id: userId }).first();
    } else {
      // Update existing user if needed
      if (
        user.username !== telegramUser.username ||
        user.display_name !== (telegramUser.firstName || telegramUser.username)
      ) {
        await db("users")
          .where({ id: user.id })
          .update({
            username: telegramUser.username,
            display_name: telegramUser.firstName || telegramUser.username,
            updated_at: new Date(),
          });

        user = await db("users").where({ id: user.id }).first();
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        telegramId: user.telegram_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Return token and user info
    res.status(200).json({
      token,
      user: {
        id: user.id,
        telegramId: user.telegram_id,
        displayName: user.display_name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
