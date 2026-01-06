'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdClose,
    MdSend,
    MdChat,
    MdBlock,
    MdPerson
} from 'react-icons/md';
import { getChatMessagesAction, sendChatMessageAction, getChatInfoAction, ChatMessageWithSender } from '@/lib/actions/chat';
import { createClient } from '@/lib/supabase/client';

interface ChatModalProps {
    eventServiceId: string;
    currentUserId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ChatModal({ eventServiceId, currentUserId, isOpen, onClose }: ChatModalProps) {
    const [messages, setMessages] = useState<ChatMessageWithSender[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chatInfo, setChatInfo] = useState<{
        eventTitle: string;
        serviceName: string;
        providerName: string | null;
        clientName: string | null;
        canChat: boolean;
        reason?: string;
    } | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chat info and messages
    useEffect(() => {
        if (!isOpen || !eventServiceId) return;

        const loadChat = async () => {
            setLoading(true);
            setError(null);

            try {
                // Load chat info
                const infoResult = await getChatInfoAction(eventServiceId);
                if (infoResult.success && infoResult.data) {
                    setChatInfo(infoResult.data);
                }

                // Load messages
                const messagesResult = await getChatMessagesAction(eventServiceId);
                if (messagesResult.success && messagesResult.data) {
                    setMessages(messagesResult.data);
                } else {
                    setError(messagesResult.error || 'Erro ao carregar mensagens');
                }
            } catch (err) {
                console.error('Error loading chat:', err);
                setError('Erro ao carregar chat');
            } finally {
                setLoading(false);
            }
        };

        loadChat();
    }, [isOpen, eventServiceId]);

    // Real-time subscription for new messages
    useEffect(() => {
        if (!isOpen || !eventServiceId) return;

        const supabase = createClient();

        const channel = supabase
            .channel(`chat_${eventServiceId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `event_service_id=eq.${eventServiceId}`
                },
                async (payload) => {
                    // Fetch the complete message with sender info
                    const { data: newMsg } = await supabase
                        .from('chat_messages')
                        .select(`
              id,
              event_service_id,
              sender_id,
              message,
              created_at,
              sender:users!chat_messages_sender_id_fkey (
                id,
                full_name,
                profile_image
              )
            `)
                        .eq('id', payload.new.id)
                        .single();

                    if (newMsg) {
                        setMessages(prev => {
                            // Avoid duplicates
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, {
                                ...newMsg,
                                sender: {
                                    id: (newMsg.sender as any)?.id || newMsg.sender_id,
                                    full_name: (newMsg.sender as any)?.full_name || null,
                                    profile_image: (newMsg.sender as any)?.profile_image || null
                                }
                            }];
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, eventServiceId]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending || !chatInfo?.canChat) return;

        setSending(true);
        const messageText = newMessage.trim();
        setNewMessage('');

        try {
            const result = await sendChatMessageAction(eventServiceId, messageText);
            if (!result.success) {
                setError(result.error || 'Erro ao enviar mensagem');
                setNewMessage(messageText); // Restore message on error
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Erro ao enviar mensagem');
            setNewMessage(messageText);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hoje';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ontem';
        } else {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.created_at).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {} as Record<string, ChatMessageWithSender[]>);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <MdChat className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-semibold truncate max-w-[200px]">
                                    {chatInfo?.eventTitle || 'Chat'}
                                </h3>
                                <p className="text-sm text-white/80 truncate max-w-[200px]">
                                    {chatInfo?.serviceName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <MdClose className="text-xl" />
                        </button>
                    </div>

                    {/* Chat disabled notice */}
                    {chatInfo && !chatInfo.canChat && (
                        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 flex items-center gap-2 text-yellow-800">
                            <MdBlock className="text-lg flex-shrink-0" />
                            <span className="text-sm">{chatInfo.reason}</span>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full text-red-600">
                                <p>{error}</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <MdChat className="text-4xl mb-2" />
                                <p>Nenhuma mensagem ainda</p>
                                <p className="text-sm">Inicie a conversa!</p>
                            </div>
                        ) : (
                            Object.entries(groupedMessages).map(([date, dateMessages]) => (
                                <div key={date}>
                                    {/* Date separator */}
                                    <div className="flex items-center justify-center mb-4">
                                        <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                            {formatDate(dateMessages[0].created_at)}
                                        </span>
                                    </div>

                                    {/* Messages for this date */}
                                    <div className="space-y-2">
                                        {dateMessages.map((message) => {
                                            const isOwn = message.sender_id === currentUserId;
                                            return (
                                                <motion.div
                                                    key={message.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        {/* Avatar */}
                                                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                                            {message.sender.profile_image ? (
                                                                <img
                                                                    src={message.sender.profile_image}
                                                                    alt={message.sender.full_name || ''}
                                                                    className="w-full h-full rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <MdPerson className="text-gray-500" />
                                                            )}
                                                        </div>

                                                        {/* Message bubble */}
                                                        <div
                                                            className={`px-4 py-2 rounded-2xl ${isOwn
                                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none'
                                                                    : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                                                                }`}
                                                        >
                                                            {!isOwn && (
                                                                <p className="text-xs font-medium mb-1 text-purple-600">
                                                                    {message.sender.full_name || 'Usuário'}
                                                                </p>
                                                            )}
                                                            <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                                                            <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                                                                {formatTime(message.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t bg-white">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={chatInfo?.canChat ? "Digite sua mensagem..." : "Chat desativado"}
                                disabled={!chatInfo?.canChat || sending}
                                className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!newMessage.trim() || !chatInfo?.canChat || sending}
                                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MdSend className="text-xl" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
