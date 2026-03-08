import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: "en", label: "English", greeting: "Hello! How can I help you today?" },
  { code: "hi", label: "हिंदी", greeting: "नमस्ते! आज मैं आपकी कैसे सहायता कर सकता हूँ?" },
  { code: "ta", label: "தமிழ்", greeting: "வணக்கம்! இன்று நான் உங்களுக்கு எப்படி உதவலாம்?" },
  { code: "te", label: "తెలుగు", greeting: "నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?" },
  { code: "bn", label: "বাংলা", greeting: "নমস্কার! আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?" },
  { code: "mr", label: "मराठी", greeting: "नमस्कार! आज मी तुम्हाला कशी मदत करू शकतो?" },
];

const QUICK_TOPICS = [
  { icon: "🏛️", label: "Govt Schemes", query: "What government schemes am I eligible for? I am a farmer with 2 acres of land." },
  { icon: "⚖️", label: "Legal Rights", query: "What are my rights as a tenant in India?" },
  { icon: "🏥", label: "Health & PMJAY", query: "How do I apply for Ayushman Bharat health card?" },
  { icon: "💼", label: "Jobs & Skills", query: "What free skill training programs are available for youth in India?" },
  { icon: "🌾", label: "PM Kisan", query: "How do I check my PM Kisan status and get ₹6000?" },
  { icon: "🍚", label: "Ration Card", query: "How do I apply for a new ration card in India?" },
];

const SYSTEM_PROMPT = `You are JanSaathi AI (जन साथी), a friendly and helpful AI assistant built specifically for Indian citizens. Your mission is to help ordinary Indians — farmers, daily wage workers, students, and families — access information about:

1. Government schemes (PM Kisan, Ayushman Bharat, PM Awas Yojana, Ujjwala Yojana, Jan Dhan, etc.)
2. Legal rights (tenant rights, consumer rights, RTI, FIR filing)
3. Healthcare guidance (PMJAY eligibility, ASHA workers, Jan Aushadhi)
4. Jobs & skills (PMKVY, apprenticeships, government jobs)
5. Ration card, Aadhaar, and other essential documents

IMPORTANT RULES:
- Always be warm, simple, and use easy language that even rural Indians can understand
- If the user writes in Hindi, respond in Hindi. If Tamil, respond in Tamil. Match their language always.
- Give practical, actionable steps — not just generic advice
- Always mention eligibility criteria, how to apply, and what documents are needed
- End every response with "कुछ और जानना है? / Anything else you want to know?" to encourage follow-up
- You are FREE for all Indians — never suggest paid services
- Keep responses concise but helpful — bullet points work great
- If you don't know something specific, say "I'll help you find the right office or helpline for this"`;

export default function JanSaathiAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [started, setStarted] = useState(false);
  const [dots, setDots] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (started && messages.length === 0) {
      setMessages([{ role: "assistant", content: lang.greeting + "\
\
I am JanSaathi AI 🇮🇳 — your free guide to government schemes, legal rights, health, and more. Ask me anything!" }]);
    }
  }, [started, lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(iv);
  }, [loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Sorry, I couldn't get a response. Please try again.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ Something went wrong. Please check your connection and try again." }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!started) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f1923 0%, #1a2d1a 50%, #0f1923 100%)",
        fontFamily: "'Georgia', serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,153,51,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(19,136,8,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", width: "80px", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "32px" }}>
          <div style={{ flex: 1, background: "#FF9933" }} />
          <div style={{ flex: 1, background: "#ffffff" }} />
          <div style={{ flex: 1, background: "#138808" }} />
        </div>

        <div style={{ fontSize: "72px", marginBottom: "8px", filter: "drop-shadow(0 0 30px rgba(255,153,51,0.5))" }}>🤝</div>

        <h1 style={{
          fontSize: "clamp(36px, 8vw, 64px)",
          fontWeight: "bold",
          color: "#ffffff",
          margin: "0 0 4px 0",
          letterSpacing: "-1px",
          textShadow: "0 0 40px rgba(255,153,51,0.4)",
        }}>JanSaathi AI</h1>

        <p style={{ color: "#FF9933", fontSize: "18px", margin: "0 0 8px 0", fontStyle: "italic" }}>जन साथी • People's Companion</p>

        <p style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: "16px",
          textAlign: "center",
          maxWidth: "480px",
          lineHeight: "1.7",
          margin: "0 0 40px 0",
        }}>
          Free AI guide for every Indian 🇮🇳<br />
          Government schemes • Legal rights • Health • Jobs
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", marginBottom: "36px" }}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLang(l)} style={{
              padding: "8px 18px",
              borderRadius: "50px",
              border: lang.code === l.code ? "2px solid #FF9933" : "2px solid rgba(255,255,255,0.2)",
              background: lang.code === l.code ? "rgba(255,153,51,0.2)" : "rgba(255,255,255,0.05)",
              color: lang.code === l.code ? "#FF9933" : "rgba(255,255,255,0.7)",
              cursor: "pointer",
              fontSize: "14px",
              fontFamily: "sans-serif",
              transition: "all 0.2s",
            }}>{l.label}</button>
          ))}
        </div>

        <button onClick={() => setStarted(true)} style={{
          padding: "16px 48px",
          borderRadius: "50px",
          border: "none",
          background: "linear-gradient(135deg, #FF9933, #FF6B00)",
          color: "#ffffff",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(255,153,51,0.4)",
          fontFamily: "sans-serif",
          letterSpacing: "0.5px",
        }}>
          Start for Free →
        </button>

        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", marginTop: "20px", fontFamily: "sans-serif" }}>
          100% Free • No login required • All Indian languages
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1923",
      fontFamily: "sans-serif",
      display: "flex",
      flexDirection: "column",
      maxWidth: "800px",
      margin: "0 auto",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1a2d1a, #0f1923)",
        borderBottom: "1px solid rgba(255,153,51,0.2)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <button onClick={() => { setStarted(false); setMessages([]); }} style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "20px", padding: "0"
        }}>←</button>
        <div style={{ fontSize: "28px" }}>🤝</div>
        <div>
          <div style={{ color: "#ffffff", fontWeight: "bold", fontSize: "16px" }}>JanSaathi AI</div>
          <div style={{ color: "#138808", fontSize: "12px" }}>● Online • Free for all Indians</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF9933" }} />
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ffffff" }} />
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#138808" }} />
        </div>
      </div>

      {messages.length <= 1 && (
        <div style={{ padding: "16px 16px 0", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {QUICK_TOPICS.map((t, i) => (
            <button key={i} onClick={() => sendMessage(t.query)} style={{
              padding: "8px 14px",
              borderRadius: "50px",
              border: "1px solid rgba(255,153,51,0.3)",
              background: "rgba(255,153,51,0.08)",
              color: "rgba(255,255,255,0.8)",
              cursor: "pointer",
              fontSize: "13px",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            gap: "10px",
            alignItems: "flex-end",
          }}>
            {m.role === "assistant" && <div style={{ fontSize: "24px", flexShrink: 0 }}>🤝</div>}
            <div style={{
              maxWidth: "75%",
              padding: "12px 16px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? "linear-gradient(135deg, #FF9933, #FF6B00)" : "rgba(255,255,255,0.07)",
              border: m.role === "assistant" ? "1px solid rgba(255,255,255,0.1)" : "none",
              color: "#ffffff",
              fontSize: "15px",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <div style={{ fontSize: "24px" }}>🤝</div>
            <div style={{
              padding: "12px 20px",
              borderRadius: "18px 18px 18px 4px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#FF9933",
              fontSize: "15px",
            }}>
              Thinking{dots}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: "16px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        background: "#0f1923",
        display: "flex",
        gap: "10px",
        alignItems: "flex-end",
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about govt schemes, legal rights, health... (any language)"
          rows={1}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,153,51,0.3)",
            borderRadius: "16px",
            padding: "12px 16px",
            color: "#ffffff",
            fontSize: "15px",
            outline: "none",
            resize: "none",
            fontFamily: "sans-serif",
            lineHeight: "1.5",
            maxHeight: "120px",
            overflowY: "auto",
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "none",
            background: loading || !input.trim() ? "rgba(255,153,51,0.3)" : "linear-gradient(135deg, #FF9933, #FF6B00)",
            color: "#ffffff",
            fontSize: "20px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >➤</button>
      </div>

      <div style={{ textAlign: "center", padding: "8px", color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>
        JanSaathi AI • Free for every Indian 🇮🇳 • Not official govt advice
      </div>
    </div>
  );
}
