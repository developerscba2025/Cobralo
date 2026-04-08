import { useState } from 'react';
import OfferBanner from './components/OfferBanner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import FeaturedTeachers from './components/FeaturedTeachers';
import Testimonials from './components/Testimonials';
import DashboardMockup from './components/DashboardMockup';
import Roadmap from './components/Roadmap';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import SupportModal from './components/SupportModal';
import Toast from './components/Toast';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';

const LandingPage = () => {
  const [showSupport, setShowSupport] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <div className="relative min-h-screen bg-bg-landing text-text">
      <LegalModal
        type={legalType || 'terms'}
        isOpen={!!legalType}
        onClose={() => setLegalType(null)}
      />
      <SupportModal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        onSent={() => setShowToast(true)}
      />
      <Toast
        message="Mensaje enviado con éxito!"
        isOpen={showToast}
        onClose={() => setShowToast(false)}
      />
      <OfferBanner />
      
      <header className="sticky top-0 z-50 pointer-events-none w-full h-0 overflow-visible">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </header>

      <main className="pt-0">
        <Hero />
        <StatsBar />
        <HowItWorks />
        <Features />
        <DashboardMockup />
        <Testimonials />
        <FeaturedTeachers />
        <Roadmap />
        <Pricing />
        <FAQ />
      </main>

      <Footer
        onOpenSupport={() => setShowSupport(true)}
        onOpenLegal={(type: 'terms' | 'privacy') => setLegalType(type)}
      />
    </div>
  );
};

export default LandingPage;
