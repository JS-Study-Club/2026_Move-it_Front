import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { GlobalStyle, AppContainer } from "./App.styles";

import Lee from "./routes/Lee";
import Yun from "./routes/Yun";

const router = createBrowserRouter([
  ...Yun,
  ...Lee,
  {
    path: "/*",
    element: <div>잘못된 페이지입니다.</div>,
  },
]);

export default function App() {
  function setScreenSize() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
  useEffect(() => {
    setScreenSize();

    window.addEventListener("resize", setScreenSize);
    return () => window.removeEventListener("resize", setScreenSize);
  }, []);

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <RouterProvider router={router} />
      </AppContainer>
    </>
  );
}
