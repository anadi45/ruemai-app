'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FileAttachmentProps {
  filename: string;
  fileSize: number;
  fileExtension: string;
  contentPreview?: string;
  className?: string;
}

export const FileAttachment = ({
  filename,
  fileSize,
  fileExtension,
  contentPreview,
  className,
  ...props
}: FileAttachmentProps & React.HTMLAttributes<HTMLDivElement>) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (extension: string): string => {
    switch (extension.toLowerCase()) {
      case '.pdf':
        return '📄';
      case '.txt':
        return '📝';
      case '.json':
        return '📋';
      case '.doc':
      case '.docx':
        return '📄';
      case '.xls':
      case '.xlsx':
        return '📊';
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.gif':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/api/files?filename=${encodeURIComponent(filename)}`;
    link.download = filename;
    link.target = '_blank';
    link.click();
  };

  return (
    <div
      className={cn(
        'border-border bg-muted/50 hover:bg-muted/70 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
        className
      )}
      onClick={handleDownload}
      {...props}
    >
      <div className="text-2xl">{getFileIcon(fileExtension)}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{filename}</div>
        <div className="text-muted-foreground text-xs">
          {formatFileSize(fileSize)} • {fileExtension.toUpperCase()}
        </div>
        {contentPreview && (
          <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">{contentPreview}</div>
        )}
      </div>
      <div className="text-muted-foreground text-xs">Click to download</div>
    </div>
  );
};
