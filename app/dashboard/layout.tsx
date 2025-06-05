'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, 
  BarChart3, 
  Heart, 
  LogOut
} from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navigationItems = [
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      label: 'Tracking',
      href: '/dashboard/tracking',
      icon: BarChart3,
    },
    {
      label: 'My Favorite',
      href: '/dashboard/favourites',
      icon: Heart,
    },
  ];

  const handleLogout = () => {
    // Remove cookies
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "userType=; path=/; max-age=0; SameSite=Lax";
    
    // Redirect to login or home page
    window.location.href = '/';
  };

  const isActiveRoute = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Mobile Top Navigation */}
      <div className="lg:hidden bg-white border-b shadow-sm">
        <div className="flex items-center overflow-x-auto px-4 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center space-y-1 px-6 py-3 min-w-0 whitespace-nowrap
                  transition-all duration-200
                  ${isActive 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center space-y-1 px-6 py-3 min-w-0 whitespace-nowrap
                       text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 bg-gradient-to-b from-blue-600 to-blue-700">
        <div className="flex flex-col w-full h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-blue-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-sm"></div>
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Dashboard</h2>
                <p className="text-blue-200 text-sm">Welcome back</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg 
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-white text-blue-600 shadow-lg' 
                      : 'text-white hover:bg-white/10 hover:translate-x-1'
                    }
                  `}
                >
                  <Icon 
                    size={20} 
                    className={`
                      ${isActive ? 'text-blue-600' : 'text-white group-hover:text-white'}
                    `}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Logout Button */}
          <div className="p-4 border-t border-blue-500/30">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg 
                         text-white hover:bg-white/10 transition-all duration-200
                         group hover:translate-x-1"
            >
              <LogOut size={20} className="text-white" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;