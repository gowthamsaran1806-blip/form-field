import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "locales", "ta.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Tamil locale file not found" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="field-shift-tamil-locale.json"',
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to download Tamil locale file" }, { status: 500 });
  }
}
