import React, { useState } from 'react';
import { getAiTutorResponse, AiTutorMessage } from '../lib/aiTutorApi';
import LoadingSpinner from './LoadingSpinner';
import { MessageCircle } from 'lucide-react';

interface AiTutorChatProps {
  onLeadCreated: (question: string, aiAnswer: string) => void;
}

// Basic sanitizer for AI output (for demo, not production-grade)
function sanitizeHtml(text: string) {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
    .replace(/\*\s/g, '• ')
    .replace(/\d+\./g, match => `<b>${match}</b>`);
}

const AiTutorChat: React.FC<AiTutorChatProps> = ({ onLeadCreated }) => {
  const [messages, setMessages] = useState<AiTutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBookTutor, setShowBookTutor] = useState(false);
  const [lastAiAnswer, setLastAiAnswer] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages: AiTutorMessage[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setShowBookTutor(false);
    const aiAnswer = await getAiTutorResponse(newMessages);
    setMessages([...newMessages, { role: 'ai', content: aiAnswer }]);
    setLastAiAnswer(aiAnswer);
    setLoading(false);
    setShowBookTutor(true);
  };

  const handleBookTutor = () => {
    // Pass the last user question and AI answer to parent
    const lastUserMsg = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
    onLeadCreated(lastUserMsg, lastAiAnswer);
    setShowBookTutor(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow border border-gray-100 p-6 mb-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
        <MessageCircle className="h-7 w-7 text-blue-500" />
        AI Tutor (Ask your doubt!)
      </h2>
      <div className="h-72 overflow-y-auto bg-white rounded-lg p-4 mb-4 flex flex-col space-y-4 border border-gray-100">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center my-auto">Ask any academic doubt and get instant help!</div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className="flex items-start gap-3">
            {msg.role === 'ai' ? (
              <>
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-green-100 rounded-full p-2 border border-green-200">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div
                  className="max-w-[80%] px-5 py-3 rounded-xl bg-green-50 shadow-sm border border-green-100 text-left prose prose-base prose-blue text-gray-900"
                  style={{ whiteSpace: 'pre-line', fontSize: '1.1rem' }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.content) }}
                />
              </>
            ) : (
              <div className="ml-auto max-w-[80%] px-5 py-3 rounded-xl bg-blue-100 shadow-sm border border-blue-100 text-right text-gray-900 font-medium" style={{ fontSize: '1.1rem' }}>
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {loading && <LoadingSpinner size="sm" text="AI is typing..." />}
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          type="text"
          placeholder="Type your doubt..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          disabled={loading}
        />
        <button
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 text-lg"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
      {showBookTutor && (
        <div className="mt-6 text-center">
          <button
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg text-lg"
            onClick={handleBookTutor}
          >
            Book the Tutor
          </button>
        </div>
      )}
    </div>
  );
};

export default AiTutorChat; 