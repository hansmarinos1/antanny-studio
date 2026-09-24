"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { ArrowLeft, PackageOpen, Plus, Trash2, X } from "lucide-react";

export default function InventarioPage() {
  const [insumos, setInsumos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({ 
    nombre: "", 
    unidad_medida: "Unidad", 
    stock_actual: "", 
    stock_minimo: "5", 
    costo_unitario: "" 
  });

  const fetchInsumos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('insumos').select('*').order('nombre');
    if (!error) setInsumos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  const handleCrearInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('insumos').insert([{
      nombre: formData.nombre,
      unidad_medida: formData.unidad_medida,
      stock_actual: Number(formData.stock_actual),
      stock_minimo: Number(formData.stock_minimo),
      costo_unitario: Number(formData.costo_unitario)
    }]);

    if (!error) {
      setModalAbierto(false);
      setFormData({ nombre: "", unidad_medida: "Unidad", stock_actual: "", stock_minimo: "5", costo_unitario: "" });
      fetchInsumos();
    } else {
      console.error(error);
      alert("Error al guardar el insumo en Supabase.");
    }
  };

  const handleBorrarInsumo = async (id: number | string) => {
    if (confirm("¿Estás seguro de eliminar este insumo?")) {
      await supabase.from('insumos').delete().eq('id_insumo', id);
      fetchInsumos();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-3 bg-[#111] rounded-xl hover:bg-[#222] transition-colors">
            <ArrowLeft size={20} className="text-[#E5C07B]" />
          </Link>
          <h1 className="text-2xl font-bold text-[#E5C07B] tracking-widest">INVENTARIO</h1>
        </div>
        <button onClick={() => setModalAbierto(true)} className="p-3 bg-[#E5C07B] text-black rounded-xl hover:bg-[#cda661] transition-colors shadow-[0_0_15px_rgba(229,192,123,0.3)]">
          <Plus size={20} />
        </button>
      </header>

      {loading ? (
        <div className="text-center text-gray-500 mt-10">Cargando inventario...</div>
      ) : insumos.length === 0 ? (
        <div className="bg-[#111] border border-dashed border-[#222] p-8 rounded-2xl text-center">
          <PackageOpen size={40} className="text-[#E5C07B] mx-auto mb-3 opacity-50" />
          <p className="text-gray-500">No hay insumos registrados.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          {insumos.map((item) => (
            <div key={item.id_insumo} className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E5C07B]/10 rounded-full flex justify-center items-center flex-shrink-0">
                  <PackageOpen size={20} className="text-[#E5C07B]" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-white">{item.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Medida: {item.unidad_medida}</p>
                  <p className="text-sm text-gray-300 mt-1">
                    Stock: <strong className={item.stock_actual <= item.stock_minimo ? "text-red-400 font-bold" : "text-[#E5C07B]"}>
                      {item.stock_actual} {item.unidad_medida}(s)
                    </strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-300">S/ {item.costo_unitario || '0.00'}</span>
                <button onClick={() => handleBorrarInsumo(item.id_insumo)} className="p-2 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Insumo */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-[#111] border border-[#222] rounded-3xl w-full max-w-md p-6 relative">
            <button onClick={() => setModalAbierto(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white bg-[#222] p-2 rounded-full">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-[#E5C07B] mb-6">Nuevo Insumo</h2>
            <form onSubmit={handleCrearInsumo} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Nombre del Insumo</label>
                <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none" placeholder="Ej. Cera Capilar Mate" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Unidad de Medida</label>
                  <input required type="text" value={formData.unidad_medida} onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none" placeholder="Unidad / Litro" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Costo Unitario (S/)</label>
                  <input required type="number" step="0.1" value={formData.costo_unitario} onChange={(e) => setFormData({...formData, costo_unitario: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none" placeholder="15.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Stock Actual</label>
                  <input required type="number" value={formData.stock_actual} onChange={(e) => setFormData({...formData, stock_actual: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none" placeholder="20" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Stock Mínimo</label>
                  <input required type="number" value={formData.stock_minimo} onChange={(e) => setFormData({...formData, stock_minimo: e.target.value})} className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none" placeholder="5" />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#E5C07B] text-black font-bold py-4 rounded-xl mt-6 hover:bg-[#cda661] transition-all">
                Guardar Insumo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}