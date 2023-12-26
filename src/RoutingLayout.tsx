import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menubar } from "primereact/menubar";
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useWalletClient } from "wagmi";
import "./App.css";
import logoImg from "./assets/images/logo.png";

function RoutingLayout() {
  const { data: signer, isError, isLoading } = useWalletClient();
  const navigate = useNavigate();
  function navigateToPage(string: any) {
    navigate(string);
  }

  const items = [
    {
      label: "Dashboard",
      // icon: 'pi pi-fw pi-file',
      command: () => {
        navigateToPage("/");
      },
    },
  ];
  const start = (
    <img
      alt="logo"
      src={logoImg}
      height="40"
      className="mr-2 crsr_pntr"
      onClick={() => {
        navigateToPage("/");
      }}
    ></img>
  );
  const end = <ConnectButton />;

  const endButton = (
    <>
      <div className="d-flex">
        <div>{end}</div>
      </div>{" "}
    </>
  );

  return (
    <>
      <div className="card bg_gray">
        <Menubar start={start} end={endButton} className="custom-container" />
      </div>
      <div className="main">
        <Outlet />
      </div>
    </>
  );
}

export default RoutingLayout;
