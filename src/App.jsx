import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from './auth/signup'
import SignIn from './auth/signin'
import AdminDashboard from './pages/admin/admin'
function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </>
  );
}

export default App
