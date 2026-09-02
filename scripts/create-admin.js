require("dotenv/config");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const email = process.env.ADMIN_EMAIL;
const allowedAdminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const fullName = process.env.ADMIN_NAME || "LeonardX Admin";

if (!process.env.DATABASE_URL || !email || !password) { console.error("Set DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD in .env first."); process.exit(1); }
(async()=>{const pool=new Pool({connectionString:process.env.DATABASE_URL});try{const hash=await bcrypt.hash(password,12);const r=await pool.query('SELECT id FROM "User" WHERE email=$1',[email.toLowerCase()]);if(r.rowCount){await pool.query('UPDATE "User" SET "role"=$1, "passwordHash"=$2, "fullName"=$3 WHERE email=$4',["ADMIN",hash,fullName,email.toLowerCase()]);console.log("Existing user updated to ADMIN.");}else{const id='admin_'+Date.now().toString(36);await pool.query('INSERT INTO "User" (id,"fullName",email,"passwordHash",role,"updatedAt") VALUES ($1,$2,$3,$4,$5,NOW())',[id,fullName,email.toLowerCase(),hash,"ADMIN"]);console.log("Admin account created.");}}catch(e){console.error(e);process.exitCode=1;}finally{await pool.end();}})();
