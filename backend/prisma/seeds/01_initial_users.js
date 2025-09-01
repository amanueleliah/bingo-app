/**
 * Seed initial users, wallets, and transactions
 * @param {import("knex")} knex
 */
exports.seed = async function (knex) {
  // Clear tables (respecting FK constraints order)
  await knex("wallet_transactions").del();
  await knex("wallets").del();
  await knex("users").del();

  // Insert users and return their IDs
  const [testUser] = await knex("users")
    .insert({
      telegram_id: 123456789,
      username: "testuser",
      display_name: "Test User",
      role: "user",
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    })
    .returning(["id", "telegram_id"]);

  const [adminUser] = await knex("users")
    .insert({
      telegram_id: 987654321,
      username: "adminuser",
      display_name: "Admin User",
      role: "admin",
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    })
    .returning(["id", "telegram_id"]);

  // Insert wallets
  const [testWallet] = await knex("wallets")
    .insert({
      user_id: testUser.id,
      balance: 100.0,
      currency: "ETB",
      updated_at: knex.fn.now(),
    })
    .returning(["id", "user_id"]);

  const [adminWallet] = await knex("wallets")
    .insert({
      user_id: adminUser.id,
      balance: 100.0,
      currency: "ETB",
      updated_at: knex.fn.now(),
    })
    .returning(["id", "user_id"]);

  // Insert initial transactions
  await knex("wallet_transactions").insert([
    {
      wallet_id: testWallet.id,
      amount: 100.0,
      balance_after: 100.0,
      type: "initial_deposit",
      description: "Initial deposit",
      created_at: knex.fn.now(),
    },
    {
      wallet_id: adminWallet.id,
      amount: 100.0,
      balance_after: 100.0,
      type: "initial_deposit",
      description: "Initial deposit",
      created_at: knex.fn.now(),
    },
  ]);
};
