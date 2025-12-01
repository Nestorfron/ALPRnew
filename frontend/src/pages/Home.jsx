import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";






const Home = () => {
  const { usuario } = useAppContext();

  
  return (
    <div>
      <h1>Bienvenido</h1>
    </div>
  );
};

export default Home;
