import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validate file type (xls, xlsx, csv)
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    const validExtensions = ['.xls', '.xlsx', '.csv'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setErrorMessage('Please select a valid Excel or CSV file (.xls, .xlsx, .csv)');
      setUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    console.log('Uploading file:', selectedFile.name);

    // Simulate upload (replace with actual API call)
    setTimeout(() => {
      setUploadStatus('success');
      console.log('Upload complete - file would be sent to backend API');
      // Reset after success
      setTimeout(() => {
        setSelectedFile(null);
        setUploadStatus('idle');
      }, 2000);
    }, 1500);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Upload Machine Data</h2>
              <p className="text-sm text-slate-500">Import XLS/CSV file to add new machines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-slate-50 hover:border-slate-400'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <p className="text-slate-700 font-medium mb-1">
                  Drag and drop your file here, or
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xls,.xlsx,.csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-slate-500">
                Supported formats: .xls, .xlsx, .csv (Max 10MB)
              </p>
            </div>
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-green-800 font-medium">File uploaded successfully!</p>
            </div>
          )}

          {uploadStatus === 'error' && errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{errorMessage}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">File Requirements:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>File must contain columns: Machine ID, Name, Status, Risk Score, Location, Last Maintenance</li>
              <li>Date format: YYYY-MM-DD</li>
              <li>Risk Score must be a number between 0-100</li>
              <li>Status must be: Normal, Watch, or Risk</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {uploadStatus === 'uploading' && (
              <span className="mr-2">Uploading...</span>
            )}
            {uploadStatus === 'success' && (
              <span className="mr-2">Uploaded!</span>
            )}
            {(uploadStatus === 'idle' || uploadStatus === 'error') && (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
