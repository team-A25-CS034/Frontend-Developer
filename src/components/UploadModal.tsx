import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    const validExtensions = ['.xls', '.xlsx', '.csv'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setErrorMessage('Please select a valid Excel or CSV file (.xls, .xlsx, .csv)');
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    setUploadStatus('idle');
    setSuccessMessage('');
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('access_token'); 
      if (!token) {
        throw new Error("Authentication token not found. Please login first.");
      }

      const API_BASE =
        (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE}/upload-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to upload file');
      }

      setUploadStatus('success');
      setSuccessMessage(data.message || `Successfully inserted ${data.inserted_count} records.`);
      
      setTimeout(() => {
        onClose();
        setUploadStatus('idle');
        setSelectedFile(null);
        setSuccessMessage('');
      }, 2000);

    } catch (error) {
      console.error('Upload Error:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred during upload.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">Upload Data</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center
              ${isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : uploadStatus === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
              }
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              className="hidden"
              accept=".csv,.xls,.xlsx"
            />

            <div className="flex flex-col items-center gap-3">
              <div className={`p-4 rounded-full ${
                uploadStatus === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {uploadStatus === 'error' ? (
                  <AlertCircle className="w-8 h-8" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>
              
              <div className="space-y-1">
                <p className="font-medium text-slate-700">
                  {selectedFile ? selectedFile.name : "Drag and drop your file here"}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedFile 
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                    : "or click to browse from your computer"
                  }
                </p>
              </div>

              {!selectedFile && (
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Select File
                </Button>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {uploadStatus === 'success' && successMessage && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">File Requirements (Backend Compatible):</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Columns: UID, Product ID, Type, Air temperature [K], Process temperature [K]</li>
              <li>Rotational speed [rpm], Torque [Nm], Tool wear [min], Machine failure</li>
              <li>Format: CSV or Excel (.xlsx)</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={uploadStatus === 'uploading'}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
            className={`text-white transition-all ${
              uploadStatus === 'success' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploadStatus === 'uploading' ? (
              <span className="flex items-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                Uploading...
              </span>
            ) : uploadStatus === 'success' ? (
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Done
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}