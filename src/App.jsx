import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Add these later when pages are ready */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
