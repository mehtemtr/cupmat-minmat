import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

function cleanUsername(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function generateBaseUsername(user: any): string {
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  return cleanUsername(firstName + lastName);
}

async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    await clerkClient.users.getUserList({ username });
    return false;
  } catch (error) {
    return true;
  }
}

async function generateUniqueUsername(base: string): Promise<string> {
  let available = await checkUsernameAvailability(base);
  if (available) return base;

  let suffix = 1923;
  while (true) {
    const candidate = base + suffix;
    available = await checkUsernameAvailability(candidate);
    if (available) return candidate;
    suffix++;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const adminSecret = request.headers.get("x-admin-secret") || body.adminSecret;

    if (adminSecret !== process.env.ADMIN_API_SECRET) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    const users = await clerkClient.users.getUserList({ limit: 500 });
    const results: any[] = [];

    for (const user of users) {
      if (user.username) {
        results.push({
          userId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          existingUsername: user.username,
          status: "skipped - already has username"
        });
        continue;
      }

      const baseUsername = generateBaseUsername(user);
      const uniqueUsername = await generateUniqueUsername(baseUsername);

      try {
        await clerkClient.users.updateUser(user.id, {
          username: uniqueUsername
        });

        results.push({
          userId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          newUsername: uniqueUsername,
          status: "success"
        });
      } catch (updateError) {
        results.push({
          userId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          status: "failed",
          error: String(updateError)
        });
      }
    }

    const successCount = results.filter(r => r.status === "success").length;
    const skippedCount = results.filter(r => r.status === "skipped - already has username").length;
    const failedCount = results.filter(r => r.status === "failed").length;

    return NextResponse.json({
      success: true,
      summary: {
        total: users.length,
        success: successCount,
        skipped: skippedCount,
        failed: failedCount
      },
      results
    });

  } catch (error) {
    console.error("User migration error:", error);
    return NextResponse.json(
      { error: "Geçiş işlemi başarısız", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const adminSecret = request.headers.get("x-admin-secret");
    
    if (adminSecret !== process.env.ADMIN_API_SECRET) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    const users = await clerkClient.users.getUserList({ limit: 500 });
    
    const userStats = users.map(user => ({
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      needsMigration: !user.username
    }));

    const needsMigrationCount = userStats.filter(u => u.needsMigration).length;

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      needsMigration: needsMigrationCount,
      users: userStats
    });

  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { error: "Kullanıcı istatistikleri alınamadı", details: String(error) },
      { status: 500 }
    );
  }
}
