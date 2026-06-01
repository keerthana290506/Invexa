import { createContext, useEffect, useState } from "react";
import axiosInstance from "../api/axios";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [authLoading, setAuthLoading] = useState(false);

  const isAuthenticated = !!user;

  /* LOAD USER */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("invexa_token");

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axiosInstance.get("/api/auth/me");

        console.log("ME RESPONSE:", res);

        // backend sends { success, data }
        setUser(res.data);

      } catch (error) {
        console.error("LOAD USER ERROR:", error);

        localStorage.removeItem("invexa_token");

        setUser(null);

      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /* LOGIN */
  const login = async (credentials) => {
  try {
    setAuthLoading(true);

    const res = await axiosInstance.post("/api/auth/login", credentials);

    console.log("LOGIN RESPONSE:", res);

    const userData = res.data ? res.data : res;

    localStorage.setItem(
      "invexa_token",
      userData.token
    );

    setUser(userData);

    return {
      success: true,
    };

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return {
      success: false,
      message: error.message,
    };

  } finally {
    setAuthLoading(false);
  }
};

  /* REGISTER */
  const register = async (payload) => {
  try {
    setAuthLoading(true);

    const res = await axiosInstance.post("/api/auth/register", payload);

    console.log("REGISTER RESPONSE:", res);

    const userData = res;

    localStorage.setItem(
      "invexa_token",
      userData.token
    );

    setUser(userData);

    return {
      success: true,
    };

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return {
      success: false,
      message: error.message,
    };

  } finally {
    setAuthLoading(false);
  }
};

  /* LOGOUT */
  const logout = () => {
    localStorage.removeItem("invexa_token");

    setUser(null);

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        authLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;