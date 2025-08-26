import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', logger(console.log));
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Admin email constant
const ADMIN_EMAIL = 'facu.esteche05@gmail.com';

// Register endpoint
app.post('/make-server-154d65af/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    console.log(`Creating user account for: ${email}`);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role: email === ADMIN_EMAIL ? 'admin' : 'user'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`User creation error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata.name,
      role: data.user.user_metadata.role,
      createdAt: new Date().toISOString()
    });

    console.log(`User created successfully: ${email}`);
    return c.json({ 
      message: 'Usuario registrado exitosamente',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
        role: data.user.user_metadata.role
      }
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
});

// Get all users (admin only)
app.get('/make-server-154d65af/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || user.email !== ADMIN_EMAIL) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const users = await kv.getByPrefix('user:');
    return c.json(users);
  } catch (error) {
    console.log(`Get users error: ${error}`);
    return c.json({ error: 'Error al obtener usuarios' }, 500);
  }
});

// Create task (admin only)
app.post('/make-server-154d65af/tasks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || user.email !== ADMIN_EMAIL) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const { title, description, assignedUserId, dueDate, status = 'pending' } = await c.req.json();
    
    const taskId = crypto.randomUUID();
    const task = {
      id: taskId,
      title,
      description,
      assignedUserId,
      status,
      dueDate,
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };

    await kv.set(`task:${taskId}`, task);
    console.log(`Task created: ${title} assigned to user ${assignedUserId}`);
    
    return c.json({ message: 'Tarea creada exitosamente', task });
  } catch (error) {
    console.log(`Create task error: ${error}`);
    return c.json({ error: 'Error al crear tarea' }, 500);
  }
});

// Get tasks
app.get('/make-server-154d65af/tasks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const tasks = await kv.getByPrefix('task:');
    
    // If user is admin, return all tasks. If regular user, return only assigned tasks
    if (user.email === ADMIN_EMAIL) {
      return c.json(tasks);
    } else {
      const userTasks = tasks.filter(task => task.assignedUserId === user.id);
      return c.json(userTasks);
    }
  } catch (error) {
    console.log(`Get tasks error: ${error}`);
    return c.json({ error: 'Error al obtener tareas' }, 500);
  }
});

// Update task (admin only)
app.put('/make-server-154d65af/tasks/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || user.email !== ADMIN_EMAIL) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const taskId = c.req.param('id');
    const updates = await c.req.json();
    
    const existingTask = await kv.get(`task:${taskId}`);
    if (!existingTask) {
      return c.json({ error: 'Tarea no encontrada' }, 404);
    }

    const updatedTask = {
      ...existingTask,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`task:${taskId}`, updatedTask);
    console.log(`Task updated: ${taskId}`);
    
    return c.json({ message: 'Tarea actualizada exitosamente', task: updatedTask });
  } catch (error) {
    console.log(`Update task error: ${error}`);
    return c.json({ error: 'Error al actualizar tarea' }, 500);
  }
});

// Delete task (admin only)
app.delete('/make-server-154d65af/tasks/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || user.email !== ADMIN_EMAIL) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const taskId = c.req.param('id');
    
    const task = await kv.get(`task:${taskId}`);
    if (!task) {
      return c.json({ error: 'Tarea no encontrada' }, 404);
    }

    await kv.del(`task:${taskId}`);
    console.log(`Task deleted: ${taskId}`);
    
    return c.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.log(`Delete task error: ${error}`);
    return c.json({ error: 'Error al eliminar tarea' }, 500);
  }
});

// Update user profile
app.put('/make-server-154d65af/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const { name, email } = await c.req.json();
    
    if (!name || !email) {
      return c.json({ error: 'Nombre y email son requeridos' }, 400);
    }

    // Update user metadata in Supabase Auth
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        email: email,
        user_metadata: { 
          name: name,
          role: user.user_metadata?.role || 'user'
        }
      }
    );

    if (updateError) {
      console.log(`Profile update error: ${updateError.message}`);
      return c.json({ error: updateError.message }, 400);
    }

    // Update user in KV store
    const existingUser = await kv.get(`user:${user.id}`);
    if (existingUser) {
      const updatedUser = {
        ...existingUser,
        name: name,
        email: email,
        updatedAt: new Date().toISOString()
      };
      await kv.set(`user:${user.id}`, updatedUser);
    }

    console.log(`Profile updated for user: ${user.id}`);
    
    return c.json({ 
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user.id,
        name: name,
        email: email,
        role: user.user_metadata?.role || 'user'
      }
    });
  } catch (error) {
    console.log(`Update profile error: ${error}`);
    return c.json({ error: 'Error al actualizar perfil' }, 500);
  }
});

Deno.serve(app.fetch);