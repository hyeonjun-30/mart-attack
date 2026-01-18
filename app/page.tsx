"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [city, setCity] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setIsLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.text || "데이터를 가져오지 못했습니다.");

      setResult(data.text);

    } catch (error: any) {
      setResult(`에러가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 md:p-12 text-slate-900 font-sans">
      {/* 제목 섹션 */}
      <section className="max-w-2xl w-full text-center mt-12 mb-10">
        <h1 className="text-5xl font-black mb-4 tracking-tighter text-slate-900 flex items-center justify-center gap-3">
          🛒 Mart Attack
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          현지 마트에서 만나는 진짜 여행, 마트 어택 가이드
        </p>
      </section>

      {/* 검색창 섹션 */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl flex gap-3 mb-10 text-center">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="방문하실 도시를 입력하세요 (예: 도쿄, 파리)"
          className="flex-1 p-5 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 shadow-sm bg-white text-lg transition-all text-center"
        />
        <button 
          disabled={isLoading}
          className="bg-blue-600 text-white px-8 py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:bg-slate-300"
        >
          {isLoading ? "분석 중..." : "찾기"}
        </button>
      </form>

      {/* 결과 섹션 */}
      {(result || isLoading) && (
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="w-full h-32 bg-blue-600 flex items-center justify-center">
            <h2 className="text-white text-2xl font-black italic tracking-widest opacity-30">MART INFORMATION</h2>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-extrabold mb-6 text-blue-600 flex items-center gap-2">
              📍 현지 마트 공략법
            </h2>

            {isLoading ? (
              <div className="flex flex-col items-center py-10 gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-medium italic">마트 정보를 분석하고 있습니다...</p>
              </div>
            ) : (
              <article className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                <ReactMarkdown
                  components={{
                    h3: ({...props}) => <h3 className="text-xl font-bold mt-8 mb-4 text-slate-800 border-l-4 border-blue-500 pl-3" {...props} />,
                    p: ({...props}) => <p className="mb-5 text-left" {...props} />,
                    ul: ({...props}) => <ul className="list-disc ml-5 mb-6 space-y-3 text-left" {...props} />,
                    li: ({...props}) => <li className="pl-1" {...props} />,
                    // 동그라미 친 주요 마트 체인에만 링크를 거는 로직
                    strong: ({children}) => {
                      const content = String(children);
                      
                      // 1. 링크를 걸고 싶은 마트 체인 리스트 (동그라미 친 항목들)
                      const martKeywords = [
                        "이온", "AEON", "세이유", "Seiyu", "라이프", "Life", 
                        "이토요카도", "Ito-Yokado", "기노쿠니야", "Kinokuniya", 
                        "아오야마 가든", "Aoyama Garden", "돈키호테", "Don Quijote",
                        "야오코", "Yaoko"
                      ];
                      
                      // 2. 키워드 포함 여부 확인
                      const isMart = martKeywords.some(mart => content.includes(mart));

                      // 3. 마트 체인인 경우에만 구글 지도 링크 생성
                      if (isMart) {
                        const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(content + " " + city)}`;
                        return (
                          <a 
                            href={mapUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 font-bold underline underline-offset-4 hover:text-blue-800 decoration-blue-300 transition-colors"
                          >
                            {children}
                          </a>
                        );
                      }

                      // 4. 일반 강조(계란, 과일 등)는 그냥 굵게만 표시
                      return <strong className="font-bold text-slate-900">{children}</strong>;
                    },
                  }}
                >
                  {result}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>
      )}
    </main>
  );
}