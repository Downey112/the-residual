import PreviewProvider from "@/components/PreviewProvider";
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import TeeSection from "@/components/sections/TeeSection";
import BookSection from "@/components/sections/BookSection";
import AssetIndex from "@/components/sections/AssetIndex";
import Philosophy from "@/components/sections/Philosophy";
import Footer from "@/components/sections/Footer";

export default function Page() {
  return (
    <PreviewProvider>
      <Header />
      <main>
        <Hero />
        <TeeSection />
        <BookSection />
        <AssetIndex />
        <Philosophy />
      </main>
      <Footer />
    </PreviewProvider>
  );
}
