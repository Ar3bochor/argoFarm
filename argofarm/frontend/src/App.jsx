import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <div className="min-h-screen bg-cream text-slate-800">
      <Navbar />
      <AppRoutes />
      <Footer />
    </div>
  );
}
