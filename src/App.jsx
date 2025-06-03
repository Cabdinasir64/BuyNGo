import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from './auth/signup'
import SignIn from './auth/signin'
import SellerDashboard from './pages/seller/seller'
import AdminDashboard from "./pages/admin/admin";
import Category from './pages/category'
import Product from './pages/product'
import Home from './pages/home/home'
import Cart from './pages/cart'
import BuyerDashboard from './pages/buyer/buyer'
import Checkout from "./pages/checkout";
import Shopping from './pages/shopping/shopping'
import Contact from './pages/contact/contact'

function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sellerdashboard" element={<SellerDashboard />} />
          <Route path="/buyerdashboard" element={<BuyerDashboard />} />
          <Route
            path="/category/:categorySlug/:subcategorySlug"
            element={<Category />}
          />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </>
  );
}

export default App
