import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from './auth/signin'

function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
        </Routes>
      </Router>
    </>
  );
}

export default App
