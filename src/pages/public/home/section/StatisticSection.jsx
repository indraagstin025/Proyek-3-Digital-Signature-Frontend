import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { year: "2023", consumption: 420 },
  { year: "2032 (proyeksi)", consumption: 476 },
];

const StatisticSection = () => (
  <section id="impact" className="py-24 bg-gray-50 dark:bg-gray-800">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
        Dampak Teknologi Digital untuk Lingkungan
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Kiri: Statistik Cards */}
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md text-center">
            <div className="text-4xl">🌍</div>
            <div className="text-2xl font-extrabold">420M ton</div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Konsumsi kertas global (2023)
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md text-center">
            <div className="text-4xl">🌳</div>
            <div className="text-2xl font-extrabold">17 pohon</div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Diselamatkan / ton kertas daur ulang
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md text-center">
            <div className="text-4xl">💧</div>
            <div className="text-2xl font-extrabold">24K galon</div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Air dipakai / ton kertas
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md text-center">
            <div className="text-4xl">📉</div>
            <div className="text-2xl font-extrabold">50%</div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Potensi pengurangan dengan digitalisasi
            </p>
          </div>
        </div>

        {/* Kanan: Chart */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Konsumsi Kertas Global
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="year" stroke="#888" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="consumption" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </section>
);

export default StatisticSection;
