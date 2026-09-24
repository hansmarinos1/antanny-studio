"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { ArrowLeft, ShoppingCart, Plus, X, Receipt } from "lucide-react";

export default function CajaPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [carrito, setCarrito] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [resClientes, resServicios] = await Promise.all([
        supabase.from('clientes').select('*'),
        supabase.from('servicios').select('*')
      ]);
      if (!resClientes.error) setClientes(resClientes.data || []);
      if (!resServicios.error) setServicios(resServicios.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const agregarAlCarrito = (servicio: any) => setCarrito([...carrito, servicio]);

  const quitarDelCarrito = (index: number) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  const total = carrito.reduce((sum, item) => sum + Number(item.precio), 0);

  // LA MAGIA OCURRE AQUÍ: Lógica de cobro real
  const procesarCobro = async () => {
    if (!clienteSeleccionado) return alert("Por favor, selecciona un cliente.");
    if (carrito.length === 0) return alert("Agrega al menos un servicio.");
    
    setProcesando(true);
    
    try {
      // 1 Sol = 1 Punto de fidelidad
      const puntosGanados = Math.floor(total); 

      // 1. Obtener los puntos actuales del cliente (si tiene)
      const { data: fidelidadActual } = await supabase
        .from('fidelidad')
        .select('puntos')
        .eq('id_cliente', clienteSeleccionado)
        .single();

      const puntosAnteriores = fidelidadActual ? fidelidadActual.puntos : 0;
      const nuevosPuntos = puntosAnteriores + puntosGanados;

      // 2. Actualizar o insertar el nuevo total de puntos en su perfil
      await supabase
        .from('fidelidad')
        .upsert({ 
          id_cliente: clienteSeleccionado, 
          puntos: nuevosPuntos,
          nivel: nuevosPuntos > 100 ? 'VIP' : 'Clásico'
        }, { onConflict: 'id_cliente' });

      // 3. Guardar el recibo en el historial
      await supabase
        .from('historial_puntos')
        .insert([{
          id_cliente: clienteSeleccionado,
          puntos: puntosGanados,
          tipo_movimiento: 'suma',
          descripcion: `Compra de: ${carrito.map(s => s.nombre).join(', ')}`
        }]);

      alert(`✅ ¡Cobro exitoso!\nTotal cobrado: S/ ${total.toFixed(2)}\nEl cliente ganó ${puntosGanados} puntos.\nTotal acumulado: ${nuevosPuntos} puntos.`);
      
      // Limpiar la caja para el siguiente cliente
      setCarrito([]);
      setClienteSeleccionado("");
    } catch (error: any) {
      alert("Hubo un error al procesar el cobro. Revisa tu conexión.");
      console.error(error);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-24">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-3 bg-[#111] rounded-xl hover:bg-[#222] transition-colors">
          <ArrowLeft size={20} className="text-[#E5C07B]" />
        </Link>
        <h1 className="text-2xl font-bold text-[#E5C07B] tracking-widest">PUNTO DE VENTA</h1>
      </header>

      {loading ? (
        <div className="text-center text-gray-500 mt-10">Cargando sistema de caja...</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#111] border border-[#222] p-5 rounded-2xl">
            <label className="block text-sm text-gray-400 mb-2">Seleccionar Cliente</label>
            <select 
              className="w-full bg-[#050505] border border-[#333] rounded-xl p-3 text-white focus:border-[#E5C07B] outline-none"
              value={clienteSeleccionado}
              onChange={(e) => setClienteSeleccionado(e.target.value)}
            >
              <option value="">-- Elige un cliente --</option>
              {clientes.map(c => (
                <option key={c.id_cliente || c.id} value={c.id_cliente || c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-300">Agregar al Ticket</h2>
            <div className="grid grid-cols-2 gap-3">
              {servicios.map(s => (
                <button 
                  key={s.id_servicio || s.id}
                  onClick={() => agregarAlCarrito(s)}
                  className="bg-[#111] border border-[#222] p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#E5C07B]/50 transition-all text-center active:scale-95"
                >
                  <Plus size={20} className="text-[#E5C07B]" />
                  <span className="text-sm font-medium">{s.nombre}</span>
                  <span className="text-xs text-[#E5C07B] font-bold">S/ {s.precio}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#111] border border-[#E5C07B]/30 p-5 rounded-2xl mt-6">
            <div className="flex items-center gap-2 mb-4 text-[#E5C07B]">
              <ShoppingCart size={20} />
              <h2 className="font-bold text-lg">Ticket Actual</h2>
            </div>
            
            {carrito.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No hay servicios seleccionados</p>
            ) : (
              <div className="space-y-3 mb-4">
                {carrito.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-[#050505] p-3 rounded-lg border border-[#222]">
                    <span className="text-gray-300">{item.nombre}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#E5C07B]">S/ {item.precio}</span>
                      <button onClick={() => quitarDelCarrito(i)} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1 rounded-md">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-[#333] pt-4 mt-4 flex justify-between items-center">
                  <span className="text-gray-400 font-medium">TOTAL A COBRAR</span>
                  <span className="text-3xl font-bold text-[#E5C07B]">S/ {total.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <button 
              onClick={procesarCobro}
              disabled={carrito.length === 0 || !clienteSeleccionado || procesando}
              className="w-full bg-[#E5C07B] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-95 transition-all"
            >
              <Receipt size={20} />
              {procesando ? "PROCESANDO..." : "COBRAR Y SUMAR PUNTOS"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}