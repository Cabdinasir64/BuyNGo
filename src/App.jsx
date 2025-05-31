import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from './auth/signup'
import SignIn from './auth/signin'
import SellerDashboard from './pages/seller/seller'
function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<SellerDashboard />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </>
  );
}

export default App
