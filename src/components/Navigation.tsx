'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TrendingUp, Settings, LogOut, Home, BarChart3, PieChart, Sun, Moon, Languages, Users } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavigationProps {
  currentPage?: string;
}

export function Navigation({ currentPage }: NavigationProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { t, language, toggleLanguage, isRTL } = useLanguage();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: t('navigation.dashboard'), icon: Home, href: '/dashboard' },
    { id: 'portfolio', label: t('navigation.portfolio'), icon: PieChart, href: '/portfolio' },
    { id: 'exchanges', label: t('navigation.exchanges'), icon: BarChart3, href: '/exchanges' },
    { id: 'advisors', label: t('navigation.advisors'), icon: Users, href: '/advisors' },
  ];

  return (
    <header className="bg-[var(--nav-bg)] border-b border-[var(--nav-border)] sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <motion.div
            className="flex items-center cursor-pointer"
            onClick={() => router.push('/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrendingUp className="h-8 w-8 text-[var(--primary)]" />
            <h1 className={`${isRTL ? 'mr-2' : 'ml-2'} text-2xl font-bold text-[var(--foreground)]`}>{t('navigation.portfolioDoctor')}</h1>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => router.push(item.href)}
                      className={
                        isActive
                          ? 'bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white border-0'
                          : 'bg-transparent hover:bg-[var(--card-hover)] text-[var(--text-muted)] hover:text-[var(--foreground)] border-0'
                      }
                    >
                      <Icon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <span>{item.label}</span>
                    </Button>
                  </motion.div>
                );
              })}
            </nav>

            {/* Language Toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="bg-transparent border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)]"
                title={language === 'en' ? 'Switch to Persian' : 'Switch to English'}
              >
                <Languages className="h-4 w-4" />
                <span className={`${isRTL ? 'mr-1' : 'ml-1'} text-xs`}>{language === 'en' ? 'EN' : 'FA'}</span>
              </Button>
            </motion.div>

            {/* Theme Toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="bg-transparent border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)]"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </motion.div>

            {/* User Menu */}
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <span className="text-sm text-[var(--text-muted)] hidden sm:inline">{t('common.welcome')}, {user.username}</span>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)]"
                >
                  <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className="hidden sm:inline">{t('common.settings')}</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)] hover:border-[var(--danger)] hover:text-[var(--danger)]"
                >
                  <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className="hidden sm:inline">{t('common.logout')}</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
