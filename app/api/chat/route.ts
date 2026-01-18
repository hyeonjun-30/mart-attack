import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { city } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: `${city} 지역의 현지 마트 정보를 알려줘. 
              주의사항:
              1. 추천하는 실제 마트 체인 이름(제목)은 반드시 대괄호를 사용하여 [마트이름] 형식으로 써줘. (예: [Big C], [이온 마트])
              2. 쇼핑 아이템이나 기타 강조가 필요한 텍스트는 기존처럼 **텍스트** 형식으로 써줘. (예: **야돔**, **라면**)
              3. 마트 이름에만 대괄호를 붙여야 지도 링크가 걸리니 반드시 지켜줘.` 
            }]
          }]
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json({ text: data.candidates[0].content.parts[0].text });
  } catch (error) {
    return NextResponse.json({ text: "데이터를 가져오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}