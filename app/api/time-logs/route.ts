import { timingSafeEqual } from "node:crypto";
import { connection } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TimeLog from "@/models/TimeLog";

// 驗證 Authorization: Bearer <CRON_SECRET>
function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // 沒設定 secret 就一律拒絕（fail closed）

  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");

  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
}

// 給 cron 呼叫：每次 GET 就存一筆當下時間
export async function GET(request: Request) {
  // 明確標示為 request-time 執行，避免被預先渲染（cacheComponents 已開啟）
  await connection();

  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET is not configured");
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const log = await TimeLog.create({ timestamp: new Date() });

    return Response.json(
      { id: log.id, timestamp: log.timestamp },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save time log:", error);
    return Response.json({ error: "Failed to save time log" }, { status: 500 });
  }
}
