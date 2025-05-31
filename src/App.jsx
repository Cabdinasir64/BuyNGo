import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from './auth/signup'

function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<SignUp />} />
        </Routes>
      </Router>
    </>
  );
}

export default App
