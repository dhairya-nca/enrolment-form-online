// components/forms/StudentRegistration.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface StudentRegistrationProps {
  onRegistrationComplete: (data: any) => void;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = ({ onRegistrationComplete }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: ''
  });
  const [errors, setErrors] = useState<Partial<RegistrationData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // UPDATED: Changed minimum age from 16 to 18 years
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old to register';
      }

      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof RegistrationData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Validate student using the correct API endpoint
      const response = await fetch('/api/validate-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (data.isNewStudent) {
          setMessage({
            type: 'success',
            text: data.message
          });
          
          // Store registration data for next steps
          localStorage.setItem('nca_student_registration', JSON.stringify({
            ...formData,
            studentId: data.studentId,
            folderId: data.folderId,
            attemptCount: data.attemptCount
          }));

          // Proceed to LLN assessment after short delay
          setTimeout(() => {
            onRegistrationComplete({
              ...formData,
              studentId: data.studentId,
              folderId: data.folderId,
              attemptCount: data.attemptCount,
              isNewStudent: true
            });
          }, 2000);

        } else {
          // Existing student
          if (data.maxAttemptsReached) {
            setMessage({
              type: 'error',
              text: data.message
            });
            
            // Redirect to not eligible page after delay
            setTimeout(() => {
              router.push('/enrollment/not-eligible');
            }, 3000);
          } else {
            setMessage({
              type: 'warning',
              text: data.message
            });
            
            // Store existing student data
            localStorage.setItem('nca_student_registration', JSON.stringify({
              ...formData,
              studentId: data.studentId,
              folderId: data.folderId,
              attemptCount: data.attemptCount
            }));

            // Proceed to LLN assessment
            setTimeout(() => {
              onRegistrationComplete({
                ...formData,
                studentId: data.studentId,
                folderId: data.folderId,
                attemptCount: data.attemptCount,
                isNewStudent: false
              });
            }, 2000);
          }
        }
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Registration failed. Please try again.'
        });
      }

    } catch (error) {
      console.error('Registration error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : message.type === 'warning'
            ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-nca-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={`form-field disabled:bg-nca-gray-100 ${
              errors.firstName ? 'border-red-500' : ''
            }`}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-nca-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={`form-field disabled:bg-nca-gray-100 ${
              errors.lastName ? 'border-red-500' : ''
            }`}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-nca-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={`form-field disabled:bg-nca-gray-100 ${
              errors.email ? 'border-red-500' : ''
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-nca-gray-700 mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            disabled={isSubmitting}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
            className={`form-field disabled:bg-nca-gray-100 ${
              errors.dateOfBirth ? 'border-red-500' : ''
            }`}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Validating...
            </div>
          ) : (
            'Continue to LLN Assessment'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-nca-gray-500">
          * Required fields. You must be at least 18 years old to register.
        </p>
      </div>
    </div>
  );
};

export default StudentRegistration;