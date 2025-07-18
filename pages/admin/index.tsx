// pages/admin/index.tsx - Professional Version
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Eye, 
  Settings, 
  LogOut, 
  Search,
  RefreshCw,
  FolderOpen,
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle
} from 'lucide-react';
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
      const response = await fetch('/api/admin/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } else {
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'admin':
        return <Settings className="w-5 h-5 text-blue-600" />;
      default:
        return <Eye className="w-5 h-5 text-green-600" />;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrator';
      case 'admin':
        return 'Administrator';
      default:
        return 'Viewer';
    }
  };

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* User Role Card */}
      <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {getRoleIcon(user?.role || '')}
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Current Role
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {getRoleDisplayName(user?.role || '')}
                </dd>
                <dd className="text-sm text-gray-600">
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
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                    <dd className="text-2xl font-bold text-gray-900">{analytics.totalStudents}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">LLN Assessments</dt>
                    <dd className="text-2xl font-bold text-gray-900">{analytics.totalLLNAssessments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Eligibility Rate</dt>
                    <dd className="text-2xl font-bold text-gray-900">{analytics.eligibilityRate}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Max Attempts</dt>
                    <dd className="text-2xl font-bold text-gray-900">{analytics.studentsAtMaxAttempts}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {canViewAnalytics && analytics && (
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Today's Submissions</p>
                  <p className="text-lg font-semibold text-blue-600">{analytics.todaySubmissions}</p>
                </div>
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">This Week</p>
                  <p className="text-lg font-semibold text-green-600">{analytics.weeklySubmissions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const StudentsTab = () => {
    if (!canViewStudents) {
      return (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">You do not have permission to view student data.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Search and Actions Bar */}
        <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={loadData}
              className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Students ({filteredStudents.length})
            </h3>
          </div>
          
          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LLN Attempts
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
                    <tr key={student.studentId} className="hover:bg-gray-50">
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
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : student.attemptCount >= 2
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {student.attemptCount}/3
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.status === 'Max Attempts Reached' 
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : student.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          {canViewFolders && (
                            <button
                              onClick={() => viewStudentFolder(student.studentId)}
                              className="inline-flex items-center text-blue-600 hover:text-blue-900"
                            >
                              <FolderOpen className="w-4 h-4 mr-1" />
                              View Folder
                            </button>
                          )}
                          {canResetAttempts && student.attemptCount >= 3 && (
                            <button
                              onClick={() => resetStudentAttempts(student.studentId)}
                              disabled={resetingStudentId === student.studentId}
                              className="inline-flex items-center text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              <RefreshCw className={`w-4 h-4 mr-1 ${resetingStudentId === student.studentId ? 'animate-spin' : ''}`} />
                              {resetingStudentId === student.studentId ? 'Resetting...' : 'Reset Attempts'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No students match your search criteria.' : 'No students have been registered yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const AnalyticsTab = () => {
    if (!canViewAnalytics) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500">You do not have permission to view analytics.</p>
        </div>
      );
    }

    if (!analytics) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-500">Analytics data is not available at this time.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Detailed Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-blue-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Weekly Activity</h3>
              </div>
              <div className="mt-4 space-y-2">
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

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-green-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Success Metrics</h3>
              </div>
              <div className="mt-4 space-y-2">
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

          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Attention Required</h3>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Max Attempts Reached</span>
                  <span className="font-semibold text-red-600">{analytics.studentsAtMaxAttempts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Courses */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Popular Courses</h3>
          </div>
          <div className="px-6 py-5">
            {analytics.popularCourses && analytics.popularCourses.length > 0 ? (
              <div className="space-y-4">
                {analytics.popularCourses.map((course, index) => (
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
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No course data available</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">NCA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">National College Australia</h1>
                <p className="text-sm text-gray-600">Administration Portal</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 bg-white rounded-lg shadow-sm">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setSelectedTab('dashboard')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                selectedTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </button>
            {canViewStudents && (
                <button
                onClick={() => setSelectedTab('students')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  selectedTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Students ({students.length})
              </button>
            )}
            {canViewAnalytics && (
              <button
                onClick={() => setSelectedTab('analytics')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  selectedTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
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