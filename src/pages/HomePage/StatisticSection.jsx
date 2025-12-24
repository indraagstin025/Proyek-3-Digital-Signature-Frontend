import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FaTree, FaTint, FaRecycle, FaChartLine } from "react-icons/fa";

const data = [
  { year: "2023", consumption: 420 },
  { year: "2032", consumption: 476 },
];

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-xl mb-3`}>
      <Icon className="text-white" />
    </div>
    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide font-semibold">
      {label}
    </p>
  </div>
);

const StatisticSection = () => (
  <section id="impact" className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-40 pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
    </div>

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Kiri: Text & Stats */}
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
            Dampak Nyata <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">
              Go Green
            </span> dengan Digital
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed">
            Setiap tanda tangan digital yang Anda buat berkontribusi mengurangi konsumsi kertas global. Bergabunglah dengan revolusi *paperless* bersama WeSign.
          </p>

          <div className="grid grid-cols-2 gap-4">
             <StatCard icon={FaRecycle} value="420M Ton" label="Kertas Global (2023)" color="bg-orange-500" />
             <StatCard icon={FaTree} value="17 Pohon" label="Selamat per Ton Kertas" color="bg-green-500" />
             <StatCard icon={FaTint} value="24K Galon" label="Air Hemat per Ton" color="bg-blue-500" />
             <StatCard icon={FaChartLine} value="50%" label="Efisiensi Biaya" color="bg-purple-500" />
          </div>
        </div>

        {/* Kanan: Chart Modern */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Proyeksi Konsumsi Kertas</h3>
            <p className="text-sm text-slate-500">Jutaan Ton per Tahun</p>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                />
                <YAxis 
                    hide={true} 
                />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar 
                    dataKey="consumption" 
                    fill="#6366F1" 
                    radius={[12, 12, 0, 0]} 
                    animationDuration={1500}
                >
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400 italic">
            *Tanpa digitalisasi, angka ini akan terus naik.
          </p>
        </div>

      </div>
    </div>
  </section>
);

export default StatisticSection;