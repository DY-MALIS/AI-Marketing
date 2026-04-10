import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('tiktok_token')?.value;
  const { publishId } = await req.json();

  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!publishId) return NextResponse.json({ error: "No publish ID provided" }, { status: 400 });

  try {
    const response = await axios.post(
      "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
      { publish_id: publishId },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("TikTok Status Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
