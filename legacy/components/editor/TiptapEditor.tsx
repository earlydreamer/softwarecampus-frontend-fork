import { useEffect } from 'react';
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
import '@/styles/tiptap.css';

/**
 * Tiptap 에디터용 툴바 컴포넌트
 */
interface TiptapToolbarProps {
  editor: Editor | null;
}

const TiptapToolbar: React.FC<TiptapToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  const addImage = () => {
    const input = window.prompt('이미지 URL을 입력하세요');
    
    // 입력값 검증: 비어있거나 문자열이 아닌 경우 무시
    if (!input || typeof input !== 'string' || input.trim() === '') {
      return;
    }

    const url = input.trim();

    try {
      // URL 파싱 및 프로토콜 검증
      const parsedUrl = new URL(url);
      
      // http 또는 https 프로토콜만 허용
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        alert('http 또는 https URL만 사용할 수 있습니다.');
        return;
      }

      // 안전한 URL만 에디터에 삽입
      editor.chain().focus().setImage({ src: parsedUrl.href }).run();
    } catch (error) {
      // URL 파싱 실패 시 에러 표시
      alert('올바른 URL 형식이 아닙니다. (예: https://example.com/image.jpg)');
    }
  };

  const addLink = () => {
    const input = window.prompt('링크 URL을 입력하세요');
    
    // 입력값 검증: 비어있거나 문자열이 아닌 경우 무시
    if (!input || typeof input !== 'string' || input.trim() === '') {
      return;
    }

    const url = input.trim();

    try {
      // URL 파싱 및 프로토콜 검증
      const parsedUrl = new URL(url);
      
      // http 또는 https 프로토콜만 허용
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        alert('http 또는 https URL만 사용할 수 있습니다.');
        return;
      }

      // 안전한 URL만 에디터에 삽입
      editor.chain().focus().setLink({ href: parsedUrl.href }).run();
    } catch (error) {
      // URL 파싱 실패 시 에러 표시
      alert('올바른 URL 형식이 아닙니다. (예: https://example.com)');
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-600 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-700">
      {/* 텍스트 스타일 */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('bold') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        <span className="font-bold">B</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('italic') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        <span className="italic">I</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('strike') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        <span className="line-through">S</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('underline') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        <span className="underline">U</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('highlight') ? 'bg-yellow-200 dark:bg-yellow-600' : ''
        }`}
        type="button"
        title="형광펜"
      >
        🖍️
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

      {/* 텍스트 색상 */}
      <div className="flex items-center gap-1">
        <input
          type="color"
          onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-8 h-6 rounded cursor-pointer border border-gray-300 dark:border-gray-500"
          title="텍스트 색상"
        />
        <button
          onClick={() => editor.chain().focus().unsetColor().run()}
          className="px-2 py-1 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          type="button"
          title="색상 초기화"
        >
          기본
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

      {/* 제목 */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        H3
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

      {/* 리스트 */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('bulletList') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        • 리스트
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('orderedList') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        1. 리스트
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('taskList') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
        title="체크리스트"
      >
        ☑ 할일
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

      {/* 정렬 */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
        title="왼쪽 정렬"
      >
        ◀ 
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
        title="가운데 정렬"
      >
        ▮
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
        title="오른쪽 정렬"
      >
        ▶
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

      {/* 코드 */}
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('code') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        {'</>'}
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('codeBlock') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        코드블록
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

      {/* 인용 */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('blockquote') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        " 인용
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

      {/* 링크 & 이미지 */}
      <button
        onClick={addLink}
        className={`px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor.isActive('link') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
        type="button"
      >
        🔗 링크
      </button>
      <button
        onClick={addImage}
        className="px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        type="button"
      >
        🖼️ 이미지
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

      {/* 구분선 */}
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        type="button"
      >
        ―
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

      {/* 실행취소/다시실행 */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        type="button"
      >
        ↶
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        type="button"
      >
        ↷
      </button>
    </div>
  );
};

/**
 * Tiptap 에디터 컴포넌트
 */
interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange, placeholder = '내용을 입력하세요' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Link는 별도로 설정하므로 StarterKit에서 제외
        link: false,
      }),
      TextStyle,
      Color,
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline hover:text-blue-700',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none min-h-[400px] p-4 text-gray-900 dark:text-gray-100',
      },
    },
  });

  // 외부 content 변경 시 에디터 동기화
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <TiptapToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
