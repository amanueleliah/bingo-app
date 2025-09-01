const crypto = require("crypto");
const queryString = require("query-string");

const validateTelegramData = (initData) => {
  try {
    // Parse the initData string
    const parsed = queryString.parse(initData);

    // Check if auth_date is recent (within 24 hours)
    const authDate = parseInt(parsed.auth_date, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const twentyFourHours = 24 * 60 * 60;

    if (currentTime - authDate > twentyFourHours) {
      throw new Error("Authentication data is too old");
    }

    // Extract the hash and remove it from the data to check
    const receivedHash = parsed.hash;
    delete parsed.hash;

    // Sort keys alphabetically
    const dataCheckString = Object.keys(parsed)
      .sort()
      .map((key) => `${key}=${parsed[key]}`)
      .join("\n");

    // Create SHA256 HMAC using the bot token as secret key
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(process.env.TELEGRAM_BOT_TOKEN)
      .digest();

    // Generate the hash
    const generatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // Compare the generated hash with the received hash
    return generatedHash === receivedHash;
  } catch (error) {
    console.error("Telegram validation error:", error);
    return false;
  }
};

const extractUserData = (initData) => {
  const parsed = queryString.parse(initData);
  const user = JSON.parse(parsed.user || "{}");

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    languageCode: user.language_code,
    allowsWriteToPm: user.allows_write_to_pm,
    authDate: parseInt(parsed.auth_date, 10),
    hash: parsed.hash,
  };
};

module.exports = {
  validateTelegramData,
  extractUserData,
};
