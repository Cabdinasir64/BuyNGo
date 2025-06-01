import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from './auth/signup'
import SignIn from './auth/signin'
import SellerDashboard from './pages/seller/seller'
import AdminDashboard from "./pages/admin/admin";
import Navbar from './components/navbar'
import Category from './pages/category'


function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navbar />} />
          <Route path="/SellerDashboard" element={<SellerDashboard />} />
          <Route
            path="/category/:categorySlug/:subcategorySlug"
            element={<Category />}
          />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </>
  );
}

export default App
