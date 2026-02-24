import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_CITIES = ['pune', 'mumbai', 'delhi', 'bangalore', 'chennai'];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState('');
  const [knowledge, setKnowledge] = useState({ cities: DEFAULT_CITIES });
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Run only once (avoid double-run in React StrictMode dev)
    if (initializedRef.current) return;
    initializedRef.current = true;
    // Open widget on first load and show polite greeting
    setOpen(true);
    pushMessage({ from: 'bot', text: 'Hi! How can I help you today?' });
    // focus input shortly after opening
    setTimeout(() => inputRef.current?.focus(), 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushMessage = (msg) => setMessages((m) => [...m, msg]);

  const quickTrain = () => {
    // Add a few extra known cities and confirmations — mimic a quick training step
    setKnowledge((k) => ({
      ...k,
      cities: Array.from(new Set([...k.cities, 'kolkata', 'hyderabad', 'ahmedabad'])),
    }));
    pushMessage({ from: 'bot', text: 'Quick train complete: I now know more cities (kolkata, hyderabad, ahmedabad).' });
  };

  const parseAndAct = (text) => {
    const lower = text.toLowerCase();
    const filters = {};

    // area: look for 'near <area>' or 'in <area>' patterns
    const areaMatch = lower.match(/(?:near|in|around|at)\s+([a-z\s]{2,40})/i);
    if (areaMatch) {
      // take first token (e.g., 'katraj area' -> 'katraj')
      const rawArea = areaMatch[1].trim().split(/\s+/)[0];
      filters.area = rawArea[0].toUpperCase() + rawArea.slice(1);
    }

    // city (from knowledge.cities)
    const cityRegex = new RegExp(knowledge.cities.join('|'), 'i');
    const cityMatch = lower.match(cityRegex);
    if (cityMatch) {
      const raw = cityMatch[0];
      filters.city = raw[0].toUpperCase() + raw.slice(1);
    }

    // budget (improved regex)
    const budgetMatch = lower.match(/(?:budget|rs|inr|rupees)\s*[:\-]?\s*(\d{2,6})|\b(\d{2,6})\b/);
    if (budgetMatch) {
      const num = budgetMatch[1] || budgetMatch[2];
      if (num) filters.budget = num;
    }

    // gender
    if (lower.includes('boys') || lower.includes('boys only')) filters.gender = 'Boys';
    if (lower.includes('girls') || lower.includes('girls only')) filters.gender = 'Girls';
    if (lower.includes('mixed')) filters.gender = 'Mixed';

    return filters;
  };

  const handleSend = () => {
    if (!value.trim()) return;
    const text = value.trim();
    pushMessage({ from: 'user', text });
    setValue('');

    const filters = parseAndAct(text);

    if (Object.keys(filters).length > 0) {
      // Create a friendly message instead of dumping raw JSON
      const parts = [];
      if (filters.city) parts.push(`${filters.city}`);
      if (filters.budget) parts.push(`budget ₹${filters.budget}`);
      if (filters.gender) parts.push(`${filters.gender}`);
      const friendly = parts.length > 0 ? parts.join(', ') : 'filters applied';
      pushMessage({ from: 'bot', text: `Searching for ${friendly}...` });
      window.dispatchEvent(new CustomEvent('applyFilters', { detail: filters }));
      navigate('/browse');
      setOpen(false);
      return;
    }

    // fallback
    const lower = text.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi')) {
      pushMessage({ from: 'bot', text: 'Hello! Tell me city or budget to search PGs.' });
    } else if (lower.includes('train')) {
      quickTrain();
    } else {
      pushMessage({ from: 'bot', text: "Sorry, I didn't understand. Try: 'Show PGs in Pune' or 'Budget 500'" });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">{/* ensure high z-index so widget sits above page content */}
      {open ? (
        <div className="w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50">
          <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏠</span>
              <div>Assistant</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setOpen(false)} className="text-xl">×</button>
            </div>
          </div>
          <div className="p-3 h-64 overflow-auto space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={m.from === 'bot' ? 'text-sm text-gray-700' : 'text-sm text-right'}>
                <div className={m.from === 'bot' ? 'inline-block bg-gray-100 p-2 rounded' : 'inline-block bg-blue-600 text-white p-2 rounded'}>
                  {String(m.text)}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full px-3 py-2 border rounded"
              placeholder="Ask me (e.g., 'PGs in Pune')"
            />
            <button onClick={handleSend} className="btn-primary w-full mt-2">Send</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="shadow-lg px-4 py-3 rounded-full bg-blue-600 text-white z-50" aria-label="Open assistant">
          🏠 Help
        </button>
      )}
    </div>
  );
}
