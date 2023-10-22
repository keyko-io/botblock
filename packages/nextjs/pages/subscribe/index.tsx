import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plan } from "~~/context/Types";
import { useWeb3AuthContext } from "~~/context/Web3AuthContext";

type TokenAddress =
  | "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  | "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  | "0x179522635726710Dd7D2035a81d856de4Aa7836c"
  | "0x4d224452801ACEd8B2F0aebE155379bb5D594381"
  | "0x8337E43E0E25eeDFA47b403Bdfe3726b8C1BB59b";

const tokenAddressMap: Record<TokenAddress, string> = {
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI",
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT",
  "0x179522635726710Dd7D2035a81d856de4Aa7836c": "USDC",
  "0x4d224452801ACEd8B2F0aebE155379bb5D594381": "ApeCoin",
  "0x8337E43E0E25eeDFA47b403Bdfe3726b8C1BB59b": "Keyko Innovation Token",
};

const Subscribe = () => {
  const { getPlans, isConnected, purchasePlan, subsContract } = useWeb3AuthContext();
  const [plans, setPlans] = useState<Plan[]>();

  const fetchPlans = useCallback(async () => {
    const p = await getPlans();
    setPlans(p);
  }, [getPlans]);

  useEffect(() => {
    if (subsContract) {
      fetchPlans();
    }
  }, [fetchPlans, subsContract]);

  const handleOnPurchaseAttempt = (plan: Plan) => {
    if (plan.planId) {
      if (!isConnected) {
        toast.error("Please log in before submitting a purchase");
        return;
      }
      const toastId = toast.loading("Wait some moments to complete the purhcase!")
      // @note: should ask before confirmation
      purchasePlan(plan.planId, Number(plan.price), plan.paymentTokenAddress);
      toast.dismiss(toastId)
    }
  };

  return (
    <div className="p-32 flex-grow" data-theme="exampleUi">
      <h1 className="text-4xl sm:text-6xl">Subscribe</h1>
      <h3 className="text-xl sm:text-2xl">Click on any website you want to purchase on the list below</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="container w-fit">
          <div className="bg-white shadow-md overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Website</th>
                  <th className="border p-2">Content creator address</th>
                  <th className="border p-2">Duration</th>
                  {/* Left just for debugging */}
                  {/* <th className="border p-2">Payment token</th> */}
                  <th className="border p-2">Price</th>
                  <th className="border p-2"></th>
                </tr>
              </thead>
              <tbody>
                {plans &&
                  plans.map(
                    (plan, index) =>
                      !!index && (
                        <tr key={index}>
                          <td className="border p-2 text-center">{plan.uri}</td>
                          <td className="border p-2 text-end">{plan.contentCreator}</td>
                          <td className="border p-2 text-center">
                            {plan.expirationBlock} Month{plan.expirationBlock !== "1" && "s"}
                          </td>
                          {/* <td className="border p-2">{plan.paymentTokenAddress}</td> */}
                          <td className="border p-2 text-end">
                            {plan.price} {tokenAddressMap[plan.paymentTokenAddress as TokenAddress]}
                          </td>
                          <td className="border p-2 text-center">
                            <button
                              className="btn btn-primary w-32 rounded-full capitalize font-normal font-white flex items-center transition-all tracking-widest"
                              onClick={() => handleOnPurchaseAttempt(plan)}
                            >
                              Buy access
                            </button>
                          </td>
                        </tr>
                      ),
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;