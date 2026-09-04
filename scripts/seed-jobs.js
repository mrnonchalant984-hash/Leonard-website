const { Client } = require("pg");
const crypto = require("crypto");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const jobs = [
  {
    title: "Build a modern business website",
    description:
      "I need a professional and responsive website for my business with a clean, modern design.",
    budget: 150000,
  },
  {
    title: "Design a professional company logo",
    description:
      "Looking for a creative designer to create a professional logo and simple brand identity.",
    budget: 50000,
  },
  {
    title: "Write SEO blog articles",
    description:
      "Need a freelance writer to create high-quality SEO-optimized articles for a Nigerian business website.",
    budget: 75000,
  },
  {
    title: "Create social media graphics",
    description:
      "I need several professional graphics for Instagram, Facebook, and other social media platforms.",
    budget: 60000,
  },
  {
    title: "Build an ecommerce website",
    description:
      "Looking for an experienced developer to build an ecommerce website with products, cart, checkout, and an admin dashboard.",
    budget: 250000,
  },
];

async function main() {
  await client.connect();

  console.log("Connected to PostgreSQL.");

  // Find an existing CLIENT account
  const userResult = await client.query(`
    SELECT id
    FROM "User"
    WHERE role = 'CLIENT'
    ORDER BY "createdAt" ASC
    LIMIT 1
  `);

  if (userResult.rows.length === 0) {
    console.log("");
    console.log("No CLIENT user was found.");
    console.log("Create a client account first, then run:");
    console.log("npm run seed-jobs");
    return;
  }

  const clientId = userResult.rows[0].id;

  console.log(`Using client ID: ${clientId}`);
  console.log("");

  for (const job of jobs) {
    // Prevent duplicate starter jobs
    const existing = await client.query(
      `
      SELECT id
      FROM "Job"
      WHERE title = $1
      AND "clientId" = $2
      LIMIT 1
      `,
      [job.title, clientId]
    );

    if (existing.rows.length > 0) {
      console.log(`Skipped (already exists): ${job.title}`);
      continue;
    }

    await client.query(
      `
      INSERT INTO "Job"
        (
          id,
          title,
          description,
          budget,
          status,
          "clientId",
          "hiredFreelancerId",
          "startedAt",
          "completedAt",
          "createdAt",
          "updatedAt"
        )
      VALUES
        (
          $1,
          $2,
          $3,
          $4,
          'OPEN',
          $5,
          NULL,
          NULL,
          NULL,
          NOW(),
          NOW()
        )
      `,
      [
        crypto.randomUUID(),
        job.title,
        job.description,
        job.budget,
        clientId,
      ]
    );

    console.log(`Created: ${job.title}`);
  }

  console.log("");
  console.log("Starter jobs seeded successfully.");
}

main()
  .catch((error) => {
    console.error("");
    console.error("Seed failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });