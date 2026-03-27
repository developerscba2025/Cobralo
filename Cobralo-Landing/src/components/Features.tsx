import { Users, Calendar, MessageCircle, BarChart3 } from 'lucide-react';
import FeatureCard from './FeatureCard';

const Features = () => (
  <section id="funciones" className="section-padding bg-bg-soft relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    <div className="container relative z-10">
      <div className="mb-16">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-light mb-4">Potencia tu enseñanza</div>
        <h2 className="text-4xl md:text-5xl font-black leading-tight">
          Toda la organizacion <br />
          <span className="text-text-dim">en un solo lugar.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Users, title: 'Gestión de Alumnos', desc: 'Cada alumno con su servicio, cuota y método de pago. Marcá cobrado en un clic.', pills: ['Filtros', 'CSV', 'Notas'] },
          { icon: Calendar, title: 'Calendario Semanal', desc: 'Visualizá todas tus clases. Detección automática de conflictos y con integracion a Google Calendar.', pills: ['Organizacion Semanal', 'Google Calendar'] },
          { icon: MessageCircle, title: 'WhatsApp Vinculado', desc: 'Mandá recordatorios personalizados con monto, servicio y alias en un par de segundos.', pills: ['Recordatorios', 'Mensajes Personalizados'] },
          { icon: BarChart3, title: 'Control de tus ingresos', desc: 'Dashboard mensual de tus finanzas. Potenciá tus cobros con Cobralo.', pills: ['Gráficos', 'Ganancias', 'Dashboard'] },
        ].map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
      </div>
    </div>
  </section>
);

export default Features;
