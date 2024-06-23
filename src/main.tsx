import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layout.tsx";
import { UserProvider } from "./userContext.tsx";
import AuthPage from "./Auth.tsx";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider.tsx";
import ErrorPage from "./ErrorPage.tsx";
import CoursePage from "./coursepage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <AuthPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/courses/:id",
    element: <CoursePage />,
    errorElement: <ErrorPage />
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark">
      <UserProvider>
        <Layout>
          <RouterProvider router={router} />
        </Layout>
      </UserProvider>
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>
);
