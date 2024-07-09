import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Home from "./components/Home";
import Footer from "./components/footer";

// ABIs
import RealEstate from "./abis/RealEstate.json";
import Escrow from "./abis/Escrow.json";

// Config
import config from "./config.json";

function App() {
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);

  const [account, setAccount] = useState(null);

  const [homes, setHomes] = useState([]);
  const [home, setHome] = useState({});
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // setProvider(provider);
    const network = await provider.getNetwork();
    // console.log(provider);
    // console.log(network);

    const realAddress = config[network.chainId].realEstate.address;
    const escrowAddress = config[network.chainId].escrow.address;

    // console.log(realAddress, escrowAddress);

    const realEstate = new ethers.Contract(
      realAddress,
      RealEstate.abi,
      provider
    );
    const totalSupply = await realEstate.totalSupply();
    console.log(totalSupply.toNumber());
    const homes = [];

    for (var i = 1; i <= totalSupply; i++) {
      try {
        const uri = await realEstate.tokenURI(i); // Getting URI from the Contract
        // console.log(uri);
        
        const response = await fetch(uri); // Fetch the URI to get response
        
        if (!response.ok) {
          throw new Error(`Failed to fetch URI: ${uri}, status: ${response.status}`);
        }
        
        const metadata = await response.json(); // Get the JSON object from response
        homes.push(metadata); // Push the JSON object to the homes array
      } catch (error) {
        console.error(`Error fetching metadata for token ${i}:`, error);
      }
    }
    

    setHomes(homes);
    // console.log(homes); 

    const escrow = new ethers.Contract(escrowAddress, Escrow.abi, provider);
    setEscrow(escrow);

    window.ethereum.on("accountsChanged", async () => {
      // featching the selected account in the meta Mask
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
      console.log(account);
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, [account]);

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />

      <div className="cards__section">
        <h3>Homes For You</h3>

        <hr />

        <div className="cards">
          {homes.map((home, index) => (
            <div className="card" key={index} onClick={() => togglePop(home)}>
              <div className="card__image">
                <img src={home.image} alt="Home" />
              </div>
              <div className="card__info">
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toggle && (
        <Home 
          home={home}
          provider={provider}
          account={account}
          escrow={escrow}
          togglePop={togglePop}
        />
      )}
      <hr/>
      <hr/>
      <hr/>
      <hr/>
      <Footer/>
    </div>
  );
}

export default App;
