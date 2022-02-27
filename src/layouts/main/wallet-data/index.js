import {
  Flex,
  Button,
  Tag,
  TagLabel,
  Badge,
  TagCloseButton,
  useEditable,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { connector } from "../../../config/web3";
import { useEffect, useState, useCallback, useMemo } from "react";
import usePlatziPunksToken from "../../../hooks/usePlatziPunksToken";

const WalletData = () => {
  const [balance, setBalance] = useState(0);
  const platziPunksToken = usePlatziPunksToken();
  const { active, activate, account, error, deactivate, library } =
    useWeb3React();

  const isUnsupportedChain = error instanceof UnsupportedChainIdError;

  const connect = useCallback(() => {
    activate(connector);
    localStorage.setItem("previouslyConnected", "true");
  }, [activate]);

  const disconnect = () => {
    deactivate();
    localStorage.removeItem("previouslyConnected");
  };

  const shortAddress = useMemo(
    () => `${account?.substr(0, 5)}...${account?.substr(-4)}`,
    [account]
  );

  useEffect(() => {
    if (localStorage.getItem("previouslyConnected") === "true") {
      connect();
    }
  }, [connect]);

  const getBalance = useCallback(async () => {
    const toSet = await platziPunksToken.methods.balanceOf(account).call();
    setBalance((toSet / 1e18).toFixed(2));
  }, [library?.eth, account]);

  useEffect(() => {
    if (active) {
      getBalance();
    }
  }, [active, getBalance]);

  return (
    <Flex alignItems={"center"}>
      {active ? (
        <Tag colorScheme="green" borderRadius="full">
          <TagLabel>
            <Link to={`/punks?address=${account}`}>{shortAddress}</Link>
          </TagLabel>
          <Badge
            d={{
              base: "none",
              md: "block",
            }}
            variant="solid"
            fontSize="0.8rem"
            ml={1}
          >
            ~{balance} PPKST
          </Badge>
          <TagCloseButton onClick={disconnect} />
        </Tag>
      ) : (
        <Button
          variant={"solid"}
          colorScheme={"green"}
          size={"sm"}
          leftIcon={<AddIcon />}
          onClick={connect}
          disabled={isUnsupportedChain}
        >
          {isUnsupportedChain ? "Red no soportada" : "Conectar Wallet"}
        </Button>
      )}
    </Flex>
  );
};

export default WalletData;
