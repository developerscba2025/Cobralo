import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const LegalModal = ({ isOpen, onClose, type }: LegalModalProps) => {
  const content = {
    terms: {
      title: 'Términos y Condiciones',
      body: `
        ### 1. Aceptación del Servicio
        Al utilizar Cobralo, aceptas estos términos. Cobralo es una herramienta de gestión para profesionales independientes.

        ### 2. Capacidad del Software
        Cobralo es una plataforma de software que facilita el seguimiento de alumnos, pagos y asistencia. Cobralo NO es un procesador de pagos bancario ni una entidad financiera.

        ### 3. Pagos y Cobros
        Los pagos realizados por tus alumnos se procesan a través de servicios externos (Mercado Pago, transferencias bancarias). Cobralo no tiene acceso a los fondos ni responsabilidad sobre las transacciones fallidas en dichas plataformas.

        ### 4. Responsabilidad
        Tú eres el único responsable de la información cargada en la cuenta y del cumplimiento fiscal de tus actividades comerciales.

        ### 5. Modificaciones
        Nos reservamos el derecho de modificar el software o estos términos para mejorar el servicio, notificando cambios importantes.
      `
    },
    privacy: {
      title: 'Política de Privacidad',
      body: `
        ### 1. Datos del Usuario
        En Cobralo, tus datos y los de tus alumnos son sagrados. No vendemos, alquilamos ni compartimos información con terceros con fines publicitarios.

        ### 2. Uso de Información
        Solo utilizamos la información necesaria para el correcto funcionamiento de las notificaciones, registros de pago y calendarios que utilizas en la plataforma.

        ### 3. Seguridad
        Implementamos medidas de seguridad estándar para proteger tu información contra accesos no autorizados.

        ### 4. Cookies
        Utilizamos cookies esenciales para mantener tu sesión iniciada y recordar tus preferencias de visualización.

        ### 5. Derechos
        Puedes solicitar la exportación o eliminación de tus datos en cualquier momento enviando un correo a soporte.
      `
    }
  };

  const current = content[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0f0a] border border-white/10 rounded-3xl p-8 max-h-[80vh] overflow-y-auto shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black mb-6 text-white">{current.title}</h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="space-y-6 text-text-muted leading-relaxed">
                {current.body.split('\n\n').map((block, i) => (
                  <div key={i}>
                    {block.trim().startsWith('###') ? (
                      <h4 className="text-white font-bold mb-2">{block.replace('###', '').trim()}</h4>
                    ) : (
                      <p>{block.trim()}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LegalModal;
