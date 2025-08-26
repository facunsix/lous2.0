import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import UserManager from './components/UserManager';
import ProfileManager from './components/ProfileManager';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const checkExistingSession = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const { projectId, publicAnonKey } = await import('./utils/supabase/info');
      
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && !error) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || 'Usuario',
          role: session.user.user_metadata?.role || 'user',
          accessToken: session.access_token
        });
      }
    } catch (error) {
      console.log('No existing session found:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const fetchTasks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { projectId } = await import('./utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-154d65af/tasks`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (response.ok) {
        const tasksData = await response.json();
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar las tareas');
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Error de conexión al obtener las tareas');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      const { projectId } = await import('./utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-154d65af/users`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (response.ok) {
        const usersData = await response.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        console.error('Error fetching users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const refreshData = () => {
    fetchTasks();
    fetchUsers();
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setError('');
  };

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const { projectId, publicAnonKey } = await import('./utils/supabase/info');
      
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );

      await supabase.auth.signOut();
      
      setUser(null);
      setTasks([]);
      setUsers([]);
      setActiveView('dashboard');
      setError('');
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
      setUser(null);
      setTasks([]);
      setUsers([]);
      setActiveView('dashboard');
      setError('');
      setSidebarOpen(false);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    checkExistingSession();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchUsers();
    }
  }, [user]);

  const renderActiveView = () => {
    if (isLoading && tasks.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error al cargar los datos
            </h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
            <button
              onClick={refreshData}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard user={user} tasks={tasks} users={users} />;
      case 'tasks':
      case 'create-task':
        return <TaskManager user={user} tasks={tasks} users={users} onRefresh={refreshData} />;
      case 'users':
        return user.role === 'admin' ? <UserManager users={users} tasks={tasks} /> : null;
      case 'profile':
        return <ProfileManager user={user} onUserUpdate={handleUserUpdate} />;
      default:
        return <Dashboard user={user} tasks={tasks} users={users} />;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl">☰</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {activeView === 'dashboard' ? 'Dashboard' :
             activeView === 'tasks' ? 'Tareas' :
             activeView === 'users' ? 'Usuarios' :
             activeView === 'profile' ? 'Perfil' : 'Sistema de Tareas'}
          </h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
          onClick={closeSidebar}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:transform-none lg:static lg:inset-auto lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar 
            user={user} 
            activeView={activeView} 
            onViewChange={(view) => {
              setActiveView(view);
              setSidebarOpen(false);
            }}
            onLogout={handleLogout}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <div className="pt-16 lg:pt-0 p-4 sm:p-6">
            {renderActiveView()}
          </div>
        </div>
      </div>
    </div>
  );
}