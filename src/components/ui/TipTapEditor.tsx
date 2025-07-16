"use client";

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaListUl, 
  FaListOl, 
  FaAlignLeft, 
  FaAlignCenter, 
  FaAlignRight,
  FaAlignJustify,
  FaUndo,
  FaRedo,
  FaLink,
  FaQuoteLeft
} from 'react-icons/fa';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

export function TipTapEditor({ 
  value, 
  onChange, 
  placeholder = "Digite aqui...", 
  disabled = false,
  minHeight = "200px"
}: TipTapEditorProps) {
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
    immediatelyRender: false,
  });

  // Atualizar conteúdo quando value mudar externamente
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-lg p-4" style={{ minHeight }}>
        <div className="animate-pulse bg-gray-200 h-4 rounded mb-2"></div>
        <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
      </div>
    );
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    title, 
    children 
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded transition-colors
        ${isActive 
          ? 'bg-blue-100 text-blue-600' 
          : 'text-gray-600 hover:bg-gray-100'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
      `}
    >
      {children}
    </button>
  );

  const addLink = () => {
    const url = window.prompt('Digite o URL do link:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className={`
      border border-gray-200 rounded-lg overflow-hidden
      ${editor.isFocused ? 'ring-2 ring-[#A502CA] border-transparent' : ''}
    `}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1">
        {/* Dropdown de formato */}
        <select 
          className="px-2 py-1 text-sm border border-gray-300 rounded mr-2"
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'paragraph') {
              editor.chain().focus().setParagraph().run();
            } else if (value.startsWith('heading')) {
              const level = parseInt(value.replace('heading', '')) as 1 | 2 | 3 | 4 | 5 | 6;
              editor.chain().focus().toggleHeading({ level }).run();
            } else if (value === 'blockquote') {
              editor.chain().focus().toggleBlockquote().run();
            }
            e.target.value = '';
          }}
          disabled={disabled}
          value=""
        >
          <option value="">Formato</option>
          <option value="paragraph">Parágrafo</option>
          <option value="heading1">Título 1</option>
          <option value="heading2">Título 2</option>
          <option value="heading3">Título 3</option>
          <option value="heading4">Título 4</option>
          <option value="heading5">Título 5</option>
          <option value="heading6">Título 6</option>
          <option value="blockquote">Citação</option>
        </select>

        {/* Formatação de texto */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          disabled={disabled}
          title="Negrito (Ctrl+B)"
        >
          <FaBold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          disabled={disabled}
          title="Itálico (Ctrl+I)"
        >
          <FaItalic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          disabled={disabled}
          title="Sublinhado (Ctrl+U)"
        >
          <FaUnderline className="w-4 h-4" />
        </ToolbarButton>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Listas */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          disabled={disabled}
          title="Lista com marcadores"
        >
          <FaListUl className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          disabled={disabled}
          title="Lista numerada"
        >
          <FaListOl className="w-4 h-4" />
        </ToolbarButton>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alinhamento */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          disabled={disabled}
          title="Alinhar à esquerda"
        >
          <FaAlignLeft className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          disabled={disabled}
          title="Centralizar"
        >
          <FaAlignCenter className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          disabled={disabled}
          title="Alinhar à direita"
        >
          <FaAlignRight className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          disabled={disabled}
          title="Justificar"
        >
          <FaAlignJustify className="w-4 h-4" />
        </ToolbarButton>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link */}
        <ToolbarButton
          onClick={addLink}
          isActive={editor.isActive('link')}
          disabled={disabled}
          title="Inserir link"
        >
          <FaLink className="w-4 h-4" />
        </ToolbarButton>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Desfazer/Refazer */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          title="Desfazer (Ctrl+Z)"
        >
          <FaUndo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          title="Refazer (Ctrl+Y)"
        >
          <FaRedo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className={`
        ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
      `}>
        <EditorContent 
          editor={editor} 
          className="prose max-w-none p-4 focus:outline-none"
          style={{ minHeight }}
        />
      </div>

      {/* Estilos CSS customizados */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: ${minHeight};
        }
        
        .ProseMirror:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          height: 0;
          float: left;
        }
        
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        
        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
        }
        
        .ProseMirror h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1.33em 0;
        }
        
        .ProseMirror h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin: 1.67em 0;
        }
        
        .ProseMirror h6 {
          font-size: 0.67em;
          font-weight: bold;
          margin: 2.33em 0;
        }
        
        .ProseMirror p {
          margin: 0.5em 0;
        }
        
        .ProseMirror blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 4px solid #e5e7eb;
          font-style: italic;
          color: #6b7280;
          background-color: #f9fafb;
          padding: 0.5em 1em;
        }
        
        .ProseMirror ul {
          list-style-type: disc;
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .ProseMirror ol {
          list-style-type: decimal;
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .ProseMirror li {
          margin: 0.25em 0;
        }
        
        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .ProseMirror strong {
          font-weight: bold;
        }
        
        .ProseMirror em {
          font-style: italic;
        }
        
        .ProseMirror u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
} 