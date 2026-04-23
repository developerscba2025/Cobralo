

export const EncodingDebugger = () => {
  const phone = '5491112345678'; // Test phone
  const message = '✨ ¡Hola! 👋 Recordatorio ✅';
  
  const links = [
    {
      name: '1. Literal (Default Browser)',
      url: `https://wa.me/${phone}?text=${message}`
    },
    {
      name: '2. Standard encodeURIComponent',
      url: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    },
    {
      name: '3. NFC Normalized + Encoded',
      url: `https://wa.me/${phone}?text=${encodeURIComponent(message.normalize('NFC'))}`
    },
    {
      name: '4. Pure Hex Encoding (UTF-8)',
      url: `https://wa.me/${phone}?text=%F0%9F%91%8B%20%C2%A1Hola!%20%E2%9C%A8` // Hand-coded bytes
    }
  ];

  return (
    <div className="p-10 bg-black text-white space-y-4">
      <h1 className="text-2xl font-bold">Debug de Codificación WhatsApp</h1>
      <p>Hacé click en cada link y fijate cuál te abre WhatsApp CON los íconos bien:</p>
      <div className="flex flex-col gap-4">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors font-bold text-center"
          >
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
};
