import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('tiktok_token')?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const response = await axios.get("https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
