import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PetMap from "@/components/PetMap";

const PetMapPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <PetMap />
      </main>
      <Footer />
    </div>
  );
};

export default PetMapPage;
