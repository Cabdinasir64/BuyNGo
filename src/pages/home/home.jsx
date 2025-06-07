import react from "react-dom";
import Navbar from "../../components/navbar";
import Hero from "./components/hero";
import Product from "./components/product";
import Features from "./components/features";
import Testimonials from "./components/testimonial";
import Faq from "./components/faq";
import Footer from "../../components/footer";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // scroll to top
  }, [pathname]);

  return null;
};
return (
  <>
    <Navbar />
    <Hero />
    <Product />
    <Features />
    <Testimonials />
    <Faq />
    <Footer />
  </>
);
export default Home;
