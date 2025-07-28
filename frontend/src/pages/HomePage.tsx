import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-white flex flex-col">
      <section className="flex-1 flex items-center justify-center px-6 py-20 text-center">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenido a <span className="text-blue-400">FacturaX</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8">
            Gestiona tus facturas de manera fácil, segura y rápida. Una plataforma sin fines de lucro pensada para ti.
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4">
            <Link
              to="/auth"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium transition-all"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/auth"
              className="border border-blue-500 hover:bg-blue-700 hover:text-white px-6 py-3 rounded-lg text-blue-400 font-medium transition-all"
            >
              Crear cuenta
            </Link>
          </div>

          <p className="text-slate-400 mt-10">¿Ya tienes cuenta? Ingresa a tu panel:</p>

          <Link
            to="/dashboard"
            className="inline-block mt-2 px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-md hover:bg-blue-100 transition-all"
          >
            Ir al Dashboard 🚀
          </Link>
        </motion.div>
      </section>
    </main>
  );
};

export default HomePage;
