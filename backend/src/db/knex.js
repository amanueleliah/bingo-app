// src/db/knex.js
const knex = require("knex");
const { Model } = require("objection");
const knexConfig = require("../../knexfile.js"); // import from root

const db = knex(knexConfig.development); // pass config to knex
Model.knex(db);

module.exports = db;
