import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./AuthContext.jsx";

/* Public */
import PublicLayout from "./PublicLayout.jsx";
import Home from "./Home.jsx";
import Providers from "./Providers.jsx";
import ProviderProfile from "./ProviderProfile.jsx";
import Login from "./Login.jsx";
import RegisterProvider from "./RegisterProvider.jsx";

/* Admin */
import AdminDashboard from "./AdminDashboard.jsx";
import AdminProviders from "./AdminProviders.jsx";
import AdminCategories from "./AdminCategories.jsx";
import AdminPromos from "./AdminPromos.jsx";

/* Provider */
import StatsPage from "./StatsPage.jsx";

/* Global */
import ChatWidget from "./ChatWidget.jsx";

const PrivateRoute = ({ roles, children }) => {
  const { account, role } = useAuth();
  if (!account) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
};

/* Shell provisoire du dashboard prestataire */
function ProviderDashboardShell() {
  return (
    <div className="min-h-screen bg-forest-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold text-forest-900 mb-6">
          Mon espace prestataire
        </h1>
        <StatsPage />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        <Routes>
          {/* ═══════ PUBLIC ═══════ */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/prestataires" element={<Providers />} />
            <Route path="/prestataire/:slug" element={<ProviderProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/devenir-prestataire" element={<RegisterProvider />} />
          </Route>

          {/* ═══════ DASHBOARD PRESTATAIRE ═══════ */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={["provider"]}>
                <ProviderDashboardShell />
              </PrivateRoute>
            }
          >
            <Route index element={<StatsPage />} />
            <Route path="stats" element={<StatsPage />} />
          </Route>

          {/* ═══════ DASHBOARD ADMIN ═══════ */}
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminProviders />} />
            <Route path="providers" element={<AdminProviders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="promos" element={<AdminPromos />} />
          </Route>

          {/* ═══════ 404 ═══════ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* 💬 Chat flottant, visible partout quand connecté */}
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}