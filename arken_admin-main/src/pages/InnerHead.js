import React, { useEffect } from "react";
import useState from "react-usestateref";
import { Link, useNavigate } from "react-router-dom";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/material/Typography";
import toast, { Toaster } from "react-hot-toast";
import {
  useDisconnect,
} from "@web3modal/ethers/react";

function InnerHead() {
  const navigate = useNavigate();

  
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [address, setAddress, addressref] = useState("");

  useEffect(() => {
    const walletConnected = localStorage.getItem("userAddress");
    console.log(walletConnected, "walletConnected");
    if (walletConnected) {
      setAddress(walletConnected);
    } else {
      navigate("/");
    }
  }, [])

  const [dropstatus, setdropstatus] = useState(false);

  const dropdowns = async () => {
    console.log(dropstatus, "dropstatus");
    if (dropstatus == true) {
      setdropstatus(false);
    } else {
      setdropstatus(true);
    }
  };

  const { disconnect } = useDisconnect();

  const disconnectWallet = async () => {
    try {
      await disconnect();
      setAddress("");
      localStorage.clear();
      toast.success("Wallet Disconnected");
      navigate("/admin");
    } catch (error) {
      console.log(error, "error diccon");
    }
  }


  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
        }}
      />
      <div className="inhead_main">
        <div className="inheader-right-menu">
          {addressref.current == "" ? (
            <div
              className="lan_had_con"
              variant="outlined"
              color="neutral"

            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="img-con"
                viewBox="0 0 20 20"
                id="wallet"
              >
                <path d="M16 6H3.5v-.5l11-.88v.88H16V4c0-1.1-.891-1.872-1.979-1.717L3.98 3.717C2.891 3.873 2 4.9 2 6v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1.5 7.006a1.5 1.5 0 1 1 .001-3.001 1.5 1.5 0 0 1-.001 3.001z"></path>
              </svg>
              <span className="con_lan_con">Connect</span>
            </div>
          ) : (
            <div
              className="lan_had_con"
              variant="outlined"
              color="neutral"
              onClick={dropdowns}
            >
              <span className="con_lan_con">{address.substring(0, 10)}...</span>
              <div className={dropstatus == true ? "dropdown-content" : "dropdown-content d-none"} onClick={() => disconnectWallet()}>
                <svg xmlns="http://www.w3.org/2000/svg" className="img-con" viewBox="0 0 100 100" id="Wallet"><path d="M93 48.627h-.5V34.968c0-4.263-3.157-7.792-7.254-8.398v-3.073c0-4.687-3.813-8.5-8.5-8.5H72.98l-1.983-5.285a1.5 1.5 0 0 0-1.864-.901l-19.201 6.186H10.735c-3.989 0-7.235 3.246-7.235 7.235V82.76c0 4.687 3.813 8.5 8.5 8.5h72c4.687 0 8.5-3.813 8.5-8.5V69.101h.5c1.93 0 3.5-1.57 3.5-3.5V52.127c0-1.929-1.57-3.5-3.5-3.5zM74.106 17.998h2.64c3.032 0 5.5 2.467 5.5 5.5v2.971h-4.961l-.299-.797-2.88-7.674zm-4.33-3 2.437 6.494 1.868 4.977H24.109l44.582-14.362 1.085 2.891zm-59.041 3h29.884l-18.84 6.07-7.453 2.401h-3.591c-2.335 0-4.235-1.9-4.235-4.235s1.9-4.236 4.235-4.236zM89.5 82.76c0 3.033-2.468 5.5-5.5 5.5H12a5.506 5.506 0 0 1-5.5-5.5V28.096c.021.016.046.026.068.042.262.185.535.354.821.504.053.028.109.052.163.079.265.131.538.246.82.344.048.017.094.036.142.052.312.101.633.177.962.235.073.013.147.023.221.034.34.049.685.083 1.038.083H84c3.032 0 5.5 2.467 5.5 5.5v13.659h-9.938c-4.687 0-8.5 3.813-8.5 8.5v3.474c0 4.687 3.813 8.5 8.5 8.5H89.5V82.76zm4-17.159a.5.5 0 0 1-.5.5H79.562a5.506 5.506 0 0 1-5.5-5.5v-3.474c0-3.033 2.468-5.5 5.5-5.5H93a.5.5 0 0 1 .5.5v13.474z" fill="#000000" class="color000000 svgShape"></path><path d="M83.449 54.522a4.347 4.347 0 0 0-4.343 4.342c0 2.395 1.948 4.342 4.343 4.342s4.342-1.948 4.342-4.342a4.347 4.347 0 0 0-4.342-4.342zm0 5.685c-.74 0-1.343-.602-1.343-1.342a1.343 1.343 0 0 1 2.685 0c0 .739-.602 1.342-1.342 1.342z" fill="#000000" class="color000000 svgShape"></path></svg>
                <span className="">Disconnect</span>
              </div>
            </div>
          )}
          {/* <div className="inhead_icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="inhead_user_icon"
              enable-background="new 0 0 512 512"
              viewBox="0 0 512 512"
              id="user"
            >
              <circle
                cx="256.1"
                cy="128.6"
                r="128.6"
                fill="#ffffff"
                transform="rotate(-45.001 256.1 128.604)"
                class="color231f20 svgShape"
              ></circle>
              <path
                fill="#ffffff"
                d="M403.6,364.5c-9.9-9.9-63.1-61.1-147.5-61.1s-137.7,51.3-147.5,61.1C48.9,424.2,47.5,498.1,47.5,512h417.2
		C464.7,498.1,463.3,424.2,403.6,364.5z"
                class="color231f20 svgShape"
              ></path>
            </svg>
          </div> */}
        </div>
      </div> 
      
       <React.Fragment>
        <Modal
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Sheet
            variant="outlined"
            sx={{
              minWidth: 500,
              borderRadius: "md",
              p: 3,
              boxShadow: "lg",
            }}
          >
            <ModalClose variant="plain" sx={{ m: 1 }} />
            <Typography
              component="h2"
              id="modal-title"
              level="h4"
              textColor="inherit"
              fontWeight="lg"
              mb={1}
            ></Typography>
            <Typography id="modal-desc">
              <h3 className="connect_a_connect_text">Connect a Wallet</h3>
              <p className="connect_a_connect_text2">
                No wallet extensions have been detected
              </p>
              <div className="meta_mask_btn">
                <img src={require("../images/Landing/Metamask.png")} />
                Meta Mask
              </div>
            </Typography>
          </Sheet>
        </Modal>
      </React.Fragment>   </div>
  );
}

export default InnerHead;
