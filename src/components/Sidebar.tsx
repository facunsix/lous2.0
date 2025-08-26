import React from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

interface SidebarProps {
  user: any;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, activeView, onViewChange, onLogout }: SidebarProps) {
  const isAdmin = user.role === 'admin';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      available: true
    },
    {
      id: 'tasks',
      label: isAdmin ? 'Gestionar Tareas' : 'Mis Tareas',
      icon: '✅',
      available: true
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: '👥',
      available: isAdmin
    },
    {
      id: 'create-task',
      label: 'Nueva Tarea',
      icon: '➕',
      available: isAdmin
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-blue-500 to-indigo-600 flex-shrink-0">
            <AvatarFallback className="text-white font-medium text-sm sm:text-base">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.name}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full truncate ${
                isAdmin 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {isAdmin ? 'Admin' : 'Usuario'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        {menuItems
          .filter(item => item.available)
          .map((item) => {
            const isActive = activeView === item.id;
            
            return (
              <div
                key={item.id}
                className="transition-transform hover:translate-x-1"
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start space-x-2 sm:space-x-3 h-10 sm:h-11 text-sm sm:text-base ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => onViewChange(item.id)}
                >
                  <span className="text-base sm:text-lg flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Button>
              </div>
            );
          })}
      </nav>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-gray-200 space-y-1 sm:space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start space-x-2 sm:space-x-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-10 sm:h-11 text-sm sm:text-base"
          onClick={() => onViewChange('profile')}
        >
          <span className="text-base sm:text-lg flex-shrink-0">⚙️</span>
          <span className="truncate">Configuración</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start space-x-2 sm:space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50 h-10 sm:h-11 text-sm sm:text-base"
          onClick={onLogout}
        >
          <span className="text-base sm:text-lg flex-shrink-0">🚪</span>
          <span className="truncate">Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  );
}