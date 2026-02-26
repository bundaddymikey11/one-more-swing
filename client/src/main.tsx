import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function dismissLoader() {
  const loader = document.getElementById("site-loader");
  if (!loader) return;
  loader.classList.add("loader-hidden");
  loader.addEventListener("transitionend", () => {
    loader.remove();
  }, { once: true });
}

createRoot(document.getElementById("root")!).render(<App />);

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    dismissLoader();
  });
});
