import Hero from '@/components/Hero';
import Offers from '@/components/Offers';
// Language fix v2 - DE/RU only
import MenuSection from '@/components/MenuSection';
import DeliverySection from '@/components/DeliverySection';
import AboutSection from '@/components/AboutSection';
import ReviewsSection from '@/components/ReviewsSection';
import ContactSection from '@/components/ContactSection';

export default function Home() {
  return (
    <>
      <Hero />
      <Offers />
      <MenuSection />
      <DeliverySection />
      <AboutSection />
      <ReviewsSection />
      <ContactSection />
    </>
  );
}
