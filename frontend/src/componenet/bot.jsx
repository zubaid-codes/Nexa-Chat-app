import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaMicrophone, FaPaperPlane, FaRobot } from "react-icons/fa";
import { motion } from "framer-motion";

function Bot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        setInput(event.results[0][0].transcript);
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setListening(true);
    recognitionRef.current.start();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { text: userText, sender: "user" }]);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:4002/bot/v1/message", {
        text: userText,
      });

      setMessages((prev) => [
        ...prev,
        { text: res.data.botMessage, sender: "bot" },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ NEXA encountered an error.", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-black text-white">
      {/* 🔮 NAVBAR */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full z-20 backdrop-blur-xl bg-white/5 border-b border-white/10"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-xl font-bold tracking-widest">
            <FaRobot className="text-cyan-400 animate-pulse" />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              NEXA AI
            </span>
          </div>
        </div>
      </motion.header>

      {/* 💬 CHAT AREA */}
      <main className="pt-24 pb-28 max-w-5xl mx-auto px-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-24">
            👋 Hello, I’m{" "}
            <span className="text-cyan-400 font-semibold">NEXA</span>
            <br />
            Your futuristic AI assistant
          </div>
        )}

        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-lg
              ${
                msg.sender === "user"
                  ? "ml-auto bg-gradient-to-r from-blue-600 to-cyan-500"
                  : "mr-auto bg-white/10 backdrop-blur-md border border-white/10"
              }`}
          >
            {msg.text}
          </motion.div>
        ))}

        {loading && (
          <div className="mr-auto bg-white/10 px-4 py-2 rounded-xl animate-pulse">
            NEXA is thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* 🎤 INPUT AREA */}
      <footer className="fixed bottom-0 w-full backdrop-blur-xl bg-black/40 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 bg-white/5 rounded-full px-5 py-3 border border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Talk to NEXA..."
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
            />

            <button
              onClick={startListening}
              className={`p-3 rounded-full transition ${
                listening
                  ? "bg-red-500 animate-pulse"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <FaMicrophone />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="p-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Bot;
