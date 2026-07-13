import { useMemo, useRef, useState } from "react";
import { clearChatSession, sendChatMessage } from "../flaskapi/ChatbotApi";
import "./FloatingChatbot.css";

const createSessionId = () => window.crypto?.randomUUID?.() || `skin-chat-${Date.now()}`;
const initialMessage = { role: "bot", text: "안녕하세요! 피부 관리와 성분에 관해 궁금한 점을 물어보세요." };
const suggestedQuestions = ["여드름 피부 세안법", "민감성 피부 성분", "건성 피부 관리법"];

function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const sessionId = useMemo(createSessionId, []);
  const messageListRef = useRef(null);

  const scrollToBottom = () => {
    window.requestAnimationFrame(() => {
      const messageList = messageListRef.current;
      if (messageList) messageList.scrollTop = messageList.scrollHeight;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendMessage(input);
  };

  const sendMessage = async (value) => {
    const message = value.trim();
    if (!message || isSending) return;
    setMessages((current) => [...current, { role: "user", text: message }]);
    setInput("");
    setIsSending(true);
    scrollToBottom();
    try {
      const response = await sendChatMessage(sessionId, message);
      setMessages((current) => [...current, { role: "bot", text: response.data.answer }]);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "챗봇 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";
      setMessages((current) => [...current, { role: "error", text: errorMessage }]);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  const handleReset = async () => {
    setMessages([initialMessage]);
    try {
      await clearChatSession(sessionId);
    } catch (error) {
      console.warn("챗봇 대화 초기화 실패", error);
    }
  };

  return (
    <div className="chatbot_wrapper">
      {isOpen && (
        <section className="chatbot_panel" aria-label="피부 상담 챗봇">
          <header className="chatbot_header">
            <div className="chatbot_identity">
              <div className="chatbot_header_avatar">
                <img src="/img/chatbot-mascot.png" alt="" />
                <span aria-hidden="true" />
              </div>
              <div>
                <p>TRIPLE SKIN AI</p>
                <strong>피부 상담 챗봇</strong>
                <span>연구 자료를 바탕으로 답변해요</span>
              </div>
            </div>
            <div className="chatbot_header_actions">
              <button type="button" onClick={handleReset}>새 대화</button>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="챗봇 닫기">×</button>
            </div>
          </header>
          <div className="chatbot_messages" ref={messageListRef} aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chatbot_message_row ${message.role}`}>
                {message.role !== "user" && (
                  <div className="chatbot_message_avatar"><img src="/img/chatbot-mascot.png" alt="" /></div>
                )}
                <div className={`chatbot_message ${message.role}`}>{message.text}</div>
              </div>
            ))}
            {messages.length === 1 && !isSending && (
              <div className="chatbot_suggestions">
                <span>이런 질문은 어떠세요?</span>
                <div>
                  {suggestedQuestions.map((question) => (
                    <button type="button" key={question} onClick={() => sendMessage(question)}>{question}</button>
                  ))}
                </div>
              </div>
            )}
            {isSending && (
              <div className="chatbot_message_row bot">
                <div className="chatbot_message_avatar"><img src="/img/chatbot-mascot.png" alt="" /></div>
                <div className="chatbot_message bot loading"><i /><i /><i /><span>자료를 살펴보고 있어요</span></div>
              </div>
            )}
          </div>
          <footer className="chatbot_footer">
            <p className="chatbot_notice"><span>ⓘ</span> 의학적 진단이나 처방을 대신하지 않습니다.</p>
            <form className="chatbot_form" onSubmit={handleSubmit}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form.requestSubmit();
                  }
                }}
                placeholder="피부 고민을 편하게 물어보세요"
                maxLength={1000}
                rows={2}
                disabled={isSending}
              />
              <button type="submit" disabled={isSending || !input.trim()} aria-label="메시지 전송">↑</button>
            </form>
          </footer>
        </section>
      )}
      <button
        type="button"
        className="floating_chatbot"
        aria-label={isOpen ? "챗봇 닫기" : "챗봇 열기"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <img src="/img/chatbot-mascot.png" alt="" />
      </button>
    </div>
  );
}

export default FloatingChatbot;
