import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider, useWallet } from "./context/WalletContext";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import StudentPortal from "./pages/StudentPortal";
import DonorPortal from "./pages/DonorPortal";

function ProtectedRoute({ children, requiredRole }) {
  const { publicKey, role } = useWallet();
  if (!publicKey || !role) return <Navigate to="/" replace />;
  if (role !== requiredRole) return <Navigate to={role === "student" ? "/student" : "/donor"} replace />;
  return children;
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col transition-colors duration-200">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  const { publicKey, role } = useWallet();

  return (
    <Routes>
      <Route
        path="/"
        element={
          publicKey && role
            ? <Navigate to={role === "student" ? "/student" : "/donor"} replace />
            : <Landing />
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <Layout><StudentPortal /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor"
        element={
          <ProtectedRoute requiredRole="donor">
            <Layout><DonorPortal /></Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <AppProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}
