import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WalletPanel from "./components/WalletPanel";
import ScholarshipList from "./components/ScholarshipList";
import ActivityFeed from "./components/ActivityFeed";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import "./App.css";

export default function App() {
  return (
    <WalletProvider>
      <div className="app">
        <Navbar />
        <main>
          <Hero />
          <WalletPanel />
          <ScholarshipList />
          <ActivityFeed />
          <HowItWorks />
        </main>
        <Footer />
      </div>
    </WalletProvider>
  );
}
