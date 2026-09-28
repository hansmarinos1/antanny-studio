"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Award, QrCode, LogOut, Calendar, Clock, PlusCircle, Bot, Sparkles, Send, X, CheckCircle2 } from "lucide-react";

export default function ClientePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>("Cliente");
  const [idCliente, setIdCliente] = useState<string | null>(null);
  const [puntos, setPuntos] = useState(0);
  const [nivel, setNivel] = useState("Clásico");
  const [misCitas, setMisCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados UI
  const [mostrarQR, setMostrarQR] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);
  
  // Estados para Reservas
  const [modalReserva, setModalReserva] = useState(false);
  const [servicios, setServicios] = useState<any[]>([]);
  const [servicioSel, setServicioSel] = useState("");
  const [fechaSel, setFechaSel] = useState("");
  const [horaSel, setHoraSel] = useState("");
  const [reservando, setReservando] = useState(false);
  const [reservaExito, setReservaExito] = useState(false);

  // Estados Chat IA
  const [mensajeInput, setMensajeInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistorial, setChatHistorial] = useState([
    { remitente: "ia", texto: "¡Hola! Soy tu asesor de estilo de Antanny Studio. ¿Buscas un cambio de look o deseas agendar una cita?" }
  ]);

  useEffect(() => {
    fetchData();
  }, [router]);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push("/");
    setUserEmail(session.user.email || "Cliente");

    const emailUser = session.user.email;
    const { data: clienteData } = await supabase.from('clientes').select('*').eq('email', emailUser).single();

    if (clienteData) {
      const id = clienteData.id_cliente || clienteData.id;
      setIdCliente(id);
      
      const { data: fidData } = await supabase.from('fidelidad').select('*').eq('id_cliente', id).single();
      if (fidData) {
        setPuntos(fidData.puntos || 0);
        setNivel(fidData.nivel || 'Clásico');
      }

      const { data: citasData } = await supabase.from('citas').select('*').eq('id_cliente', id).order('fecha', { ascending: true });
      if (citasData) setMisCitas(citasData);

      // Cargar Catálogo de Servicios para el Modal
      const { data: servData } = await supabase.from('servicios').select('*');
      if (servData) setServicios(servData);
    }
    setLoading(false);
  };

  // --- LÓGICA DE AGENDAMIENTO REAL ---
  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    setReservando(true);
    try {
      const { error } = await supabase.from('citas').insert([{
        id_cliente: idCliente,
        id_servicio: servicioSel,
        fecha: fechaSel,
        hora: horaSel,
        estado: 'Pendiente'
      }]);
      
      if (error) throw error;
      
      setReservaExito(true);
      fetchData(); // Actualizar lista de citas
      setTimeout(() => {
        setModalReserva(false);
        setReservaExito(false);
        setServicioSel(""); setFechaSel(""); setHoraSel("");
      }, 2000);
    } catch (error) {
      alert("Error al agendar. Intenta de nuevo.");
    } finally {
      setReservando(false);
    }
  };

  // --- LÓGICA DEL CHAT IA REAL ---
  const enviarMensajeIA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensajeInput.trim()) return;

    const textoUsuario = mensajeInput;
    setChatHistorial(prev => [...prev, { remitente: "usuario", texto: textoUsuario }]);
    setMensajeInput("");
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: textoUsuario })
      });
      const data = await res.json();
      setChatHistorial(prev => [...prev, { remitente: "ia", texto: data.respuesta }]);
    } catch (error) {
      setChatHistorial(prev => [...prev, { remitente: "ia", texto: "Hubo un error de conexión con la IA." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] text-white p-5">Cargando tu perfil...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-5 pb-28 relative">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 bg-[#111] border border-[#222] p-4 rounded-2xl">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#E5C07B] font-semibold bg-[#E5C07B]/10 px-2 py-0.5 rounded-full border border-[#E5C07B]/20">
            Digital Wallet VIP
          </span>
          <h1 className="text-base font-bold text-white mt-1">{userEmail}</h1>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => router.push("/"))} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20">
          <LogOut size={18} />
        </button>
      </header>

      <div className="space-y-5 max-w-md mx-auto">
        {/* TARJETA VIP */}
        <div className="bg-gradient-to-tr from-[#121212] via-[#1a1a1a] to-[#0a0a0a] border border-[#E5C07B]/40 p-6 rounded-3xl relative overflow-hidden shadow-[0_0_30px_rgba(229,192,123,0.15)]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#E5C07B]/10 blur-3xl rounded-full pointer-events-none animate-pulse"></div>
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
              <span className="text-xs font-bold text-black bg-[#E5C07B] px-3 py-1 rounded-full uppercase tracking-wider inline-block mt-1">{nivel}</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-[#262626] flex justify-between items-center">
            <span className="text-[11px] text-gray-400 tracking-wider">CÓDIGO DE CLIENTE ACTIVO</span>
            <button onClick={() => setMostrarQR(true)} className="bg-[#222] hover:bg-[#333] text-[#E5C07B] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#333]">
              <QrCode size={16} /> Mostrar QR
            </button>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setModalReserva(true)} className="bg-[#111] border border-[#222] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#E5C07B]/50 transition-all active:scale-95">
            <PlusCircle className="text-[#E5C07B]" size={24} />
            <span className="text-xs font-semibold">Agendar Cita</span>
          </button>
          <button onClick={() => setChatAbierto(true)} className="bg-[#111] border border-[#222] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#E5C07B]/50 transition-all active:scale-95 relative">
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#E5C07B] rounded-full animate-ping"></span>
            <Bot className="text-[#E5C07B]" size={24} />
            <span className="text-xs font-semibold">Asesor IA</span>
          </button>
        </div>

        {/* HISTORIAL DE CITAS */}
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3 tracking-wide">Mis Próximas Citas</h2>
          {misCitas.length === 0 ? (
            <div className="bg-[#111] border border-[#222] p-6 rounded-2xl text-center text-gray-500 text-sm">No tienes citas registradas.</div>
          ) : (
            <div className="space-y-3">
              {misCitas.map((cita, index) => (
                <div key={index} className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E5C07B]/10 rounded-xl flex items-center justify-center text-[#E5C07B]"><Calendar size={20} /></div>
                    <div>
                      <p className="font-semibold text-sm">Reserva Studio</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={12} /> {cita.fecha} - {cita.hora}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${cita.estado === 'Pendiente' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                    {cita.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL: AGENDAR CITA --- */}
      {modalReserva && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-[#111] border border-[#222] rounded-3xl w-full max-w-sm p-6 relative shadow-2xl">
            <button onClick={() => setModalReserva(false)} className="absolute top-4 right-4 text-gray-400 p-2"><X size={18} /></button>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Calendar className="text-[#E5C07B]"/> Nueva Reserva</h3>
            
            {reservaExito ? (
              <div className="text-center py-10 space-y-4">
                <CheckCircle2 size={50} className="text-[#E5C07B] mx-auto animate-bounce" />
                <p className="font-bold text-white">¡Cita Agendada!</p>
                <p className="text-xs text-gray-400">Te esperamos en el estudio.</p>
              </div>
            ) : (
              <form onSubmit={handleAgendar} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Servicio</label>
                  <select required value={servicioSel} onChange={(e) => setServicioSel(e.target.value)} className="w-full bg-[#050505] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-[#E5C07B]">
                    <option value="">Selecciona un servicio</option>
                    {servicios.map(s => <option key={s.id_servicio} value={s.id_servicio}>{s.nombre} - S/{s.precio}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Fecha</label>
                  <input type="date" required value={fechaSel} onChange={(e) => setFechaSel(e.target.value)} className="w-full bg-[#050505] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-[#E5C07B]" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Hora</label>
                  <input type="time" required value={horaSel} onChange={(e) => setHoraSel(e.target.value)} className="w-full bg-[#050505] border border-[#333] p-3 rounded-xl text-white outline-none focus:border-[#E5C07B]" />
                </div>
                <button type="submit" disabled={reservando} className="w-full bg-[#E5C07B] text-black font-bold py-3.5 rounded-xl mt-4 hover:bg-[#cda661] disabled:opacity-50">
                  {reservando ? 'Confirmando...' : 'Confirmar Cita'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL: CHAT IA (Actualizado) --- */}
      {chatAbierto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4">
          <div className="bg-[#111] border border-[#222] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md h-[80vh] sm:h-[500px] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-[#222] bg-[#151515]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#E5C07B]/10 rounded-xl text-[#E5C07B]"><Sparkles size={18} /></div>
                <div><h3 className="font-bold text-sm text-white">Asesor IA Gemini</h3><p className="text-[10px] text-green-400">● Inteligencia Activa</p></div>
              </div>
              <button onClick={() => setChatAbierto(false)} className="text-gray-400 p-2"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080808]">
              {chatHistorial.map((msg, i) => (
                <div key={i} className={`flex ${msg.remitente === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${msg.remitente === 'usuario' ? 'bg-[#E5C07B] text-black font-medium rounded-br-none' : 'bg-[#181818] text-gray-200 border border-[#262626] rounded-bl-none'}`}>
                    {msg.texto}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#181818] border border-[#262626] p-3 rounded-2xl rounded-bl-none text-xs text-gray-400 animate-pulse">Pensando...</div>
                </div>
              )}
            </div>

            <form onSubmit={enviarMensajeIA} className="p-3 border-t border-[#222] bg-[#111] flex gap-2">
              <input type="text" value={mensajeInput} onChange={(e) => setMensajeInput(e.target.value)} placeholder="Pregúntale a la IA..." className="flex-1 bg-[#050505] border border-[#333] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#E5C07B] outline-none" disabled={isTyping}/>
              <button type="submit" disabled={isTyping} className="bg-[#E5C07B] text-black p-2.5 rounded-xl hover:bg-[#cda661] disabled:opacity-50"><Send size={16} /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}