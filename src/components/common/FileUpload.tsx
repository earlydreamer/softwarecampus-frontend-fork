import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Archive } from 'lucide-react';

// 허용 확장자 (백엔드 .env와 동일)
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv', 'zip', 'rar'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILE_COUNT = 5;

interface FileUploadProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number;
    disabled?: boolean;
}

// 파일 아이콘 선택
const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return <Image className="w-5 h-5 text-blue-500" />;
    }
    if (['zip', 'rar'].includes(ext)) {
        return <Archive className="w-5 h-5 text-yellow-500" />;
    }
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv'].includes(ext)) {
        return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
};

// 파일 크기 포맷
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUpload = ({
    files,
    onFilesChange,
    maxFiles = MAX_FILE_COUNT,
    maxSize = MAX_FILE_SIZE,
    disabled = false,
}: FileUploadProps) => {
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 파일 검증
    const validateFile = useCallback((file: File): string | null => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return `허용되지 않은 파일 형식입니다: ${ext}`;
        }
        
        if (file.size > maxSize) {
            return `파일 크기가 ${formatFileSize(maxSize)}를 초과합니다: ${file.name}`;
        }
        
        return null;
    }, [maxSize]);

    // 파일 추가
    const addFiles = useCallback((newFiles: FileList | File[]) => {
        setError(null);
        const fileArray = Array.from(newFiles);
        
        // 개수 검증
        if (files.length + fileArray.length > maxFiles) {
            setError(`첨부파일은 최대 ${maxFiles}개까지 업로드 가능합니다.`);
            return;
        }
        
        // 각 파일 검증
        for (const file of fileArray) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            
            // 중복 파일 검사
            if (files.some(f => f.name === file.name && f.size === file.size)) {
                setError(`이미 추가된 파일입니다: ${file.name}`);
                return;
            }
        }
        
        onFilesChange([...files, ...fileArray]);
    }, [files, maxFiles, validateFile, onFilesChange]);

    // 파일 제거
    const removeFile = useCallback((index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onFilesChange(newFiles);
        setError(null);
    }, [files, onFilesChange]);

    // 드래그 앤 드롭 핸들러
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled && e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    }, [disabled, addFiles]);

    // 파일 선택
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(e.target.files);
        }
        // input 초기화 (같은 파일 다시 선택 가능하게)
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [addFiles]);

    return (
        <div className="space-y-3">
            {/* 드래그 앤 드롭 영역 */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                    ${dragOver 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                    onChange={handleFileSelect}
                    disabled={disabled}
                    className="hidden"
                />
                
                <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-blue-500' : 'text-slate-400'}`} />
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    클릭하거나 파일을 드래그하여 업로드
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                    최대 {maxFiles}개, 파일당 {formatFileSize(maxSize)}까지
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                    이미지, 문서, 압축파일 지원
                </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {error}
                </p>
            )}

            {/* 선택된 파일 목록 */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        첨부파일 ({files.length}/{maxFiles})
                    </p>
                    <ul className="space-y-2">
                        {files.map((file, index) => (
                            <li
                                key={`${file.name}-${file.size}-${index}`}
                                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                            >
                                {getFileIcon(file.name)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    disabled={disabled}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-500 hover:text-red-500" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
