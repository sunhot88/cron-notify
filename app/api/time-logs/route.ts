import { connection } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TimeLog from "@/models/TimeLog";

// 給 cron 呼叫：每次 GET 就存一筆當下時間
export async function GET() {
  // 明確標示為 request-time 執行，避免被預先渲染（cacheComponents 已開啟）
  await connection();

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
