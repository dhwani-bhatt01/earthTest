import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import React from "react";
// import ReactDOM from "react-dom/client";
import ReactDOM from "react-dom";
import {
  Route,
  RouterProvider,
  createHashRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { WagmiConfig } from "wagmi";
import Admin from "./Admin";
import BaseAdmin from "./BaseAdmin";
import Home from "./Home";
import Home2 from "./Home2";
import RoutingLayout from "./RoutingLayout";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { chains, config } from "./wagmi";

// const root = ReactDOM.createRoot(
//   document.getElementById("root") as HTMLElement
// );

const router = createHashRouter(
  createRoutesFromElements(
    <Route path="/" element={<RoutingLayout />}>
      <Route index element={<Home />} />
      <Route path="base" element={<Home2 />} />
      <Route path="admin" element={<Admin />} />
      <Route path="baseAdmin" element={<BaseAdmin />} />
    </Route>
  )
);

ReactDOM.render(
  // <React.StrictMode>
  <WagmiConfig config={config}>
    <RainbowKitProvider
      chains={chains}
      theme={lightTheme({
        accentColor: "#63a748",
        accentColorForeground: "white",
        borderRadius: "medium",
        fontStack: "system",
        overlayBlur: "small",
      })}
    >
      <RouterProvider router={router} />
    </RainbowKitProvider>
  </WagmiConfig>,
  // </React.StrictMode>
  document.getElementById("root") as HTMLElement
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
