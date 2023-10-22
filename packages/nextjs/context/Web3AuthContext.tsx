import { PropsWithChildren, useState } from "react";
import { createCtx } from ".";
import { Plan } from "./Types";
import { Web3Provider } from "@ethersproject/providers";
import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";
import { subsContract as rawContract } from "~~/public/artifacts";
import { BotblockMarket } from "~~/types/typechain-types";

const CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
const SUBS_CONTRACT_ADDRESS = "0xD07ee34Ad20F50861ff4A72D09677F42af6E933f";

// State variables only
type Web3AuthContextState = {
  web3Auth: Web3Auth;
  provider?: Web3Provider;
  isConnected?: boolean;
  address?: string;
  username?: string;
  email?: string;
  subsContract?: BotblockMarket;
  connectedSubsContract?: BotblockMarket;
  plan?: Plan;
};

// This interface differentiates from State
// because it holds any other option or fx
// that handle the state in some way
interface Web3AuthContext extends Web3AuthContextState {
  connectWeb3Auth: () => Promise<void>;
  disconnectWeb3Auth: () => Promise<void>;
  getPlans: () => Promise<Plan[] | undefined>;
  initProvider: () => Promise<void>;
  initWeb3Auth: () => Promise<void>;
  setPlanData: (plan: Plan) => void;
}

// TODO make so that the user can switch chains
const INITIAL_STATE: Web3AuthContextState = {
  web3Auth: new Web3Auth({
    clientId: CLIENT_ID ?? "",
    web3AuthNetwork: "sapphire_devnet", // Web3Auth Network
    chainConfig: {
      chainNamespace: "eip155",
      chainId: "0x66eed",
      rpcTarget: "https://goerli-rollup.arbitrum.io/rpc",
      displayName: "Arbitrum Goerli",
      blockExplorer: "https://goerli.arbiscan.io/",
      ticker: "ETH",
      tickerName: "Arbitrum Goerli Ether",
    },
  }),
};

const [useContext, Web3AuthContextProvider] = createCtx<Web3AuthContext>("Web3AuthContext");

export const Web3AuthProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<Web3AuthContextState>(INITIAL_STATE);

  const initWeb3Auth = async () => {
    await state?.web3Auth.initModal();
  };

  const initProvider = async () => {
    const provider = new ethers.providers.JsonRpcProvider("https://goerli-rollup.arbitrum.io/rpc");
    const subsContract = new ethers.Contract(SUBS_CONTRACT_ADDRESS, rawContract.abi, provider) as BotblockMarket;
    setState(prevState => ({ ...prevState, subsContract }));
  };

  const connectWeb3Auth = async () => {
    const web3authProvider = await state.web3Auth.connect();
    const userInfo = await state.web3Auth.getUserInfo();
    if (!web3authProvider) return;
    const provider = new ethers.providers.Web3Provider(web3authProvider);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const subsContract = new ethers.Contract(SUBS_CONTRACT_ADDRESS, rawContract.abi, signer) as BotblockMarket;
    const connectedSubsContract = subsContract.connect(signer);
    setState(prevState => ({
      ...prevState,
      provider,
      isConnected: true,
      username: userInfo.name,
      email: userInfo.email,
      subsContract,
      connectedSubsContract,
      address,
    }));

    //just for testing
    // const address = await signer.getAddress();
    // const balance = ethers.utils.formatEther(
    //   await provider.getBalance(address), // Balance is in wei
    // );
    // console.log("ADDRESS", address);
    // console.log("BALANCE", balance);
  };

  const getPlans = async () => {
    if (state.subsContract) {
      const plans = await state.subsContract.getAllPlans();
      // Map plan struct output into a usable array
      return plans.map(plan => ({
        contentCreator: plan.contentCreator,
        expirationBlock: plan.expirationBlock.toString(),
        planId: plan.planID.toString(),
        paymentTokenAddress: plan.paymentTokenAddress,
        price: plan.price.toString(),
        uri: plan.uri,
      })) as Plan[];
    }
  };

  const disconnectWeb3Auth = async () => {
    await state.web3Auth.logout();
    setState(prevState => ({ ...prevState, isConnected: false }));
  };

  const setPlanData = (plan: Plan) => {
    setState(prevState => ({ ...prevState, plan }));
  };

  return (
    <Web3AuthContextProvider
      value={{ ...state, connectWeb3Auth, disconnectWeb3Auth, getPlans, initProvider, initWeb3Auth, setPlanData }}
    >
      {children}
    </Web3AuthContextProvider>
  );
};

export const useWeb3AuthContext = useContext;
