import { useEffect, useState } from "react";
import { Nevermined, NeverminedOptions } from "@nevermined-io/sdk";
import { decodeJwt } from "jose";
import { useWeb3AuthContext } from "~~/context/Web3AuthContext";

const Nvm = () => {
  const { address, getOrders, getPlans, isConnected, subsContract, username } = useWeb3AuthContext();
  const [nevermined, setNvm] = useState<Nevermined>();

  const connect = async () => {
    const config: NeverminedOptions = {
      // The web3 endpoint of the blockchain network to connect to, could be an Infura endpoint, Quicknode, or any other web3 provider
      web3ProviderUri: "https://goerli-rollup.arbitrum.io/rpc",
      // The url of the marketplace api if you connect to one. It could be your own service if you run a Marketplace API
      marketplaceUri: "https://marketplace-api.goerli.nevermined.app",
      // The url to a Nevermined node. It could be your own if you run a Nevermined Node
      neverminedNodeUri: "https://node.goerli.nevermined.app",
      // The public address of the above Node
      neverminedNodeAddress: "0x5838B5512cF9f12FE9f2beccB20eb47211F9B0bc",
      // The url to access the nevermined subgraphs required to query for on-chain events
      graphHttpUri: "https://api.thegraph.com/subgraphs/name/nevermined-io/public",
      // Folder where are copied the ABIs of the Nevermined Smart Contracts
      artifactsFolder: "http://localhost:3000/artifacts",
      marketplaceAuthToken: ""
    };
    try {
      const sdk = await Nevermined.getInstance(config);
      setNvm(sdk);
      console.log(await sdk.utils.versions.get());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    connect().then(() => console.log("NVM is connected", nevermined));
  }, []);

  const loginNevermined = async () => {
    if (!nevermined) return;
    debugger
    const [publisher] = await nevermined.accounts.list();
    console.log("publisher", publisher);

    const clientAssertion = await nevermined.utils.jwt.generateClientAssertion(publisher);

    const loginResult = await nevermined.services.marketplace.login(clientAssertion);
    console.log("loginResult", loginResult);
    // const payload = decodeJwt(config.marketplaceAuthToken);
    // console.log("payload", payload);
  };

  return (
    <div className="p-32 flex-grow" data-theme="exampleUi">
      <h1 className="text-2xl sm:text-3xl">
        Welcome to your profile {username}: {address}
      </h1>
      <>
        <div className="grid grid-cols-2 gap-4 mt-4 mb-16">
          <div className="container w-fit">
            <h2 className="text-2xl font-bold mb-4">NEVERMINED TEST</h2>
            {nevermined &&
              <>
                <p className="text-xl text-bold text-success">NVM SDK is connected</p>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => loginNevermined()}
                >
                  Login to nvm!
                </button>
              </>
            }
          </div>
        </div>
      </>
    </div>
  );
};

export default Nvm;
