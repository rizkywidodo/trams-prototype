import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import StationSelect from "./pages/StationSelect";
import TenantChecklist from "./pages/TenantChecklist";
import FormPatrol from "./pages/FormPatrol";
import PatrolSubmitted from "./pages/PatrolSubmitted";
import Logbook from "./pages/Logbook";
import Scheduling from "./pages/Scheduling";
import TenantList from "./pages/TenantList";
import TenantCreation from "./pages/TenantCreation";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import StationList from "./pages/StationList";
import StationCreation from "./pages/StationCreation";
import StationDetail from "./pages/StationDetail";
import TenantDetail from "./pages/TenantDetail";
import PersonnelList from "./pages/PersonnelList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/daily-check/tenant" replace />} />
            <Route path="/daily-check" element={<Navigate to="/daily-check/tenant" replace />} />
            <Route path="/daily-check/tenant" element={<StationSelect />} />
            <Route path="/daily-check/patrol" element={<FormPatrol />} />
            <Route path="/daily-check/patrol/submitted" element={<PatrolSubmitted />} />
            <Route path="/daily-check/logbook" element={<Logbook />} />
            <Route path="/station/:stationId" element={<TenantChecklist />} />
            <Route path="/scheduling" element={<Scheduling />} />
            <Route path="/master-data" element={<Navigate to="/master-data/stations" replace />} />
            <Route path="/master-data/stations" element={<StationList />} />
            <Route path="/master-data/stations/create" element={<StationCreation />} />
            <Route path="/master-data/stations/:stationId" element={<StationDetail />} />
            <Route path="/master-data/tenants" element={<TenantList />} />
            <Route path="/master-data/tenants/create" element={<TenantCreation />} />
            <Route path="/master-data/tenants/:tenantId" element={<TenantDetail />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
