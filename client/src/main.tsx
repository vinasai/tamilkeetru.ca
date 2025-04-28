import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Daily Mirror inspired colors to Tailwind
document.documentElement.style.setProperty('--primary', '227 6% 19%');
document.documentElement.style.setProperty('--primary-foreground', '210 40% 98%');
document.documentElement.style.setProperty('--secondary', '0 84% 45%');
document.documentElement.style.setProperty('--secondary-foreground', '210 40% 98%');
document.documentElement.style.setProperty('--accent', '25 95% 53%');
document.documentElement.style.setProperty('--accent-foreground', '0 0% 100%');

// Fonts
const fontRoboto = document.createElement('link');
fontRoboto.rel = 'stylesheet';
fontRoboto.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Condensed:wght@400;700&display=swap';
document.head.appendChild(fontRoboto);

// Font Awesome icons
const fontAwesome = document.createElement('link');
fontAwesome.rel = 'stylesheet';
fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
document.head.appendChild(fontAwesome);

createRoot(document.getElementById("root")!).render(<App />);
