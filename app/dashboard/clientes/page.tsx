"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { ArrowLeft, User, Star } from "lucide-react";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientes = async () => {
      // Apuntamos directamente a la tabla 'clientes' real de tu base de datos
      const { data, error } = await supabase
        .from('clientes')
        .select('*');
        
      if (!error) {
        setClientes(data || []);
      } else {
        console.error("Error al cargar clientes:", error);
      }
      setLoading(false);
    };
    fetchClientes();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-3 bg-[#111] rounded-xl hover:bg-[#222] transition-colors">
          <ArrowLeft size={20} className="text-[#E5C07B]" />
        </Link>
        <h1 className="text-2xl font-bold text-[#E5C07B] tracking-widest">CLIENTES</h1>
      </header>

      {loading ? (
        <div className="text-center text-gray-500 mt-10">Cargando clientes...</div>
      ) : clientes.length === 0 ? (
        <div className="bg-[#111] border border-dashed border-[#222] p-8 rounded-2xl text-center">
          <p className="text-gray-500">No hay clientes registrados aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clientes.map((cliente: any) => (
            <div key={cliente.id_cliente || cliente.id} className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center justify-between hover:border-[#E5C07B]/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E5C07B]/10 rounded-full flex justify-center items-center flex-shrink-0">
                  <User size={20} className="text-[#E5C07B]" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{cliente.nombre || 'Sin nombre'}</p>
                  {/* Si tienes una columna email o descripción en tu tabla, se mostrará aquí */}
                  <p className="text-sm text-gray-500">{cliente.email || cliente.descripcion || 'Cliente Antanny'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#E5C07B] bg-[#E5C07B]/10 px-3 py-1 rounded-full">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-bold">VIP</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}