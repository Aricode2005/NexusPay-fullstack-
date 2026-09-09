import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api';

const SUGGESTIONS = [
  'How much did I spend today?',
  'Show my last 5 transactions',
  'Who did I send money to?',
  'What is my total balance?',
  'List all credits I received',
  'Summarize my spending this week',
];

export default function AIChatPage() {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const currentQuery = query;
    setChat(prev => [...prev, { role: 'user', content: currentQuery }]);
    setQuery('');
    setLoading(true);

    try {
      const data = await api.chat(currentQuery);
      setChat(prev => [...prev, { role: 'ai', content: data.answer || "I couldn't find relevant information." }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'ai', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {chat.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-indigo-50 p-5 rounded-2xl mb-5">
              <Bot className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Financial Assistant</h3>
            <p className="text-gray-400 max-w-md text-sm leading-relaxed mb-2">
              Ask me anything about your transactions. I securely query your account data using RAG (Retrieval-Augmented Generation) and summarize it for you.
            </p>
            <p className="text-gray-300 text-xs mb-6">Powered by Qwen 2.5 + In-Memory Vector Store</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => setQuery(q)}
                  className="text-xs bg-white border border-gray-200 text-gray-500 px-3.5 py-2 rounded-full hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {chat.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center mr-2.5 mt-1 shrink-0">
                <Bot className="w-3.5 h-3.5 text-indigo-500" />
              </div>
            )}
            <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md shadow-md shadow-indigo-200'
                : 'bg-white text-gray-700 rounded-bl-md border border-gray-200 shadow-sm'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-700">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center mr-2.5 mt-1 shrink-0">
              <Bot className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="bg-white border border-gray-200 px-5 py-3.5 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing your transactions...
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-5 border-t border-gray-200/80 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          {chat.length > 0 && (
            <button
              onClick={() => setChat([])}
              className="p-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <form onSubmit={handleSubmit} className="relative flex-1">
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Ask about your transactions..."
              disabled={loading}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder-gray-400 disabled:opacity-50"
            />
            <button
              type="submit" disabled={loading || !query.trim()}
              className="absolute right-2.5 top-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 p-2.5 rounded-xl text-white transition-all disabled:opacity-30 shadow-md shadow-indigo-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
