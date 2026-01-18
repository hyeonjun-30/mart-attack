"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [city, setCity] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 모바일/데스크톱 공용 시스템 인쇄(PDF 저장) 함수
  const handlePrint = () => {
    window.print();
  };

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

  // [기능 유지] 마트 이름([ ])에만 구글 지도 링크 적용
  const renderMartLinks = (text: any) => {
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
      const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(martName + " " + city)}`;
      
      parts.push(
        <a
          key={match.index}
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-bold underline underline-offset-4 hover:text-blue-800"
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
    <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center p-6 md:p-12 text-slate-900 font-sans print:bg-white print:p-0">
      
      {/* 헤더 - PDF 출력 시 숨김 */}
      <div className="flex flex-col items-center mt-10 mb-12 print:hidden">
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">
          Mart <span className="text-blue-600">Attack</span>
        </h1>
        <p className="text-slate-500 font-medium tracking-tight text-lg text-center">현지인처럼 장보는 가장 똑똑한 방법</p>
      </div>

      {/* 검색 바 - PDF 출력 시 숨김 */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl flex gap-2 mb-10 shadow-2xl rounded-[2rem] p-1.5 bg-white border border-slate-100 print:hidden">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="방문하실 도시를 입력하세요"
          className="flex-1 p-4 pl-6 rounded-2xl focus:outline-none text-lg font-medium w-full"
        />
        <button 
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 md:px-10 py-4 rounded-[1.5rem] font-black text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 shrink-0"
        >
          {isLoading ? "분석중" : "찾기"}
        </button>
      </form>

      {/* PDF 저장 버튼 - 결과가 있을 때만 노출 & PDF 출력 시 숨김 */}
      {result && !isLoading && (
        <button 
          onClick={handlePrint}
          className="mb-8 flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95 print:hidden"
        >
          <span className="text-xl">📄</span> PDF로 저장 / 인쇄하기
        </button>
      )}

      {(result || isLoading) && (
        <div className="w-full max-w-4xl flex flex-col gap-10">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4 print:hidden">
              <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 font-bold">마트 정보를 정리하고 있습니다...</p>
            </div>
          ) : (
            <div className="space-y-12 pb-20 print:pb-0 print:space-y-6">
              <ReactMarkdown
                components={{
                  // 마트별 블록 제목
                  h3: ({ children, ...props }) => (
                    <div className="mt-12 first:mt-0 mb-[-32px] print:mt-6 print:mb-[-20px]">
                      <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 border-l-8 border-blue-600 pl-4 py-2" {...props}>
                        {renderMartLinks(children)}
                      </h3>
                    </div>
                  ),
                  // 하나의 통합 블록 (카드 형태)
                  p: ({ children }) => (
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-white mb-6 last:mb-0 print:shadow-none print:border-slate-200 print:p-6 print:rounded-xl">
                      <div className="leading-relaxed text-slate-600 text-[1.1rem] font-medium print:text-black print:text-sm">
                        {renderMartLinks(children)}
                      </div>
                    </div>
                  ),
                  ul: ({ children }) => (
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-white mb-6 last:mb-0 print:shadow-none print:border-slate-200 print:p-6 print:rounded-xl">
                      <ul className="space-y-4 print:space-y-2">{children}</ul>
                    </div>
                  ),
                  li: ({ children }) => (
                    <li className="flex gap-3 text-slate-600 items-start print:text-black print:text-sm">
                      <span className="text-blue-500 mt-1 print:hidden">✦</span>
                      <div className="flex-1 leading-relaxed">{renderMartLinks(children)}</div>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-extrabold text-slate-900 mx-0.5 print:text-black">
                      {children}
                    </strong>
                  ),
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      <footer className="mt-24 mb-12 text-slate-300 font-bold print:hidden">
        © 2026 Mart Attack. 통합 블록 가이드
      </footer>

      {/* 인쇄 전용 CSS 스타일링 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
          }
          /* 링크 색상 유지 */
          a {
            color: #2563eb !important;
            text-decoration: underline !important;
          }
        }
      `}</style>
    </main>
  );
}