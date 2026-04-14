import React, { useState } from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

const LegalTab: React.FC = () => {
    const [activeSection, setActiveSection] = useState<'terms' | 'privacy'>('terms');

    const content = {
        terms: {
            title: 'Términos y Condiciones',
            body: `
                ### 1. Identificación de las Partes
                El presente acuerdo se celebra entre Cobralo (en adelante "Cobralo" o el "Servicio") y el Usuario, entendiéndose por tal a toda persona humana mayor de 18 años, con plena capacidad legal para contratar y que desarrolle una actividad comercial lícita de forma independiente.

                ### 2. Descripción del Servicio
                Cobralo es una plataforma de software (SaaS) diseñada para la gestión operativa de alumnos, cobros, asistencias y comunicación. Cobralo NO es un procesador de pagos, NO es una entidad financiera ni un banco, y NO brinda asesoramiento fiscal ni contable.

                ### 3. Condiciones de Alta y Elegibilidad
                Para utilizar el Servicio, el Usuario debe proporcionar datos verídicos y actualizados. La cuenta es personal, única e intransferible. El uso de identidades falsas o la duplicación de cuentas podrá resultar en la baja inmediata del Servicio.

                ### 4. Planes, Período de Prueba y Facturación
                Los precios y planes están detallados en el sitio. La facturación es mensual/anual con renovación automática. **Período de prueba:** Al finalizar el período de prueba gratuito de un plan pago, si el Usuario no abona, su cuenta revertirá automáticamente al plan Free, conservando sus datos pero perdiendo acceso a las funcionalidades premium (gestión ilimitada, etc.). **Ajuste de precios:** Los precios de los planes están sujetos a modificaciones mensuales basadas en el **50% del Índice de Precios al Consumidor (IPC)** oficial de Argentina. Cualquier ajuste será notificado con al menos 10 días de antelación. Si el Usuario no acepta el nuevo precio, podrá cancelar su suscripción sin penalidad antes de la fecha de renovación.

                ### 5. Política de Reembolsos
                Los pagos realizados son, como regla general, no reembolsables. Sin embargo, si el Usuario solicita la cancelación dentro de los primeros **7 (siete) días corridos** desde la contratación inicial de un plan pago, Cobralo realizará el reembolso completo del monto abonado. Transcurrido dicho plazo, no se otorgarán reembolsos parciales ni totales. Los créditos de servicio otorgados por incumplimiento del SLA (ver cláusula 13) no son convertibles a dinero.

                ### 6. Pagos de Alumnos y Terceros (Mercado Pago / WhatsApp)
                Cobralo facilita el registro de pagos, pero los fondos fluyen vía plataformas externas (como Mercado Pago). Cobralo no tiene responsabilidad sobre transacciones fallidas o retenciones. Asimismo, ante el envío de notificaciones por WhatsApp, Cobralo no se responsabiliza por la interacción del profesor con dicha plataforma ni por posibles bloqueos, demoras o fallos en la entrega. Se recomienda fuertemente el uso de **WhatsApp Business** para una gestión profesional y segura.

                ### 7. Propiedad Intelectual
                Todo el software, código, diseño, marcas y contenidos de Cobralo son propiedad exclusiva de la empresa. El Usuario conserva la propiedad de los datos que carga, otorgando a Cobralo una licencia limitada, no exclusiva y revocable únicamente para la prestación del servicio.

                ### 8. Uso Aceptable y Prohibiciones
                Queda terminantemente prohibido: utilizar el Servicio para fines ilícitos, enviar spam a los alumnos, realizar ingeniería inversa, intentar acceder a cuentas de otros usuarios, cargar información falsa o difamatoria, o utilizar la plataforma para actividades que violen la legislación vigente en la República Argentina.

                ### 9. Limitación de Responsabilidad
                Cobralo no será responsable por lucro cesante, pérdida de datos, daños indirectos, incidentales, especiales o consecuentes derivados del uso o la imposibilidad de uso del Servicio. Nuestra responsabilidad máxima, bajo cualquier circunstancia, no superará el monto total abonado por el Usuario en los últimos 3 (tres) meses de servicio previos al incidente que origina el reclamo.

                ### 10. Indemnización
                El Usuario se compromete a indemnizar, defender y mantener indemne a Cobralo, sus directores, empleados y afiliados, frente a cualquier reclamo, demanda, daño, pérdida o gasto (incluyendo honorarios de abogados) que surja del uso indebido del Servicio, la carga de datos sin autorización de los titulares, o cualquier violación de estos Términos por parte del Usuario.

                ### 11. Cancelación y Baja del Servicio
                El Usuario puede cancelar su suscripción en cualquier momento desde la sección de Ajustes. Tras la cancelación, el Usuario tendrá un plazo de **30 (treinta) días corridos** para exportar sus datos en formato estándar (CSV). Transcurrido dicho plazo, Cobralo procederá a la eliminación o anonimización definitiva de los datos. Cobralo se reserva el derecho de rescindir el servicio unilateralmente ante incumplimientos graves, uso fraudulento, o falta de pago persistente pasada la semana de gracia.

                ### 12. Exportación y Portabilidad de Datos
                El Usuario tiene derecho a solicitar la exportación de todos sus datos en cualquier momento. Cobralo proveerá herramientas para descargar la información en formatos estándar (CSV, JSON). Este derecho es irrenunciable y se garantiza tanto durante la vigencia del servicio como durante el período de gracia post-cancelación.

                ### 13. Disponibilidad, Mantenimiento y SLA
                Nos comprometemos a un esfuerzo razonable para alcanzar una disponibilidad del **99% mensual**. El mantenimiento programado será notificado con al menos 24 horas de antelación. **Consecuencias por incumplimiento:** En caso de que la disponibilidad sea inferior al SLA comprometido por causas imputables a Cobralo, el Usuario tiene derecho a solicitar un crédito de servicio equivalente a **1 día de suscripción por cada hora de indisponibilidad**, con un máximo de 30 días de crédito por mes. Este crédito se aplicará automáticamente al siguiente período de facturación tras su aprobación.

                ### 14. Fuerza Mayor
                Cobralo no será responsable por incumplimientos derivados de causas de fuerza mayor, incluyendo pero no limitado a: desastres naturales, pandemias, interrupciones de servicios de terceros (proveedores de hosting, APIs, telecomunicaciones), conflictos bélicos, actos de gobierno, cortes generalizados de energía eléctrica o internet, y cualquier otra circunstancia imprevisible e inevitable ajena al control razonable de Cobralo.

                ### 15. Comunicaciones Electrónicas
                El Usuario acepta que todas las comunicaciones, notificaciones y avisos que Cobralo realice a través de la plataforma, correo electrónico registrado o notificaciones push, tendrán plena validez legal como comunicación fehaciente. Es responsabilidad del Usuario mantener actualizado su correo electrónico de contacto.

                ### 16. Responsabilidad Fiscal (AFIP / ARCA)
                El Usuario es el único responsable de cumplir con sus obligaciones impositivas. Cobralo actúa como un intermediario técnico y no es responsable de la validez de los certificados fiscales ni de la veracidad de la facturación emitida por el Usuario.

                ### 17. Modificaciones al Servicio y Términos
                Cobralo podrá modificar funcionalidades, precios o estos Términos notificando al Usuario con al menos **10 días de anticipación** a través de la plataforma o por correo electrónico. El uso continuado del Servicio tras la notificación implica la aceptación de las modificaciones.

                ### 18. Acuerdo de Procesamiento de Datos (DPA)
                Cobralo actúa como "Encargado de Tratamiento" de los datos de alumnos cargados por el Usuario, quien es el "Responsable de los Datos". Ambas partes deben cumplir con la Ley 25.326 de Protección de Datos Personales.

                ### 19. Jurisdicción y Ley Aplicable
                Este acuerdo se rige por las leyes de la República Argentina. Cualquier controversia se somete a la jurisdicción exclusiva de los Tribunales Ordinarios de la Ciudad de Córdoba, renunciando expresamente a cualquier otro fuero o jurisdicción que pudiera corresponder.

                ### 20. Acuerdo Integral
                Estos Términos constituyen el acuerdo completo entre el Usuario y Cobralo, y reemplazan cualquier acuerdo previo, verbal o escrito. Si alguna cláusula fuera declarada nula o inaplicable, las restantes mantendrán plena vigencia.

                Última actualización: Abril 2026.
            `
        },
        privacy: {
            title: 'Política de Privacidad',
            body: `
                ### 1. Identidad del Responsable
                Cobralo es operado por Cobralo App S.A.S. (en formación), con domicilio en la Ciudad de Córdoba, Argentina. Contacto: privacidad@cobralo.info.

                ### 2. Qué Datos se Recopilan
                Recopilamos: datos del Usuario (nombre, email, CUIT/DNI, foto de perfil) y datos de sus alumnos (nombre, contacto, pagos, asistencia). También datos técnicos automáticos (dirección IP, tipo de dispositivo, sistema operativo, cookies esenciales) para seguridad y funcionamiento del Servicio.

                ### 3. Finalidad del Tratamiento
                Los datos se usan para: (a) Gestión de cuenta y suscripción, (b) Envío de recordatorios automáticos (vía email/WhatsApp), (c) Soporte técnico, (d) Mejora del producto mediante analíticas anónimas, y (e) Cumplimiento de obligaciones legales.

                ### 4. Base Legal — Ley 25.326
                Tratamos sus datos bajo su consentimiento expreso y la ejecución del contrato de servicio, en total conformidad con la Ley de Protección de Datos Personales de la República Argentina (Ley 25.326) y su Decreto Reglamentario 1558/2001.

                ### 5. Proveedores y Terceros
                Solo compartimos datos con servicios esenciales para la operación: Mercado Pago (pagos), Google Cloud (alojamiento), Twilio/WhatsApp API (notificaciones), servicios de envío de correo electrónico (comunicaciones transaccionales) y herramientas de analítica anónima. **No vendemos, alquilamos ni compartimos datos personales a terceros con fines publicitarios bajo ninguna circunstancia.**

                ### 6. Transferencia Internacional
                Los datos pueden ser procesados en servidores ubicados fuera de Argentina (p. ej. EE.UU. — Google Cloud), garantizando siempre niveles de protección adecuados según estándares internacionales y las disposiciones de la Dirección Nacional de Protección de Datos Personales.

                ### 7. Período de Conservación
                Los datos se conservan mientras la cuenta esté activa. Al darse de baja, se otorga un plazo de **30 (treinta) días corridos** para exportar la información. Transcurrido este plazo, los datos serán eliminados de forma permanente o anonimizados de manera irreversible, salvo aquellos que deban conservarse por obligaciones legales o fiscales.

                ### 8. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
                Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales en cualquier momento y sin costo. Escríbanos a privacidad@cobralo.info para ejercer estos derechos. Nos comprometemos a responder dentro de los 10 días hábiles establecidos por la Ley 25.326.

                ### 9. Derecho al Olvido y Eliminación Permanente
                El Usuario puede solicitar la eliminación completa y permanente de todos sus datos personales y los datos de sus alumnos. Una vez procesada la solicitud, la eliminación es irreversible. Cobralo confirmará la eliminación por escrito dentro de los 10 días hábiles posteriores a la solicitud.

                ### 10. Anonimización de Datos para Estadísticas
                Cobralo podrá utilizar datos anonimizados y agregados (que no permiten identificar a ningún usuario o alumno individual) para fines estadísticos, de mejora del producto y generación de informes de tendencias del sector. Estos datos anonimizados no constituyen datos personales según la Ley 25.326.

                ### 11. Política de Cookies
                Usamos solo cookies esenciales y estrictamente necesarias para el funcionamiento del login, la sesión de usuario y las preferencias de interfaz. No utilizamos cookies de rastreo publicitario de terceros ni tecnologías de seguimiento invasivas.

                ### 12. Datos de Menores (Consentimiento Parental)
                Dado que el Servicio permite gestionar datos de alumnos menores de edad, el Usuario (academia/profesor) **garantiza taxativamente** contar con la autorización expresa, informada y verificable de los padres o tutores legales antes de cargar dicha información en la plataforma. Cobralo no verifica de forma independiente la edad de los alumnos registrados; dicha responsabilidad recae exclusiva y completamente sobre el Usuario. En caso de incumplimiento, el Usuario será el único responsable ante cualquier reclamo de padres, tutores o autoridades competentes.

                ### 13. Notificación de Brechas de Seguridad
                En caso de producirse una brecha de seguridad que comprometa datos personales, Cobralo se compromete a: (a) Notificar a los Usuarios afectados dentro de las **72 (setenta y dos) horas** siguientes al descubrimiento del incidente, (b) Informar a la Dirección Nacional de Protección de Datos Personales según corresponda, (c) Detallar la naturaleza de la brecha, los datos comprometidos y las medidas correctivas adoptadas.

                ### 14. Seguridad de la Información
                Aplicamos medidas de seguridad técnicas y organizativas, incluyendo: cifrado TLS/HTTPS en tránsito, encriptación de datos sensibles en reposo, backups periódicos automatizados, control de acceso basado en roles, y auditorías de seguridad regulares para proteger su información contra accesos no autorizados, alteración o destrucción.

                ### 15. Cambios en la Política
                Cualquier cambio sustancial en esta Política será notificado vía plataforma o email con al menos **10 días de antelación**. El uso continuo del Servicio tras la notificación implica la aceptación de la nueva política. Las versiones anteriores estarán disponibles bajo solicitud.

                Última actualización: Abril 2026.
            `
        }
    };

    const current = content[activeSection];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all h-full flex flex-col">
            {/* Header */}
            <div>
                <h2 className="text-xl lg:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3 mb-2 tracking-tight uppercase">
                    <ShieldCheck size={24} className="text-primary-main" /> Información Legal
                </h2>
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-300 uppercase tracking-widest">
                    Términos, condiciones y privacidad de Cobralo.
                </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex p-1 bg-zinc-100/50 dark:bg-bg-app rounded-full border border-zinc-200 dark:border-border-emerald w-full md:max-w-md mx-auto xl:mx-0">
                <button
                    onClick={() => setActiveSection('terms')}
                    className={`flex-1 py-3 px-4 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                        activeSection === 'terms'
                            ? 'bg-primary-main text-white shadow-lg shadow-primary-glow scale-100'
                            : 'text-text-muted hover:text-text-main scale-[0.98]'
                    }`}
                >
                    <FileText size={14} /> Términos
                </button>
                <button
                    onClick={() => setActiveSection('privacy')}
                    className={`flex-1 py-3 px-4 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                        activeSection === 'privacy'
                            ? 'bg-primary-main text-white shadow-lg shadow-primary-glow scale-100'
                            : 'text-text-muted hover:text-text-main scale-[0.98]'
                    }`}
                >
                    <ShieldCheck size={14} /> Privacidad
                </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 bg-surface border border-border-main rounded-3xl lg:rounded-[40px] p-6 md:p-10 shadow-sm relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-main/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-xl md:text-2xl font-black mb-8 text-zinc-900 dark:text-white uppercase tracking-tight font-accent relative z-10 shrink-0">
                    {current.title}
                </h3>
                
                <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none flex-1 overflow-y-auto hide-scrollbar relative z-10 pr-2">
                    <div className="space-y-6 text-zinc-600 dark:text-zinc-100 leading-relaxed font-medium pb-10">
                        {current.body.split('\n\n').map((block, i) => (
                            <div key={i}>
                                {block.trim().startsWith('###') ? (
                                    <h4 className="text-zinc-900 dark:text-zinc-100 font-extrabold uppercase tracking-widest text-[11px] mb-3 mt-8">{block.replace('###', '').trim()}</h4>
                                ) : (
                                    <p className="text-sm">{block.trim()}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalTab;
