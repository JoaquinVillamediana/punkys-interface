import { Route, Routes } from "react-router-dom";
import Home from "./views/home/index.js";
import MainLayout from "./layouts/main";
import Punks from "./views/punks/index.js";
import Punk from "./views/punk/index.js";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/punks" element={<Punks />} />
        <Route path="/punks/:tokenId" element={<Punk />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
