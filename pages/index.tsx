// pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to enrollment register page
    router.replace('/enrollment/register');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen nca-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nca-primary mx-auto mb-4"></div>
        <p className="text-nca-gray-600">Redirecting to enrollment...</p>
      </div>
    </div>
  );
};

export default HomePage;