import { sanitizeInput } from './validation';

const API_KEY = 'AIzaSyAgHSRsfPfSviU8228XiuKfMprpH-5B3nE';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface AiTutorMessage {
  role: 'user' | 'ai';
  content: string;
}

// --- Blocklist for moderation ---
const BLOCKLIST: string[] = [
  // Sexual content
  'sex', 'sexual', 'nude', 'nudes', 'naked', 'porn', 'pornography', 'xxx', 'hentai',
  'blowjob', 'handjob', 'anal', 'oral', 'orgasm', 'masturbation', 'erection',
  'boobs', 'tits', 'dick', 'pussy', 'vagina', 'penis', 'cum', 'semen',
  'sex chat', 'send nudes', 'dirty talk', 'sexting',
  // Profanity and offensive language
  'fuck', 'shit', 'bitch', 'asshole', 'dickhead', 'mf', 'nigger', 'cunt',
  // Drugs and substance abuse
  'weed', 'marijuana', 'cocaine', 'heroin', 'meth', 'ecstasy',
  'get high', 'buy drugs', 'where to get weed',
  // Violence or harm
  'harm myself', 'kill myself', 'kill someone', 'suicide', 'cutting',
  // Grooming/exploitation
  'are you alone', 'send me a pic', 'let’s meet', 'lets meet', 'i’m older than you', 'im older than you'
];

function containsBlockedContent(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKLIST.some(word => lower.includes(word));
}

export async function getAiTutorResponse(messages: AiTutorMessage[]): Promise<string> {
  // Moderation: block inappropriate/18+ content before sending to AI
  const lastUserMsg = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
  if (containsBlockedContent(lastUserMsg)) {
    return '🚫 This topic is not appropriate for this educational chatbot. Please ask something academic and age-appropriate.';
  }

  // System instruction: Friendly, expert teacher. Use easy, clear language. Avoid jargon. Break down complex concepts. Be conversational and supportive, like a helpful friend. Only answer academic-related questions for school/college students. Politely refuse non-academic or 18+ questions.
  const systemInstruction = {
    role: 'user',
    parts: [{
      text: `You are a friendly, expert teacher. Always use easy and clear language, avoid jargon, and break down complex concepts into simple explanations for school or early college students. Be conversational and supportive, like a helpful friend, not a strict instructor. Only answer academic-related questions (science, math, history, etc.). If a question is not academic or is 18+ or inappropriate, politely refuse and say you can only help with academic topics.`
    }]
  };

  // Gemini expects a "contents" array with role and parts
  const contextMessages = messages.slice(-5).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: sanitizeInput(m.content) }]
  }));

  // Prepend the system instruction
  const contents = [systemInstruction, ...contextMessages];

  const body = {
    contents
  };

  try {
    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Failed to get AI response');
    const data = await res.json();
    // Gemini returns text in: data.candidates[0].content.parts[0].text
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate an answer.';
  } catch (err) {
    console.error('AI Tutor API error:', err);
    return 'Sorry, there was an error connecting to the AI Tutor.';
  }
} 