"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ChatMessage } from "@/app/api/api-tools/route";

import { WeatherCard } from "./weather-card";
import { Send, Square, Sparkles, User, Bot } from "lucide-react";
import AttachButton from "./AttachButton";
import Image from "next/image";

export default function APIToolPage() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { messages, sendMessage, status, error, stop } =
    useChat<ChatMessage>({
      transport: new DefaultChatTransport({
        api: "/api/api-tools",
      }),
    });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Auto focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Submit handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({ text: input, files });
    setInput("");
    setFiles(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">
              AI Assistant
            </h1>
            <p className="text-xs text-zinc-500">
              {isLoading ? "Thinking..." : "Ready to help"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto gap-2">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <strong>Error:</strong> {error.message}
            </div>
          )}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-zinc-800/50 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                How can I assist you today?
              </h2>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-6 flex gap-3 ${
                message.role === "user"
                  ? "flex-row-reverse"
                  : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-blue-500"
                    : "bg-zinc-800 border border-zinc-700"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-blue-400" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`flex-1 max-w-2xl gap-2 ${
                  message.role === "user"
                    ? "items-end"
                    : "items-start"
                } flex flex-col`}
              >
                {message.parts.map((part, index) => {
                  switch (part.type) {
                    // TEXT
                    case "text":
                      return (
                        <div
                          key={`${message.id}-${index}`}
                          className={`px-4 py-3 rounded-2xl ${
                            message.role === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-zinc-800/80 text-zinc-100 border border-zinc-700/50"
                          } whitespace-pre-wrap break-words`}
                        >
                          {part.text}
                        </div>
                      );

                    // WEATHER TOOL
                    case "tool-getWeather":
                      switch (part.state) {
                        case "input-streaming":
                          return (
                            <div
                              key={`weather-${index}`}
                              className="bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl mt-2 animate-pulse"
                            >
                              <div className="text-sm text-zinc-400 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                                Receiving weather request...
                              </div>
                            </div>
                          );

                        case "input-available":
                          return (
                            <div
                              key={`weather-${index}`}
                              className="bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl mt-2"
                            >
                              <div className="text-sm text-zinc-300">
                                Getting weather for{" "}
                                <strong>{part.input.city}</strong>...
                              </div>
                            </div>
                          );

                        case "output-available":
                          return (
                            <div
                              key={`weather-${index}`}
                              className="mt-2"
                            >
                              <div className="text-sm text-zinc-400">
                                🌤️ Weather
                              </div>
                              <WeatherCard weatherData={part.output} />
                            </div>
                          );

                        case "output-error":
                          return (
                            <div
                              key={`weather-${index}`}
                              className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mt-2"
                            >
                              <div className="text-sm text-red-400">
                                ⚠️ Error: {part.errorText}
                              </div>
                            </div>
                          );
                      }
                      return null;

                    // FILES (IMAGE / PDF)
                    case "file":
                      if (part.mediaType?.startsWith("image/")) {
                        return (
                          <Image
                            key={`${message.id}-${index}`}
                            src={part.url}
                            alt={part.filename ?? "image"}
                            width={450}
                            height={450}
                            className="rounded-xl mt-2"
                          />
                        );
                      }

                      if (part.mediaType?.includes("pdf")) {
                        return (
                          <iframe
                            key={`${message.id}-${index}`}
                            src={part.url}
                            width="450"
                            height="600"
                            className="rounded-xl mt-2 border border-zinc-700"
                          />
                        );
                      }

                      return null;

                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-zinc-800/80 border border-zinc-700/50 px-4 py-3 rounded-2xl">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 items-center relative"
          >
            <AttachButton
            files={files}
              onChange={(selected) => setFiles(selected ?? undefined)}
            />

            <input
              ref={inputRef}
              className="flex-1 bg-zinc-800 text-white px-4 py-3 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can I help you?"
              disabled={isLoading}
            />

            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="bg-red-500 text-white px-4 py-3 rounded-xl flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={status !== "ready"}
                className="bg-blue-500 text-white px-4 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            )}
          </form>

          <p className="text-xs text-zinc-600 text-center mt-2">
            Press Enter to send • AI can make mistakes
          </p>
        </div>
      </div>
    </div>
  );
}
