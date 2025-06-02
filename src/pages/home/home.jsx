import react from 'react-dom'
import Navbar from '../../components/navbar'
import Hero from './components/hero'
import Product from "./components/product";
import Features from './components/features';
import Testimonials from './components/testimonial';
import Footer from "./components/footer";

const Home = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <Product />
            <Features />
            <Testimonials />
            <Footer />
        </>
    );
}
export default Home;