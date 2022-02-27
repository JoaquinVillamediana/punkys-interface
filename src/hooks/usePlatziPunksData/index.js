import { useWeb3React } from "@web3-react/core";
import usePlatziPunks from "../usePlatziPunks";
const { useState, useCallback, useEffect } = require("react");

const getPunkData = async ({ platziPunks, tokenId }) => {
  const dna = await platziPunks.methods.tokenDNA(tokenId).call();

  const [
    tokenURI,
    owner,
    accessoriesType,
    clotheColor,
    clotheType,
    eyeType,
    eyeBrowType,
    facialHairColor,
    facialHairType,
    hairColor,
    hatColor,
    graphicType,
    mouthType,
    skinColor,
    topType,
  ] = await Promise.all([
    platziPunks.methods.tokenURI(tokenId).call(),
    platziPunks.methods.ownerOf(tokenId).call(),
    platziPunks.methods.getAccessoriesType(dna).call(),
    platziPunks.methods.getClotheColor(dna).call(),
    platziPunks.methods.getClotheType(dna).call(),
    platziPunks.methods.getEyeType(dna).call(),
    platziPunks.methods.getEyeBrowType(dna).call(),
    platziPunks.methods.getFacialHairColor(dna).call(),
    platziPunks.methods.getFacialHairType(dna).call(),
    platziPunks.methods.getHairColor(dna).call(),
    platziPunks.methods.getHatColor(dna).call(),
    platziPunks.methods.getGraphicType(dna).call(),
    platziPunks.methods.getMouthType(dna).call(),
    platziPunks.methods.getSkinColor(dna).call(),
    platziPunks.methods.getTopType(dna).call(),
  ]);

  const responseMetadata = await fetch(tokenURI);
  const metadata = await responseMetadata.json();

  return {
    tokenId,
    attributes: {
      accessoriesType,
      clotheColor,
      clotheType,
      eyeType,
      eyeBrowType,
      facialHairColor,
      facialHairType,
      hairColor,
      hatColor,
      graphicType,
      mouthType,
      skinColor,
      topType,
    },
    tokenURI,
    dna,
    owner,
    ...metadata,
  };
};

//Plural
const usePlatziPunksData = ({ owner = null } = {}) => {
  const [punks, setPunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const platziPunks = usePlatziPunks();
  const { library } = useWeb3React();

  const update = useCallback(async () => {
    if (platziPunks) {
      setLoading(true);

      let tokenIds;

      if (!library.utils.isAddress(owner)) {
        const totalSupply = await platziPunks.methods.totalSupply().call();

        tokenIds = new Array(parseInt(totalSupply))
          .fill()
          .map((_, index) => index);
      } else {
        const balanceOf = await platziPunks.methods.balanceOf(owner).call();

        const tokenIdsOfOwner = new Array(Number(balanceOf))
          .fill()
          .map((_, index) =>
            platziPunks.methods.tokenOfOwnerByIndex(owner, index).call()
          );

        tokenIds = await Promise.all(tokenIdsOfOwner);
      }

      const punksPromise = tokenIds.map((tokenId) =>
        getPunkData({ tokenId, platziPunks })
      );

      const punks = await Promise.all(punksPromise);

      setPunks(punks);

      setLoading(false);
    }
  }, [platziPunks, owner, library?.utils]);

  useEffect(() => {
    update();
  }, [update]);

  return {
    loading,
    punks,
    update,
  };
};

//Singular
const usePlatziPunkData = (tokenId = null) => {
  const [punk, setPunk] = useState();
  const [loading, setLoading] = useState(true);
  const platziPunks = usePlatziPunks();

  const update = useCallback(async () => {
    if (platziPunks && tokenId != null) {
      setLoading(true);

      const toSet = await getPunkData({ tokenId, platziPunks });

      setPunk(toSet);

      setLoading(false);
    }
  }, [platziPunks, tokenId]);

  useEffect(() => {
    update();
  }, [update]);

  return {
    loading,
    punk,
    update,
  };
};

export { usePlatziPunkData, usePlatziPunksData };
