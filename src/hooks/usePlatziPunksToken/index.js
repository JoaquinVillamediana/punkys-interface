import { useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import PlatziPunksTokenArtifact from "../../config/web3/artifacts/PlatziPunksToken";

const { address, abi } = PlatziPunksTokenArtifact;

const usePlatziPunksToken = () => {
  const { active, library, chainId } = useWeb3React();
  const platziPunksToken = useMemo(() => {
    if (active) {
      return new library.eth.Contract(abi, address[chainId]);
    }
  }, [active, chainId, library?.eth?.Contract]);

  return platziPunksToken;
};

export default usePlatziPunksToken;
