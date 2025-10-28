'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Shield, BarChart3, Users } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Portfolio Doctor</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => router.push('/login')}>
                Login
              </Button>
              <Button onClick={() => router.push('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Manage Your Crypto Portfolio
            <span className="text-primary"> Intelligently</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Connect to exchanges, analyze your risk profile, and make informed investment decisions with our comprehensive portfolio management platform.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Button size="lg" onClick={() => router.push('/register')}>
                Start Free Trial
              </Button>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Button variant="outline" size="lg" onClick={() => router.push('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary" />
                <CardTitle>Portfolio Tracking</CardTitle>
                <CardDescription>
                  Monitor your cryptocurrency investments across multiple exchanges in real-time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary" />
                <CardTitle>Risk Management</CardTitle>
                <CardDescription>
                  Get personalized risk assessments and trading plan recommendations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary" />
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Detailed performance metrics and portfolio optimization insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary" />
                <CardTitle>Expert Support</CardTitle>
                <CardDescription>
                  Access to professional guidance and community support.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">
              © 2024 Portfolio Doctor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}