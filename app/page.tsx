"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { Sparkles, Scissors, Lock, User, ArrowRight, Crown } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sessionChecking, setSessionChecking] = useState(true);

  // Verificar si ya hay sesión iniciada para redirigir automáticamente
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (session.user.email?.includes("admin")) {
          router.push("/dashboard");
        } else {
          router.push("/cliente");
        }
      } else {
        setSessionChecking(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Credenciales incorrectas. Intenta nuevamente.");
      setLoading(false);
    } else {
      // Magia del enrutamiento inteligente
      if (email.includes("admin")) {
        router.push("/dashboard");
      } else {
        router.push("/cliente");
      }
    }
  };

  if (sessionChecking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E5C07B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden flex flex-col md:flex-row">
      {/* Luces ambientales y efectos (Background) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#E5C07B]/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#E5C07B]/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* SECCIÓN IZQUIERDA: Marca y Slogan */}
      <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center relative z-10 min-h-[50vh] md:min-h-screen">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5C07B]/10 border border-[#E5C07B]/20 w-fit mb-6">
          <Sparkles size={14} className="text-[#E5C07B]" />
          <span className="text-xs font-semibold text-[#E5C07B] tracking-widest uppercase">Next-Gen Barbershop</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter leading-tight">
          ANTANNI <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E5C07B] to-[#cda661]">
            STUDIO
          </span>
        </h1>
        
        <p className="text-gray-400 text-lg max-w-md font-light leading-relaxed mb-8">
          Eleva tu estilo. Gestiona tus citas, acumula puntos VIP y descubre tu mejor versión con nuestra plataforma impulsada por tecnología de punta.
        </p>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Crown size={16} className="text-[#E5C07B]" /> Programa VIP
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Scissors size={16} className="text-[#E5C07B]" /> Expertos en Estilo
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Login "Glassmorphism" */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-[#0a0a0a]/60 backdrop-blur-2xl border border-[#222] p-8 md:p-10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          {/* Resplandor interno de la tarjeta */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5C07B]/10 blur-3xl rounded-full pointer-events-none"></div>

          <h2 className="text-2xl font-bold text-white mb-2">Bienvenido de vuelta</h2>
          <p className="text-sm text-gray-400 mb-8">Ingresa tus credenciales para acceder a tu portal.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl py-3.5 pl-11 pr-4 text-white focus:border-[#E5C07B] outline-none transition-all placeholder:text-gray-600"
                  placeholder="admin@antannystudio.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded-xl py-3.5 pl-11 pr-4 text-white focus:border-[#E5C07B] outline-none transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#E5C07B] to-[#cda661] text-black font-bold py-4 rounded-xl mt-4 hover:shadow-[0_0_20px_rgba(229,192,123,0.4)] transition-all flex justify-center items-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Ingresar al Sistema
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-[#222] pt-6">
            <p className="text-xs text-gray-500">
              ¿No tienes cuenta? <span className="text-[#E5C07B] cursor-pointer hover:underline">Regístrate en el local</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}