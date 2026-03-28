const OfferBanner = () => (
  <div className="offer-banner">
    <div className="offer-track">
      {[...Array(15)].map((_, i) => (
        <span key={i} className="inline-block px-12">🚀 @COBRALOAPP — 25% OFF LANZAMIENTO — ¡APROVECHA ESTA OPORTUNIDAD! — </span>
      ))}
    </div>
  </div>
);

export default OfferBanner;
