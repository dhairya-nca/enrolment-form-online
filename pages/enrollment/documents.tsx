// pages/enrollment/documents.tsx - Enhanced with better UX and error handling
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/Header';
import StepProgress from '../../components/StepProgress';

const REQUIRED_DOCUMENTS = [
  {
    id: 'passportBio',
    name: 'Passport Bio Page',
    description: 'Clear photo of your passport information page',
    icon: '📘',
    tips: 'Ensure all text is clearly readable and the page is well-lit'
  },
  {
    id: 'visaCopy',
    name: 'Current VISA Copy',
    description: 'Copy of your current Australian visa',
    icon: '🛂',
    tips: 'Include the full visa page showing validity dates'
  },
  {
    id: 'photoId',
    name: 'Photo ID',
    description: 'Driver\'s license or other government-issued photo ID',
    icon: '🆔',
    tips: 'Both sides if it\'s a driver\'s license'
  },
  {
    id: 'usiEmail',
    name: 'USI Creation Email',
    description: 'Email confirmation from creating your USI',
    icon: '📧',
    tips: 'Screenshot or PDF of the USI confirmation email'
  },
  {
    id: 'recentPhoto',
    name: 'Recent Photo',
    description: 'Recent passport-style photograph',
    icon: '📸',
    tips: 'Clear headshot, good lighting, neutral background'
  }
];

interface UploadStatus {
  [key: string]: {
    uploaded: boolean;
    uploading: boolean;
    fileName?: string;
    fileUrl?: string;
    error?: string;
  };
}

const DocumentsPage = () => {
  const router = useRouter();
  const [studentData, setStudentData] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const steps = [
    { id: 1, name: 'LLN Assessment', completed: true },
    { id: 2, name: 'Personal Details', completed: true },
    { id: 3, name: 'Declarations', completed: true },
    { id: 4, name: 'Documents', current: true }
  ];

  useEffect(() => {
    const savedData = localStorage.getItem('nca_student_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      setStudentData(data);
      
      // Initialize upload status
      const initialStatus: UploadStatus = {};
      REQUIRED_DOCUMENTS.forEach(doc => {
        initialStatus[doc.id] = { uploaded: false, uploading: false };
      });
      setUploadStatus(initialStatus);
    } else {
      router.push('/enrollment/start');
    }
  }, [router]);

  const handleFileUpload = useCallback(async (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !studentData) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setUploadStatus(prev => ({
        ...prev,
        [documentId]: {
          ...prev[documentId],
          error: 'Invalid file type. Please upload JPG, PNG, or PDF files only.'
        }
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus(prev => ({
        ...prev,
        [documentId]: {
          ...prev[documentId],
          error: 'File too large. Maximum size is 10MB.'
        }
      }));
      return;
    }

    // Start upload
    setUploadStatus(prev => ({
      ...prev,
      [documentId]: { uploaded: false, uploading: true, error: undefined }
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentId', studentData.studentId);
      formData.append('documentType', documentId);

      const response = await fetch('/api/upload-documents', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadStatus(prev => ({
          ...prev,
          [documentId]: {
            uploaded: true,
            uploading: false,
            fileName: result.fileName,
            fileUrl: result.fileUrl,
            error: undefined
          }
        }));

        // Show success modal if all documents are uploaded
        if (result.allDocumentsUploaded) {
          setShowSuccessModal(true);
        }
      } else {
        throw new Error(result.message || result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(prev => ({
        ...prev,
        [documentId]: {
          uploaded: false,
          uploading: false,
          error: error instanceof Error ? error.message : 'Upload failed. Please try again.'
        }
      }));
    }

    // Clear the input
    event.target.value = '';
  }, [studentData]);

  const handleRetryUpload = (documentId: string) => {
    setUploadStatus(prev => ({
      ...prev,
      [documentId]: { uploaded: false, uploading: false, error: undefined }
    }));
  };

  const handleReplaceDocument = (documentId: string) => {
    setUploadStatus(prev => ({
      ...prev,
      [documentId]: { uploaded: false, uploading: false, error: undefined }
    }));
  };

  const handleCompleteEnrollment = () => {
    setShowSuccessModal(false);
    localStorage.removeItem('nca_student_data');
    router.push('/enrollment/complete');
  };

  if (!studentData) {
    return (
      <div className="min-h-screen nca-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nca-primary mx-auto"></div>
          <p className="mt-4 text-nca-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const uploadedCount = Object.values(uploadStatus).filter(status => status.uploaded).length;
  const allDocumentsUploaded = uploadedCount === REQUIRED_DOCUMENTS.length;
  const hasErrors = Object.values(uploadStatus).some(status => status.error);

  return (
    <div className="min-h-screen nca-gradient">
      <Header 
        title="Document Upload" 
        showProgress={true}
        currentStep={4}
        totalSteps={4}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <StepProgress steps={steps} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card"
        >
          {/* Header Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-nca-gray-900 mb-2">Upload Required Documents</h2>
            <p className="text-nca-gray-600 mb-4">
              Please upload all required documents to complete your enrollment
            </p>
            
            {/* Progress Bar */}
            <div className="bg-nca-light rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-nca-primary font-medium">
                  Progress: {uploadedCount} of {REQUIRED_DOCUMENTS.length} documents uploaded
                </span>
                <span className="text-sm text-nca-gray-600">
                  {Math.round((uploadedCount / REQUIRED_DOCUMENTS.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-nca-gray-200 rounded-full h-3">
                <motion.div 
                  className="bg-nca-primary h-3 rounded-full transition-all duration-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(uploadedCount / REQUIRED_DOCUMENTS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Document Upload Cards */}
          <div className="space-y-6 mb-8">
            {REQUIRED_DOCUMENTS.map((document, index) => {
              const status = uploadStatus[document.id] || { uploaded: false, uploading: false };
              
              return (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`border-2 rounded-lg p-6 transition-all duration-300 ${
                    status.uploaded 
                      ? 'border-green-300 bg-green-50' 
                      : status.error 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-nca-gray-200 bg-white hover:border-nca-primary'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{document.icon}</span>
                        <h4 className="text-lg font-semibold text-nca-gray-900">{document.name}</h4>
                      </div>
                      <p className="text-sm text-nca-gray-600 mb-1">{document.description}</p>
                      <p className="text-xs text-nca-gray-500 italic">💡 {document.tips}</p>
                      <p className="text-xs text-nca-gray-500 mt-1">
                        Accepted: PDF, JPG, PNG | Max size: 10MB
                      </p>
                    </div>

                    {/* Status Icon */}
                    <div className="ml-4">
                      {status.uploading && (
                        <div className="flex items-center text-nca-primary">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-nca-primary mr-2"></div>
                          <span className="text-sm">Uploading...</span>
                        </div>
                      )}
                      {status.uploaded && (
                        <div className="flex items-center text-green-600">
                          <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">Uploaded</span>
                        </div>
                      )}
                      {status.error && (
                        <div className="flex items-center text-red-600">
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">Error</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Area */}
                  {!status.uploaded && !status.uploading && (
                    <div className="border-2 border-dashed border-nca-gray-300 rounded-lg p-6 text-center hover:border-nca-primary transition-colors">
                      <input
                        type="file"
                        id={`file-${document.id}`}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(document.id, e)}
                        className="hidden"
                        disabled={status.uploading}
                      />
                      <label htmlFor={`file-${document.id}`} className="cursor-pointer">
                        <div className="w-12 h-12 bg-nca-light rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-nca-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-nca-gray-600 mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-nca-gray-500">PDF, PNG, JPG up to 10MB</p>
                      </label>
                    </div>
                  )}

                  {/* Success State */}
                  {status.uploaded && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-green-700 font-medium">✅ Document uploaded successfully!</p>
                          <p className="text-xs text-green-600">File: {status.fileName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleReplaceDocument(document.id)}
                        className="text-green-600 hover:text-green-800 text-sm underline"
                      >
                        Replace
                      </button>
                    </div>
                  )}

                  {/* Error State */}
                  {status.error && (
                    <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-red-700 text-sm">{status.error}</p>
                        </div>
                        <button
                          onClick={() => handleRetryUpload(document.id)}
                          className="text-red-600 hover:text-red-800 text-sm underline"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-nca-gray-200 pt-6">
            {allDocumentsUploaded ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="bg-green-100 border border-green-300 rounded-lg p-6 mb-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    🎉 All Documents Uploaded!
                  </h3>
                  <p className="text-green-700">
                    Congratulations! You have successfully uploaded all required documents. 
                    Your enrollment is now complete and ready for review.
                  </p>
                </div>
                <button
                  onClick={handleCompleteEnrollment}
                  className="btn-primary text-lg px-8 py-3"
                >
                  Complete Enrollment
                </button>
              </motion.div>
            ) : (
              <div className="text-center">
                <p className="text-nca-gray-600 mb-4">
                  Please upload all {REQUIRED_DOCUMENTS.length} required documents to complete your enrollment.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-nca-primary font-medium">
                    {uploadedCount} of {REQUIRED_DOCUMENTS.length} completed
                  </span>
                  <span className="text-nca-gray-400">•</span>
                  <span className="text-nca-gray-600">
                    {REQUIRED_DOCUMENTS.length - uploadedCount} remaining
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-nca-gray-900 mb-2">Documents Complete!</h3>
              <p className="text-nca-gray-600 mb-6">
                All required documents have been uploaded successfully. Your enrollment is now ready for review.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleCompleteEnrollment}
                  className="btn-primary w-full"
                >
                  Complete Enrollment
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="btn-secondary w-full"
                >
                  Review Documents
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentsPage;