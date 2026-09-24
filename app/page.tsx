"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // <-- ENRUTADOR IMPORTADO
import { Scissors, Mail, Lock, ArrowRight, UserCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter(); // <-- INICIALIZAMOS EL ENRUTADOR
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage({ text: "¡Sesión iniciada con éxito!", type: "success" });
        
        // REDIRECCIÓN AUTOMÁTICA AL PANEL
        router.push("/dashboard"); 
        
      } else if (mode === "register") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ text: "¡Registro exitoso! Revisa tu correo.", type: "success" });
        
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage({ text: "Enlace de recuperación enviado.", type: "success" });
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setMessage({ text: error.message, type: "error" });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 selection:bg-[#E5C07B] selection:text-black">
      {/* Círculo de luz de fondo (Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E5C07B]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#E5C07B]/20 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-[#E5C07B] flex items-center justify-center bg-[#E5C07B]/10 shadow-[0_0_15px_rgba(229,192,123,0.3)]">
            <Scissors className="text-[#E5C07B] w-8 h-8" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-[#E5C07B] tracking-widest mb-1">
          ANTANNI STUDIO
        </h1>
        <p className="text-center text-gray-400 text-sm mb-8 tracking-wider">
          {mode === "reset" ? "RECUPERAR ACCESO" : "SISTEMA DE GESTIÓN & FIDELIDAD"}
        </p>

        {/* Alertas */}
        {message && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-medium border ${message.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-green-500/10 border-green-500/30 text-green-400"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {/* Input Email */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-[#E5C07B]/70 group-focus-within:text-[#E5C07B] transition-colors" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-[#222] text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#E5C07B]/50 focus:ring-1 focus:ring-[#E5C07B]/50 transition-all placeholder:text-gray-600"
              placeholder="Correo electrónico"
            />
          </div>

          {/* Input Password (Oculto en modo reset) */}
          {mode !== "reset" && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#E5C07B]/70 group-focus-within:text-[#E5C07B] transition-colors" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-[#222] text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#E5C07B]/50 focus:ring-1 focus:ring-[#E5C07B]/50 transition-all placeholder:text-gray-600"
                placeholder="Contraseña"
              />
            </div>
          )}

          {/* Botón Principal */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-black font-bold tracking-widest rounded-xl py-4 flex justify-center items-center hover:shadow-[0_0_20px_rgba(229,192,123,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {mode === "login" && "INICIAR SESIÓN"}
                {mode === "register" && "CREAR CUENTA"}
                {mode === "reset" && "ENVIAR ENLACE"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Enlaces para cambiar de modo */}
        <div className="mt-6 text-center space-y-4">
          {mode === "login" ? (
            <>
              <p className="text-gray-500 text-sm">
                ¿No tienes cuenta?{" "}
                <button onClick={() => setMode("register")} className="text-[#E5C07B] hover:underline font-semibold">Regístrate</button>
              </p>
              <button onClick={() => setMode("reset")} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </>
          ) : (
            <button onClick={() => setMode("login")} className="text-[#E5C07B] hover:underline text-sm font-semibold">
              Volver al inicio de sesión
            </button>
          )}
        </div>

        {/* Botón Google (Oculto en modo reset) */}
        {mode !== "reset" && (
          <>
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-[#222]"></div>
              <span className="px-4 text-gray-500 text-xs tracking-widest font-semibold">O INGRESA CON</span>
              <div className="flex-1 border-t border-[#222]"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full bg-[#111] border border-[#333] hover:border-[#E5C07B]/50 text-white font-semibold rounded-xl py-4 flex justify-center items-center transition-all"
            >
              <UserCircle className="mr-3 w-5 h-5 text-gray-300" />
              Continuar con Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}