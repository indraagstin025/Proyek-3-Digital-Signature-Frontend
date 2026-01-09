import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { FaRocket, FaMoneyBillWave, FaClock, FaCheckDouble } from "react-icons/fa";

// Data: Perbandingan jumlah dokumen yang bisa diproses dalam 1 hari
const data = [
  { method: "Manual", processed: 12 },   // Sedikit karena butuh print/kirim/scan
  { method: "WeSign", processed: 85 },   // Banyak karena instan
];

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-md transition-shadow group">
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform`}>
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
    {/* Background Pattern (Tech/Grid Look) */}
    <div className="absolute inset-0 opacity-30 pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}>
    </div>

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Kiri: Text & Business Stats */}
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
            Akselerasi <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Performa Bisnis
            </span> Anda
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed">
            Jangan biarkan tumpukan kertas memperlambat kesepakatan bisnis. Transformasikan alur kerja dokumen Anda menjadi data digital yang cepat, hemat, dan terukur.
          </p>

          <div className="grid grid-cols-2 gap-4">
             {/* Stat 1: Kecepatan */}
             <StatCard icon={FaRocket} value="80%" label="Lebih Cepat" color="bg-rose-500" />
             {/* Stat 2: Waktu Turnaround */}
             <StatCard icon={FaClock} value="2 Min" label="Rata-rata Sign" color="bg-blue-500" />
             {/* Stat 3: Hemat Biaya */}
             <StatCard icon={FaMoneyBillWave} value="60%" label="Hemat Biaya Ops" color="bg-green-500" />
             {/* Stat 4: Akurasi/Success */}
             <StatCard icon={FaCheckDouble} value="99.9%" label="Akurasi Data" color="bg-indigo-500" />
          </div>
        </div>

        {/* Kanan: Chart Analitik Produktivitas */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Produktivitas Dokumen</h3>
            <p className="text-sm text-slate-500">Dokumen Selesai per Hari (Avg)</p>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barSize={60} layout="vertical"> {/* Layout horizontal agar bar memanjang ke samping */}
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide={true} />
                <YAxis 
                    dataKey="method" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 14, fontWeight: 'bold' }}
                    width={80}
                />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar 
                    dataKey="processed" 
                    radius={[0, 12, 12, 0]} 
                    animationDuration={1500}
                    label={{ position: 'right', fill: '#64748b', fontSize: 12 }} // Menampilkan angka di ujung bar
                >
                  {/* Warna Bar Berbeda: Manual (Abu), WeSign (Biru) */}
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#94a3b8' : '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400 italic">
            *Data berdasarkan perbandingan rata-rata klien kami.
          </p>
        </div>

      </div>
    </div>
  </section>
);

export default StatisticSection;