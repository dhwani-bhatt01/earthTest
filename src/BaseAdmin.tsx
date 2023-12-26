import { ethers } from "ethers";
import earthLpStaking from './abi/EarthLpStaking.sol/EarthLpStaking.json'
import { useSigner } from "wagmi";
import { Toast } from "primereact/toast";
import { useRef } from "react";

function BaseAdmin() {

    const parentStrategyValContract = "0x25ADF247aC836D35be924f4b701A0787A30d46a9";
    const vaultContractList = ["0x55FD5B67B115767036f9e8af569B281A8A544a12", "0xE7C0E6b67b58e36BcAA45c2b783f384555C42d26"];
    const { data: signer } = useSigner();
    const toast = useRef<Toast>(null);

    const showError = (message: string) => {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
    }

    const showSuccess = (message: string) => {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
    }

    const getContract = (address: string, abi: any, provider: any) => {
        return new ethers.Contract(address, abi, provider);
    }

    const startEpochFun = async () => {
        const parentStrategy = getContract(parentStrategyValContract as string, earthLpStaking.abi, signer);
        const startTxt = await parentStrategy.startEpoch(vaultContractList);
        await startTxt.wait().then(async (e: any) => {
            showSuccess("Started");
        }).catch((error: any) => {
            showError("Something went wrong");
        });
    }

    const endEpochFun = async () => {
        const parentStrategy = getContract(parentStrategyValContract as string, earthLpStaking.abi, signer);
        const endTxt = await parentStrategy.endEpoch();
        await endTxt.wait().then(async (e: any) => {
            showSuccess("Ended");
        }).catch((error: any) => {
            showError("Something went wrong");
        });
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="App">
                <header className="App-header">
                <div className="admn_fnt">Admin Panel</div>
                    <div>
                        <div> <button className='btn btn_desgn' onClick={startEpochFun}>Start Epoch</button></div>
                        <div> <button className='btn btn_desgn' onClick={endEpochFun}>End Epoch</button></div>
                    </div>

                </header>
            </div>
        </>

    );
}

export default BaseAdmin;