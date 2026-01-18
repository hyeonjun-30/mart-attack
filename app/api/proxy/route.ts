import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) return new Response("URL missing", { status: 400 });

  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // 브라우저에게 이 이미지는 안전하다고 확실히 말해줍니다.
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "image/png",
        "Access-Control-Allow-Origin": "*", // 모든 곳에서 접근 허용
        "Cache-Control": "no-cache", 
      },
    });
  } catch (error) {
    return new Response("Proxy error", { status: 500 });
  }
}