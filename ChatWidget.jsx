import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { api } from "./api.js";
import { connectSocket } from "./socketServer.js";
import { useAuth } from "./AuthContext.jsx";

export default function ChatWidget() {
  const { account } = useAuth();
  const [open, setOpen] = useState(false);
  const [convs, setConvs] = useState([]);
  const [current, setCurrent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!account) return;
    socketRef.current = connectSocket();
    loadConvs();
    // eslint-disable-next-line
  }, [account]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    s.on("chat:message", (msg) => setMessages((m) => [...m, msg]));
    return () => s.off("chat:message");
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadConvs = async () => {
    try {
      const r = await api.get("/conversations/me");
      setConvs(r.data);
    } catch {}
  };

  const openConv = async (conv) => {
    setCurrent(conv);
    const r = await api.get(`/conversations/${conv._id}`);
    setMessages(r.data.messages);
    socketRef.current?.emit("chat:join", conv._id);
    socketRef.current?.emit("chat:read", conv._id);
  };

  const send = () => {
    if (!text.trim() || !current) return;
    socketRef.current?.emit("chat:send", { conversationId: current._id, content: text.trim() });
    setText("");
  };

  if (!account) return null;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-forest-800 text-cream shadow-2xl flex items-center justify-center hover:bg-forest-900"
      >
        {open ? <X /> : <MessageCircle />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-2xl shadow-2xl border border-forest-100 flex flex-col overflow-hidden">
          <div className="bg-forest-800 text-cream p-4 font-semibold">
            {current ? current.provider?.name || current.client?.name : "Mes conversations"}
          </div>

          {!current ? (
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {convs.map((c) => (
                <button key={c._id} onClick={() => openConv(c)}
                  className="w-full text-left p-3 rounded-lg hover:bg-forest-50 border border-forest-100">
                  <div className="font-medium text-forest-900">
                    {c.provider?.name || c.client?.name}
                  </div>
                  <div className="text-xs text-forest-700/70 truncate">{c.lastMessage || "—"}</div>
                </button>
              ))}
              {!convs.length && <p className="text-center text-forest-700/60 py-10">Aucune conversation</p>}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto p-4 space-y-2 bg-forest-50">
                {messages.map((m, i) => {
                  const mine = String(m.sender) === String(account.id);
                  return (
                    <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        mine ? "bg-forest-800 text-cream" : "bg-white text-forest-900 border border-forest-100"
                      }`}>{m.content}</div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <div className="p-3 border-t flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Message…" className="flex-1 border border-forest-100 rounded-xl px-3 py-2 outline-none focus:border-forest-700" />
                <button onClick={send} className="bg-forest-800 text-cream p-2 rounded-xl">
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}