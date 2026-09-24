"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { Award, QrCode, LogOut, Calendar, Clock, PlusCircle, Bot, Sparkles, Send, X } from "lucide-react";

export default function ClientePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>("Cliente");
  const [puntos, setPuntos] = useState(0);
  const [nivel, setNivel] = useState("Clásico");
  const [misCitas, setMisCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para la Wallet (Modal QR) y el Asistente IA
  const [mostrarQR, setMostrarQR] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [mensajeInput, setMensajeInput] = useState("");
  const [chatHistorial, setChatHistorial] = useState([
    { remitente: "ia", texto: "¡Hola! Soy tu asesor de estilo de Antanny Studio. ¿En qué te puedo ayudar hoy? ¿Buscas un corte nuevo o deseas agendar una cita?" }
  ]);

  useEffect(() => {
    const fetchClienteData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      setUserEmail(session.user.email || "Cliente");

      const emailUser = session.user.email;
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', emailUser)
        .single();

      if (clienteData) {
        const idCliente = clienteData.id_cliente || clienteData.id;
        
        // Puntos de fidelidad
        const { data: fidData } = await supabase
          .from('fidelidad')
          .select('*')
          .eq('id_cliente', idCliente)
          .single();

        if (fidData) {
          setPuntos(fidData.puntos || 0);
          setNivel(fidData.nivel || 'Clásico');
        }

        // Citas del cliente
        const { data: citasData } = await supabase
          .from('citas')
          .select('*')
          .eq('id_cliente', idCliente);

        if (citasData) setMisCitas(citasData);
      }
      setLoading(false);
    };

    fetchClienteData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Simulación de respuesta de la IA de Estilo y Citas
  const enviarMensajeIA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensajeInput.trim()) return;

    const textoUsuario = mensajeInput;
    setChatHistorial(prev => [...prev, { remitente: "usuario", texto: textoUsuario }]);
    setMensajeInput("");

    setTimeout(() => {
      let respuestaIA = "Entendido. Para cambios de look complejos o reservas específicas, puedes escribirnos directo o usar nuestro sistema de turnos.";
      const query = textoUsuario.toLowerCase();

      if (query.includes("corte") || query.includes("estilo") || query.includes("cara")) {
        respuestaIA = "Para rostros ovalados o alargados, recomiendo un corte 'Fade' con textura arriba. Si prefieres algo más clásico, un 'Pompadour' moderno te quedará increíble en Antanny Studio.";
      } else if (query.includes("cita") || query.includes("agendar") || query.includes("reservar")) {
        respuestaIA = "Puedes programar tu cita tocando el botón 'Reservar Nueva Cita' en tu panel principal. ¡Te esperamos!";
      } else if (query.includes("puntos") || query.includes("beneficios")) {
        respuestaIA = `Actualmente tienes ${puntos} puntos y tu rango es ${nivel}. ¡Acumula más puntos en cada visita para canjear servicios gratis!`;
      }

      setChatHistorial(prev => [...prev, { remitente: "ia", texto: respuestaIA }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-5 pb-28 relative">
      {/* Header Cliente */}
      <header className="flex justify-between items-center mb-6 bg-[#111] border border-[#222] p-4 rounded-2xl">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#E5C07B] font-semibold bg-[#E5C07B]/10 px-2 py-0.5 rounded-full border border-[#E5C07B]/20">
            Digital Wallet VIP
          </span>
          <h1 className="text-base font-bold text-white mt-1">{userEmail}</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </header>

      {loading ? (
        <div className="text-center text-gray-500 mt-12">Cargando tu Wallet y perfil...</div>
      ) : (
        <div className="space-y-5 max-w-md mx-auto">
          
          {/* TARJETA DIGITAL DE FIDELIDAD (ESTILO APPLE/GOOGLE WALLET) */}
          <div className="bg-gradient-to-tr from-[#121212] via-[#1a1a1a] to-[#0a0a0a] border border-[#E5C07B]/40 p-6 rounded-3xl relative overflow-hidden shadow-[0_0_30px_rgba(229,192,123,0.15)]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E5C07B]/10 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] text-[#E5C07B] uppercase tracking-widest font-bold">Antanny Studio Pass</p>
                <h3 className="text-xl font-black tracking-wider text-white mt-0.5">MEMBRESÍA VIP</h3>
              </div>
              <Award className="text-[#E5C07B]" size={28} />
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-400">Saldo Disponible</p>
                <p className="text-3xl font-black text-[#E5C07B] mt-0.5">{puntos} <span className="text-xs text-gray-300 font-normal">pts</span></p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Nivel</span>
                <span className="text-xs font-bold text-black bg-[#E5C07B] px-3 py-1 rounded-full uppercase tracking-wider inline-block mt-1">
                  {nivel}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#262626] flex justify-between items-center">
              <span className="text-[11px] text-gray-400 tracking-wider">CÓDIGO DE CLIENTE ACTIVO</span>
              <button 
                onClick={() => setMostrarQR(true)}
                className="bg-[#222] hover:bg-[#333] text-[#E5C07B] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#333]"
              >
                <QrCode size={16} /> Mostrar QR
              </button>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN RÁPIDA */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => alert("Módulo de reservas directas activado. Selecciona fecha y hora en el mostrador o comunícate al estudio.")}
              className="bg-[#111] border border-[#222] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#E5C07B]/50 transition-all active:scale-95 text-center"
            >
              <PlusCircle className="text-[#E5C07B]" size={24} />
              <span className="text-xs font-semibold">Agendar Cita</span>
            </button>

            <button 
              onClick={() => setChatAbierto(true)}
              className="bg-[#111] border border-[#222] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#E5C07B]/50 transition-all active:scale-95 text-center relative"
            >
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#E5C07B] rounded-full animate-ping"></span>
              <Bot className="text-[#E5C07B]" size={24} />
              <span className="text-xs font-semibold">Asesor IA</span>
            </button>
          </div>

          {/* HISTORIAL DE CITAS */}
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3 tracking-wide">Mis Próximas Citas</h2>
            {misCitas.length === 0 ? (
              <div className="bg-[#111] border border-[#222] p-6 rounded-2xl text-center text-gray-500 text-sm">
                No tienes citas registradas en este momento.
              </div>
            ) : (
              <div className="space-y-3">
                {misCitas.map((cita, index) => (
                  <div key={index} className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E5C07B]/10 rounded-xl flex items-center justify-center text-[#E5C07B]">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Servicio Studio</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock size={12} /> {cita.fecha} - {cita.hora}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-medium border border-green-500/20">
                      {cita.estado || 'Confirmada'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CÓDIGO QR PARA CAJA */}
      {mostrarQR && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-[#111] border border-[#222] rounded-3xl w-full max-w-xs p-6 text-center relative shadow-2xl">
            <button onClick={() => setMostrarQR(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#222] p-2 rounded-full">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-[#E5C07B] mb-1">Tu Código QR</h3>
            <p className="text-xs text-gray-400 mb-6">Muéstralo en caja para acumular puntos al instante</p>
            
            <div className="bg-white p-6 rounded-2xl inline-block mb-6 shadow-inner">
              {/* Simulación visual de código QR con patrón */}
              <div className="w-40 h-40 bg-black flex flex-col justify-between p-2 rounded-lg">
                <div className="flex justify-between"><div className="w-8 h-8 bg-white"></div><div className="w-8 h-8 bg-white"></div></div>
                <div className="text-[10px] text-white font-mono tracking-tighter text-center">ANTANNY-VIP</div>
                <div className="flex justify-between"><div className="w-8 h-8 bg-white"></div><div className="w-8 h-8 bg-white"></div></div>
              </div>
            </div>

            <p className="text-xs text-gray-300 font-semibold">{userEmail}</p>
          </div>
        </div>
      )}

      {/* CHAT ASISTENTE IA FLOTANTE */}
      {chatAbierto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4">
          <div className="bg-[#111] border border-[#222] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md h-[80vh] sm:h-[500px] flex flex-col relative shadow-2xl overflow-hidden">
            
            {/* Header Chat IA */}
            <div className="flex justify-between items-center p-4 border-b border-[#222] bg-[#151515]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#E5C07B]/10 rounded-xl text-[#E5C07B]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Asesor IA Antanny</h3>
                  <p className="text-[10px] text-green-400 flex items-center gap-1">● En línea</p>
                </div>
              </div>
              <button onClick={() => setChatAbierto(false)} className="text-gray-400 hover:text-white p-2">
                <X size={20} />
              </button>
            </div>

            {/* Mensajes del chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080808]">
              {chatHistorial.map((msg, i) => (
                <div key={i} className={`flex ${msg.remitente === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.remitente === 'usuario' 
                      ? 'bg-[#E5C07B] text-black font-medium rounded-br-none' 
                      : 'bg-[#181818] text-gray-200 border border-[#262626] rounded-bl-none'
                  }`}>
                    {msg.texto}
                  </div>
                </div>
              ))}
            </div>

            {/* Input de mensajes */}
            <form onSubmit={enviarMensajeIA} className="p-3 border-t border-[#222] bg-[#111] flex gap-2">
              <input 
                type="text" 
                value={mensajeInput}
                onChange={(e) => setMensajeInput(e.target.value)}
                placeholder="Pregunta por un corte o tus puntos..."
                className="flex-1 bg-[#050505] border border-[#333] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#E5C07B] outline-none"
              />
              <button type="submit" className="bg-[#E5C07B] text-black p-2.5 rounded-xl hover:bg-[#cda661] transition-colors">
                <Send size={16} />
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}