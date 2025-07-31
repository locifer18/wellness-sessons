import React, { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });

  // useEffect to load authentication data from localStorage on initial mount
  useEffect(() => {
    try {
      const storedAuthData = localStorage.getItem("auth");
      if (storedAuthData) {
        const parsedAuthData = JSON.parse(storedAuthData);
        setAuth({
          user: parsedAuthData.user,
          token: parsedAuthData.token,
        });
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage:", error);
      localStorage.removeItem("auth");
      setAuth({ user: null, token: "" });
    }
  }, []);

  // IMPORTANT FIX: This useEffect correctly sets/updates the Axios default header
  // whenever the 'auth.token' state changes.
  useEffect(() => {
    if (auth.token) {
      // Set the 'x-auth-token' header, as your backend expects this
      axios.defaults.headers.common["x-auth-token"] = auth.token;
    } else {
      // If no token, remove the header
      delete axios.defaults.headers.common["x-auth-token"];
    }
  }, [auth.token]); // Dependency on auth.token ensures this effect reacts to token changes

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
