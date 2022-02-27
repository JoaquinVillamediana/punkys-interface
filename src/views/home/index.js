import {
  Stack,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import usePlatziPunks from "../../hooks/usePlatziPunks";
import usePlatziPunksToken from "../../hooks/usePlatziPunksToken";
import { useCallback, useEffect, useState } from "react";
import useTruncatedAddress from "../../hooks/useTruncatedAddress";

const Home = () => {
  const { active, account, library } = useWeb3React();
  const platziPunks = usePlatziPunks();
  const platziPunksToken = usePlatziPunksToken();
  const [imageSrc, setImageSrc] = useState();
  const [maxSupply, setMaxSupply] = useState();
  const [allowance, setAllowance] = useState(0);
  const [totalSupply, setTotalSupply] = useState();
  const [isMinting, setMinting] = useState(false);
  const [isApproving, setApproving] = useState(false);
  const [balance, setBalance] = useState(0);
  const toast = useToast();
  const truncatedAddress = useTruncatedAddress(account);

  const getPlatziPunksData = useCallback(async () => {
    if (platziPunks) {
      const totalItems = await platziPunks.methods.totalSupply().call();
      setTotalSupply(totalItems);
      const dnaPreview = await platziPunks.methods
        .deterministicPseudoRandomDNA(totalItems, account)
        .call();
      const image = await platziPunks.methods.imageByDNA(dnaPreview).call();
      setImageSrc(image);
      const maxItems = await platziPunks.methods.maxSupply().call();
      setMaxSupply(maxItems);
    }
  }, [platziPunks, account]);

  useEffect(() => {
    getPlatziPunksData();
  }, [getPlatziPunksData]);

  const checkAllowance = useCallback(async () => {
    if (platziPunksToken) {
      const toSet = await platziPunksToken.methods
        .allowance(account, process.env.REACT_APP_PLATZIPUNKS_ADDRESS_4)
        .call();

      if (toSet) {
        setAllowance(toSet);
      }
    }
  }, [platziPunksToken, account]);

  useEffect(() => {
    checkAllowance();
  }, [checkAllowance]);

  const checkBalance = useCallback(async () => {
    if (platziPunksToken) {
      const toSet = await platziPunksToken.methods.balanceOf(account).call();
      if (toSet) {
        setBalance(toSet);
      }
    }
  }, [platziPunksToken, account]);

  useEffect(() => {
    checkBalance();
  }, [checkBalance]);

  const mint = () => {
    setMinting(true);

    platziPunks.methods
      .mint()
      .send({
        from: account,
      })
      .on("transactionHash", (txHash) => {
        toast({
          title: "Transaccion enviada",
          description: txHash,
          status: "info",
        });
      })
      .on("receipt", () => {
        setMinting(false);
        toast({
          title: "Transaccion confirmada",
          description: "Minting listo!",
          status: "success",
        });
        setAllowance(allowance - 1e18);
        getPlatziPunksData();
        checkBalance();
      })
      .on("error", (error) => {
        setMinting(false);
        toast({
          title: "Transaccion fallida",
          description: error.message,
          status: "error",
        });
      });
  };

  const approveMint = () => {
    setApproving(true);
    const BN = library.utils.BN;
    platziPunksToken.methods
      .increaseAllowance(
        process.env.REACT_APP_PLATZIPUNKS_ADDRESS_4,
        new BN("1000000000000000000")
      )
      .send({
        from: account,
      })
      .on("transactionHash", (txHash) => {
        toast({
          title: "Transaccion enviada",
          description: txHash,
          status: "info",
        });
      })
      .on("receipt", () => {
        setApproving(false);
        setAllowance(1e18);
        toast({
          title: "Transaccion confirmada",
          description: "Minting listo!",
          status: "success",
        });
      })
      .on("error", (error) => {
        setApproving(false);
        toast({
          title: "Transaccion fallida",
          description: error.message,
          status: "error",
        });
      });
  };

  return (
    <Stack
      align={"center"}
      spacing={{ base: 8, md: 10 }}
      py={{ base: 20, md: 28 }}
      direction={{ base: "column-reverse", md: "row" }}
    >
      <Stack flex={1} spacing={{ base: 5, md: 10 }}>
        <Heading
          lineHeight={1.1}
          fontWeight={600}
          fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
        >
          <Text
            as={"span"}
            position={"relative"}
            _after={{
              content: "''",
              width: "full",
              height: "30%",
              position: "absolute",
              bottom: 1,
              left: 0,
              bg: "green.400",
              zIndex: -1,
            }}
          >
            Un Platzi Punk
          </Text>
          <br />
          <Text as={"span"} color={"green.400"}>
            nunca para de aprender
          </Text>
        </Heading>
        <Text color={"gray.500"}>
          Platzi Punks es una colección de Avatares randomizados cuya metadata
          es almacenada on-chain. Poseen características únicas y sólo hay 10000
          en existencia.
        </Text>
        <Text color={"green.500"}>
          Cada Platzi Punk se genera de forma secuencial basado en tu address,
          usa el previsualizador para averiguar cuál sería tu Platzi Punk si
          minteas en este momento
        </Text>
        <Stack
          spacing={{ base: 4, sm: 6 }}
          direction={{ base: "column", sm: "row" }}
        >
          {allowance >= 1e18 ? (
            <Button
              rounded={"full"}
              size={"lg"}
              fontWeight={"normal"}
              px={6}
              colorScheme={"green"}
              bg={"green.400"}
              _hover={{ bg: "green.500" }}
              disabled={!platziPunks || balance < 1e18}
              onClick={mint}
              isLoading={isMinting}
            >
              Obtén tu punk
            </Button>
          ) : (
            <Button
              rounded={"full"}
              size={"lg"}
              fontWeight={"normal"}
              px={6}
              colorScheme={"green"}
              bg={"green.400"}
              _hover={{ bg: "green.500" }}
              disabled={(allowance < 1e18) & !platziPunksToken}
              onClick={approveMint}
              isLoading={isApproving}
            >
              Approve Minting
            </Button>
          )}

          <Link to="/punks">
            <Button rounded={"full"} size={"lg"} fontWeight={"normal"} px={6}>
              Galería
            </Button>
          </Link>
        </Stack>
      </Stack>
      <Flex
        flex={1}
        direction="column"
        justify={"center"}
        align={"center"}
        position={"relative"}
        w={"full"}
      >
        <Image src={active ? imageSrc : "https://avataaars.io/"} />
        {active ? (
          <>
            <Flex mt={2}>
              <Badge>
                Next ID:
                <Badge ml={1} colorScheme="green">
                  {parseInt(totalSupply) + 1}
                </Badge>
              </Badge>
              <Badge ml={2}>
                Address:
                <Badge ml={1} colorScheme="green">
                  {truncatedAddress}
                </Badge>
              </Badge>
              <Badge ml={2}>
                Minted:
                <Badge ml={1} colorScheme="green">
                  {totalSupply} of {maxSupply}
                </Badge>
              </Badge>
            </Flex>
            <Button
              onClick={getPlatziPunksData}
              mt={4}
              size="xs"
              colorScheme="green"
            >
              Actualizar
            </Button>
          </>
        ) : (
          <Badge mt={2}>Wallet desconectado</Badge>
        )}
      </Flex>
    </Stack>
  );
};

export default Home;
