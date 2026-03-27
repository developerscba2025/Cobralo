const OfferBanner = () => (
  <div className="offer-banner">
    <div className="offer-track">
      {[...Array(20)].map((_, i) => (
        <span key={i} className="inline-block px-12">🚀 @COBRALO_APP — 50% OFF LANZAMIENTO — ¡QUEDAN POCOS CUPOS! — </span>
      ))}
    </div>
  </div>
);

export default OfferBanner;
