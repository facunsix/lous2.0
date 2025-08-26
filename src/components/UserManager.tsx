import React from 'react';
import { motion } from 'motion/react';
import { Users, Mail, Calendar, Shield, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

interface UserManagerProps {
  users: any[];
  tasks: any[];
}

export default function UserManager({ users, tasks }: UserManagerProps) {
  const getUserTaskStats = (userId: string) => {
    const userTasks = tasks.filter(task => task.assignedUserId === userId);
    const completed = userTasks.filter(task => task.status === 'completed').length;
    const inProgress = userTasks.filter(task => task.status === 'in-progress').length;
    const pending = userTasks.filter(task => task.status === 'pending').length;
    
    return {
      total: userTasks.length,
      completed,
      inProgress,
      pending,
      completionRate: userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-1">
          Administra todos los usuarios registrados en el sistema
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'user').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => {
          const stats = getUserTaskStats(user.id);
          
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600">
                      <AvatarFallback className="text-white font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{user.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate">{user.email}</span>
                      </div>
                      <div className="mt-2">
                        <Badge 
                          className={user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {user.role === 'admin' ? '👑 Administrador' : '👤 Usuario'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Registration Date */}
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Registrado: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Fecha no disponible'}
                      </span>
                    </div>

                    {/* Task Statistics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Estadísticas de Tareas
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center">
                          <p className="font-bold text-lg text-gray-900">
                            {stats.total}
                          </p>
                          <p className="text-gray-600">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg text-green-600">
                            {stats.completed}
                          </p>
                          <p className="text-gray-600">Completadas</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg text-orange-600">
                            {stats.inProgress}
                          </p>
                          <p className="text-gray-600">En Proceso</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg text-yellow-600">
                            {stats.pending}
                          </p>
                          <p className="text-gray-600">Pendientes</p>
                        </div>
                      </div>

                      {/* Completion Rate */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Tasa de completitud</span>
                          <span className="font-medium text-gray-900">
                            {stats.completionRate}%
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.completionRate}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Performance Indicator */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rendimiento</span>
                      <div className="flex items-center space-x-2">
                        {stats.completionRate >= 80 ? (
                          <Badge className="bg-green-100 text-green-700">
                            🚀 Excelente
                          </Badge>
                        ) : stats.completionRate >= 60 ? (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            👍 Bueno
                          </Badge>
                        ) : stats.completionRate >= 40 ? (
                          <Badge className="bg-orange-100 text-orange-700">
                            ⚠️ Regular
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">
                            📈 Necesita mejorar
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {users.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay usuarios registrados
          </h3>
          <p className="text-gray-500">
            Los usuarios aparecerán aquí una vez que se registren en el sistema
          </p>
        </motion.div>
      )}
    </div>
  );
}