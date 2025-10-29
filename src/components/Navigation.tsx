'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TrendingUp, Settings, LogOut, Home, BarChart3, PieChart } from 'lucide-react';

interface NavigationProps {
  currentPage?: string;
}

export function Navigation({ currentPage }: NavigationProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart, href: '/portfolio' },
    { id: 'exchanges', label: 'Exchanges', icon: BarChart3, href: '/exchanges' },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">Portfolio Doctor</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => router.push(item.href)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Welcome, {user.username}</span>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
