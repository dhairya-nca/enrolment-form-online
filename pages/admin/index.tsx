// pages/admin/index.tsx - Updated with Authentication
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { UserRole } from '../../middleware/auth';

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
  const [user, setUser] = useState<UserRole | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'students' | 'analytics'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [resetingStudentId, setResetingStudentId] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Load data after authentication
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const checkAuthentication = async () => {
    const token = localStorage.getItem('admin-token');
    const savedUser = localStorage.getItem('admin-user');

    if (!token || !savedUser) {
      router.push('/admin/login');
      return;
    }

    try {
      // Verify token with server
      const response = await fetch('/api/admin/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } else {
        // Token invalid, redirect to login
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin/login');
    }
  };

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const requests = [];
      
      // Only load data if user has permission
      if (user.permissions.includes('view_all')) {
        requests.push(fetch('/api/admin/students', { headers }));
      }
      
      if (user.permissions.includes('view_analytics')) {
        requests.push(fetch('/api/admin/analytics', { headers }));
      }

      const responses = await Promise.all(requests);
      
      if (user.permissions.includes('view_all') && responses[0]?.ok) {
        const studentsData = await responses[0].json();
        setStudents(studentsData.students || []);
      }

      const analyticsIndex = user.permissions.includes('view_all') ? 1 : 0;
      if (user.permissions.includes('view_analytics') && responses[analyticsIndex]?.ok) {
        const analyticsData = await responses[analyticsIndex].json();
        setAnalytics(analyticsData.analytics || null);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  };

  const resetStudentAttempts = async (studentId: string) => {
    if (!user?.permissions.includes('reset_attempts')) {
      alert('You do not have permission to reset attempts');
      return;
    }

    if (!confirm('Are you sure you want to reset this student\'s LLN attempts?')) {
      return;
    }

    try {
      setResetingStudentId(studentId);
      const token = localStorage.getItem('admin-token');
      
      const response = await fetch('/api/admin/reset-attempts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId })
      });

      if (response.ok) {
        alert('Student attempts reset successfully');
        loadData();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to reset student attempts');
      }
    } catch (error) {
      console.error('Error resetting attempts:', error);
      alert('Error resetting student attempts');
    } finally {
      setResetingStudentId(null);
    }
  };

  const viewStudentFolder = async (studentId: string) => {
    if (!user?.permissions.includes('view_folders')) {
      alert('You do not have permission to view folders');
      return;
    }

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/admin/student-folder?studentId=${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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

  // Permission-based component rendering
  const canViewStudents = user?.permissions.includes('view_all');
  const canViewAnalytics = user?.permissions.includes('view_analytics');
  const canResetAttempts = user?.permissions.includes('reset_attempts');
  const canViewFolders = user?.permissions.includes('view_folders');

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* User Role Badge */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                user?.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                user?.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user?.role === 'super_admin' ? '👑' : user?.role === 'admin' ? '🛡️' : '👁️'}
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Logged in as {user?.role?.replace('_', ' ')}
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {user?.email}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {canViewAnalytics && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics.totalStudents}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">LLN Assessments</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics.totalLLNAssessments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 font-semibold">📈</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Eligibility Rate</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics.eligibilityRate}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-semibold">⚠️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Max Attempts</dt>
                    <dd className="text-lg font-medium text-gray-900">{analytics.studentsAtMaxAttempts}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions List */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Permissions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {user?.permissions.map((permission) => (
              <span key={permission} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {permission.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const StudentsTab = () => {
    if (!canViewStudents) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">You do not have permission to view student data.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="bg-white shadow rounded-lg p-6">
          <input
            type="text"
            placeholder="Search students by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Students Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
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
                    {canViewFolders && (
                      <button
                        onClick={() => viewStudentFolder(student.studentId)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Folder
                      </button>
                    )}
                    {canResetAttempts && student.attemptCount >= 3 && (
                      <button
                        onClick={() => resetStudentAttempts(student.studentId)}
                        disabled={resetingStudentId === student.studentId}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 ml-2"
                      >
                        {resetingStudentId === student.studentId ? 'Resetting...' : 'Reset Attempts'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students found matching your search.
            </div>
          )}
        </div>
      </div>
    );
  };

  const AnalyticsTab = () => {
    if (!canViewAnalytics) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">You do not have permission to view analytics.</p>
        </div>
      );
    }

    if (!analytics) {
      return (
        <div className="text-center py-8 text-gray-500">
          No analytics data available.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Detailed Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Activity</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="font-semibold">{analytics.weeklySubmissions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Today</span>
                  <span className="font-semibold">{analytics.todaySubmissions}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Success Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Eligibility Rate</span>
                  <span className="font-semibold text-green-600">{analytics.eligibilityRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Enrollments</span>
                  <span className="font-semibold">{analytics.totalEnrollments}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Attention Required</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Max Attempts Reached</span>
                  <span className="font-semibold text-red-600">{analytics.studentsAtMaxAttempts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Courses */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Popular Courses</h3>
            <div className="space-y-3">
              {analytics.popularCourses?.map((course, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{course.course}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(course.count / (analytics.popularCourses?.[0]?.count || 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{course.count}</span>
                </div>
              )) || <p className="text-gray-500">No data available</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  if (!user) {
    return null; // Will redirect to login
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
                <p className="text-xs text-gray-600">Admin Portal - {user.role.replace('_', ' ')}</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
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
            {canViewStudents && (
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
            )}
            {canViewAnalytics && (
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
            )}
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