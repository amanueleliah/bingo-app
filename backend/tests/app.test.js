const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db/knex");

describe("Bingo Backend API", () => {
  beforeAll(async () => {
    // Run migrations and seeds for test database
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    // Cleanup and close database connection
    await db.destroy();
  });

  describe("GET /health", () => {
    it("should return healthy status", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
      expect(response.body.status).toBe("OK");
    });
  });

  describe("POST /api/auth/telegram", () => {
    it("should reject request without initData", async () => {
      const response = await request(app).post("/api/auth/telegram").send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("initData is required");
    });

    it("should reject invalid initData", async () => {
      const response = await request(app)
        .post("/api/auth/telegram")
        .send({ initData: "invalid_data" });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/user/me", () => {
    it("should reject request without authentication", async () => {
      const response = await request(app).get("/api/user/me");
      expect(response.status).toBe(401);
    });

    it("should reject request with invalid token", async () => {
      const response = await request(app)
        .get("/api/user/me")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
    });
  });
});

