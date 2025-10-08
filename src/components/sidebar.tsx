'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  Package, 
  Settings, 
  Shield, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEmpresaDoUsuario } from '@/hooks/use-empresa';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
  requiresProprietario?: boolean;
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: empresa, isLoading: empresaLoading } = useEmpresaDoUsuario(isAuthenticated);

  const navItems: NavItem[] = [
    { 
      href: '/vitrine', 
      label: 'Vitrine', 
      icon: LayoutGrid 
    },
    { 
      href: '/estoque', 
      label: 'Estoque', 
      icon: Package,
      requiresAuth: true,
      requiresProprietario: true
    },
    { 
      href: '/admin', 
      label: 'Admin', 
      icon: Shield,
      requiresAuth: true,
      requiresProprietario: true
    },
    { 
      href: '/configuracoes', 
      label: 'Configurações', 
      icon: Settings,
      requiresAuth: true,
      requiresProprietario: true
    },
  ];

  const isProprietario = empresa?.papel === 'proprietario';

  const visibleItems = navItems.filter(item => {
    if (item.requiresAuth && (!isAuthenticated || authLoading)) return false;
    if (item.requiresProprietario && (!isProprietario || empresaLoading)) return false;
    return true;
  });

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 ${isCollapsed ? 'lg:justify-center lg:p-4' : ''}`}>
            <Link href="/" className={`flex items-center gap-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image
                  src="/logo-deitada.png"
                  alt="Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                RN Gestor
              </span>
            </Link>
            <Link href="/" className={`hidden ${isCollapsed ? 'lg:flex' : 'lg:hidden'} items-center`}>
              <div className="relative h-10 w-10">
                <Image
                  src="/logo-deitada.png"
                  alt="Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-1 px-3">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      {...(isCollapsed ? { 'aria-label': item.label } : {})}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                        ${isCollapsed ? 'lg:justify-center lg:px-3' : ''}
                      `}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} aria-hidden="true" />
                      <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer Info */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Sistema de Gestão de Veículos
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div className={`hidden lg:block transition-all duration-300 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`} />
    </>
  );
}
