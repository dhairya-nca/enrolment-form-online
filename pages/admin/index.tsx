// pages/admin/index.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import NCALogo from '../../components/NCALogo';
import { useRouter } from 'next/router';

interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  attemptCount: number;
  isBlocked: boolean;
  status: string;
  folderId: string;
  registeredAt: string;
  lastAttemptAt: string;
}

interface Analytics {
  totalStudents: number;
  totalEnrollments: number;
  totalLLNAssessments: number;
  todaySubmissions: number;
  weeklySubmissions: number;
  eligibilityRate: number;
  studentsAtMaxAttempts: number;
  popularCourses: Array<{course: string, count: number}>;
}

const AdminPortal = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'students' | 'analytics'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [resetingStudentId, setResetingStudentId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/admin/analytics')
      ]);

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students || []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.analytics || null);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetStudentAttempts = async (studentId: string) => {
    if (!confirm('Are you sure you want to reset this student\'s LLN attempts?')) {
      return;
    }

    try {
      setResetingStudentId(studentId);
      const response = await fetch('/api/admin/reset-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });

      if (response.ok) {
        alert('Student attempts reset successfully');
        loadData(); // Reload data
      } else {
        alert('Failed to reset student attempts');
      }
    } catch (error) {
      console.error('Error resetting attempts:', error);
      alert('Error resetting student attempts');
    } finally {
      setResetingStudentId(null);
    }
  };

  const viewStudentFolder = async (studentId: string) => {
    try {
      const response = await fetch(`/api/admin/student-folder?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.student?.shareableLink) {
          window.open(data.student.shareableLink, '_blank');
        } else {
          alert('Student folder not found');
        }
      } else {
        alert('Error accessing student folder');
      }
    } catch (error) {
      console.error('Error viewing folder:', error);
      alert('Error accessing student folder');
    }
  };

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics?.totalStudents || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Enrollments</h3>
          <p className="text-3xl font-bold text-green-600">{analytics?.totalEnrollments || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">LLN Assessments</h3>
          <p className="text-3xl font-bold text-purple-600">{analytics?.totalLLNAssessments || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Eligibility Rate</h3>
          <p className="text-3xl font-bold text-orange-600">{analytics?.eligibilityRate?.toFixed(1) || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Today's Submissions</span>
              <span className="font-semibold">{analytics?.todaySubmissions || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>This Week's Submissions</span>
              <span className="font-semibold">{analytics?.weeklySubmissions || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Students at Max Attempts</span>
              <span className="font-semibold text-red-600">{analytics?.studentsAtMaxAttempts || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Courses</h3>
          <div className="space-y-2">
            {analytics?.popularCourses?.slice(0, 5).map((course, index) => (
              <div key={index} className="flex justify-between">
                <span className="truncate">{course.course}</span>
                <span className="font-semibold">{course.count}</span>
              </div>
            )) || <p className="text-gray-500">No data available</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const StudentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.studentId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{student.studentId}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    student.attemptCount >= 3 
                      ? 'bg-red-100 text-red-800' 
                      : student.attemptCount >= 2 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {student.attemptCount}/3
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    student.status === 'Max Attempts Reached' 
                      ? 'bg-red-100 text-red-800'
                      : student.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(student.registeredAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => viewStudentFolder(student.studentId)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Folder
                  </button>
                  {student.attemptCount >= 3 && (
                    <button
                      onClick={() => resetStudentAttempts(student.studentId)}
                      disabled={resetingStudentId === student.studentId}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {resetingStudentId === student.studentId ? 'Resetting...' : 'Reset Attempts'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Students Registered</span>
              <span className="font-bold">{analytics?.totalStudents || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed Enrollments</span>
              <span className="font-bold">{analytics?.totalEnrollments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>LLN Assessments Taken</span>
              <span className="font-bold">{analytics?.totalLLNAssessments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Eligibility Rate</span>
              <span className="font-bold">{analytics?.eligibilityRate?.toFixed(1) || 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Popularity</h3>
          <div className="space-y-3">
            {analytics?.popularCourses?.map((course, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{course.course}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{
                        width: `${(course.count / (analytics.popularCourses?.[0]?.count || 1)) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{course.count}</span>
                </div>
              </div>
            )) || <p className="text-gray-500">No data available</p>}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">NCA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">National College Australia</h1>
                <p className="text-xs text-gray-600">Admin Portal</p>
              </div>
            </Link>
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Main Site
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('dashboard')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setSelectedTab('students')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Students ({students.length})
            </button>
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {selectedTab === 'dashboard' && <DashboardTab />}
          {selectedTab === 'students' && <StudentsTab />}
          {selectedTab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;