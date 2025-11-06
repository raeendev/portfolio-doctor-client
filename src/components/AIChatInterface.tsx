'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, Loader2, Trash2, MessageSquare } from 'lucide-react';
import { aiChatApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIChatInterfaceProps {
  portfolioData?: any;
  className?: string;
  defaultExpanded?: boolean;
}

export function AIChatInterface({ portfolioData, className = '', defaultExpanded = true }: AIChatInterfaceProps) {
  const { t, isRTL } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true); // Always expanded when called from parent
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await aiChatApi.getHistory();
      if (response.data?.messages) {
        setMessages(response.data.messages);
      }
    } catch (err: any) {
      // Silent fail - chat history is optional
      console.debug('Could not load chat history:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiChatApi.sendMessage({
        message: userMessage.content,
        portfolioContext: portfolioData,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.response || t('aiChat.couldNotGenerateResponse'),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || t('aiChat.error'));
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm(t('aiChat.confirmClearHistory'))) return;

    try {
      await aiChatApi.clearHistory();
      setMessages([]);
    } catch (err: any) {
      setError(t('aiChat.failedToClearHistory'));
      console.error('Clear history error:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Suggested questions for quick start
  const getSuggestedQuestions = () => {
    try {
      const q0 = t('aiChat.suggestedQuestions.0');
      const q1 = t('aiChat.suggestedQuestions.1');
      const q2 = t('aiChat.suggestedQuestions.2');
      const q3 = t('aiChat.suggestedQuestions.3');
      return [q0, q1, q2, q3].filter(q => q && !q.includes('suggestedQuestions'));
    } catch {
      return [
        'How should I rebalance my portfolio?',
        'What is my risk exposure?',
        'Which assets should I consider selling?',
        'How do meme coins affect my portfolio?',
      ];
    }
  };
  
  const suggestedQuestions = getSuggestedQuestions();

  return (
    <Card className={`bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] border-[var(--card-border)] transition-colors ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-[#3b82f6]" />
            <CardTitle className="text-[var(--foreground)] text-lg font-semibold">{t('aiChat.title')}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-[var(--text-muted)] hover:text-[var(--foreground)] h-8 w-8 p-0"
                title={t('aiChat.clearHistory')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 p-0 flex flex-col h-[500px]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Bot className="h-12 w-12 text-[#3b82f6] mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{t('aiChat.startConversation')}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md">
                {t('aiChat.startDescription')}
              </p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                {suggestedQuestions.map((question: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputValue(question);
                      inputRef.current?.focus();
                    }}
                    className="text-left justify-start bg-[var(--input-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] text-xs h-auto py-2 px-3 transition-colors"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]' 
                      : 'bg-gradient-to-br from-[#10b981] to-[#059669]'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white'
                        : 'bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--foreground)] transition-colors'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <p className={`text-xs text-[var(--text-muted)] mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start space-x-3"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="inline-block bg-[var(--input-bg)] border border-[var(--card-border)] rounded-lg px-4 py-3 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 text-[var(--primary)] animate-spin" />
                    <span className="text-sm text-[var(--text-muted)]">{t('aiChat.thinking')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <div className="p-3 bg-[#ef4444]/20 border border-[#ef4444] rounded-lg">
              <p className="text-xs text-[#ef4444]">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[var(--card-border)] p-4 bg-[var(--input-bg)] transition-colors">
          <div className="flex items-end space-x-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('aiChat.placeholder')}
              className="flex-1 min-h-[60px] max-h-[120px] resize-none bg-[var(--card-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors"
              rows={2}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white px-4 h-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

