"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [city, setCity] = useState("");
  const [result, setResult] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setIsLoading(true);
    setResult("");
    setImageUrl("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.text);

      setResult(data.text);
      
      const finalPrompt = data.imagePrompt || `${city} local market scenery`;
      const originalUrl = `https://pollinations.ai/p/${encodeURIComponent(finalPrompt)}?width=1024&height=512&nologo=true`;
      
      // 직접 주소 대신 우리 프록시 서버(/api/proxy) 주소를 사용합니다.
      setImageUrl(`/api/proxy?url=${encodeURIComponent(originalUrl)}`);

    } catch (error: any) {
      setResult(`에러: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 md:p-12 text-slate-900 font-sans text-center">
      <section className="max-w-2xl w-full mt-12 mb-10">
        <h1 className="text-5xl font-black mb-4 tracking-tighter">🛒 Mart Attack</h1>
        <p className="text-lg text-slate-500 font-medium">현지 마트에서 만나는 진짜 여행</p>
      </section>

      <form onSubmit={handleSubmit} className="w-full max-w-xl flex gap-3 mb-10">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="방문하실 도시를 입력하세요"
          className="flex-1 p-5 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 shadow-sm bg-white text-lg transition-all"
        />
        <button disabled={isLoading} className="bg-blue-600 text-white px-8 py-5 rounded-2xl font-bold hover:bg-blue-700 shadow-lg disabled:bg-slate-300">
          {isLoading ? "분석 중..." : "찾기"}
        </button>
      </form>

      {(result || isLoading) && (
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left">
          {/* 프록시를 통해 불러온 이미지는 보안 에러가 발생하지 않습니다. */}
          {imageUrl && !isLoading && (
            <div className="w-full h-64 relative bg-slate-200">
              <img 
                src={imageUrl} 
                alt="Market Scenery" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-6 text-white font-bold drop-shadow-lg">📍 {city} Market View</div>
            </div>
          )}

          <div className="p-8">
            <h2 className="text-2xl font-extrabold mb-6 text-blue-600">📍 현지 마트 공략법</h2>
            {isLoading ? (
              <div className="flex flex-col items-center py-10 gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-medium italic">마트 전단지를 분석하고 있습니다...</p>
              </div>
            ) : (
              <article className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                <ReactMarkdown
                  components={{
                    h3: ({...props}) => <h3 className="text-xl font-bold mt-8 mb-4 text-slate-800 border-l-4 border-blue-500 pl-3" {...props} />,
                    p: ({...props}) => <p className="mb-5" {...props} />,
                    ul: ({...props}) => <ul className="list-disc ml-5 mb-6 space-y-3" {...props} />,
                    li: ({...props}) => <li className="pl-1" {...props} />,
                    strong: ({children}) => {
                      const placeName = String(children);
                      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`;
                      return (
                        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline underline-offset-4 hover:text-blue-800">
                          {children}
                        </a>
                      );
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