import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AuthFormProps {
  onLogin: (userData: any) => void;
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        onLogin({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || 'Usuario',
          role: data.user.user_metadata?.role || 'user',
          accessToken: data.session.access_token
        });
      }
    } catch (error) {
      setError('Error al iniciar sesión');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-154d65af/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ name, email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al registrarse');
        return;
      }

      // Auto-login after successful registration
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Usuario registrado. Por favor inicia sesión manualmente.');
        return;
      }

      if (data.session) {
        onLogin({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || name,
          role: data.user.user_metadata?.role || 'user',
          accessToken: data.session.access_token
        });
      }
    } catch (error) {
      setError('Error al registrarse');
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md animate-fade-in">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center p-4 sm:p-6">
            <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-lg sm:text-xl text-white">👤</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-800">
              Gestión de Tareas
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm sm:text-base">
              Accede a tu panel de control
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <span className="text-sm">🔒</span>
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Login</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <span className="text-sm">👤</span>
                  <span className="hidden sm:inline">Registrarse</span>
                  <span className="sm:hidden">Registro</span>
                </TabsTrigger>
              </TabsList>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm">Correo electrónico</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">📧</span>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10 text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm">Contraseña</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">🔒</span>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-sm">Nombre completo</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">👤</span>
                      <Input
                        id="register-name"
                        name="name"
                        type="text"
                        placeholder="Tu nombre"
                        className="pl-10 text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm">Correo electrónico</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">📧</span>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10 text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm">Contraseña</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">🔒</span>
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 text-sm sm:text-base"
                        minLength={8}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Mínimo 8 caracteres
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-sm sm:text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Registrando...' : 'Registrarse'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}