import { WalletProvider, useWallet } from "./context/WalletContext";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import RoleSelect from "./pages/RoleSelect";
import ProviderPortal from "./pages/ProviderPortal";
import StudentPortal from "./pages/StudentPortal";

function AppRoutes() {
  const { publicKey, role } = useWallet();

  if (!publicKey || !role) return <RoleSelect />;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      {role === "provider" ? <ProviderPortal /> : <StudentPortal />}
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
