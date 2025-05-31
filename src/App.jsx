import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from './pages/admin/admin'
import SignUp from './auth/signup'
import SignIn from './auth/signin'
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
