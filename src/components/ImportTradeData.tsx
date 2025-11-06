'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { exchangesApi } from '@/lib/api';

interface ImportTradeDataProps {
  onImportSuccess?: () => void;
}

export function ImportTradeData({ onImportSuccess }: ImportTradeDataProps) {
  const { t, isRTL } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel', 'text/plain'];
    const validExtensions = ['.csv', '.json', '.txt'];
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension);

    if (!isValidType) {
      setError(t('importTradeData.invalidFileType'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('importTradeData.fileTooLarge'));
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccess(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Read file content
      const fileContent = await readFileContent(selectedFile);
      
      // Parse and validate data
      const parsedData = parseFileData(fileContent, selectedFile.name);
      
      // Send to API
      const response = await exchangesApi.importTradeData({
        data: parsedData,
        fileName: selectedFile.name,
        fileType: selectedFile.type || getFileType(selectedFile.name),
      });

      const result = response.data;
      setSuccess(t('importTradeData.uploadSuccess', { count: result.importedCount || parsedData.length }));
      setSelectedFile(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call success callback
      if (onImportSuccess) {
        setTimeout(() => {
          onImportSuccess();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || t('importTradeData.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const parseFileData = (content: string, fileName: string): any[] => {
    const fileExtension = '.' + fileName.split('.').pop()?.toLowerCase();
    
    if (fileExtension === '.json') {
      try {
        const jsonData = JSON.parse(content);
        return Array.isArray(jsonData) ? jsonData : [jsonData];
      } catch (err) {
        throw new Error(t('importTradeData.invalidJson'));
      }
    } else if (fileExtension === '.csv' || fileExtension === '.txt') {
      return parseCSV(content);
    }
    
    throw new Error(t('importTradeData.unsupportedFormat'));
  };

  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error(t('importTradeData.emptyFile'));
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
    
    // Parse rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
      if (values.length === headers.length && values.some(v => v)) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  };

  const getFileType = (fileName: string): string => {
    const extension = '.' + fileName.split('.').pop()?.toLowerCase();
    if (extension === '.json') return 'application/json';
    if (extension === '.csv') return 'text/csv';
    return 'text/plain';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors">
      <CardHeader>
        <CardTitle className="text-[var(--foreground)] flex items-center">
          <Upload className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-[var(--primary)]`} />
          {t('importTradeData.title')}
        </CardTitle>
        <CardDescription className="text-[var(--text-muted)]">
          {t('importTradeData.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag and Drop Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
            ${isDragging 
              ? 'border-[var(--primary)] bg-[var(--primary)]/10' 
              : 'border-[var(--card-border)] hover:border-[var(--primary)]/50 hover:bg-[var(--input-bg)]'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,.txt"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center space-y-4">
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 text-[var(--primary)] animate-spin" />
                <p className="text-sm text-[var(--text-muted)]">{t('importTradeData.uploading')}</p>
              </>
            ) : (
              <>
                <div className="p-4 rounded-full bg-[var(--primary)]/10">
                  <FileText className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)] mb-1">
                    {t('importTradeData.dragAndDrop')}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t('importTradeData.supportedFormats')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploading}
                  className="mt-2"
                >
                  <Upload className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('importTradeData.selectFile')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Selected File Info */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--card-border)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-[var(--primary)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {!isUploading && (
                <Button
                  onClick={handleUpload}
                  className="w-full mt-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90"
                >
                  <Upload className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('importTradeData.upload')}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-lg flex items-start space-x-2"
            >
              <AlertCircle className="h-5 w-5 text-[var(--danger)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--danger)] flex-1">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="flex-shrink-0 h-auto p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-lg flex items-start space-x-2"
            >
              <CheckCircle className="h-5 w-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--success)] flex-1">{success}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSuccess(null)}
                className="flex-shrink-0 h-auto p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        <div className="p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--card-border)]">
          <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">
            {t('importTradeData.requiredFields')}
          </p>
          <ul className="text-xs text-[var(--text-muted)] space-y-1 list-disc list-inside">
            <li>{t('importTradeData.fieldExample', { field: 'symbol', example: 'BTC/USDT' })}</li>
            <li>{t('importTradeData.fieldExample', { field: 'quantity', example: '0.1' })}</li>
            <li>{t('importTradeData.fieldExample', { field: 'price', example: '50000' })}</li>
            <li>{t('importTradeData.fieldExample', { field: 'timestamp', example: '2024-01-01 12:00:00' })}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

