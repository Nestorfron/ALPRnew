import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [adminExists, setAdminExists] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    role: "operator",
  });

  const navigate = useNavigate();

  // Load if admin exists
  useEffect(() => {
    const checkAdmin = async () => {
      const res = await fetch(`${API_URL}/users`);
      const users = await res.json();

      const exists = users.some((u) => u.role === "admin");
      setAdminExists(exists);
    };

    checkAdmin();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (res.status !== 200) return alert(data.error);

    localStorage.setItem("token", data.access_token);
    navigate("/home");
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();

    const payload = {
      username: form.username,
      password: form.password,
      email: form.email,
      role: adminExists ? "operator" : form.role,
    };

    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.status >= 400) return alert(data.error);

    alert("Usuario creado con éxito");
    setIsLogin(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">

      <div className="bg-white shadow-xl rounded-xl p-8 w-[350px]">
        <h1 className="text-3xl font-bold text-center mb-6">
          {isLogin ? "Iniciar Sesión" : "Registrarse"}
        </h1>

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleLogin}
              className="flex flex-col gap-3"
            >
              <input
                className="border p-2 rounded"
                placeholder="Usuario"
                name="username"
                onChange={handleChange}
              />
              <input
                className="border p-2 rounded"
                placeholder="Contraseña"
                type="password"
                name="password"
                onChange={handleChange}
              />

              <button className="bg-blue-600 text-white p-2 rounded mt-2">
                Entrar
              </button>

              <p
                className="text-center text-blue-600 cursor-pointer mt-3"
                onClick={() => setIsLogin(false)}
              >
                ¿No tenés cuenta? Registrate
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleRegister}
              className="flex flex-col gap-3"
            >
              <input
                className="border p-2 rounded"
                placeholder="Usuario"
                name="username"
                onChange={handleChange}
              />
              <input
                className="border p-2 rounded"
                placeholder="Email"
                name="email"
                type="email"
                onChange={handleChange}
              />
              <input
                className="border p-2 rounded"
                placeholder="Contraseña"
                type="password"
                name="password"
                onChange={handleChange}
              />

              {/* Mostrar selector de rol SOLO si aún no existe admin */}
              {!adminExists && (
                <select
                  name="role"
                  className="border p-2 rounded"
                  onChange={handleChange}
                >
                  <option value="admin">Administrador</option>
                  <option value="operator">Operador</option>
                </select>
              )}

              {adminExists && (
                <p className="text-sm text-gray-500">
                  Ya existe un admin. Serás registrado como operador.
                </p>
              )}

              <button className="bg-green-600 text-white p-2 rounded mt-2">
                Crear cuenta
              </button>

              <p
                className="text-center text-blue-600 cursor-pointer mt-3"
                onClick={() => setIsLogin(true)}
              >
                ¿Ya tenés cuenta? Iniciá sesión
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
