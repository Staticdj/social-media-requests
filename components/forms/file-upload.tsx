'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, FileVideo, AlertCircle } from 'lucide-react';
import { cn, formatFileSize, validateFile, ALLOWED_FILE_TYPES } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
}

export function FileUpload({
  files,
  onFilesChange,
  maxFiles = 10,
  className,
}: FileUploadProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newErrors: string[] = [];
      const validFiles: File[] = [];

      acceptedFiles.forEach((file) => {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          newErrors.push(`${file.name}: ${validation.error}`);
        }
      });

      if (files.length + validFiles.length > maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed`);
        const remaining = maxFiles - files.length;
        validFiles.splice(remaining);
      }

      setErrors(newErrors);
      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
      }
    },
    [files, maxFiles, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragActive && 'border-primary bg-primary/5',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
              isDragActive ? 'bg-primary/10' : 'bg-gray-100'
            )}
          >
            <Upload
              className={cn(
                'w-6 h-6 transition-colors',
                isDragActive ? 'text-primary' : 'text-gray-400'
              )}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              or click to browse
            </p>
          </div>
          <p className="text-xs text-gray-400">
            JPG, PNG, WebP, MP4, MOV • Max 50MB each
          </p>
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
          <div className="grid gap-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
              >
                {/* Preview */}
                {file.type.startsWith('image/') ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={getFilePreview(file) || ''}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <FileVideo className="w-5 h-5 text-gray-500" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Remove button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
