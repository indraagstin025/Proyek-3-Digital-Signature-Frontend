import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from "path" // 1. Wajib import ini

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(), 
    ],
    // 2. Tambahkan konfigurasi ini
    resolve: {
        alias: {
            // Fix untuk error Recharts "Could not resolve react-is"
            "react-is": "react-is",
            
            // Opsional: Alias agar bisa import pakai '@/' (cth: '@/components/...')
            "@": path.resolve(__dirname, "./src"), 
        },
    },
})