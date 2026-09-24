import Link from "next/link";
import { ArrowLeft, TrendingUp, Calendar } from "lucide-react";

export default function PanelPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-3 bg-[#111] rounded-xl hover:bg-[#222] transition-colors">
          <ArrowLeft size={20} className="text-[#E5C07B]" />
        </Link>
        <h1 className="text-2xl font-bold text-[#E5C07B] tracking-widest">PANEL GENERAL</h1>
      </header>

      <div className="space-y-4">
        <div className="bg-[#111] border border-[#222] p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Citas Hoy</p>
            <p className="text-3xl font-bold">4</p>
          </div>
          <div className="w-12 h-12 bg-[#E5C07B]/10 rounded-full flex justify-center items-center">
            <Calendar className="text-[#E5C07B]" size={24} />
          </div>
        </div>

        <div className="bg-[#111] border border-[#222] p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Ingresos (Estimado)</p>
            <p className="text-3xl font-bold">S/ 320</p>
          </div>
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex justify-center items-center">
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}