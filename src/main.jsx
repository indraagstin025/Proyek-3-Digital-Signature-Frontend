import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* ✅ 3. Sediakan QueryClient */}
    <QueryClientProvider client={queryClient}>
      {/* ❌ <BrowserRouter> DIHAPUS DARI SINI KARENA SUDAH ADA DI App.jsx */}
      <App />
    </QueryClientProvider>
  </StrictMode>
);
