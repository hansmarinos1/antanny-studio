"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { ArrowLeft, Scissors, Clock, Plus, Pencil, Trash2, X, MoreVertical, AlertTriangle } from "lucide-react";

export default function ServiciosCRUDPage() {
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el CRUD (Formulario de Creación/Edición)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nombre: "", duracion: "", precio: "" });

  // Estado para el Menú Flotante de Acciones
  const [servicioSeleccionado, setServicioSeleccionado] = useState<any>(null);
  
  // NUEVO: Estado para el Modal de Confirmación de Borrado Custom
  const [modalConfirmacion, setModalConfirmacion] = useState(false);

  const fetchServicios = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('servicios').select('*').order('nombre');
    if (!error) setServicios(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  // Abrir modal de Formulario
  const abrirModalFormulario = (servicio?: any) => {
    setServicioSeleccionado(null);
    if (servicio) {
      setEditandoId(servicio.id_servicio || servicio.id);
      setFormData({ nombre: servicio.nombre, duracion: servicio.duracion.toString(), precio: servicio.precio.toString() });
    } else {
      setEditandoId(null);
      setFormData({ nombre: "", duracion: "", precio: "" });
    }
    setModalAbierto(true);
  };

  // Función GUARDAR
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editandoId) {
      await supabase.from('servicios').update({
        nombre: formData.nombre,
        duracion: Number(formData.duracion),
        precio: Number(formData.precio)
      }).eq('id', editandoId).or(`id_servicio.eq.${editandoId}`);
    } else {
      await supabase.from('servicios').insert([{
        nombre: formData.nombre,
        duracion: Number(formData.duracion),
        precio: Number(formData.precio)
      }]);
    }
    setModalAbierto(false);
    fetchServicios();
  };

  // Función BORRAR DEFINITIVA (Sin alertas feas)
  const handleBorrar = async () => {
    if (!servicioSeleccionado) return;
    const id = servicioSeleccionado.id_servicio || servicioSeleccionado.id;
    
    await supabase.from('servicios').delete().eq('id', id).or(`id_servicio.eq.${id}`);
    
    setModalConfirmacion(false);
    setServicioSeleccionado(null);
    fetchServicios();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-3 bg-[#111] rounded-xl hover:bg-[#222] transition-colors">
            <ArrowLeft size={20} className="text-[#E5C07B]" />
          </Link>
          <h1 className="text-2xl font-bold text-[#E5C07B] tracking-widest">SERVICIOS</h1>
        </div>
        <button onClick={() => abrirModalFormulario()} className="p-3 bg-[#E5C07B] text-black rounded-xl hover:bg-[#cda661] transition-colors shadow-[0_0_15px_rgba(229,192,123,0.3)]">
          <Plus size={20} />
        </button>
      </header>

      {/* Lista de Servicios */}
      {loading ? (
        <div className="text-center text-gray-500 mt-10">Cargando catálogo...</div>
      ) : (
        <div className="space-y-4 pb-20">
          {servicios.map((servicio) => (
            <div key={servicio.id_servicio || servicio.id} className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E5C07B]/10 rounded-full flex justify-center items-center flex-shrink-0">
                  <Scissors size={20} className="text-[#E5C07B]" />
                </div>
                <div>
                  <p className="font-semibold text-lg line-clamp-1">{servicio.nombre}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Clock size={12}/> {servicio.duracion} min</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[#E5C07B] font-bold text-lg">S/ {servicio.precio}</p>
                <button 
                  onClick={() => setServicioSeleccionado(servicio)} 
                  className="p-2 text-gray-400 hover:text-white bg-[#222] rounded-lg transition-colors"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. MENÚ FLOTANTE DE ACCIONES */}
      {servicioSeleccionado && !modalAbierto && !modalConfirmacion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center p-4 pb-8" onClick={() => setServicioSeleccionado(null)}>
          <div className="bg-[#111] border border-[#222] rounded-3xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-[#333] rounded-full mx-auto mb-6 sm:hidden"></div>
            <h3 className="text-center text-xl font-bold text-white mb-6">{servicioSeleccionado.nombre}</h3>
            <div className="space-y-3">
              <button 
                onClick={() => abrirModalFormulario(servicioSeleccionado)} 
                className="w-full bg-[#222] hover:bg-[#333] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
              >
                <Pencil size={20} className="text-[#E5C07B]" /> Editar Servicio
              </button>
              <button 
                onClick={() => setModalConfirmacion(true)} 
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-colors"
              >
                <Trash2 size={20} /> Eliminar Servicio
              </button>
              <button 
                onClick={() => setServicioSeleccionado(null)} 
                className="w-full bg-transparent border border-[#333] text-gray-400 py-4 rounded-xl font-semibold mt-4 hover:bg-[#222]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. NUEVO: MODAL DE CONFIRMACIÓN DE BORRADO ELEGANTE */}
      {modalConfirmacion && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-[#111] border border-[#222] rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl relative">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex justify-center items-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">¿Eliminar servicio?</h2>
            <p className="text-gray-400 mb-8 text-sm">
              Estás a punto de eliminar <strong className="text-white">{servicioSeleccionado?.nombre}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setModalConfirmacion(false)} 
                className="flex-1 bg-[#222] hover:bg-[#333] text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleBorrar} 
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL DEL FORMULARIO CRUD */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-[#111] border border-[#222] rounded-3xl w-full max-w-md p-6 relative">
            <button onClick={() => setModalAbierto(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white bg-[#222] p-2 rounded-full">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-[#E5C07B] mb-6">
              {editandoId ? "Editar Servicio" : "Nuevo Servicio"}
            </h2>
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Nombre del Servicio</label>
                <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none transition-colors" placeholder="Ej. Corte Fade" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Precio (S/)</label>
                  <input required type="number" step="0.1" value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none transition-colors" placeholder="25" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Duración (min)</label>
                  <input required type="number" value={formData.duracion} onChange={(e) => setFormData({...formData, duracion: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none transition-colors" placeholder="45" />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#E5C07B] text-black font-bold py-4 rounded-xl mt-6 hover:bg-[#cda661] transition-all active:scale-95 shadow-[0_0_15px_rgba(229,192,123,0.2)]">
                {editandoId ? "Actualizar Servicio" : "Guardar Servicio"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}