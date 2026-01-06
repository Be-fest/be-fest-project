'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MdArrowBack, MdChat, MdError } from 'react-icons/md';
import { ChatModal } from '@/components/admin/ChatModal';
import { getChatInfoAction } from '@/lib/actions/chat';
import { createClient } from '@/lib/supabase/client';

export default function ClientChatPage() {
    const params = useParams();
    const router = useRouter();
    const eventServiceId = params.eventServiceId as string;

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [chatInfo, setChatInfo] = useState<{
        eventTitle: string;
        serviceName: string;
        providerName: string | null;
        clientName: string | null;
        canChat: boolean;
        reason?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get current user and chat info
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get current user
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/auth/login');
                    return;
                }

                setCurrentUserId(user.id);

                // Get chat info
                const infoResult = await getChatInfoAction(eventServiceId);
                if (infoResult.success && infoResult.data) {
                    setChatInfo(infoResult.data);
                } else {
                    setError(infoResult.error || 'Erro ao carregar informações do chat');
                }
            } catch (err) {
                console.error('Error loading chat:', err);
                setError('Erro ao carregar chat');
            } finally {
                setLoading(false);
            }
        };

        if (eventServiceId) {
            loadData();
        }
    }, [eventServiceId, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando chat...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <MdError className="text-red-500 text-6xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <MdArrowBack className="text-2xl text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MdChat className="text-purple-600" />
                            Chat do Evento
                        </h1>
                        {chatInfo && (
                            <p className="text-gray-600 text-sm">
                                {chatInfo.eventTitle} - {chatInfo.serviceName}
                            </p>
                        )}
                    </div>
                </div>

                {/* Chat embedded directly (not as modal) */}
                {currentUserId && chatInfo && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-200px)]">
                        <ChatModalEmbed
                            eventServiceId={eventServiceId}
                            currentUserId={currentUserId}
                            chatInfo={chatInfo}
                        />
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// Embedded version of the chat (not modal)
function ChatModalEmbed({
    eventServiceId,
    currentUserId,
    chatInfo
}: {
    eventServiceId: string;
    currentUserId: string;
    chatInfo: {
        eventTitle: string;
        serviceName: string;
        providerName: string | null;
        canChat: boolean;
        reason?: string;
    };
}) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load messages
    React.useEffect(() => {
        const loadMessages = async () => {
            try {
                const { getChatMessagesAction } = await import('@/lib/actions/chat');
                const result = await getChatMessagesAction(eventServiceId);
                if (result.success && result.data) {
                    setMessages(result.data);
                }
            } catch (err) {
                console.error('Error loading messages:', err);
            } finally {
                setLoading(false);
            }
        };
        loadMessages();
    }, [eventServiceId]);

    // Real-time subscription
    React.useEffect(() => {
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
                async (payload: any) => {
                    const { data: newMsg } = await supabase
                        .from('chat_messages')
                        .select(`
              id, event_service_id, sender_id, message, created_at,
              sender:users!chat_messages_sender_id_fkey (id, full_name, profile_image)
            `)
                        .eq('id', payload.new.id)
                        .single();

                    if (newMsg) {
                        setMessages((prev: any[]) => {
                            if (prev.some((m: any) => m.id === newMsg.id)) return prev;
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
    }, [eventServiceId]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending || !chatInfo.canChat) return;

        setSending(true);
        const messageText = newMessage.trim();
        setNewMessage('');

        try {
            const { sendChatMessageAction } = await import('@/lib/actions/chat');
            const result = await sendChatMessageAction(eventServiceId, messageText);
            if (!result.success) {
                setNewMessage(messageText);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setNewMessage(messageText);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
                <h3 className="font-semibold">{chatInfo.eventTitle}</h3>
                <p className="text-sm text-white/80">{chatInfo.serviceName}</p>
                {chatInfo.providerName && (
                    <p className="text-sm text-white/70">Prestador: {chatInfo.providerName}</p>
                )}
            </div>

            {/* Disabled notice */}
            {!chatInfo.canChat && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 text-yellow-800 text-sm">
                    {chatInfo.reason}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <MdChat className="text-4xl mb-2" />
                        <p>Nenhuma mensagem ainda</p>
                    </div>
                ) : (
                    messages.map((message: any) => {
                        const isOwn = message.sender_id === currentUserId;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${isOwn
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                                        }`}
                                >
                                    {!isOwn && (
                                        <p className="text-xs font-medium mb-1 text-purple-600">
                                            {message.sender?.full_name || 'Usuário'}
                                        </p>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                    <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                                        {formatTime(message.created_at)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={chatInfo.canChat ? "Digite sua mensagem..." : "Chat desativado"}
                        disabled={!chatInfo.canChat || sending}
                        className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || !chatInfo.canChat || sending}
                        className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full disabled:opacity-50"
                    >
                        <MdSend className="text-xl" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Need to import React and MdSend for the embed component
import React from 'react';
import { MdSend } from 'react-icons/md';
