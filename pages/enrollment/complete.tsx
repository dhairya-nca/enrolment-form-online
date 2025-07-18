import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';

const REQUIRED_DOCUMENTS = [
  {
    id: 'passportBio',
    name: 'Passport Bio Page',
    description: 'Clear photo of your passport information page'
  },
  {
    id: 'visaCopy',
    name: 'Current VISA Copy',
    description: 'Copy of your current Australian visa'
  },
  {
    id: 'photoId',
    name: 'Photo ID',
    description: 'Driver\'s license or other government-issued photo ID'
  },
  {
    id: 'usiEmail',
    name: 'USI Creation Email',
    description: 'Email confirmation from creating your USI'
  },
  {
    id: 'recentPhoto',
    name: 'Recent Photo',
    description: 'Recent passport-style photograph'
  }
];

const DocumentsPage = () => {
  const router = useRouter();
  const [studentData, setStudentData] = useState<any>(null);
  const [uploads, setUploads] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } else {
      router.push('/enrollment/start');
    }
  }, [router]);

  const handleFileUpload = (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate upload success
      setUploads(prev => ({
        ...prev,
        [documentId]: true
      }));
      alert(`${file.name} uploaded successfully!`);
    }
  };

  const handleFinalSubmit = async () => {
    const uploadedCount = Object.values(uploads).filter(Boolean).length;
    
    if (uploadedCount < REQUIRED_DOCUMENTS.length) {
      alert(`Please upload all ${REQUIRED_DOCUMENTS.length} required documents before proceeding.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare document links
      const documentLinks = Object.fromEntries(
        Object.entries(uploads).map(([docId, uploaded]) => [
          docId,
          uploaded ? `https://mock-storage.com/documents/${docId}_${Date.now()}.pdf` : null
        ])
      );

      const finalStudentData = {
        ...studentData,
        documents: documentLinks,
        status: 'complete',
        submittedAt: new Date().toISOString()
      };

      // Submit to backend (mock)
      console.log('Submitting enrollment data:', finalStudentData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      localStorage.setItem('nca_final_submission', JSON.stringify(finalStudentData));
      localStorage.removeItem('nca_student_data');
      router.push('/enrollment/complete');

    } catch (error) {
      console.error('Error submitting enrollment:', error);
      alert('There was an error submitting your enrollment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const uploadedCount = Object.values(uploads).filter(Boolean).length;
  const allDocumentsUploaded = uploadedCount === REQUIRED_DOCUMENTS.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">NCA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">National College Australia</h1>
                <p className="text-xs text-gray-600">Document Upload</p>
              </div>
            </Link>
            <div className="text-right">
              <p className="text-sm text-gray-600">Step 4 of 4</p>
              <p className="text-xs text-gray-500">Required Documents</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    step.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : step.current 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {step.completed ? (
                      <span>✓</span>
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className={`text-xs font-medium ${step.current ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.name}
                    </span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-all duration-200 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Required Documents</h2>
            <p className="text-gray-600">
              Please upload all required documents to complete your enrollment
            </p>
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 font-medium">
                Progress: {uploadedCount} of {REQUIRED_DOCUMENTS.length} documents uploaded
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(uploadedCount / REQUIRED_DOCUMENTS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {REQUIRED_DOCUMENTS.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{document.name}</h4>
                    <p className="text-sm text-gray-600">{document.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Accepted formats: PDF, JPG, PNG | Max size: 5MB
                    </p>
                  </div>
                  {uploads[document.id] && (
                    <div className="text-green-500">✓ Uploaded</div>
                  )}
                </div>

                {!uploads[document.id] ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 text-gray-400 mb-3">📄</div>
                      <p className="text-gray-600 mb-4">Choose file to upload</p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(document.id, e)}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-green-600">📄</div>
                      <div className="flex-1">
                        <p className="text-green-800 font-medium">{document.name}</p>
                        <p className="text-green-600 text-sm">Uploaded successfully</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploads(prev => {
                            const newUploads = { ...prev };
                            delete newUploads[document.id];
                            return newUploads;
                          });
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Notes</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• All documents must be clear and legible</li>
              <li>• Photos should be in color and well-lit</li>
              <li>• PDF files are preferred for official documents</li>
              <li>• Maximum file size is 5MB per document</li>
              <li>• All documents will be securely stored and used only for enrollment purposes</li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Declarations
            </button>
            
            <button
              onClick={handleFinalSubmit}
              disabled={!allDocumentsUploaded || isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                allDocumentsUploaded && !isSubmitting
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Enrollment'}
            </button>
          </div>

          {isSubmitting && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Processing your enrollment...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentsPage;