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
      setResult("에러가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const parseMartLinks = (text: string) => {
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
          className="text-indigo-600 font-bold underline underline-offset-4 hover:text-indigo-800 transition-colors bg-indigo-50 px-1 rounded"
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
    <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center p-5 md:p-10 text-slate-900 font-sans">
      
      {/* 로고 및 헤더 */}
      <div className="flex flex-col items-center mt-16 mb-12 animate-in fade-in zoom-in duration-700">
        <div className="text-6xl mb-4 transform hover:scale-110 transition-transform cursor-default">🛒</div>
        <h1 className="text-5xl font-[900] tracking-tight text-slate-900 mb-2">
          Mart <span className="text-indigo-600">Attack</span>
        </h1>
        <p className="text-slate-500 font-medium">현지인처럼 장보는 가장 똑똑한 방법</p>
      </div>

      {/* 검색창 섹션 */}
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-2xl flex flex-col md:flex-row gap-3 mb-16"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="어떤 도시의 마트를 찾으시나요?"
            className="w-full p-5 pl-8 rounded-2xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-indigo-100 outline-none text-lg transition-all bg-white placeholder:text-slate-300"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20">📍</span>
        </div>
        <button 
          disabled={isLoading} 
          className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-xl active:scale-95 disabled:bg-slate-300 disabled:scale-100 transition-all shadow-[0_8px_20px_rgb(79,70,229,0.3)]"
        >
          {isLoading ? "분석중..." : "가이드 받기"}
        </button>
      </form>

      {/* 결과 카드 섹션 */}
      {(result || isLoading) && (
        <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden animate-in slide-in-from-bottom-8 duration-1000">
          
          <div className="bg-indigo-600 p-8 text-white relative">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              ✈️ {city || "현지"} 마트 가이드
            </h2>
            <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-black italic select-none">MART</div>
          </div>

          <div className="p-8 md:p-12">
            {isLoading ? (
              <div className="flex flex-col items-center py-20">
                <div className="w-12 h-12 border-[5px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
                <p className="text-slate-400 font-bold animate-pulse text-lg">AI가 마트 정보를 수집하고 있습니다...</p>
              </div>
            ) : (
              <article className="prose prose-indigo max-w-none">
                <ReactMarkdown
                  components={{
                    h3: ({ ...props }) => <h3 className="text-2xl font-black mt-12 mb-6 text-slate-800 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-6 before:bg-indigo-600 before:rounded-full" {...props} />,
                    p: ({ children }) => {
                      const processChildren = (node: any): any => {
                        if (typeof node === 'string') return parseMartLinks(node);
                        if (Array.isArray(node)) return node.map(processChildren);
                        if (node?.props?.children) return { ...node, props: { ...node.props, children: processChildren(node.props.children) } };
                        return node;
                      };
                      return <p className="text-slate-600 text-[1.1rem] leading-[1.8] mb-6">{processChildren(children)}</p>;
                    },
                    li: ({ children }) => {
                      const processChildren = (node: any): any => {
                        if (typeof node === 'string') return parseMartLinks(node);
                        if (Array.isArray(node)) return node.map(processChildren);
                        if (node?.props?.children) return { ...node, props: { ...node.props, children: processChildren(node.props.children) } };
                        return node;
                      };
                      return <li className="mb-3 pl-2 text-slate-600">{processChildren(children)}</li>;
                    },
                    strong: ({ children }) => <strong className="font-extrabold text-slate-900 bg-yellow-50 px-1 rounded">{children}</strong>,
                  }}
                >
                  {result}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>
      )}
      
      <footer className="mt-20 mb-10 text-slate-300 text-sm font-medium">
        © 2026 Mart Attack. Powered by Gemini 2.0
      </footer>
    </main>
  );
}