import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { city } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // 아까 성공했던 Gemini 2.0 모델 주소로 직접 연결
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: `${city} 지역의 현지 마트 정보와 추천 쇼핑 리스트를 알려줘. 그리고 반드시 마지막 줄에 이 도시 마트의 풍경을 표현한 영어 문장을 'IMAGE_PROMPT: [영어문장]' 형식으로 추가해줘.` 
            }]
          }]
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "구글 서버 응답 에러");

    const fullText = data.candidates[0].content.parts[0].text;

    // 텍스트와 이미지 프롬프트를 분리
    const splitContent = fullText.split("IMAGE_PROMPT:");
    const mainText = splitContent[0].trim();
    const imagePrompt = splitContent[1] ? splitContent[1].trim() : `${city} local grocery store, photorealistic`;

    return NextResponse.json({ 
      text: mainText,
      imagePrompt: imagePrompt
    });

  } catch (error: any) {
    return NextResponse.json({ text: `연결 에러: ${error.message}` }, { status: 500 });
  }
}