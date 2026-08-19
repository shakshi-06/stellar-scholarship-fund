import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("sc_theme") || "dark"; }
    catch { return "dark"; }
  });

  useEffect(() => {
    // Set on <html> element so html[data-theme="light"] CSS selector works
    const html = document.documentElement;
    if (theme === "light") {
      html.setAttribute("data-theme", "light");
    } else {
      html.removeAttribute("data-theme");
    }
    try { localStorage.setItem("sc_theme", theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
