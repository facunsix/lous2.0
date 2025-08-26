import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ProfileManagerProps {
  user: any;
  onUserUpdate: (updatedUser: any) => void;
}

export default function ProfileManager({ user, onUserUpdate }: ProfileManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    try {
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-154d65af/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({ name, email })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al actualizar el perfil');
        return;
      }

      // Update local user state
      const updatedUser = {
        ...user,
        name,
        email
      };
      
      onUserUpdate(updatedUser);
      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setError('Error de conexión al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Configuración de Perfil</CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2"
            >
              <span>✏️</span>
              <span className="hidden sm:inline">Editar</span>
            </Button>
          )}
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={user?.name || ''}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email || ''}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {isLoading ? 'Actualizando...' : 'Guardar cambios'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Nombre</Label>
                <p className="mt-1 text-gray-900 text-sm sm:text-base">
                  {user?.name || 'No disponible'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Correo electrónico</Label>
                <p className="mt-1 text-gray-900 text-sm sm:text-base break-all">
                  {user?.email || 'No disponible'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Rol</Label>
                <p className="mt-1 text-gray-900 capitalize text-sm sm:text-base">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">ID de usuario</Label>
                <p className="mt-1 text-gray-500 text-xs font-mono break-all">
                  {user?.id || 'No disponible'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de la cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Estado de la cuenta</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                ✅ Activa
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Permisos</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.role === 'admin' ? '👑 Administrador' : '👤 Usuario'}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Tareas asignadas</span>
              <span className="font-medium">
                {user?.role === 'admin' ? 'Todas las tareas' : 'Solo asignadas'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ayuda y soporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Consejos de uso</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Mantén tu información de perfil actualizada</li>
                <li>• Revisa regularmente tus tareas asignadas</li>
                <li>• Contacta al administrador para cambios de permisos</li>
              </ul>
            </div>
            
            {user?.role === 'admin' && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">👑 Funciones de administrador</h4>
                <ul className="space-y-1 text-purple-800">
                  <li>• Gestionar usuarios y sus permisos</li>
                  <li>• Crear, editar y eliminar tareas</li>
                  <li>• Ver reportes y estadísticas del sistema</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}