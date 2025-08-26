import React, { useMemo } from "react";
import { motion } from "framer-motion";

type User = {
  id: string | number;
  name?: string;
  role?: "admin" | "user" | string;
};

type Task = {
  id?: string | number;
  title?: string;
  status?: "pending" | "in-progress" | "completed" | string;
  assignedUserId?: string | number;
  createdAt?: string | Date;
  dueDate?: string | Date;
};

type DashboardProps = {
  user?: User | null;
  tasks?: Task[];
  users?: User[];
};

const COLORES = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const COLORES_CLAROS = ["#e0e7ff", "#dcfce7", "#fef3c7", "#fee2e2", "#f3e8ff"];

const Dashboard: React.FC<DashboardProps> = ({
  user = null,
  tasks = [] as Task[],
  users = [] as User[],
}) => {
  const esAdmin = user?.role === "admin";

  const calcularDiasRestantes = (dueDate?: string | Date) => {
    if (!dueDate) return "Sin fecha";
    const hoy = new Date();
    const fechaVencimiento = new Date(dueDate);
    const diffTime = fechaVencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Vencida";
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "1 día";
    return `${diffDays} días`;
  };

  const totalPendientes = tasks.filter((t) => t?.status === "pending").length;
  const totalEnProgreso = tasks.filter((t) => t?.status === "in-progress").length;
  const totalCompletadas = tasks.filter((t) => t?.status === "completed").length;
  const totalTareas = tasks.length;
  const porcentajeCompletadas =
    totalTareas > 0 ? Math.round((totalCompletadas / totalTareas) * 100) : 0;

  const misTareas = useMemo(() => {
    if (esAdmin) return [];
    return tasks.filter((t) => String(t.assignedUserId) === String(user?.id));
  }, [tasks, user, esAdmin]);

  const misTareasCompletadas = misTareas.filter((t) => t?.status === "completed").length;
  const miPorcentajeCompletadas =
    misTareas.length > 0 ? Math.round((misTareasCompletadas / misTareas.length) * 100) : 0;

  const usuariosConEstadisticas = useMemo(() => {
    if (!users) return [];
    const data = users.map((u, index) => {
      const nombre = u?.name?.trim() || "Sin nombre";
      const tareasUsuario = tasks.filter(
        (t) => String(t.assignedUserId) === String(u.id)
      );
      const completadas = tareasUsuario.filter((t) => t?.status === "completed").length;
      const total = tareasUsuario.length;
      const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
      const color = COLORES[index % COLORES.length];
      return {
        name: nombre,
        completadas,
        total,
        porcentaje,
        role: u.role ?? "sin rol",
        color,
      };
    });
    data.sort((a, b) => b.completadas - a.completadas);
    return data;
  }, [users, tasks]);

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto font-sans">
      {/* ENCABEZADO */}
      <div className="text-center p-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white">
        <h1 className="text-xl font-bold text-gray-800 mb-5 text-center">Panel de control</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Resumen dinámico del sistema</p>
        <div className="mt-3 inline-block px-4 py-1 bg-black text-indigo-700 rounded-full text-sm font-semibold">
          {esAdmin ? "Administrador" : "Usuario"}
        </div>
      </div>

      {/* ESTADÍSTICAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Tareas totales",
            value: totalTareas,
            borderColor: "border-indigo-500",
            textColor: "text-indigo-700",
          },
          {
            label: "Pendientes",
            value: totalPendientes,
            borderColor: "border-amber-500",
            textColor: "text-yellow-700",
          },
          {
            label: "En progreso",
            value: totalEnProgreso,
            borderColor: "border-blue-500",
            textColor: "text-blue-700",
          },
          {
            label: "Completadas",
            value: totalCompletadas,
            borderColor: "border-green-500",
            textColor: "text-green-700",
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            className={`bg-white border ${stat.borderColor} rounded-xl p-5 text-center ${stat.textColor}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="text-sm font-semibold">{stat.label}</div>
            <div className="text-3xl font-bold mt-2">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* VISTA SEGÚN ROL */}
      {esAdmin ? (
        <div className="space-y-6">
          <motion.div
            className="bg-white rounded-2xl p-5 border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-5 text-center">
              Usuarios y su progreso
            </h2>

            {users && users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {usuariosConEstadisticas.map((u, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl p-4"
                    style={{ borderLeft: `4px solid ${u.color}` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{u.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">{u.role}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {u.porcentaje}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${u.porcentaje}%`,
                          backgroundColor: u.color,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {u.completadas}/{u.total} tareas completadas
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No hay usuarios registrados
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PROGRESO PERSONAL */}
          <motion.div
            className="bg-white rounded-2xl p-6 border border-gray-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">📊 Mi progreso</h2>
            <p className="text-sm text-gray-600 text-center mb-6">Hola, {user?.name}</p>

            <div className="bg-indigo-50 p-5 rounded-xl mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Progreso general</span>
                <span className="text-sm font-bold text-indigo-600">{miPorcentajeCompletadas}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${miPorcentajeCompletadas}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>

              <p className="text-xs text-gray-500 text-center">
                {misTareasCompletadas}/{misTareas.length} tareas completadas
              </p>
            </div>
          </motion.div>

          {/* LISTA DE TAREAS */}
          <motion.div
            className="bg-white rounded-2xl p-6 border border-gray-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-5 text-center">📝 Mis tareas</h2>

            {misTareas.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {misTareas.map((tarea, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800">
                        {tarea.title || "Tarea sin título"}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tarea.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : tarea.status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {tarea.status === "completed"
                          ? "Completada"
                          : tarea.status === "in-progress"
                          ? "En progreso"
                          : "Pendiente"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                      <span>
                        {tarea.dueDate
                          ? `Vence en: ${calcularDiasRestantes(tarea.dueDate)}`
                          : "Sin fecha de vencimiento"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No tienes tareas asignadas</div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
