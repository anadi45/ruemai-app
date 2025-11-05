'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FileAttachmentProps {
  filename: string;
  fileSize: number;
  fileExtension: string;
  className?: string;
}

export const FileAttachment = ({
  filename,
  fileSize,
  fileExtension,
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

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const link = document.createElement('a');
    link.href = `/api/files?filename=${encodeURIComponent(filename)}`;
    link.download = filename;
    link.target = '_blank';
    link.style.display = 'none';
    
    // Append to body to ensure it works in all browsers
    document.body.appendChild(link);
    link.click();
    
    // Clean up after a short delay
    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
    }, 100);
  };

  // Extract product name by removing the extension
  const productName = filename.replace(fileExtension, '');

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
        <div className="truncate text-sm font-medium">{productName}</div>
        <div className="text-muted-foreground text-xs">
          {formatFileSize(fileSize)}
        </div>
      </div>
      <div className="text-muted-foreground text-xs">Click to download</div>
    </div>
  );
};
