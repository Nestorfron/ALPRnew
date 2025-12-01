import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Camera, ScanSearch, AlertTriangle, Car, Ban } from "lucide-react";
import CameraReader from "../components/CameraReader";
import { postData, logoutUser } from "../utils/api";
import { useAppContext } from "../context/AppContext";

export default function Home() {
  const { token } = useAppContext();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePlate = async (plate) => {
    setLoading(true);
    setResult(null);

    try {
      const data = await postData("/check-plates", { plate }, token);
      setResult(data);
    } catch (err) {
      console.error("❌ Error al consultar placas:", err);

      setResult({
        plate,
        status: "error",
        description: "No se pudo contactar al servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-6 relative border border-gray-200">

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm transition shadow-md"
        >
          <LogOut size={16} />
        </button>

        <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <Car className="text-blue-600" size={32} />
          Control de Vehículos
        </h1>

        {/* Lector */}
        <div className="border rounded-xl p-4 bg-gray-50 shadow-inner">
          <CameraReader onPlateDetected={handlePlate} />
        </div>

        {/* Loader */}
        {loading && (
          <div className="mt-6 flex flex-col items-center">
            <div className="animate-spin border-4 border-gray-300 border-t-blue-600 rounded-full w-10 h-10"></div>
            <p className="text-gray-600 mt-2 flex items-center gap-1">
              <ScanSearch size={18} />
              Analizando matrícula...
            </p>
          </div>
        )}

        {/* Resultado */}
        {result && !loading && (
          <div
            className="mt-6 p-5 rounded-xl shadow bg-white border animate-fadeIn"
            style={{ animation: "fadeIn .3s ease" }}
          >
            <p className="text-lg flex items-center gap-2">
              <strong>Matrícula:</strong> {result.plate}
            </p>
            <p className="text-lg">
              <strong>Estado:</strong> {result.status}
            </p>

            {result.description && (
              <p className="mt-2 text-gray-700">
                <strong>Descripción:</strong> {result.description}
              </p>
            )}

            {/* Estados visuales */}
            {result.status === "robado" && (
              <p className="text-red-600 font-bold mt-4 text-xl flex items-center justify-center gap-2">
                <Ban size={28} />
                🚨 VEHÍCULO ROBADO 🚨
              </p>
            )}

            {result.status === "denunciado" && (
              <p className="text-yellow-600 font-bold mt-4 text-xl flex items-center justify-center gap-2">
                <AlertTriangle size={26} />
                ⚠️ VEHÍCULO DENUNCIADO ⚠️
              </p>
            )}

            {result.status === "ok" && (
              <p className="text-green-600 font-bold mt-4 text-xl flex items-center justify-center gap-2">
                ✅ SIN PROBLEMAS
              </p>
            )}

            {result.status === "not_found" && (
              <p className="text-gray-600 font-bold mt-4 text-xl flex items-center justify-center gap-2">
                ❌ REGISTRO NO ENCONTRADO
              </p>
            )}

            {result.status === "error" && (
              <p className="text-red-500 font-bold mt-4 text-xl flex items-center justify-center gap-2">
                ❌ Error consultando el servidor
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
