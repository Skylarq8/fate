// 📁 app/api/payment/session/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id")

  const res = await fetch(
    `https://byl.mn/api/v1/projects/${process.env.BYL_PROJECT_ID}/checkouts/${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.BYL_TOKEN}`,
        Accept: "application/json",
      },
    }
  )

  const data = await res.json()
  return NextResponse.json(data.data)
}