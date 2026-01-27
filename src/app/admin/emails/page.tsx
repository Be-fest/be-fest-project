'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdEmail,
    MdEdit,
    MdSave,
    MdClose,
    MdCheck,
    MdWarning,
    MdSend,
    MdVisibility,
    MdToggleOn,
    MdToggleOff,
    MdPerson,
    MdBusinessCenter,
    MdRefresh
} from 'react-icons/md';
import {
    getEmailTemplatesAction,
    updateEmailTemplateAction,
    toggleEmailTemplateActiveAction,
    sendTestEmailAction,
    EmailTemplate
} from '@/lib/actions/email-templates';

const templateLabels: Record<string, { label: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
    welcome_client: {
        label: 'Boas-vindas Cliente',
        description: 'Enviado quando um novo cliente se cadastra',
        icon: MdPerson
    },
    welcome_provider: {
        label: 'Boas-vindas Prestador',
        description: 'Enviado quando um novo prestador se cadastra',
        icon: MdBusinessCenter
    }
};

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [editSubject, setEditSubject] = useState('');
    const [editContent, setEditContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
    const [testEmailModal, setTestEmailModal] = useState<EmailTemplate | null>(null);
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        const result = await getEmailTemplatesAction();
        if (result.success && result.data) {
            setTemplates(result.data);
        }
        setLoading(false);
    };

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setEditSubject(template.subject);
        setEditContent(template.content);
    };

    const handleSave = async () => {
        if (!editingTemplate) return;

        setSaving(true);
        const result = await updateEmailTemplateAction(
            editingTemplate.id,
            editSubject,
            editContent
        );

        if (result.success) {
            setMessage({ type: 'success', text: 'Template atualizado com sucesso!' });
            setEditingTemplate(null);
            loadTemplates();
        } else {
            setMessage({ type: 'error', text: result.error || 'Erro ao salvar' });
        }
        setSaving(false);

        setTimeout(() => setMessage(null), 3000);
    };

    const handleToggleActive = async (template: EmailTemplate) => {
        const result = await toggleEmailTemplateActiveAction(template.id);
        if (result.success) {
            setMessage({
                type: 'success',
                text: `Template ${template.is_active ? 'desativado' : 'ativado'} com sucesso!`
            });
            loadTemplates();
        } else {
            setMessage({ type: 'error', text: result.error || 'Erro ao alterar status' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSendTest = async () => {
        if (!testEmailModal || !testEmail) return;

        setSendingTest(true);
        const result = await sendTestEmailAction(testEmailModal.type, testEmail);

        if (result.success) {
            setMessage({ type: 'success', text: 'Email de teste enviado!' });
            setTestEmailModal(null);
            setTestEmail('');
        } else {
            setMessage({ type: 'error', text: result.error || 'Erro ao enviar email' });
        }
        setSendingTest(false);

        setTimeout(() => setMessage(null), 3000);
    };

    const getPreviewHtml = (template: EmailTemplate) => {
        let html = template.content;
        html = html.replace(/{{nome}}/g, 'João Silva');
        html = html.replace(/{{email}}/g, 'joao@exemplo.com');
        html = html.replace(/{{data_cadastro}}/g, new Date().toLocaleDateString('pt-BR'));
        return html;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Templates de Email</h1>
                    <p className="text-gray-600 mt-1">
                        Gerencie os emails automáticos enviados pela plataforma
                    </p>
                </div>
                <button
                    onClick={loadTemplates}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <MdRefresh className="text-xl" />
                    Atualizar
                </button>
            </div>

            {/* Message Toast */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${message.type === 'success'
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}
                    >
                        {message.type === 'success' ? <MdCheck /> : <MdWarning />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <MdEmail className="text-blue-500 text-xl flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900">Variáveis disponíveis</h3>
                        <p className="text-blue-700 text-sm mt-1">
                            Use estas variáveis nos templates que serão substituídas automaticamente:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{'{{nome}}'}</code>
                            <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{'{{email}}'}</code>
                            <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{'{{data_cadastro}}'}</code>
                        </div>
                    </div>
                </div>
            </div>

            {/* Templates Grid */}
            <div className="grid gap-6">
                {templates.map((template) => {
                    const config = templateLabels[template.type] || {
                        label: template.type,
                        description: '',
                        icon: MdEmail
                    };
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                            {/* Template Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${template.is_active ? 'bg-purple-100' : 'bg-gray-100'
                                        }`}>
                                        <Icon className={`text-xl ${template.is_active ? 'text-purple-600' : 'text-gray-400'
                                            }`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{config.label}</h3>
                                        <p className="text-sm text-gray-500">{config.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Status badge */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${template.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {template.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                            </div>

                            {/* Template Content Preview */}
                            <div className="p-4">
                                <div className="mb-3">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Assunto
                                    </label>
                                    <p className="text-gray-900 font-medium mt-1">{template.subject}</p>
                                </div>

                                <div className="text-sm text-gray-500 mb-4">
                                    Última atualização: {new Date(template.updated_at).toLocaleString('pt-BR')}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 p-4 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={() => handleEdit(template)}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                >
                                    <MdEdit className="text-lg" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => setPreviewTemplate(template)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                                >
                                    <MdVisibility className="text-lg" />
                                    Preview
                                </button>
                                <button
                                    onClick={() => setTestEmailModal(template)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                >
                                    <MdSend className="text-lg" />
                                    Testar
                                </button>
                                <button
                                    onClick={() => handleToggleActive(template)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ml-auto ${template.is_active
                                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                        }`}
                                >
                                    {template.is_active ? (
                                        <>
                                            <MdToggleOff className="text-lg" />
                                            Desativar
                                        </>
                                    ) : (
                                        <>
                                            <MdToggleOn className="text-lg" />
                                            Ativar
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingTemplate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setEditingTemplate(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Editar Template: {templateLabels[editingTemplate.type]?.label || editingTemplate.type}
                                </h2>
                                <button
                                    onClick={() => setEditingTemplate(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <MdClose className="text-xl text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assunto do Email
                                    </label>
                                    <input
                                        type="text"
                                        value={editSubject}
                                        onChange={(e) => setEditSubject(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Assunto do email..."
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Conteúdo do Email (HTML)
                                    </label>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={15}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                                        placeholder="Conteúdo HTML do email..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Use HTML para formatar o email. Variáveis: {'{{nome}}'}, {'{{email}}'}, {'{{data_cadastro}}'}
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => setEditingTemplate(null)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <MdSave className="text-lg" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewTemplate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setPreviewTemplate(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Preview Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Preview</p>
                                    <h3 className="font-semibold text-gray-900">{previewTemplate.subject}</h3>
                                </div>
                                <button
                                    onClick={() => setPreviewTemplate(null)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <MdClose className="text-xl text-gray-500" />
                                </button>
                            </div>

                            {/* Preview Content */}
                            <div
                                className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]"
                                dangerouslySetInnerHTML={{ __html: getPreviewHtml(previewTemplate) }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Test Email Modal */}
            <AnimatePresence>
                {testEmailModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setTestEmailModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Enviar Email de Teste
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Digite o email para receber o template &quot;{templateLabels[testEmailModal.type]?.label}&quot;
                                </p>
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                                    placeholder="seu@email.com"
                                />
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setTestEmailModal(null);
                                            setTestEmail('');
                                        }}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSendTest}
                                        disabled={!testEmail || sendingTest}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {sendingTest ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <MdSend className="text-lg" />
                                                Enviar Teste
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
