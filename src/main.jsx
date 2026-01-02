import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuotaProvider } from "./context/QuotaContext.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* ✅ 3. Sediakan QueryClient */}
    <QueryClientProvider client={queryClient}>
      {/* ✅ 4. Sediakan QuotaContext untuk fitur Premium/Freemium */}
      <QuotaProvider>
        {/* ❌ <BrowserRouter> DIHAPUS DARI SINI KARENA SUDAH ADA DI App.jsx */}
        <App />
      </QuotaProvider>
    </QueryClientProvider>
  </StrictMode>
);
