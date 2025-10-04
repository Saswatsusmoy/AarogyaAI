"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

export default function ChatbotInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user?.id) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const BACKEND_BASE = process.env.NEXT_PUBLIC_STT_BACKEND_URL || "http://localhost:8080";
        const response = await fetch(`${BACKEND_BASE}/ai/chatbot/history/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "AarogyaAI-Frontend/1.0.0",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const historyMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.message,
            isUser: msg.is_user,
            timestamp: new Date(msg.created_at),
          }));

          // If no history, show welcome message
          if (historyMessages.length === 0) {
            setMessages([{
              id: "welcome",
              content: "Hello! I'm AarogyaAI Assistant, your intelligent healthcare companion. I have access to your medical history and can provide personalized health guidance. How can I help you today?",
              isUser: false,
              timestamp: new Date(),
            }]);
          } else {
            setMessages(historyMessages);
          }
        } else {
          // Fallback to welcome message if history loading fails
          setMessages([{
            id: "welcome",
            content: "Hello! I'm AarogyaAI Assistant, your intelligent healthcare companion. I have access to your medical history and can provide personalized health guidance. How can I help you today?",
            isUser: false,
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        // Fallback to welcome message
        setMessages([{
          id: "welcome",
          content: "Hello! I'm AarogyaAI Assistant, your intelligent healthcare companion. I have access to your medical history and can provide personalized health guidance. How can I help you today?",
          isUser: false,
          timestamp: new Date(),
        }]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [user?.id]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Use intelligent chatbot backend with patient data
      const BACKEND_BASE = process.env.NEXT_PUBLIC_STT_BACKEND_URL || "http://localhost:8080";
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`${BACKEND_BASE}/ai/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AarogyaAI-Frontend/1.0.0",
        },
        body: JSON.stringify({
          patient_id: user.id,
          message: userMessage.content,
        }),
      });

      let botResponse = "";
      
      if (response.ok) {
        const data = await response.json();
        botResponse = data.response || "I'm sorry, I couldn't process your request at the moment.";
      } else {
        // Fallback to rule-based responses if intelligent backend fails
        botResponse = generateFallbackResponse(userMessage.content);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing some technical difficulties. Please try again later or contact your healthcare provider for immediate assistance.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("symptom") || message.includes("pain") || message.includes("hurt")) {
      return "I understand you're experiencing symptoms. While I can provide general health information, I recommend consulting with a healthcare professional for proper diagnosis and treatment. Would you like help booking an appointment?";
    }
    
    if (message.includes("appointment") || message.includes("book") || message.includes("schedule")) {
      return "I can help you with appointment-related questions! You can book a new appointment using the 'Book Appointment' section in your dashboard. Is there anything specific about appointments you'd like to know?";
    }
    
    if (message.includes("medication") || message.includes("medicine") || message.includes("prescription")) {
      return "For medication and prescription questions, I recommend consulting directly with your healthcare provider or pharmacist. They can provide the most accurate and personalized information about your medications.";
    }
    
    if (message.includes("emergency") || message.includes("urgent") || message.includes("help")) {
      return "If this is a medical emergency, please call emergency services immediately. For urgent but non-emergency concerns, I recommend contacting your healthcare provider directly.";
    }
    
    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
      return "Hello! I'm here to help with your health-related questions. What would you like to know?";
    }
    
    if (message.includes("how are you") || message.includes("how do you work")) {
      return "I'm AarogyaAI Assistant, designed to help patients with general health information and navigation assistance. I can help you understand your appointments, provide general health guidance, and connect you with the right resources.";
    }
    
    // Default response
    return "Thank you for your message. I'm here to help with general health information and assist you with using the AarogyaAI platform. For specific medical advice, please consult with your healthcare provider. How else can I assist you today?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = async () => {
    if (!user?.id) return;

    try {
      const BACKEND_BASE = process.env.NEXT_PUBLIC_STT_BACKEND_URL || "http://localhost:8080";
      const response = await fetch(`${BACKEND_BASE}/ai/chatbot/history/${user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AarogyaAI-Frontend/1.0.0",
        },
      });

      if (response.ok) {
        setMessages([
          {
            id: "welcome",
            content: "Hello! I'm AarogyaAI Assistant, your intelligent healthcare companion. I have access to your medical history and can provide personalized health guidance. How can I help you today?",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      } else {
        console.error("Failed to clear chat history");
      }
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium">AarogyaAI Assistant</h2>
            <p className="text-sm opacity-70">Your healthcare companion</p>
          </div>
          <button
            onClick={clearChat}
            className="text-xs px-3 py-1 rounded border border-white/20 hover:bg-white/5 transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm opacity-70">Loading chat history...</span>
            </div>
          </div>
        ) : (
          messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              <div className="text-sm">
                {message.isUser ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown 
                      components={{
                        p: ({children}) => <p className="mb-2 last:mb-0 text-white">{children}</p>,
                        strong: ({children}) => <strong className="font-semibold text-blue-300">{children}</strong>,
                        em: ({children}) => <em className="italic text-yellow-300">{children}</em>,
                        code: ({children}) => <code className="bg-white/20 px-1 py-0.5 rounded text-xs font-mono text-white">{children}</code>,
                        ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1 text-white">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1 text-white">{children}</ol>,
                        li: ({children}) => <li className="text-sm text-white">{children}</li>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              <div className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm opacity-70">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex space-x-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your health..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
        <div className="text-xs opacity-60 mt-2">
          💡 Tip: Ask about your symptoms, appointments, medications, medical history, or general health questions. I have access to your complete medical profile for personalized responses.
        </div>
      </div>
    </div>
  );
}
