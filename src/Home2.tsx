import "./App.css";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { baseRPCUrl } from "./constants/global.js";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useNetwork,
  usePublicClient,
  useWalletClient,
  useSwitchNetwork,
} from "wagmi";
import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import earthAutoCompoundingVaultPublicJson from "./abi/EarthAutoCompoundingVaultPublic.sol/EarthAutoCompoundingVaultPublic.json";
import earthLpStaking from "./abi/EarthLpStaking.sol/EarthLpStaking.json";
import Decimal from "decimal.js";
import { Dialog } from "primereact/dialog";
import { TabView, TabPanel } from "primereact/tabview";
import { Toast } from "primereact/toast";
import erc20Json from "./abi/out/ERC20.sol/ERC20.json";
import homeBackGroundImg from "./assets/images/homeBackGround.png";
import supplyImg from "./assets/images/supply.svg";
import timerImg from "./assets/images/timer.svg";
import bostedGreenImg from "./assets/images/bostedGreen.svg";
import bostedRedImg from "./assets/images/bostedRed.svg";
import wETHVaultImg from "./assets/images/wETHVault.svg";
import alertTriangleImg from "./assets/images/alertTriangle.svg";
import { Accordion, AccordionTab } from "primereact/accordion";
import epochImg from "./assets/images/epoch.svg";
import deposit_greenImg from "./assets/images/deposit_green.svg";
import withdraw_greenImg from "./assets/images/withdraw_green.svg";
import rocketAccordianImg from "./assets/images/rocketAccordian.svg";
import flagGreenImg from "./assets/images/flagGreen.svg";
import strategyRedImg from "./assets/images/strategyRed.svg";
import timerRedImg from "./assets/images/timerRed.svg";
import externalLinkRedImg from "./assets/images/external-link-red.svg";
import externalLinkGreenImg from "./assets/images/external-link-green.svg";
import depositRedImg from "./assets/images/depositRed.svg";
import withdrawRedImg from "./assets/images/withdrawRed.svg";
import popupLogoIm from "./assets/images/popupLogo.svg";
import cloudBaseImg from "./assets/images/cloudBase.svg";
import cloud from "./assets/images/cloud.svg";

function Home2() {
  const parentStrategyValContractExplorer =
    "https://goerli.basescan.org/address/0x25adf247ac836d35be924f4b701a0787a30d46a9";
  const parentStrategyValContract =
    "0x25ADF247aC836D35be924f4b701A0787A30d46a9";
  const staticValutList = [
    "0x74C5E75798b33D38abeE64f7EC63698B7e0a10f1",
    "0xe8d223328543Cc10Edaa3292CE12C320CE43A099",
  ];
  const staticLpValut = ["0x6AB8c9590bD89cBF9DCC90d5efEC4F45D5d219be"];
  const [epochRunning, setEpochRunning] = useState<any>();
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonVal = "View Details --->";
  const [isDataLoadng, setIsDataLoadng] = useState(false);
  const [valutList, setvalutList] = useState<any>([]);
  const [lpValutList, setLpValutList] = useState<any>([]);
  const { address, isConnected } = useAccount();
  const provider = usePublicClient();
  const { data: signer, isError, isLoading } = useWalletClient();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const [approvalWaitingVisible, setapprovalWaitingVisible] =
    useState<boolean>(false);
  const [depositWithDrawVisible, setDepositWithDrawVisible] =
    useState<boolean>(false);
  let [depositAmout, setdepositAmout] = useState<any>("0");
  const [maxLimit, setMaxLimit] = useState<any>(null);
  const [isApproved, setisApproved] = useState(false);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const { chain } = useNetwork();
  const switchNetwork = useSwitchNetwork();
  const [transactionType, setTransactionType] = useState("");
  const [isTransactionOnGoing, setIsTransactionOnGoing] = useState(false);
  const [depositWaitingVisible, setdepositWaitingVisible] =
    useState<boolean>(false);
  const [depositSuccessfullVisible, setdepositSuccessfullVisible] =
    useState<boolean>(false);
  const [vaultAddress, setVaultAddress] = useState("");
  const [withdrawAmout, setwithdrawAmout] = useState("0");
  const [approvalSuccessfullVisible, setapprovalSuccessfullVisible] =
    useState<boolean>(false);
  const [userShare, setUserShare] = useState("0");
  const [vaultDetail, setvaultDetail] = useState<any>({});
  const [startingBalance, setStartingBalance] = useState("0");

  useEffect(() => {
    getDeployedValut();
    // getHistoricalData();
  }, [address]);

  const getContract = (address: string, abi: any, provider: any) => {
    return new ethers.Contract(address, abi, provider);
  };

  const getHistoricalData = async () => {
    let headers = new Headers();
    headers.set("Authorization", "Bearer cqt_rQY6pwwVJ8jYkYkDKfW4qQY9PTFH");

    fetch(
      `https://api.covalenthq.com/v1/mantle-testnet/address/${vaultAddress}/transactions_v3/?quote-currency=USD`,
      { method: "GET", headers: headers }
    )
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);

        const output = data.data.items.slice(0, 10).map((e: any) => {
          const time = e.block_signed_at;
          const txhash = e.tx_hash;
          const txfee = e.fees_paid;
          let type = "";
          let value = "";
          if (e.log_events) {
            type = e.log_events[e.log_events.length - 1].decoded.name;

            if (
              e.log_events[e.log_events.length - 1].decoded.name ===
                "Withdraw" ||
              e.log_events[e.log_events.length - 1].decoded.name === "Approval"
            ) {
              const prsVal =
                e.log_events[e.log_events.length - 1].decoded.params;
              value = ethers.formatEther(prsVal[prsVal.length - 1].value);
            } else if (
              e.log_events[e.log_events.length - 1].decoded.name === "Deposit"
            ) {
              const prsVal = e.log_events[0].decoded.params;
              value = ethers.formatEther(prsVal[prsVal.length - 1].value);
            }
          }

          const returnVal = {
            date: time,
            type: type,
            txHash: txhash,
            txfee: ethers.formatEther(txfee),
            value: value,
          };
          return returnVal;
        });
      });
  };

  const getValutDetailsByChain2 = async (
    valultList: string[],
    provider: any
  ) => {
    const valutListVal = await Promise.all(
      valultList?.map(async (vaultAddressVal: any) => {
        let userHolding = "";
        let walletBalance = "";
        console.log("vaultAddress vaultAddress", vaultAddressVal);
        const response = await fetch("/vaultDetails.json");
        const data = await response.json();
        const valutDetailsInJson = data[vaultAddressVal as string];
        const assetAbiResponse = await fetch(
          data[vaultAddressVal as string].assetAbi
        );
        const assetAbiResponseJson = await assetAbiResponse.json();

        const localProvider = new ethers.JsonRpcProvider(baseRPCUrl);
        const vaultContract = getContract(
          vaultAddressVal as string,
          earthAutoCompoundingVaultPublicJson.abi,
          localProvider
        );

        let totalAssets = await vaultContract.totalAssets(); //it will return the total assets of the valut
        totalAssets = ethers.formatEther(totalAssets);

        if (address) {
          let totalSupply = await vaultContract.totalSupply();
          totalSupply = ethers.formatEther(totalSupply);

          const assetAdress = await vaultContract.asset();
          console.log("asset adress: " + assetAdress);
          let share = await vaultContract.balanceOf(address);
          share = ethers.formatEther(share);
          const userShareVal = new Decimal(totalAssets)
            .mul(new Decimal(share))
            .div(new Decimal(totalSupply));
          setUserShare(userShareVal.toFixed(18));
          console.log("your holdning", userShareVal.toFixed(18));
          userHolding = userShareVal.toFixed(2);

          const asstsContract = getContract(
            assetAdress,
            assetAbiResponseJson.abi,
            provider
          );
          const balance = await asstsContract.balanceOf(address);
          console.log("wallet balance", ethers.formatEther(balance));
          console.log("tvl", fnum(totalAssets));
          walletBalance = ethers.formatEther(balance);
          walletBalance = Number(walletBalance).toFixed(2);
          setWalletBalance(ethers.formatEther(balance));
        }

        return {
          contractExplorer: valutDetailsInJson?.contractExplorer,
          name: valutDetailsInJson?.displayName,
          assetImg: valutDetailsInJson?.assetImg,
          assetName: valutDetailsInJson?.denominationAsset,
          chainImg: valutDetailsInJson?.chainImg,
          saftyRating: valutDetailsInJson?.risk?.safetyScore,
          tvlInUsd: 0,
          tvl: totalAssets,
          holding: userHolding,
          walletBalance: walletBalance,
          averageApy: "23.84%",
          valutAddress: vaultAddressVal,
          tvlcapInUsd: 0,
          tvlcap: 0,
          valutApy: 0,
          percentage: 0,
          totalPortfolio: 0,
          totalOverallreturnVal: 0,
          totalAverageApy: 0,
          poweredBy: valutDetailsInJson?.poweredBy,
          isStablePair: valutDetailsInJson?.isStablePair,
          isLSDFarming: valutDetailsInJson?.isLSDFarming,
          isVolatilePair: valutDetailsInJson?.isVolatilePair,
          isLiquidityMining: valutDetailsInJson?.isLiquidityMining,
          isDynamicStrategy: valutDetailsInJson?.isDynamicStrategy,
          vaultApr: valutDetailsInJson?.vaultApr,
        };
      })
    );

    return valutListVal;
  };

  async function getDeployedValut() {
    setIsDataLoadng(true);

    const mantleLocalProvied = new ethers.JsonRpcProvider(baseRPCUrl);

    const parentStrategy = getContract(
      parentStrategyValContract as string,
      earthLpStaking.abi,
      mantleLocalProvied
    );
    const epochRunningVal = await parentStrategy.epochRunning();
    setEpochRunning(epochRunningVal);
    console.log("parentStrategy is running", epochRunningVal);
    const balanceOfPoolVal = await parentStrategy.balanceOfPool();
    const formateBalanceOfPoolVal = ethers.formatEther(balanceOfPoolVal);
    setStartingBalance(Number(formateBalanceOfPoolVal).toFixed(8));
    console.log("balanceOfPoolVal", balanceOfPoolVal);

    //get vault deatils for vault with standard coin(ex:- wETH, USDC)
    const mantleValutList = await getValutDetailsByChain2(
      staticValutList,
      mantleLocalProvied
    );
    setvalutList(mantleValutList);

    //get vault deatils for vault with lp coin
    const mantleDetailValut = await getValutDetailsByChain2(
      staticLpValut,
      mantleLocalProvied
    );
    setLpValutList(mantleDetailValut);

    setLoading(false);
    setIsDataLoadng(false);
  }

  const fnum = (x: any) => {
    if (isNaN(x)) return x;

    if (x < 999) {
      return x;
    }

    if (x < 1000) {
      return (x / 1000).toFixed(2) + "K";
    }

    if (x < 10000) {
      return (x / 1000).toFixed(2) + "K";
    }

    if (x < 100000) {
      return (x / 1000).toFixed(2) + "K";
    }

    if (x < 1000000) {
      return (x / 1000).toFixed(2) + "K";
    }
    if (x < 10000000) {
      return (x / 1000000).toFixed(2) + "M";
    }

    if (x < 1000000000) {
      return Math.round(x / 1000000) + "M";
    }

    if (x < 1000000000000) {
      return Math.round(x / 1000000000) + "B";
    }

    return "1T+";
  };

  const handledepositAmoutChange = (event: any) => {
    let val = event.target.value;
    if (val === "") {
      val = "0";
    }
    const enteredVal = new Decimal(val);
    const mxlmtVal = new Decimal(maxLimit);
    if (enteredVal.gt(mxlmtVal)) {
      setisApproved(false);
    } else {
      setisApproved(true);
    }
    setdepositAmout(event.target.value);
  };

  const networkSwitchHandler = (networkId: number) => {
    (switchNetwork as any).switchNetwork(networkId);
  };

  const showError = (message: string) => {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 3000,
    });
  };

  const showWarn = (header: string, message: string) => {
    toast.current?.show({
      severity: "warn",
      summary: header,
      detail: message,
      life: 3000,
    });
  };

  async function approve(assetsAddress: string) {
    const contract = getContract(assetsAddress, erc20Json.abi, signer);
    try {
      setIsTransactionOnGoing(true);

      const aa = Decimal.pow(10, 18);
      const bb = new Decimal(depositAmout);

      const convertedAmount = bb.mul(aa).toFixed();

      const aprvTxt = await contract.approve(vaultAddress, convertedAmount);
      setapprovalWaitingVisible(true);
      await aprvTxt
        .wait()
        .then(async (e: any) => {
          setDepositWithDrawVisible(false);
          setapprovalWaitingVisible(false);
          setapprovalSuccessfullVisible(true);
          //await checkAllowance();

          setIsTransactionOnGoing(false);
        })
        .catch((error: any) => {
          setIsTransactionOnGoing(false);
          showError("Something went wrong");
        });
    } catch (err: any) {
      console.log("revert reason:", err.message);
    }
  }

  const checkAllowance = async (valutAddressVal: any) => {
    if (depositAmout === "") {
      depositAmout = "0";
    }

    let localProvider = new ethers.JsonRpcProvider(baseRPCUrl);
    let vaultContract = getContract(
      valutAddressVal as string,
      earthAutoCompoundingVaultPublicJson.abi,
      localProvider
    );
    const assetAdress = await vaultContract.asset();

    const erc20Contract = getContract(assetAdress, erc20Json.abi, signer);
    const allowance = await erc20Contract.allowance(address, valutAddressVal); //address:- login user address  //assetAdress:-valut asset address
    setMaxLimit(ethers.formatEther(allowance));

    const maxLimitVal = new Decimal(ethers.formatEther(allowance));
    const despositAmtVal = new Decimal(depositAmout);
    if (despositAmtVal.gt(maxLimitVal)) {
      setisApproved(false);
    } else {
      setisApproved(true);
    }
  };

  const deposit = async () => {
    setTransactionType("Deposit");
    const despositAmtVal = new Decimal(depositAmout);
    const walletBalanceVal = new Decimal(walletBalance);

    // if (despositAmtVal.lt(new Decimal("0.0001"))) {
    //   const message = "Min Limit 0.0001";
    //   showWarn("Warning", message);
    //   return;
    // }

    // if (despositAmtVal.gt(walletBalanceVal)) {
    //   const message = "Insufficient Balance";
    //   showWarn("Warning", message);
    //   return;
    // }

    // if ((Number(deatils.tvl) + Number(depositAmout)) > Number(tvlCap)) {
    //   showWarn("Warning", "Vault Capacity Reached");
    //   return;
    // }

    setIsTransactionOnGoing(true);

    const contract = getContract(
      vaultAddress as string,
      earthAutoCompoundingVaultPublicJson.abi,
      signer
    );

    const aa = Decimal.pow(10, 18);
    const bb = new Decimal(depositAmout);

    const convertedAmount = bb.mul(aa).toFixed();
    //calling the deposit method
    const aprvTxt = await contract.deposit(convertedAmount, address, {
      gasLimit: 800000,
    });
    setdepositWaitingVisible(true);
    await aprvTxt
      .wait()
      .then(async (e: any) => {
        setDepositWithDrawVisible(false);
        setdepositWaitingVisible(false);
        setdepositSuccessfullVisible(true);
        // await checkAllowance();
        setIsTransactionOnGoing(false);
        //await getAllDetails();
      })
      .catch((error: any) => {
        setLoading(false);
        setIsTransactionOnGoing(false);
        showError("Something went wrong");
      });
  };

  const handlewithdrawAmoutChange = (event: any) => {
    setwithdrawAmout(event.target.value);
  };

  const approveIntilize = async () => {
    const contract = getContract(
      vaultAddress as string,
      earthAutoCompoundingVaultPublicJson.abi,
      signer
    );
    const assetAdress = await contract.asset();
    await approve(assetAdress);
  };

  const withdraw = async () => {
    setTransactionType("Withdraw");
    // if (withdrawAmout < 0.0001 || withdrawAmout > Number(userShare)) {
    //   const message = "Please enter a valid amount.";
    //   showWarn(message);
    //   return;
    // }

    const withdrawAmoutVal = new Decimal(withdrawAmout);
    const userHohlding = new Decimal(userShare);

    // if (withdrawAmoutVal.lt(new Decimal("0.0001"))) {
    //   const message = "Min Limit 0.0001";
    //   showWarn("Warning", message);
    //   return;
    // }

    // if (withdrawAmoutVal.gt(userHohlding)) {
    //   const message = "Insufficient Holdings";
    //   showWarn("Warning", message);
    //   return;
    // }

    const contract = getContract(
      vaultAddress as string,
      earthAutoCompoundingVaultPublicJson.abi,
      signer
    );
    const aa = Decimal.pow(10, 18);
    const bb = new Decimal(withdrawAmout);

    const convertedAmount = bb.mul(aa).toFixed();

    setIsTransactionOnGoing(true);
    const aprvTxt = await contract.withdraw(convertedAmount, address, address, {
      gasLimit: 8000000,
    });
    setdepositWaitingVisible(true);
    //setLoading(true);
    await aprvTxt
      .wait()
      .then(async (e: any) => {
        setDepositWithDrawVisible(false);
        setdepositWaitingVisible(false);
        setdepositSuccessfullVisible(true);
        // await checkAllowance();
        //await getAllDetails();
        setIsTransactionOnGoing(false);
        // assetValueUpdate();
      })
      .catch((error: any) => {
        //setLoading(false);
        setIsTransactionOnGoing(false);
        showError("Something went wrong");
      });
  };

  const openWithdrawOrDeposit = async (e: any, index: any) => {
    console.log("ee details", e);
    setvaultDetail(e);
    setVaultAddress(e.valutAddress);
    await checkAllowance(e.valutAddress);
    setDepositWithDrawVisible(true);
    setActiveIndex(index);
  };

  interface CustomTabHeaderProps {
    icon: string;
    title: string;
  }

  const CustomTabHeader: React.FC<CustomTabHeaderProps> = ({ icon, title }) => {
    return (
      <>
        {icon && (
          <img
            src={icon}
            alt="Icon"
            style={{ marginRight: "10px", width: "28px" }}
          />
        )}
        <span>{title}</span>
      </>
    );
  };

  const CustomAccordianHeader1: React.FC<CustomTabHeaderProps> = ({
    icon,
    title,
  }) => {
    return (
      <>
        <div className="dsp mb-4">
          <div>
            {" "}
            {icon && (
              <img
                src={icon}
                alt="Icon"
                style={{ marginRight: "10px", width: "28px" }}
              />
            )}{" "}
            <span className="primary_header_color">{title}</span>{" "}
          </div>
          <div>
            <img
              src={rocketAccordianImg}
              alt="Icon"
              style={{ marginRight: "10px", width: "28px" }}
            />{" "}
            <span className="mr_10">13 August 2023 | 14:35:00 UTC</span>
            <img src={externalLinkGreenImg} alt="externalLink" />
          </div>
          <div>
            <img
              src={flagGreenImg}
              alt="Icon"
              style={{ marginRight: "10px", width: "28px" }}
            />{" "}
            <span className="mr_10">13 August 2023 | 14:37:00 UTC</span>{" "}
            <img src={externalLinkGreenImg} alt="externalLink" />
          </div>
        </div>
        <div className="dsp">
          <div>
            {" "}
            <div className="fnt_wght_500 mb-2">Starting Balance</div>{" "}
            <div>12.32657812 ETH-CLOUD LP</div>
          </div>
          <div>
            {" "}
            <div className="fnt_wght_500 mb-2">Ending Balance </div>{" "}
            <div>12.33567612 ETH-CLOUD LP</div>{" "}
          </div>
          <div>
            {" "}
            <div className="fnt_wght_500 mb-2">Epoch Growth</div>{" "}
            <div className="primary_header_color">0.00%</div>
          </div>
          <div>
            {" "}
            <div className="fnt_wght_500 mb-2">Epoch APR</div>{" "}
            <div className="primary_header_color">0.86%</div>
          </div>
          <div>
            {" "}
            <div className="fnt_wght_500 mb-2">Leverage</div>{" "}
            <div className="primary_header_color">3.2x</div>
          </div>
        </div>
      </>
    );
  };

  const CustomAccordianHeader2: React.FC<CustomTabHeaderProps> = ({
    icon,
    title,
  }) => {
    return (
      <>
        <div className="dsp mb-4">
          <div>
            {" "}
            {icon && (
              <img
                src={icon}
                alt="Icon"
                style={{ marginRight: "10px", width: "28px" }}
              />
            )}{" "}
            <span className="primary_header_color">{title}</span>{" "}
          </div>
          <div>
            <img
              src={rocketAccordianImg}
              alt="Icon"
              style={{ marginRight: "10px", width: "28px" }}
            />{" "}
            <span className="mr_10">12 August 2023 | 22:30:00 UTC</span>
            <img src={externalLinkGreenImg} alt="externalLink" />
          </div>
          <div>
            <img
              src={flagGreenImg}
              alt="Icon"
              style={{ marginRight: "10px", width: "28px" }}
            />{" "}
            <span className="mr_10">13 August 2023 | 1:30:00 UTC</span>{" "}
            <img src={externalLinkGreenImg} alt="externalLink" />
          </div>
        </div>
        <div className="dsp">
          <div>
            {" "}
            <div className="fnt_wght_500 mb-2">Starting Balance</div>{" "}
            <div>20.03301761 ETH-CLOUD LP</div>
          </div>
          <div>
            {" "}
            <div className="fnt_wght_500 mb-2">Ending Balance </div>{" "}
            <div>21.03301761 ETH-CLOUD LP</div>{" "}
          </div>
          <div>
            {" "}
            <div className="fnt_wght_500 mb-2">Epoch Growth</div>{" "}
            <div className="primary_header_color">0.01%</div>
          </div>
          <div>
            {" "}
            <div className="fnt_wght_500 mb-2">Epoch APR</div>{" "}
            <div className="primary_header_color">0.89%</div>
          </div>
          <div>
            {" "}
            <div className="fnt_wght_500 mb-2">Leverage</div>{" "}
            <div className="primary_header_color">3.3x</div>
          </div>
        </div>
      </>
    );
  };

  const goToUrl = (url: any) => {
    window.open(url, "_blank");
  };

  return (
    <>
      <Toast ref={toast} />
      {loading ? (
        <>
          <div className="loader-container">
            <div className="spinner"></div>
          </div>
        </>
      ) : (
        <>
          <div className="custom-container notMobileDevice">
            <div
              className="second_section outer_section_first mb-4 mt-4"
              style={{ backgroundImage: `url("${homeBackGroundImg}")` }}
            >
              <div className="dsp_cont">
                <div className="wdth_40">
                  <div className="holding_header_inner mb-2">
                    Interest rate swap vaults
                  </div>
                  <div className="mb-3 opct_61">
                    Risk-shared liquidity for DeFi LP Pools
                  </div>
                </div>
              </div>
            </div>
            <div className="second_section outer_section_first mb-4">
              <div className="dsp_cont">
                {/* <div>
                <span className='opct_61'>Built on</span> <br />
                <img src={baseDexImg} alt='chain' />
              </div> */}

                <div>
                  <span className="ml_12 opct_61">DEX</span>
                  <br />
                  <img src={cloudBaseImg} alt="chain" />
                </div>

                <div>
                  <span className="opct_61"> Liquidity Pool</span>
                  <br />
                  <span className="fnt_wgt_600">ETH-CLOUD LP</span>
                </div>
                <div>
                  <span className="opct_61">Pool TVL</span>
                  <br />{" "}
                  <span className="primary_header_color fnt_wgt_600">
                    $2.3M
                  </span>
                </div>
                <div>
                  <span className="opct_61">Pool APR</span>
                  <br />{" "}
                  <span className="primary_header_color fnt_wgt_600">
                    15.36 %
                  </span>
                </div>
              </div>
            </div>

            {epochRunning ? (
              <>
                <div className="second_section outer_section_first mb-4">
                  <div className="dsp mb-4">
                    <div className="wdth_50 d-flex align-items-center">
                      <div className="mr_20 redCircle">
                        <img
                          src={strategyRedImg}
                          alt="chain"
                          className="wdth_35"
                        />
                      </div>
                      <div>
                        <span className="clsHeaderColor">
                          Strategy is active now
                        </span>
                        <img
                          src={externalLinkRedImg}
                          onClick={() => {
                            goToUrl(parentStrategyValContractExplorer);
                          }}
                          alt="externalLinkRedImg"
                          className="extrImgWth crsr_pntr"
                        />
                        <br />
                        <span className="opct_61 mr_15">
                          Vaults are locked for new deposits & withdrawals. You
                          can supply more assets or redeem your positions at the
                          end of the current epoch.
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="closeRedBox">
                        <span className="opct_61">Epoch closes on</span>{" "}
                        <img src={timerRedImg} alt="chain" />{" "}
                        <span>30 September 2023 | 16:30:00</span>
                      </div>
                    </div>
                  </div>
                  <div className="dsp">
                    <div>
                      {" "}
                      <div>Strategy LP Balance</div>{" "}
                      <div className="fnt_wgt_600">
                        {startingBalance} ETH-CLOUD LP{" "}
                      </div>
                    </div>
                    <div>
                      {" "}
                      <div>Overall Gain</div>{" "}
                      <div className="fnt_wgt_600">2.32 ETH-CLOUD LP</div>{" "}
                    </div>
                    <div>
                      {" "}
                      <div>Overall Return</div>{" "}
                      <div className="fnt_wgt_600 primary_header_color">
                        1.02%
                      </div>
                    </div>
                    <div>
                      {" "}
                      <div>Current APR</div>{" "}
                      <div className="fnt_wgt_600 primary_header_color">
                        18.23%
                      </div>
                    </div>
                    <div>
                      {" "}
                      <div>Leverage</div>{" "}
                      <div className="fnt_wgt_600 primary_header_color">
                        3.2x
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="second_section outer_section_first mb-4">
                  <div className="dsp">
                    <div className="wdth_50 d-flex align-items-center">
                      <div className="mr_20 greenCircle">
                        <img src={supplyImg} alt="chain" className="wdth_35" />
                      </div>
                      <div>
                        <span className="primary_header_color">
                          Vaults are available now
                        </span>
                        <br />
                        <span className="opct_61 mr_15">
                          You can supply more assets or redeem your positions
                          now. Deposits & withdrawals will be locked once the
                          epoch is running.
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="firstGreenBox">
                        <span className="opct_61">Epoch starts on </span>{" "}
                        <img src={timerImg} alt="chain" />{" "}
                        <span>1 October 2023 | 16:30:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="bstd_sectiopn">
              <div className="dsp_cont">
                <div className="bx_cntn firstGreenBoxBoosted primary_header_color sbHrd">
                  <img src={bostedGreenImg} className="mr_10" alt="green" />
                  Fixed return for low risk investors
                </div>
                <div className="bx_cntn firstRedBoxBoosted secondary_header_color sbHrd">
                  <img src={bostedRedImg} className="mr_10" alt="red" />
                  Boosted return for market-makers
                </div>
              </div>
            </div>

            <div className="second_section row mb-1">
              {/* <h4 className='valut_header'>Vaults</h4> */}

              <div className="wdth_50">
                {valutList.map((e: any, index: any) => {
                  return (
                    <div key={index}>
                      <div className="first_section outer_section mb-4">
                        {/* <div className="small-home-div-3"></div> */}
                        <div className="dsp">
                          <div className="header_font_size">
                            <span>
                              <img
                                src={e.assetImg}
                                alt="btc img"
                                className="btc_img_width"
                              />
                            </span>
                            {e.name}{" "}
                            <img
                              src={externalLinkGreenImg}
                              onClick={() => {
                                goToUrl(e.contractExplorer);
                              }}
                              alt="externalLink"
                              className="crsr_pntr"
                            />
                          </div>
                          <div>
                            <span className="mr_15 opct_61">Fixed APR </span>
                            <span className="firstGreenBox ">{e.vaultApr}</span>
                          </div>
                        </div>

                        <div className="dsp mb-3 mt-3">
                          <div>
                            <span className="opct_61">Vault TVL</span> <br />{" "}
                            <span className="holding_val">
                              {Number(e.tvl).toFixed(8)} {e.assetName}
                            </span>
                          </div>
                          <div>
                            <span className="opct_61">My Balance</span> <br />{" "}
                            <span>
                              {Number(e?.holding).toFixed(8)} {e.assetName}
                            </span>
                          </div>
                        </div>
                        <div className="dsp_around mb-2 mt-4">
                          {isConnected ? (
                            <>
                              {/* <div><a className='btn btn-riv-secondary view_btn_wdth' href={`#/vault/${e.valutAddress}`}>{buttonVal}</a></div> */}
                              <div className="wdth_50">
                                <button
                                  disabled={epochRunning}
                                  className="btn btn_desgn"
                                  onClick={() => {
                                    openWithdrawOrDeposit(e, 0);
                                  }}
                                >
                                  <img
                                    src={deposit_greenImg}
                                    className="wtdrw_depost_btn"
                                    alt="deposit"
                                  />
                                  Depost
                                </button>
                              </div>
                              <div className="wdth_50">
                                <button
                                  disabled={epochRunning}
                                  className="btn btn_desgn"
                                  onClick={() => {
                                    openWithdrawOrDeposit(e, 1);
                                  }}
                                >
                                  <img
                                    src={withdraw_greenImg}
                                    className="wtdrw_depost_btn"
                                    alt="deposit"
                                  />{" "}
                                  Withdraw
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="d-flex justify-content-center">
                                <ConnectButton />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="wdth_50">
                {lpValutList.map((e: any, index: any) => {
                  return (
                    <div key={index}>
                      <div className="first_section outer_section_red">
                        {/* <div className="small-home-div-3"></div> */}
                        <div className="dsp">
                          <div className="header_font_size">
                            <span>
                              <img
                                src={wETHVaultImg}
                                alt="btc img"
                                className="btc_img_width"
                              />
                              <img
                                src={cloud}
                                alt="btc img"
                                className="btc_img_width ml_20_neg"
                              />
                            </span>
                            {e.name}{" "}
                            <img
                              src={externalLinkRedImg}
                              onClick={() => {
                                goToUrl(e.contractExplorer);
                              }}
                              alt="externalLink"
                              className="crsr_pntr"
                            />
                          </div>
                          <div>
                            <span className="mr_15 opct_61">Overall APR </span>{" "}
                            <span className="firstRedBox">19.23%</span>
                          </div>
                        </div>

                        <div className="dsp mb-3 mt-3">
                          <div>
                            <span className="opct_61">Vault TVL</span> <br />{" "}
                            <span className="holding_val_red">
                              {Number(e.tvl).toFixed(8)} {e.assetName}
                            </span>
                          </div>
                          <div>
                            <span className="opct_61">My Balance</span> <br />{" "}
                            <span>
                              {Number(e?.holding).toFixed(8)} {e.assetName}
                            </span>
                          </div>
                        </div>

                        <div className="redBox mb-3">
                          <div className="dsp mb-3">
                            <div className="wdth_50">
                              <span className="opct_61">
                                Available for borrow
                              </span>{" "}
                              <br />{" "}
                              <span className="fnt_wgt_600">
                                {Number(valutList[0].tvl).toFixed(8)}{" "}
                                {valutList[0].assetName} <br />{" "}
                                {Number(valutList[1].tvl).toFixed(8)}{" "}
                                {valutList[1].assetName}{" "}
                              </span>{" "}
                            </div>
                            <div>
                              <span className="opct_61">
                                Available Collateral
                              </span>{" "}
                              <br />{" "}
                              <span className="fnt_wgt_600">
                                {Number(e.tvl).toFixed(8)} {e.assetName}
                              </span>{" "}
                            </div>
                          </div>
                          <div className="dsp mb-3">
                            <div>
                              <span className="opct_61">
                                Projected Leverage
                              </span>{" "}
                              <br /> <span className="fnt_wgt_600">3.2x</span>{" "}
                            </div>
                            <div>
                              <span className="opct_61">
                                Max Allowed Leverage
                              </span>{" "}
                              <br /> <span className="fnt_wgt_600">4x</span>{" "}
                            </div>
                          </div>
                          <div className="dsp">
                            <div>
                              <span className="opct_61">Projected APR</span>{" "}
                              <br />{" "}
                              <span className="fnt_wgt_600"> 32.6% </span>
                              <span className="base_fnt">
                                Based on Current Pool APR
                              </span>
                            </div>
                            <div></div>
                          </div>
                        </div>

                        <div className="dsp_around mb-2">
                          {isConnected ? (
                            <>
                              {/* <div><a className='btn btn-riv-secondary view_btn_wdth' href={`#/vault/${e.valutAddress}`}>{buttonVal}</a></div> */}
                              <div className="wdth_50">
                                <button
                                  disabled={epochRunning}
                                  className="btn btn_desgn_red"
                                  onClick={() => {
                                    openWithdrawOrDeposit(e, 0);
                                  }}
                                >
                                  <img
                                    src={depositRedImg}
                                    className="wtdrw_depost_btn"
                                    alt="deposit"
                                  />
                                  Depost
                                </button>
                              </div>
                              <div className="wdth_50">
                                <button
                                  disabled={epochRunning}
                                  className="btn btn_desgn_red"
                                  onClick={() => {
                                    openWithdrawOrDeposit(e, 1);
                                  }}
                                >
                                  <img
                                    src={withdrawRedImg}
                                    className="wtdrw_depost_btn"
                                    alt="deposit"
                                  />
                                  Withdraw
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="d-flex justify-content-center">
                                <ConnectButton />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="second_section outer_section_first_red mb-5">
              <div className="dsclmr_section">
                <div className="mr_10">
                  <img src={alertTriangleImg} className="wdth_35" alt="alert" />
                </div>
                <div>
                  <span>Disclaimer:</span> Fixed APR is not risk-free APR. Funds
                  of fixed-return vaults are borrowed for leveraged yield
                  mining. All vaults are susceptible to protocol risks &
                  strategy failure risks.
                </div>
                <div>
                  {/* Epoch starts on   <img src={timerImg} alt='chain' /> <span>4 August 2023 | 12:30:00</span> */}
                </div>
              </div>
            </div>

            <div className="m10 mb-5">
              <div className="epch_text">Epoch History</div>
              <Accordion activeIndex={0}>
                <AccordionTab
                  header={
                    <CustomAccordianHeader1
                      icon={epochImg}
                      title="Epoch was live for 2 minutes"
                    />
                  }
                >
                  <div className="dsp wdth_100">
                    <div>
                      {" "}
                      <div>Collateral Deposited</div>{" "}
                      <div>5.23 ETH-CLOUD LP </div>
                    </div>
                    <div>
                      {" "}
                      <div>Overall Return</div> <div>0.34 ETH-CLOUD LP</div>{" "}
                    </div>
                    <div>
                      {" "}
                      <div>Net Growth</div> <div>3.6%</div>
                    </div>
                    <div>
                      {" "}
                      <div>Net APR</div> <div>43.6%</div>
                    </div>
                    <div>
                      {" "}
                      <div>Leverage</div> <div>3.3x</div>
                    </div>
                  </div>
                  <hr />
                  <div className="dsp wdth_100">
                    <div>
                      {" "}
                      <div>Borrowed Liquidity</div>{" "}
                      <div>
                        80.23 ETH <br />
                        180,000 CLOUD{" "}
                      </div>
                    </div>
                    <div>
                      {" "}
                      <div>Overall Return</div>{" "}
                      <div>
                        0.56 ETH
                        <br />
                        1,092 CLOUD
                      </div>{" "}
                    </div>
                    <div>
                      {" "}
                      <div>Net Growth</div>{" "}
                      <div>
                        0.2 %<br />
                        0.4 %
                      </div>
                    </div>
                    <div>
                      {" "}
                      <div>Net APR</div>{" "}
                      <div>
                        5 %<br />
                        10 %
                      </div>
                    </div>
                    <div className="wdth4">
                      {" "}
                      <div></div> <div></div>
                    </div>
                  </div>
                </AccordionTab>
                <AccordionTab
                  header={
                    <CustomAccordianHeader2
                      icon={epochImg}
                      title="Epoch was live for 8 hours"
                    />
                  }
                >
                  <div className="dsp wdth_100">
                    <div>
                      {" "}
                      <div>Collateral Deposited</div>{" "}
                      <div>7.23 ETH-CLOUD LP </div>
                    </div>
                    <div>
                      {" "}
                      <div>Overall Return</div> <div>0.34 ETH-CLOUD LP</div>{" "}
                    </div>
                    <div>
                      {" "}
                      <div>Net Growth</div> <div>3.6%</div>
                    </div>
                    <div>
                      {" "}
                      <div>Net APR</div> <div>43.6%</div>
                    </div>
                    <div>
                      {" "}
                      <div>Leverage</div> <div>3.3x</div>
                    </div>
                  </div>
                  <hr />
                  <div className="dsp wdth_100">
                    <div>
                      {" "}
                      <div>Borrowed Liquidity</div>{" "}
                      <div>
                        100.23 ETH <br />
                        200,000 CLOUD{" "}
                      </div>
                    </div>
                    <div>
                      {" "}
                      <div>Overall Return</div>{" "}
                      <div>
                        0.56 ETH
                        <br />
                        1,092 CLOUD
                      </div>{" "}
                    </div>
                    <div>
                      {" "}
                      <div>Net Growth</div>{" "}
                      <div>
                        0.2 %<br />
                        0.4 %
                      </div>
                    </div>
                    <div>
                      {" "}
                      <div>Net APR</div>{" "}
                      <div>
                        5 %<br />
                        10 %
                      </div>
                    </div>
                    <div className="wdth4">
                      {" "}
                      <div></div> <div></div>
                    </div>
                  </div>
                </AccordionTab>
                {/* <AccordionTab header={<CustomAccordianHeader icon={epochImg} title="Epoch was live for 7 days" />}>
                <div className='dsp wdth_100'>
                  <div> <div>Starting Balance</div> <div>18.34 wETH-USDC LP </div></div>
                  <div> <div>Overall  Return</div>  <div>2.46 wETH-USDC LP</div> </div>
                  <div> <div>Epoch Growth</div>  <div>2.23%</div></div>
                  <div> <div>Epoch APR</div>  <div>26.32%</div></div>
                  <div> <div>Leverage</div>  <div>4.3x</div></div>
                </div>
                <hr />
                <div className='dsp wdth_100'>
                  <div> <div>Starting Balance</div> <div>18.34 wETH-USDC LP </div></div>
                  <div> <div>Overall  Return</div>  <div>2.46 wETH-USDC LP</div> </div>
                  <div> <div>Epoch Growth</div>  <div>2.23%</div></div>
                  <div> <div>Epoch APR</div>  <div>26.32%</div></div>
                  <div> <div>Leverage</div>  <div>4.3x</div></div>
                </div>
              </AccordionTab> */}
              </Accordion>
            </div>
          </div>
          <div className="mobileDevice text-center">
            You need a laptop/desktop to access this app
          </div>
        </>
      )}

      <Dialog
        visible={depositWithDrawVisible}
        style={{ width: "30vw" }}
        onHide={() => setDepositWithDrawVisible(false)}
      >
        <div className="second_section outer_section pos_sticky">
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
          >
            <TabPanel
              header={
                <CustomTabHeader icon={deposit_greenImg} title="Deposit" />
              }
            >
              <div className="mt-3">
                <div className="dsp backGrd mb-3">
                  {/* <div className='fnt_wgt_600'><img src={deatils?.assetImg} className='wdth_50' alt='usdt' /> <br /> {deatils?.assetName}</div> */}
                  <div className="fnt_wgt_600"> {vaultDetail?.assetName}</div>
                  <div>
                    <input
                      type="number"
                      id="first_name"
                      name="first_name"
                      value={depositAmout}
                      onChange={handledepositAmoutChange}
                    />
                    {/* <button className='btn mxBtn' onClick={updateDepositMax}>Max</button> */}
                  </div>
                </div>
                <div className="dsp">
                  <div>Wallet balance</div>
                  {/* <div>{Number(walletBalance).toFixed(2)} {deatils?.assetName}</div> */}
                  <div>
                    {vaultDetail?.walletBalance} {vaultDetail?.assetName}
                  </div>
                </div>
                <div className="dsp">
                  <div className="buy_cake mt-1 mb-2">
                    {/* <a target='_blank' href={deatils?.buyToken} className='clr_prpl'>Buy ${deatils?.assetName}</a> */}
                    <a target="_blank" href="#" className="clr_prpl">
                      Buy ${vaultDetail?.assetName}
                    </a>
                  </div>
                </div>
                {/* <hr />
                <div className='dsp'>
                  <div>Performance Fee</div>
                  <div>15.00%</div>
                </div>
                <div className='dsp'>
                  <div>Exit Fee</div>
                  <div>1.00%</div>
                </div> */}
                <div className="mt-3 text-center">
                  {/* {isConnected ? isWhiteListed ?
                          (chain as any)?.id !== Number(valutJsonData?.id) ?
                            <button className='btn btn-riv-primary wdth_100' onClick={() => { networkSwitchHandler(Number(valutJsonData?.id)) }} >Switch to {valutJsonData?.chainname}</button>
                            : isApproved ? <button className='btn btn-riv-primary wdth_100' onClick={deposit} disabled={isTransactionOnGoing}>Deposit</button>
                              : <button className='btn btn-riv-primary wdth_100' onClick={approveIntilize} disabled={isTransactionOnGoing}>Approve</button> : <>
                            <div>
                              <div className='mb-1'>Whitelist your address to proceed.</div>
                              <button className='btn btn-riv-primary wdth_100' onClick={gotoDiscord}>Get Whitelisted</button>
                            </div>
                          </> :
                          <>
                            <div className='d-flex justify-content-center'><ConnectButton /></div>
                          </>} */}

                  {isConnected ? (
                    (chain as any)?.id !== Number("84531") ? (
                      <button
                        className="btn btn-riv-primary wdth_100"
                        onClick={() => {
                          networkSwitchHandler(Number("84531"));
                        }}
                      >
                        Switch to Base Goerli (ETH)
                      </button>
                    ) : isApproved ? (
                      <button
                        className="btn btn-riv-primary wdth_100"
                        onClick={deposit}
                        disabled={isTransactionOnGoing}
                      >
                        {" "}
                        Deposit
                      </button>
                    ) : (
                      <button
                        className="btn btn-riv-primary wdth_100"
                        onClick={approveIntilize}
                        disabled={isTransactionOnGoing}
                      >
                        Approve
                      </button>
                    )
                  ) : (
                    <>
                      <div className="d-flex justify-content-center">
                        <ConnectButton />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabPanel>
            <TabPanel
              header={
                <CustomTabHeader icon={withdraw_greenImg} title="Withdraw" />
              }
            >
              <div className="mt-3">
                <div className="dsp backGrd mb-3">
                  {/* <div className='fnt_wgt_600'><img src={deatils?.assetImg} className='wdth_50' alt='usdt' /> <br /> {deatils?.assetName}</div> */}
                  <div className="fnt_wgt_600">{vaultDetail?.assetName}</div>
                  <div>
                    <input
                      type="number"
                      id="first_name_2"
                      name="first_name_2"
                      value={withdrawAmout}
                      onChange={handlewithdrawAmoutChange}
                    />
                    {/* <button className='btn mxBtn' onClick={updateWithdrawMax}>Max</button> */}
                  </div>
                </div>
                <div className="dsp">
                  <div>Portfolio balance</div>
                  {/* <div>{Number(walletBalance).toFixed(2)} {deatils?.assetName}</div> */}
                  <div>
                    {Number(vaultDetail?.holding).toFixed(8)}{" "}
                    {vaultDetail?.assetName}
                  </div>
                </div>
                <div className="dsp">
                  <div className="buy_cake mt-1 mb-2">
                    {" "}
                    <a target="_blank" href="#" className="clr_prpl">
                      Buy ${vaultDetail?.assetName}{" "}
                    </a>
                  </div>
                </div>
                {/* <hr />
                <div className='dsp'>
                  <div>Performance Fee</div>
                  <div>15.00%</div>
                </div>
                <div className='dsp'>
                  <div>Exit Fee</div>
                  <div>1.00%</div>
                </div> */}
                <div className="mt-3 text-center">
                  {/* {isConnected  ?
                          (chain as any)?.id !== Number(valutJsonData?.id) ?
                            <button className='btn btn-riv-primary wdth_100' onClick={() => { networkSwitchHandler(Number(valutJsonData?.id)) }} >Switch to {valutJsonData?.chainname}</button>
                            : <button className='btn btn-riv-primary wdth_100' disabled={isTransactionOnGoing} onClick={withdraw}>Withdraw</button>
                          :
                          <>

                            <div className='d-flex justify-content-center'><ConnectButton /></div>
                          </>} */}

                  {isConnected ? (
                    (chain as any)?.id !== Number("84531") ? (
                      <button
                        className="btn btn-riv-primary wdth_100"
                        onClick={() => {
                          networkSwitchHandler(Number("84531"));
                        }}
                      >
                        Switch to Base Goerli (ETH)
                      </button>
                    ) : (
                      <button
                        className="btn btn-riv-primary wdth_100"
                        disabled={isTransactionOnGoing}
                        onClick={withdraw}
                      >
                        Withdraw
                      </button>
                    )
                  ) : (
                    <>
                      <div className="d-flex justify-content-center">
                        <ConnectButton />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </Dialog>

      <Dialog
        visible={approvalWaitingVisible}
        style={{ width: "30vw" }}
        onHide={() => setapprovalWaitingVisible(false)}
      >
        <div className="text-center mb-5">
          <img src={popupLogoIm} alt="chain" className="gif_wdth" />
          <div className="header_font_size">Waiting for Approval</div>
          <div>Transaction is pending on blockchain.</div>
        </div>
      </Dialog>
      <Dialog
        visible={approvalSuccessfullVisible}
        style={{ width: "30vw" }}
        onHide={() => setapprovalSuccessfullVisible(false)}
      >
        <div className="text-center mb-5">
          <img src={popupLogoIm} alt="chain" className="gif_success_wdth" />
          <div className="header_font_size">Approval Successful</div>
          <div>Awesome! Please continue to deposit. </div>
        </div>
      </Dialog>

      <Dialog
        visible={depositWaitingVisible}
        style={{ width: "30vw" }}
        onHide={() => setdepositWaitingVisible(false)}
      >
        <div className="text-center mb-5">
          <img src={popupLogoIm} alt="chain" className="gif_wdth" />
          <div className="header_font_size">Waiting for {transactionType}</div>
          <div>Transaction is pending on blockchain.</div>
        </div>
      </Dialog>

      <Dialog
        visible={depositSuccessfullVisible}
        style={{ width: "30vw" }}
        onHide={() => setdepositSuccessfullVisible(false)}
      >
        <div className="text-center mb-5">
          <img src={popupLogoIm} alt="chain" className="gif_success_wdth" />
          <div className="header_font_size">{transactionType} Successful</div>
          {transactionType === "Withdraw" ? (
            <></>
          ) : (
            <div>Great! You are invested now.</div>
          )}
        </div>
      </Dialog>
    </>
  );
}

export default Home2;
