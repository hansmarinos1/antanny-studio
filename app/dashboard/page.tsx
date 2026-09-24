"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { LogOut, Scissors, Users, Calculator, CalendarClock, PackageOpen, TrendingUp, Calendar } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>("Cargando...");
  const [stats, setStats] = useState({ citasHoy: 0, ingresosHoy: 0 });

  useEffect(() => {
    const checkSessionAndStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      setUserEmail(session.user.email || "Usuario");

      // Cargar métricas reales rápidas para el panel principal
      const hoy = new Date().toISOString().split('T')[0];
      const { data: citasData } = await supabase
        .from('citas')
        .select('total_pagar')
        .eq('fecha', hoy);

      if (citasData) {
        const totalCitas = citasData.length;
        const totalIngresos = citasData.reduce((acc, curr) => acc + Number(curr.total_pagar || 0), 0);
        setStats({ citasHoy: totalCitas, ingresosHoy: totalIngresos });
      }
    };
    checkSessionAndStats();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-5 pb-20">
      {/* Header Operativo */}
      <header className="flex justify-between items-center mb-6 bg-[#111] border border-[#222] p-4 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-[#E5C07B] tracking-wider">ANTANNI STUDIO</h1>
          <p className="text-gray-400 text-xs">{userEmail}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Tarjetas de Métricas en Vivo */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs">Citas Hoy</p>
            <p className="text-2xl font-bold mt-0.5">{stats.citasHoy}</p>
          </div>
          <div className="w-10 h-10 bg-[#E5C07B]/10 rounded-xl flex items-center justify-center">
            <Calendar className="text-[#E5C07B]" size={20} />
          </div>
        </div>

        <div className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs">Ingresos Hoy</p>
            <p className="text-2xl font-bold mt-0.5 text-[#E5C07B]">S/ {stats.ingresosHoy.toFixed(2)}</p>
          </div>
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-green-500" size={20} />
          </div>
        </div>
      </div>

      {/* Grid de Accesos Directos (Menú Funcional) */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <Link href="/dashboard/servicios" className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center gap-3 hover:border-[#E5C07B] transition-all">
          <div className="p-2.5 bg-[#E5C07B]/10 rounded-xl">
            <Scissors className="text-[#E5C07B]" size={22} />
          </div>
          <div>
            <span className="font-semibold text-sm block">Servicios</span>
            <span className="text-[11px] text-gray-500">CRUD catálogo</span>
          </div>
        </Link>

        <Link href="/dashboard/clientes" className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center gap-3 hover:border-[#E5C07B] transition-all">
          <div className="p-2.5 bg-[#E5C07B]/10 rounded-xl">
            <Users className="text-[#E5C07B]" size={22} />
          </div>
          <div>
            <span className="font-semibold text-sm block">Clientes</span>
            <span className="text-[11px] text-gray-500">Base de datos</span>
          </div>
        </Link>

        <Link href="/dashboard/caja" className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center gap-3 hover:border-[#E5C07B] transition-all">
          <div className="p-2.5 bg-[#E5C07B]/10 rounded-xl">
            <Calculator className="text-[#E5C07B]" size={22} />
          </div>
          <div>
            <span className="font-semibold text-sm block">Caja / POS</span>
            <span className="text-[11px] text-gray-500">Ventas & Puntos</span>
          </div>
        </Link>

        <Link href="/dashboard/agenda" className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center gap-3 hover:border-[#E5C07B] transition-all">
          <div className="p-2.5 bg-[#E5C07B]/10 rounded-xl">
            <CalendarClock className="text-[#E5C07B]" size={22} />
          </div>
          <div>
            <span className="font-semibold text-sm block">Agenda</span>
            <span className="text-[11px] text-gray-500">Control de citas</span>
          </div>
        </Link>

        <Link href="/dashboard/inventario" className="bg-[#111] border border-[#222] p-4 rounded-2xl flex items-center gap-3 hover:border-[#E5C07B] transition-all col-span-2">
          <div className="p-2.5 bg-[#E5C07B]/10 rounded-xl">
            <PackageOpen className="text-[#E5C07B]" size={22} />
          </div>
          <div>
            <span className="font-semibold text-sm block">Inventario / Insumos</span>
            <span className="text-[11px] text-gray-500">Stock actual de productos y materiales</span>
          </div>
        </Link>
      </div>
    </div>
  );
}