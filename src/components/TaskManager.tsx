import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface TaskManagerProps {
  user: any;
  tasks: any[];
  users: any[];
  onRefresh: () => void;
}

export default function TaskManager({ user, tasks, users, onRefresh }: TaskManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user.role === 'admin';

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = isAdmin ? tasks : tasks.filter(t => t.assignedUserId === user.id);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // User filter (admin only)
    if (userFilter !== 'all' && isAdmin) {
      filtered = filtered.filter(task => task.assignedUserId === userFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'dueDate':
          return new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime();
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return filtered;
  }, [tasks, searchTerm, statusFilter, userFilter, sortBy, isAdmin, user.id]);

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const taskData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      assignedUserId: formData.get('assignedUserId') as string,
      dueDate: formData.get('dueDate') as string,
      status: formData.get('status') as string || 'pending'
    };

    try {
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-154d65af/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        onRefresh();
        (e.target as HTMLFormElement).reset();
      } else {
        console.error('Error creating task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const taskData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      assignedUserId: formData.get('assignedUserId') as string,
      dueDate: formData.get('dueDate') as string,
      status: formData.get('status') as string
    };

    try {
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-154d65af/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        setEditingTask(null);
        onRefresh();
      } else {
        console.error('Error updating task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-154d65af/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (response.ok) {
        onRefresh();
      } else {
        console.error('Error deleting task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">✅ Completada</Badge>;
      case 'in-progress':
        return <Badge className="bg-orange-100 text-orange-700">🔄 En Proceso</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">⏳ Pendiente</Badge>;
    }
  };

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Usuario desconocido';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isAdmin ? 'Gestionar Tareas' : 'Mis Tareas'}
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {isAdmin ? 'Administra todas las tareas del sistema' : 'Revisa y organiza tus tareas asignadas'}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 w-full sm:w-auto">
                <span className="mr-2">➕</span>
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Tarea</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <div>
                  <Label htmlFor="assignedUserId">Asignar a</Label>
                  <Select name="assignedUserId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Fecha de vencimiento</Label>
                  <Input id="dueDate" name="dueDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select name="status" defaultValue="pending">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">⏳ Pendiente</SelectItem>
                      <SelectItem value="in-progress">🔄 En Proceso</SelectItem>
                      <SelectItem value="completed">✅ Completada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creando...' : 'Crear Tarea'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4 sm:items-center">
            <div className="flex-1 min-w-0 sm:min-w-[200px]">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                <Input
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-none sm:flex gap-2 sm:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">⏳ Pendiente</SelectItem>
                  <SelectItem value="in-progress">🔄 En Proceso</SelectItem>
                  <SelectItem value="completed">✅ Completada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Más reciente</SelectItem>
                  <SelectItem value="title">Por título</SelectItem>
                  <SelectItem value="status">Por estado</SelectItem>
                  <SelectItem value="dueDate">Por vencimiento</SelectItem>
                </SelectContent>
              </Select>

              {isAdmin && (
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-full sm:w-48 col-span-2 sm:col-span-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredTasks.map((task, index) => (
          <div key={task.id || index} className="opacity-0 animate-fade-in">
            <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg line-clamp-2">
                      {task.title || 'Tarea sin título'}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg sm:text-xl flex-shrink-0">
                        {task.status === 'completed' ? '✅' : 
                         task.status === 'in-progress' ? '🔄' : '⏳'}
                      </span>
                      <div className="min-w-0 flex-1">
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingTask(task)}
                        className="p-1 h-8 w-8"
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-700 p-1 h-8 w-8"
                      >
                        🗑️
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {task.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {task.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span>👤</span>
                    <span>{getUserName(task.assignedUserId)}</span>
                  </div>
                  
                  {task.dueDate && (
                    <div className="flex items-center space-x-2">
                      <span>📅</span>
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <span>🕒</span>
                    <span>Creada: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron tareas
          </h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' || userFilter !== 'all' 
              ? 'Intenta ajustar tus filtros de búsqueda'
              : 'No hay tareas disponibles en este momento'
            }
          </p>
        </div>
      )}

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input 
                  id="edit-title" 
                  name="title" 
                  defaultValue={editingTask.title}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea 
                  id="edit-description" 
                  name="description" 
                  defaultValue={editingTask.description}
                  rows={3} 
                />
              </div>
              <div>
                <Label htmlFor="edit-assignedUserId">Asignar a</Label>
                <Select name="assignedUserId" defaultValue={editingTask.assignedUserId} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-dueDate">Fecha de vencimiento</Label>
                <Input 
                  id="edit-dueDate" 
                  name="dueDate" 
                  type="date" 
                  defaultValue={editingTask.dueDate?.split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Estado</Label>
                <Select name="status" defaultValue={editingTask.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">⏳ Pendiente</SelectItem>
                    <SelectItem value="in-progress">🔄 En Proceso</SelectItem>
                    <SelectItem value="completed">✅ Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Actualizando...' : 'Actualizar Tarea'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>


    </div>
  );
}