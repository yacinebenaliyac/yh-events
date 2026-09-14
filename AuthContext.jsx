import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const a = localStorage.getItem("account");
    const r = localStorage.getItem("role");
    if (a) setAccount(JSON.parse(a));
    if (r) setRole(r);
  }, []);

  const login = async (identifier, password, role) => {
    const { data } = await api.post("/auth/login", { identifier, password, role });
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", role);
    localStorage.setItem("account", JSON.stringify(data.account));
    setAccount(data.account);
    setRole(role);
    return data;
  };

  const logout = () => {
    localStorage.clear();
    setAccount(null);
    setRole(null);
  };

  return <AuthContext.Provider value={{ account, role, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);