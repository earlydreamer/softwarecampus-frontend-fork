import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon,
  Highlighter, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Underline as UnderlineIcon, ListTodo, X, Check, Upload, Loader2,
  type LucideIcon
} from 'lucide-react';
import { uploadEditorImage } from '../../services/communityService';
import '../../styles/tiptap.css';

// URL Input Modal Component
interface UrlInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  title: string;
  placeholder?: string;
  validate?: (url: string) => string | null;
}

const UrlInputModal = ({ isOpen, onClose, onSubmit, title, placeholder, validate }: UrlInputModalProps) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();

    if (trimmedUrl) {
      if (validate) {
        const validationError = validate(trimmedUrl);
        if (validationError) {
          setError(validationError);
          return;
        }
      }
      onSubmit(trimmedUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={placeholder || 'https://...'}
              className={`w-full px-4 py-2 rounded-lg border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-primary-500'
                } bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none transition-all`}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 이미지 업로드 모달 컴포넌트
interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageInsert: (url: string) => void;
}

const ImageUploadModal = ({ isOpen, onClose, onImageInsert }: ImageUploadModalProps) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_SIZE_MB = 10;

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setUrlError(null);
      setUploadError(null);
      setActiveTab('upload');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return '지원하지 않는 이미지 형식입니다. (jpg, png, gif, webp만 가능)';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `파일 크기는 ${MAX_SIZE_MB}MB를 초과할 수 없습니다.`;
    }
    return null;
  };

  const handleFileUpload = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const imageUrl = await uploadEditorImage(file);
      onImageInsert(imageUrl);
      onClose();
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      setUploadError('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const validateUrl = (inputUrl: string): string | null => {
    if (!inputUrl || inputUrl.trim() === '') return 'URL을 입력해주세요.';
    try {
      const parsedUrl = new URL(inputUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return 'http 또는 https URL만 사용할 수 있습니다.';
      }
      return null;
    } catch {
      return '올바른 URL 형식이 아닙니다.';
    }
  };

  const handleUrlSubmit = () => {
    const trimmedUrl = url.trim();
    const error = validateUrl(trimmedUrl);
    if (error) {
      setUrlError(error);
      return;
    }
    onImageInsert(trimmedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">이미지 추가</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            파일 업로드
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'url'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LinkIcon className="w-4 h-4 inline mr-2" />
            URL 입력
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'upload' ? (
            <div>
              {/* 드래그 앤 드롭 영역 */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-slate-600 dark:text-slate-400">업로드 중...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400 mb-1">
                      클릭하거나 이미지를 드래그하세요
                    </p>
                    <p className="text-xs text-slate-500">
                      JPG, PNG, GIF, WebP (최대 {MAX_SIZE_MB}MB)
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              {uploadError && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {uploadError}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUrlSubmit();
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    urlError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                  } bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none transition-all`}
                  autoFocus
                />
                {urlError && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {urlError}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  확인
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TiptapToolbarProps {
  editor: Editor | null;
  onAddImage: () => void;
  onAddLink: () => void;
}

const TiptapToolbar = ({ editor, onAddImage, onAddLink }: TiptapToolbarProps) => {
  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    icon: Icon,
    title
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: LucideIcon;
    title: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      type="button"
      className={`p-2 rounded-lg transition-colors ${isActive
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="border-b-2 border-slate-200 dark:border-slate-600 p-2 flex flex-wrap gap-1 bg-slate-50 dark:bg-slate-800 rounded-t-xl">
      {/* 텍스트 스타일 */}
      <div className="flex gap-1 pr-2 border-r border-slate-300 dark:border-slate-600">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          icon={Bold}
          title="굵게 (Ctrl+B)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          icon={Italic}
          title="기울임 (Ctrl+I)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={UnderlineIcon}
          title="밑줄 (Ctrl+U)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          icon={Strikethrough}
          title="취소선"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          icon={Highlighter}
          title="형광펜"
        />
      </div>

      {/* 제목 */}
      <div className="flex gap-1 pr-2 border-r border-slate-300 dark:border-slate-600">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={Heading1}
          title="제목 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          title="제목 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={Heading3}
          title="제목 3"
        />
      </div>

      {/* 리스트 */}
      <div className="flex gap-1 pr-2 border-r border-slate-300 dark:border-slate-600">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          title="글머리 기호"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          title="번호 매기기"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          icon={ListTodo}
          title="체크리스트"
        />
      </div>

      {/* 정렬 */}
      <div className="flex gap-1 pr-2 border-r border-slate-300 dark:border-slate-600">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={AlignLeft}
          title="왼쪽 정렬"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={AlignCenter}
          title="가운데 정렬"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={AlignRight}
          title="오른쪽 정렬"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          icon={AlignJustify}
          title="양쪽 정렬"
        />
      </div>

      {/* 기타 */}
      <div className="flex gap-1 pr-2 border-r border-slate-300 dark:border-slate-600">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={Quote}
          title="인용구"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          icon={Code}
          title="코드"
        />
        <ToolbarButton
          onClick={onAddLink}
          isActive={editor.isActive('link')}
          icon={LinkIcon}
          title="링크"
        />
        <ToolbarButton
          onClick={onAddImage}
          icon={ImageIcon}
          title="이미지"
        />
      </div>

      {/* 실행 취소/다시 실행 */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          icon={Undo}
          title="실행 취소 (Ctrl+Z)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          icon={Redo}
          title="다시 실행 (Ctrl+Y)"
        />
      </div>
    </div>
  );
};

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const [modalType, setModalType] = useState<'link' | 'image' | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '내용을 입력하세요...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Color,
      TextStyle,
      Highlight.configure({
        multicolor: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const validateUrl = (url: string) => {
    if (!url || url.trim() === '') return 'URL을 입력해주세요.';
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return 'http 또는 https URL만 사용할 수 있습니다.';
      }
      return null;
    } catch (error) {
      return '올바른 URL 형식이 아닙니다. (예: https://example.com)';
    }
  };

  const handleAddLink = (url: string) => {
    if (editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleAddImage = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border-2 border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg relative">
      <TiptapToolbar
        editor={editor}
        onAddLink={() => setModalType('link')}
        onAddImage={() => setModalType('image')}
      />
      <EditorContent editor={editor} className="tiptap-editor" />

      <UrlInputModal
        isOpen={modalType === 'link'}
        onClose={() => setModalType(null)}
        onSubmit={handleAddLink}
        title="링크 추가"
        placeholder="https://example.com"
        validate={validateUrl}
      />

      <ImageUploadModal
        isOpen={modalType === 'image'}
        onClose={() => setModalType(null)}
        onImageInsert={handleAddImage}
      />
    </div>
  );
};

export default TiptapEditor;
