import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const dir = path.join(__dirname, "..");
  const envFiles = [".env", ".env.local"];
  for (const file of envFiles) {
    const envPath = path.join(dir, file);
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
      for (const line of lines) {
        if (line.trim().startsWith("#")) continue;
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      }
    }
  }
}

async function fetchClerkUser(userId: string, secretKey: string) {
  const url = `https://api.clerk.com/v1/users/${userId}`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      return { error: `HTTP ${res.status}: ${await res.text()}` };
    }
    return await res.json();
  } catch (e: any) {
    return { error: e.message };
  }
}

async function main() {
  loadEnv();
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("CLERK_SECRET_KEY not found in env!");
    return;
  }

  const u1 = "user_3E1moQp7w4ETZnBAGPLuFjIQjr0"; // ismail toptaş
  const u2 = "user_3ESNMt3VVkj9ixjcPx2fH4gdRDp"; // Trabzon_61

  console.log(`Fetching Clerk user ${u1}...`);
  const details1 = await fetchClerkUser(u1, secretKey);

  console.log(`Fetching Clerk user ${u2}...`);
  const details2 = await fetchClerkUser(u2, secretKey);

  const result = {
    user1: {
      id: u1,
      firstName: details1.first_name,
      lastName: details1.last_name,
      username: details1.username,
      emails: details1.email_addresses?.map((e: any) => e.email_address),
      phoneNumbers: details1.phone_numbers?.map((p: any) => p.phone_number),
      externalAccounts: details1.external_accounts?.map((a: any) => ({
        provider: a.provider,
        email: a.email_address,
      })),
      createdAt: details1.created_at,
      error: details1.error,
    },
    user2: {
      id: u2,
      firstName: details2.first_name,
      lastName: details2.last_name,
      username: details2.username,
      emails: details2.email_addresses?.map((e: any) => e.email_address),
      phoneNumbers: details2.phone_numbers?.map((p: any) => p.phone_number),
      externalAccounts: details2.external_accounts?.map((a: any) => ({
        provider: a.provider,
        email: a.email_address,
      })),
      createdAt: details2.created_at,
      error: details2.error,
    }
  };

  const outPath = path.join(__dirname, "clerk-users-check.json");
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`Results saved to ${outPath}`);
}

main().catch(console.error);
