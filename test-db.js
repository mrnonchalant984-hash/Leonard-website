require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function testDatabase() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("DATABASE CONNECTED SUCCESSFULLY!");
    console.log(result.rows);
  } catch (error) {
    console.error("DATABASE CONNECTION FAILED:");
    console.error(error);
  } finally {
    await pool.end();
  }
}

testDatabase();