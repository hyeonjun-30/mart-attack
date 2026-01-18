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
      setResult(data.text);
    } catch (error) {
      setResult("정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // [절대 유지] 기존의 [마트명] 기반 구글 지도 링크 로직
  const parseMartLinks = (text: string) => {
    if (typeof text !== 'string') return text;
    
    const regex = /\[(.*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const martName = match[1];
      parts.push(
        <a
          key={match.index}
          href={`https://www.google.com/maps/search/${encodeURIComponent(martName + " " + city)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-bold underline underline-offset-4 hover:text-blue-800 transition-colors"
        >
          {martName}
        </a>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#e0f0ff] via-[#f5faff] to-[#ffffff] flex flex-col items-center p-6 md:p-12 text-slate-900 font-sans">
      
      {/* 이미지 스타일의 헤더 섹션 */}
      <div className="flex flex-col items-center mt-12 mb-16 animate-in fade-in slide-in-from-top-6 duration-700">
        <div className="text-6xl mb-4 drop-shadow-lg transform hover:scale-110 transition-transform">🛒</div>
        <h1 className="text-6xl font-[950] tracking-tighter text-slate-900 drop-shadow-sm">
          Mart <span className="text-blue-600">A</span>ttack
        </h1>
        <p className="text-slate-500 font-semibold mt-4 text-lg">현지인처럼 장보는 가장 똑똑한 방법</p>
      </div>

      {/* 입체적인 검색 섹션 */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex flex-col gap-3">
          <div className="relative group">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="방문하실 도시를 입력하세요 (예: 도쿄, 방콕)"
              className="w-full p-5 rounded-full border-none shadow-[0_10px_30px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-blue-200 outline-none text-lg text-center bg-white/90 backdrop-blur-sm transition-all"
            />
          </div>
          <button 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-5 rounded-full font-black text-xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-95 transition-all disabled:bg-slate-300 disabled:shadow-none"
          >
            {isLoading ? "정보 분석 중..." : "찾기"}
          </button>
        </div>
      </form>

      {/* 결과 카드 디자인 (이미지 스타일 반영) */}
      {(result || isLoading) && (
        <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-white/50 overflow-hidden animate-in zoom-in-95 duration-700">
          
          {/* 파란색 상단 탭 */}
          <div className="bg-blue-600 p-8 flex items-center gap-3">
            <span className="text-white text-3xl">📍</span>
            <h2 className="text-white text-2xl font-black">
              {city} 마트 공략 가이드
            </h2>
          </div>

          <div className="p-10 md:p-14">
            {isLoading ? (
              <div className="flex flex-col items-center py-20 gap-6">
                <div className="w-16 h-16 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold text-lg animate-pulse">현지 마트 정보를 수집하고 있습니다...</p>
              </div>
            ) : (
              <article className="prose prose-slate max-w-none text-left leading-relaxed">
                <ReactMarkdown
                  components={{
                    // [기능 유지] 마트 링크 로직
                    p: ({ children }) => {
                      const process = (node: any): any => {
                        if (typeof node === 'string') return parseMartLinks(node);
                        if (Array.isArray(node)) return node.map(process);
                        if (node?.props?.children) return { ...node, props: { ...node.props, children: process(node.props.children) } };
                        return node;
                      };
                      return <p className="mb-8 text-slate-600 text-[1.1rem] font-medium">{process(children)}</p>;
                    },
                    li: ({ children }) => {
                      const process = (node: any): any => {
                        if (typeof node === 'string') return parseMartLinks(node);
                        if (Array.isArray(node)) return node.map(process);
                        if (node?.props?.children) return { ...node, props: { ...node.props, children: process(node.props.children) } };
                        return node;
                      };
                      return <li className="mb-4 text-slate-600">{process(children)}</li>;
                    },
                    // [디자인 강조] 굵은 글씨 스타일
                    strong: ({ children }) => (
                      <strong className="font-extrabold text-slate-900 bg-yellow-100/80 px-1 rounded">
                        {children}
                      </strong>
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="text-2xl font-black mt-12 mb-6 text-slate-800 border-l-8 border-blue-600 pl-4" {...props} />
                    ),
                  }}
                >
                  {result}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>
      )}

      <footer className="mt-24 mb-12 text-slate-400 font-semibold tracking-wide">
        © 2026 Mart Attack. 여행자를 위한 AI 가이드
      </footer>
    </main>
  );
}