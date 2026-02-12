import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Auth from "./Auth";
import Chatbot from "./Chatbot";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/chatbot" element={<Chatbot />} />
      </Routes>
    </Router>
  );
}