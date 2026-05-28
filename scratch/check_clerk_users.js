const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
let clerkKey = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      if (key === "CLERK_SECRET_KEY") clerkKey = val;
    }
  });
}

const userIds = [
  "user_3EBPcQkjN7fmwETYT9d8kEkDXa1",
  "user_3EBPcQKjN7fmwETYT9d8kEkDXa1"
];

async function checkUser(userId) {
  try {
    const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${clerkKey}`
      }
    });
    if (res.status === 404) {
      console.log(`User ${userId} not found in Clerk (404)`);
      return null;
    }
    const data = await res.json();
    console.log(`User ${userId} info:`, {
      id: data.id,
      email: data.email_addresses?.[0]?.email_address,
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      created_at: new Date(data.created_at).toISOString()
    });
  } catch (err) {
    console.error(`Error checking user ${userId}:`, err);
  }
}

async function run() {
  for (const uid of userIds) {
    await checkUser(uid);
  }
}

run();
