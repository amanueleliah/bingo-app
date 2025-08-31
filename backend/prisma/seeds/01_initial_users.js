exports.up = function(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.bigInteger('telegram_id').notNullable().unique();
      table.text('username');
      table.text('display_name');
      table.text('role').notNullable().defaultTo('user');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('wallets', (table) => {
      table.increments('id').primary();
      table.integer('user_id').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
      table.decimal('balance', 12, 2).notNullable().defaultTo(0.00);
      table.text('currency').notNullable().defaultTo('ETB');
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('wallet_transactions', (table) => {
      table.increments('id').primary();
      table.integer('wallet_id').notNullable().references('id').inTable('wallets').onDelete('CASCADE');
      table.decimal('amount', 12, 2).notNullable();
      table.decimal('balance_after', 12, 2).notNullable();
      table.text('type').notNullable();
      table.text('description');
      table.text('reference_id');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('games', (table) => {
      table.increments('id').primary();
      table.text('game_code').notNullable();
      table.text('status').notNullable().defaultTo('waiting');
      table.decimal('stake', 12, 2).notNullable();
      table.decimal('prize_pool', 12, 2).defaultTo(0.00);
      table.text('seed');
      table.jsonb('shuffle_order');
      table.integer('current_call');
      table.boolean('bonus_enabled').defaultTo(false);
      table.timestamp('next_call_at');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('started_at');
      table.timestamp('ended_at');
    })
    .createTable('boards', (table) => {
      table.increments('id').primary();
      table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
      table.integer('board_number').notNullable();
      table.boolean('is_winner').defaultTo(false);
      table.boolean('is_bonus_winner').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      // Unique constraint to prevent duplicate board purchases in same game
      table.unique(['user_id', 'game_id', 'board_number']);
    })
    .createTable('cells', (table) => {
      table.increments('id').primary();
      table.integer('board_id').notNullable().references('id').inTable('boards').onDelete('CASCADE');
      table.integer('number').notNullable();
      table.integer('position').notNullable();
      table.boolean('is_marked').notNullable().defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('marked_at');
    })
    .createTable('game_calls', (table) => {
      table.increments('id').primary();
      table.integer('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
      table.integer('number').notNullable();
      table.timestamp('called_at').defaultTo(knex.fn.now());
    })
    .createTable('claims', (table) => {
      table.increments('id').primary();
      table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
      table.integer('board_id').notNullable().references('id').inTable('boards').onDelete('CASCADE');
      table.text('pattern_type').notNullable();
      table.text('status').notNullable().defaultTo('pending');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('resolved_at');
    })
    .then(() => {
      // Create indexes for performance
      return knex.schema
        .raw('CREATE INDEX idx_wallets_user_id ON wallets(user_id)')
        .raw('CREATE INDEX idx_wallet_transactions_wallet_id_created_at ON wallet_transactions(wallet_id, created_at)')
        .raw('CREATE INDEX idx_boards_user_id_game_id ON boards(user_id, game_id)')
        .raw('CREATE INDEX idx_cells_board_id_number ON cells(board_id, number)')
        .raw('CREATE INDEX idx_game_calls_game_id_called_at ON game_calls(game_id, called_at)')
        .raw('CREATE INDEX idx_claims_game_id_status ON claims(game_id, status)');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('claims')
    .dropTableIfExists('game_calls')
    .dropTableIfExists('cells')
    .dropTableIfExists('boards')
    .dropTableIfExists('games')
    .dropTableIfExists('wallet_transactions')
    .dropTableIfExists('wallets')
    .dropTableIfExists('users');
};