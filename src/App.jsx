import { WalletProvider, useWallet } from "./context/WalletContext";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import StudentPortal from "./pages/StudentPortal";
import DonorPortal from "./pages/DonorPortal";

function AppRoutes() {
  const { publicKey, role } = useWallet();

  // No wallet connected — show landing page
  if (!publicKey || !role) return <Landing />;

  // Wallet connected — show appropriate portal
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      {role === "student" ? <StudentPortal /> : <DonorPortal />}
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </WalletProvider>
  );
}
