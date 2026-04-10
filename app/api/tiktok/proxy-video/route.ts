import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) return new NextResponse("No URL provided", { status: 400 });

  try {
    const response = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'arraybuffer',
      headers: {
        'x-goog-api-key': process.env.API_KEY || process.env.GEMINI_API_KEY || '',
      }
    });

    return new NextResponse(response.data, {
      headers: {
        'Content-Type': response.headers['content-type'] || 'video/mp4',
      },
    });
  } catch (error: any) {
    console.error("Proxy Error:", error.message);
    return new NextResponse("Failed to proxy video", { status: 500 });
  }
}
