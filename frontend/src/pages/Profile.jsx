import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { LogOut, Mail, Phone, Shield, Calendar, Monitor, Smartphone, Globe, Clock, ShieldCheck, Trash2, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [sesiones, setSesiones] = useState([]);
  const [loadingSesiones, setLoadingSesiones] = useState(true);

  // Estado para el Modal de Todas las Sesiones
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalSesiones, setModalSesiones] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [loadingModal, setLoadingModal] = useState(false);

  // Cargar primeras 5 sesiones para la vista principal
  const fetchSesionesPrincipales = async () => {
    try {
      const res = await api.get('/auth/sessions?limit=5');
      setSesiones(res.data.data || []);
      setTotalRegistros(res.data.total || 0);
    } catch (err) {
      console.error('Error cargando sesiones principales:', err);
    } finally {
      setLoadingSesiones(false);
    }
  };

  useEffect(() => {
    fetchSesionesPrincipales();
  }, []);

  // Cargar sesiones para el Modal con filtros y paginación
  const fetchModalSesiones = async (estado = filtroEstado, page = paginaActual) => {
    setLoadingModal(true);
    try {
      const res = await api.get(`/auth/sessions?estado=${estado}&page=${page}&limit=5`);
      setModalSesiones(res.data.data || []);
      setTotalPaginas(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error cargando modal de sesiones:', err);
    } finally {
      setLoadingModal(false);
    }
  };

  const abrirModal = () => {
    setModalAbierto(true);
    setPaginaActual(1);
    fetchModalSesiones('todas', 1);
  };

  const handleCambiarFiltro = (nuevoEstado) => {
    setFiltroEstado(nuevoEstado);
    setPaginaActual(1);
    fetchModalSesiones(nuevoEstado, 1);
  };

  const handleCambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      fetchModalSesiones(filtroEstado, nuevaPagina);
    }
  };

  // Revocar/Cerrar sesión remota por ID
  const handleRevocarSesion = async (sessionId) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      // Recargar ambas listas
      fetchSesionesPrincipales();
      if (modalAbierto) {
        fetchModalSesiones(filtroEstado, paginaActual);
      }
    } catch (err) {
      console.error('Error revocando sesión:', err);
    }
  };

  const fechaRegistro = user?.creadoEn
    ? new Date(user.creadoEn).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : '15 de Enero, 2026';

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">

      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between sticky top-0 z-30 shadow-sm gap-2">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Credenly Icon" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">
              Credenly
            </span>
            <span className="hidden sm:inline text-[10px] text-slate-500 font-medium">Autenticación segura, información en tus manos.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-slate-200">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              {user?.nombre ? user.nombre.charAt(0) : 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-700 max-w-[100px] sm:max-w-none truncate">{user?.nombre}</span>
          </div>

          <button
            onClick={logout}
            title="Cerrar Sesión"
            className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-full transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 lg:p-8">

        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-white mb-6">
          <div className="h-32 sm:h-56 lg:h-64 w-full relative overflow-hidden">
            <img
              src="/profile_banner.png"
              alt="Profile Banner"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 -mt-12 sm:-mt-24">

            <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center z-10">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-extrabold">
                {user?.nombre ? user.nombre.charAt(0) : 'U'}
              </div>

              <h2 className="text-xl font-bold text-slate-900">{user?.nombre}</h2>
              <p className="text-xs text-slate-400 mt-0.5">@{user?.usuario} • ID #{user?.id}</p>

              <div className="my-4 px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Rol: {user?.rol || 'Usuario'}
              </div>

              <div className="w-full text-left pt-4 border-t border-slate-100 space-y-3.5 mt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{user?.correo}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{user?.telefono}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Miembro desde: <strong>{fechaRegistro}</strong></span>
                </div>
              </div>
            </div>

            {/* Panel Derecho: Historial de Sesiones */}
            <div className="lg:col-span-8 pt-0 lg:pt-20 space-y-6">

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-slate-100 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Últimas Sesiones Registradas
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Priorizando conexiones activas (Máximo 5 visibles)</p>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5" /> Conexión Protegida
                  </span>
                </div>

                {loadingSesiones ? (
                  <div className="p-6 text-center text-slate-400 text-xs">Cargando historial de accesos...</div>
                ) : sesiones.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">No hay sesiones registradas.</div>
                ) : (
                  <div className="space-y-2.5">
                    {sesiones.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 shadow-sm shrink-0">
                            {s.dispositivo.includes('Móvil') || s.dispositivo.includes('Android') || s.dispositivo.includes('iOS') ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-bold text-slate-800 truncate">{s.dispositivo}</p>
                              {s.estado === 'Activa' || s.estado === 'Sesión Actual' ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                                  ● Activa
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-slate-200 text-slate-600 shrink-0">
                                  Finalizada
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                              <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-slate-400" /> {s.ipAcceso}</span>
                              <span>•</span>
                              <span>{new Date(s.creadoEn).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                          </div>
                        </div>

                        {(s.estado === 'Activa' || s.estado === 'Sesión Actual') && (
                          <button
                            onClick={() => handleRevocarSesion(s.id)}
                            title="Revocar esta sesión"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Botón para abrir el Modal si hay sesiones */}
                    <div className="pt-3 border-t border-slate-100 text-center">
                      <button
                        onClick={abrirModal}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition inline-flex items-center gap-1"
                      >
                        Ver todas las sesiones y filtros ({totalRegistros}) →
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </main>

      {/* MODAL DE GESTIÓN COMPLETA DE SESIONES */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">

            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  Gestión Completa de Sesiones
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Filtra, pagina y revoca dispositivos conectados</p>
              </div>

              <button
                onClick={() => setModalAbierto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filtros Compactos */}
            <div className="p-3 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filtrar:
              </span>
              <button
                onClick={() => handleCambiarFiltro('todas')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition shrink-0 ${
                  filtroEstado === 'todas'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => handleCambiarFiltro('Activa')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition shrink-0 ${
                  filtroEstado === 'Activa'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => handleCambiarFiltro('Finalizada')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition shrink-0 ${
                  filtroEstado === 'Finalizada'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Finalizadas
              </button>
            </div>

            {/* Cuerpo Lista Modal */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
              {loadingModal ? (
                <div className="p-8 text-center text-slate-400 text-xs">Cargando registros...</div>
              ) : modalSesiones.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No se encontraron sesiones con el filtro seleccionado.</div>
              ) : (
                modalSesiones.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 shadow-sm shrink-0">
                        {s.dispositivo.includes('Móvil') || s.dispositivo.includes('Android') || s.dispositivo.includes('iOS') ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-slate-800 truncate">{s.dispositivo}</p>
                          {s.estado === 'Activa' || s.estado === 'Sesión Actual' ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                              ● Activa
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-slate-200 text-slate-600 shrink-0">
                              Finalizada
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-slate-400" /> {s.ipAcceso}</span>
                          <span>•</span>
                          <span>{new Date(s.creadoEn).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                    </div>

                    {(s.estado === 'Activa' || s.estado === 'Sesión Actual') && (
                      <button
                        onClick={() => handleRevocarSesion(s.id)}
                        title="Revocar sesión remota"
                        className="px-2.5 py-1 text-[10px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition shrink-0 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Revocar</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Página {paginaActual} de {totalPaginas}
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={paginaActual <= 1}
                  onClick={() => handleCambiarPagina(paginaActual - 1)}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={paginaActual >= totalPaginas}
                  onClick={() => handleCambiarPagina(paginaActual + 1)}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
