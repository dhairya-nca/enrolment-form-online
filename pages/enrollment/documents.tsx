import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import NCALogo from '../../components/NCALogo';
import StepProgress from '../../components/StepProgress';

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

  const handleBackButton = () => {
  // Go back to Declaration page explicitly  
  router.push('/enrollment/declaration');
  };


  const handleFinalSubmit = async () => {
    const uploadedCount = Object.values(uploads).filter(Boolean).length;
    
    if (uploadedCount < REQUIRED_DOCUMENTS.length) {
      alert(`Please upload all ${REQUIRED_DOCUMENTS.length} required documents before proceeding.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit enrollment to API
      const response = await fetch('/api/submit-enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit enrollment');
      }
  
      const result = await response.json();
      console.log('Enrollment submitted successfully:', result);
      
      const completedData = {
        ...studentData,
        documents: uploads,
        status: 'enrollment-complete',
        completedAt: new Date().toISOString()
      };
  
      localStorage.setItem('nca_student_data', JSON.stringify(completedData));
      router.push('/enrollment/complete');
  
    } catch (error) {
      console.error('Error completing enrollment:', error);
      alert('There was an error completing your enrollment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadedCount = Object.values(uploads).filter(Boolean).length;
  const allDocumentsUploaded = uploadedCount === REQUIRED_DOCUMENTS.length;

  return (
    <div className="min-h-screen nca-gradient">
      {/* Header */}
      <Header 
        title="Document Upload" 
        showProgress={true}
        currentStep={4}
        totalSteps={4}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <StepProgress steps={steps} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-nca-gray-900 mb-2">Upload Required Documents</h2>
            <p className="text-nca-gray-600">
              Please upload all required documents to complete your enrollment
            </p>
            <div className="mt-4 bg-nca-light rounded-lg p-4">
              <p className="text-nca-primary font-medium">
                Progress: {uploadedCount} of {REQUIRED_DOCUMENTS.length} documents uploaded
              </p>
              <div className="nca-progress mt-2">
                <div 
                  className="nca-progress-fill"
                  style={{ width: `${(uploadedCount / REQUIRED_DOCUMENTS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {REQUIRED_DOCUMENTS.map((document) => (
              <div key={document.id} className="border border-nca-gray-200 rounded-lg p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-nca-gray-900">{document.name}</h4>
                    <p className="text-sm text-nca-gray-600">{document.description}</p>
                    <p className="text-xs text-nca-gray-500 mt-1">
                      Accepted formats: PDF, JPG, PNG | Max size: 5MB
                    </p>
                  </div>
                  {uploads[document.id] && (
                    <div className="flex items-center text-nca-primary">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium">Uploaded</span>
                    </div>
                  )}
                </div>

                {!uploads[document.id] ? (
                  <div className="border-2 border-dashed border-nca-gray-300 rounded-lg p-6 text-center hover:border-nca-primary transition-colors">
                    <input
                      type="file"
                      id={`file-${document.id}`}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(document.id, e)}
                      className="hidden"
                    />
                    <label
                      htmlFor={`file-${document.id}`}
                      className="cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-nca-light rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-nca-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-nca-gray-600 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-nca-gray-500">PDF, PNG, JPG up to 5MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="bg-nca-light border border-nca-primary rounded-lg p-4 flex items-center">
                    <div className="w-10 h-10 bg-nca-primary rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-nca-primary font-medium">Document uploaded successfully</p>
                      <p className="text-xs text-nca-gray-600">File verified and ready for processing</p>
                    </div>
                    <button
                      onClick={() => setUploads(prev => ({ ...prev, [document.id]: false }))}
                      className="text-nca-gray-500 hover:text-nca-gray-700 text-sm"
                    >
                      Replace
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Important Notes */}
          <div className="bg-nca-light border border-nca-primary rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-nca-primary mb-3">Important Notes</h3>
            <ul className="text-sm text-nca-gray-700 space-y-2">
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
            onClick={handleBackButton}  // NEW LINE
            className="px-6 py-3 border border-nca-gray-300 text-nca-gray-700 rounded-lg hover:bg-nca-gray-50 transition-colors"
          >
            Back to Declarations
          </button>
            
            <button
              onClick={handleFinalSubmit}
              disabled={!allDocumentsUploaded || isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                allDocumentsUploaded && !isSubmitting
                  ? 'btn-primary hover:scale-105'
                  : 'bg-nca-gray-300 text-nca-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Enrollment'}
            </button>
          </div>

          {isSubmitting && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nca-primary mx-auto mb-2"></div>
              <p className="text-nca-gray-600">Processing your enrollment...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentsPage;