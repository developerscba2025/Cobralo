import { useState } from 'react';
import OfferBanner from './components/OfferBanner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import FeaturedTeachers from './components/FeaturedTeachers';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import DashboardMockup from './components/DashboardMockup';
import SupportModal from './components/SupportModal';
import Toast from './components/Toast';
import Footer from './components/Footer';
import FAQ from './components/FAQ';
import LegalModal from './components/LegalModal';

const App = () => {
  const [showSupport, setShowSupport] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <div className="bg-[#050805] text-text min-h-screen">
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
      
      <header className="fixed top-0 left-0 right-0 z-50">
        <OfferBanner />
        <Navbar />
      </header>
      
      <main className="pt-[110px]"> {/* Space for the fixed header */}
        <Hero />
        <HowItWorks />
        <Features />
        <FeaturedTeachers />
        <Testimonials />
        <DashboardMockup />
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

export default App;
