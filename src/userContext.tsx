import React, { createContext, useContext, useState, ReactNode } from "react";
import { ACAD_ME_URL } from "@/env";

interface User {
  username: string;
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
}

interface UserContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (username: string, password: string) => {
    const response = await fetch(ACAD_ME_URL + "/iam/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    setUser(() => {
      const newuser = {
        username: username,
        accessToken: data.data?.access_token,
        refreshToken: data.data?.refresh_token,
        role: data.data?.role,
      };
      localStorage.setItem("user", JSON.stringify(newuser));
      return newuser;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const refresh = async () => {
    if (user?.refreshToken) {
      try {
        const response = await fetch("ACAD_ME_URL/iam/refresh/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: user.refreshToken }),
        });

        if (!response.ok) {
          throw new Error("Token refresh failed");
        }

        const data = await response.json();
        setUser({
          ...user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      } catch (error) {
        console.error("Error during token refresh:", error);
        logout();
      }
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, refresh }}>
      {children}
    </UserContext.Provider>
  );
};
