import { useState, useEffect, useCallback, useRef } from 'react';
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
  Underline as UnderlineIcon, ListTodo, X, Check, Paperclip, Trash2,
  type LucideIcon
} from 'lucide-react';
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

interface TiptapToolbarProps {
  editor: Editor | null;
  onAddImage: () => void;
  onAddLink: () => void;
  onAddFile?: () => void;
  showFileButton?: boolean;
}

const TiptapToolbar = ({ editor, onAddImage, onAddLink, onAddFile, showFileButton = false }: TiptapToolbarProps) => {
  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    icon: Icon,
    title,
    ariaLabel
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: LucideIcon;
    title: string;
    ariaLabel?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel ?? title}
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
          title="이미지 URL"
        />
        {showFileButton && onAddFile && (
          <ToolbarButton
            onClick={onAddFile}
            icon={Paperclip}
            title="파일 첨부"
          />
        )}
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

// 에디터/폼 공통에서 사용하는 첨부파일 타입
interface AttachedFile {
  id: string;           // 임시 ID (UUID)
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;  // 이미지인 경우 미리보기 URL
}

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  // 파일 첨부 관련 props
  enableFileAttachment?: boolean;
  attachedFiles?: AttachedFile[];
  onFilesChange?: (files: AttachedFile[]) => void;
  maxFileSize?: number;      // bytes (기본: 10MB)
  maxFileCount?: number;     // 최대 파일 수 (기본: 5)
  allowedExtensions?: string[]; // 허용 확장자
}

// 파일 크기 포맷팅
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// UUID 생성
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const TiptapEditor = ({
  content,
  onChange,
  enableFileAttachment = false,
  attachedFiles = [],
  onFilesChange,
  maxFileSize = 10 * 1024 * 1024,  // 10MB
  maxFileCount = 5,
  allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar'],
}: TiptapEditorProps) => {
  const [modalType, setModalType] = useState<'link' | 'image' | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);

  // 에러 타임아웃 클린업 및 Object URL 해제
  useEffect(() => {
    return () => {
      // 에러 타임아웃 정리
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      // 남아있는 previewUrl 해제
      attachedFiles.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [attachedFiles]);

  // 파일 유효성 검사
  const validateFile = useCallback((file: File): string | null => {
    // 파일 크기 검사
    if (file.size > maxFileSize) {
      return `파일 크기가 너무 큽니다. 최대 ${formatFileSize(maxFileSize)}까지 업로드 가능합니다.`;
    }

    // 확장자 검사
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext && !allowedExtensions.includes(ext)) {
      return `허용되지 않는 파일 형식입니다. (허용: ${allowedExtensions.join(', ')})`;
    }

    return null;
  }, [maxFileSize, allowedExtensions]);

  // 파일 추가 처리
  const handleAddFiles = useCallback((files: FileList | File[]) => {
    if (!enableFileAttachment || !onFilesChange) return;

    const fileArray = Array.from(files);
    const newFiles: AttachedFile[] = [];
    const errors: string[] = [];

    // 최대 파일 수 검사 (음수 방지)
    const remainingSlots = Math.max(0, maxFileCount - attachedFiles.length);
    
    // 추가 가능한 슬롯이 없으면 에러 메시지 후 조기 반환
    if (remainingSlots === 0) {
      setFileError(`최대 ${maxFileCount}개의 파일만 첨부할 수 있습니다.`);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = window.setTimeout(() => {
        setFileError(null);
        errorTimeoutRef.current = null;
      }, 5000);
      return;
    }
    
    if (fileArray.length > remainingSlots) {
      errors.push(`최대 ${maxFileCount}개의 파일만 첨부할 수 있습니다. (${remainingSlots}개 추가 가능)`);
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);

    for (const file of filesToAdd) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        continue;
      }

      const isImage = file.type.startsWith('image/');
      const attachedFile: AttachedFile = {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      };

      newFiles.push(attachedFile);
    }

    if (errors.length > 0) {
      setFileError(errors.join('\n'));
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = window.setTimeout(() => {
        setFileError(null);
        errorTimeoutRef.current = null;
      }, 5000);
    }

    if (newFiles.length > 0) {
      onFilesChange([...attachedFiles, ...newFiles]);
    }
  }, [enableFileAttachment, onFilesChange, attachedFiles, maxFileCount, validateFile]);

  // 파일 삭제 처리
  const handleRemoveFile = useCallback((fileId: string) => {
    if (!onFilesChange) return;

    const fileToRemove = attachedFiles.find(f => f.id === fileId);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }

    onFilesChange(attachedFiles.filter(f => f.id !== fileId));
  }, [attachedFiles, onFilesChange]);

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
      // 파일 붙여넣기/드래그앤드롭 처리 (모든 파일 타입 지원)
      handlePaste: (_view, event) => {
        if (!enableFileAttachment || !onFilesChange) return false;

        const items = event.clipboardData?.items;
        if (!items) return false;

        const files = Array.from(items)
          .filter(item => item.kind === 'file')
          .map(item => item.getAsFile())
          .filter((file): file is File => file !== null);

        if (files.length === 0) return false;

        event.preventDefault();
        handleAddFiles(files);
        return true;
      },
      handleDrop: (_view, event) => {
        if (!enableFileAttachment || !onFilesChange) return false;

        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        event.preventDefault();
        handleAddFiles(Array.from(files));
        return true;
      },
    },
  }, [enableFileAttachment, handleAddFiles]);

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

  // 파일 선택 다이얼로그 열기
  const openFileDialog = useCallback(() => {
    // 파일 핸들러가 없으면 조기 반환
    if (!onFilesChange) {
      if (import.meta.env.DEV) {
        console.warn('[TiptapEditor] openFileDialog called but onFilesChange is not defined');
      }
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = allowedExtensions.map(ext => `.${ext}`).join(',');
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        handleAddFiles(target.files);
      }
    };
    input.click();
  }, [onFilesChange, allowedExtensions, handleAddFiles]);

  return (
    <div className="border-2 border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-lg relative">
      <TiptapToolbar
        editor={editor}
        onAddLink={() => setModalType('link')}
        onAddImage={() => setModalType('image')}
        onAddFile={openFileDialog}
        showFileButton={enableFileAttachment}
      />
      <EditorContent editor={editor} className="tiptap-editor" />

      {/* 파일 첨부 영역 */}
      {enableFileAttachment && (
        <div className="border-t-2 border-slate-200 dark:border-slate-600 p-4 bg-slate-50 dark:bg-slate-800">
          {/* 파일 에러 메시지 */}
          {fileError && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 whitespace-pre-line">
              {fileError}
            </div>
          )}

          {/* 첨부파일 목록 */}
          {attachedFiles.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  첨부파일 ({attachedFiles.length}/{maxFileCount})
                </span>
                <button
                  type="button"
                  onClick={openFileDialog}
                  disabled={attachedFiles.length >= maxFileCount}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + 파일 추가
                </button>
              </div>
              <div className="space-y-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    {/* 이미지 미리보기 */}
                    {file.previewUrl ? (
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                        <Paperclip className="w-5 h-5 text-slate-400" />
                      </div>
                    )}

                    {/* 파일 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="파일 삭제"
                      aria-label={`${file.name} 파일 삭제`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-colors bg-transparent"
              onClick={openFileDialog}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openFileDialog();
                }
              }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-400'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('border-blue-400'); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-400');
                if (e.dataTransfer.files) {
                  handleAddFiles(e.dataTransfer.files);
                }
              }}
              aria-label="파일 첨부 영역. 클릭하거나 파일을 드래그하여 첨부하세요."
            >
              <Paperclip className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                클릭하거나 파일을 드래그하여 첨부
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                최대 {maxFileCount}개, 파일당 {formatFileSize(maxFileSize)}
              </p>
            </button>
          )}
        </div>
      )}

      <UrlInputModal
        isOpen={modalType === 'link'}
        onClose={() => setModalType(null)}
        onSubmit={handleAddLink}
        title="링크 추가"
        placeholder="https://example.com"
        validate={validateUrl}
      />

      <UrlInputModal
        isOpen={modalType === 'image'}
        onClose={() => setModalType(null)}
        onSubmit={handleAddImage}
        title="이미지 URL 추가"
        placeholder="https://example.com/image.jpg"
        validate={validateUrl}
      />
    </div>
  );
};

// AttachedFile 타입 export
export type { AttachedFile };

export default TiptapEditor;
