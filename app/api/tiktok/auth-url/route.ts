import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${protocol}://${host}/api/tiktok/callback`;

  if (!clientKey) {
    return NextResponse.json({ error: "TIKTOK_CLIENT_KEY not configured" }, { status: 500 });
  }

  const state = Math.random().toString(36).substring(7);
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=video.upload,video.publish,user.info.basic&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  return NextResponse.json({ url: authUrl });
}
