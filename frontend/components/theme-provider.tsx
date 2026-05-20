"use client";

import { useEffect } from "react";

export default function ThemeProvider() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("app-theme", "light");
    }
  }, []);

  return null;
}