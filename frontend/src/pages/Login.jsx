import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, KeyRound, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aceptaTerminos) {
      setError('Debe aceptar los términos de servicio');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await login(usuario, clave);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-slate-800 relative overflow-hidden">

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[600px] h-[600px] rounded-full border border-indigo-400/30 flex items-center justify-center">
          <div className="w-[450px] h-[450px] rounded-full border border-indigo-400/30"></div>
        </div>
      </div>


      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 z-10 border border-indigo-100">

        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold text-slate-900 mb-1">
              Iniciar Sesión
            </div>
            <p className="text-xs text-slate-500 mb-6 font-medium">Autenticación segura, información en tus manos.</p>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Usuario o Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="admin o estudiante"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition duration-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terminos"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="terminos" className="text-xs text-slate-500 cursor-pointer select-none">
                  Acepto los <span className="text-indigo-600 font-medium hover:underline">términos del servicio</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/30 transition duration-200 transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Prueba rápida: <code className="text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">admin</code> / <code className="text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">Password123!</code>
            </p>
          </div>
        </div>

        <div className="hidden lg:flex bg-slate-50/60 p-8 sm:p-10 flex-col items-center justify-center border-l border-slate-100 relative">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-indigo-50/40 p-6 border border-indigo-100/50 flex items-center justify-center relative shadow-sm">
            <img
              src="/logo.png"
              alt="Credenly Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="mt-4 text-center max-w-xs">
            <p className="text-xs text-slate-500">
              Autenticación segura, información en tus manos.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
