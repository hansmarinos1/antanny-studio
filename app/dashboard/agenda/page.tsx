"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { ArrowLeft, CalendarClock, Plus, Trash2, X, Clock, Calendar as CalendarIcon } from "lucide-react";

export default function AgendaPage() {
  const [citas, setCitas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({ id_cliente: "", id_servicio: "", fecha: "", hora: "" });

  const fetchDatos = async () => {
    setLoading(true);
    const [resCitas, resClientes, resServicios] = await Promise.all([
      supabase.from('citas').select('*').order('fecha', { ascending: false }),
      supabase.from('clientes').select('*'),
      supabase.from('servicios').select('*')
    ]);
    if (!resCitas.error) setCitas(resCitas.data || []);
    if (!resClientes.error) setClientes(resClientes.data || []);
    if (!resServicios.error) setServicios(resServicios.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleCrearCita = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Buscamos el precio del servicio seleccionado para asignarlo al total_pagar
    const servicioSeleccionado = servicios.find(s => String(s.id_servicio || s.id) === String(formData.id_servicio));
    const precioServicio = servicioSeleccionado ? Number(servicioSeleccionado.precio) : 0;

    const { error } = await supabase.from('citas').insert([{
      id_cliente: Number(formData.id_cliente),
      id_servicio: Number(formData.id_servicio),
      fecha: formData.fecha,
      hora: formData.hora,
      estado: 'Completada',
      total_pagar: precioServicio,
      metodo_pago: 'Efectivo',
      estado_pago: 'Pendiente'
    }]);

    if (!error) {
      setModalAbierto(false);
      setFormData({ id_cliente: "", id_servicio: "", fecha: "", hora: "" });
      fetchDatos();
    } else {
      console.error(error);
      alert("Error al registrar la cita en Supabase. Revisa la consola.");
    }
  };

  const handleBorrarCita = async (id: string | number) => {
    if (confirm("¿Estás seguro de eliminar esta cita?")) {
      await supabase.from('citas').delete().eq('id_cita', id);
      fetchDatos();
    }
  };

  const obtenerNombreCliente = (id: number) => {
    const c = clientes.find(item => (item.id_cliente || item.id) === id);
    return c ? c.nombre : `Cliente #${id}`;
  };

  const obtenerNombreServicio = (id: number) => {
    const s = servicios.find(item => (item.id_servicio || item.id) === id);
    return s ? s.nombre : `Servicio #${id}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-3 bg-[#111] rounded-xl hover:bg-[#222] transition-colors">
            <ArrowLeft size={20} className="text-[#E5C07B]" />
          </Link>
          <h1 className="text-2xl font-bold text-[#E5C07B] tracking-widest">AGENDA</h1>
        </div>
        <button onClick={() => setModalAbierto(true)} className="p-3 bg-[#E5C07B] text-black rounded-xl hover:bg-[#cda661] transition-colors shadow-[0_0_15px_rgba(229,192,123,0.3)]">
          <Plus size={20} />
        </button>
      </header>

      {loading ? (
        <div className="text-center text-gray-500 mt-10">Cargando agenda...</div>
      ) : citas.length === 0 ? (
        <div className="bg-[#111] border border-dashed border-[#222] p-8 rounded-2xl text-center">
          <CalendarClock size={40} className="text-[#E5C07B] mx-auto mb-3 opacity-50" />
          <p className="text-gray-500">No hay citas programadas.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          {citas.map((cita) => (
            <div key={cita.id_cita} className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E5C07B]/10 rounded-full flex justify-center items-center flex-shrink-0">
                  <CalendarIcon size={20} className="text-[#E5C07B]" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-white">{obtenerNombreServicio(cita.id_servicio)}</p>
                  <p className="text-xs text-[#E5C07B] font-medium mb-1">Cliente: {obtenerNombreCliente(cita.id_cliente)}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><CalendarIcon size={12}/> {cita.fecha}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {cita.hora}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-[#E5C07B]">S/ {cita.total_pagar || '0.00'}</span>
                <button onClick={() => handleBorrarCita(cita.id_cita)} className="p-2 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-[#111] border border-[#222] rounded-3xl w-full max-w-md p-6 relative">
            <button onClick={() => setModalAbierto(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white bg-[#222] p-2 rounded-full">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-[#E5C07B] mb-6">Nueva Cita</h2>
            <form onSubmit={handleCrearCita} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Cliente</label>
                <select required value={formData.id_cliente} onChange={(e) => setFormData({...formData, id_cliente: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none">
                  <option value="">-- Seleccionar Cliente --</option>
                  {clientes.map(c => <option key={c.id_cliente || c.id} value={c.id_cliente || c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Servicio</label>
                <select required value={formData.id_servicio} onChange={(e) => setFormData({...formData, id_servicio: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none">
                  <option value="">-- Seleccionar Servicio --</option>
                  {servicios.map(s => <option key={s.id_servicio || s.id} value={s.id_servicio || s.id}>{s.nombre} (S/ {s.precio})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Fecha</label>
                  <input required type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Hora</label>
                  <input required type="time" value={formData.hora} onChange={(e) => setFormData({...formData, hora: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#E5C07B] text-black font-bold py-4 rounded-xl mt-6 hover:bg-[#cda661] transition-all">
                Programar Cita
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}