import React, { useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import useState from "react-usestateref";

import { toast } from "react-toastify";
import Sidebar_2 from "./Nav_bar";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { env } from "../core/service/envconfig";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/material/Typography";
// import Modal from "@mui/joy/Modal";
import { ScaleLoader } from "react-spinners";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import { Skeleton } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};

function Dashboard() {
  const inputRef = useRef(null);
  const [add, setAdd] = useState(false);
  const [stakingpage, setstakingpage] = useState(false);
  const [otcpage, setotcpage] = useState(false);
  const [stakeflex, setstakeflex] = useState(false);
  const [otcValidationErr, setOtcValidationErr] = useState({});
  const [Currencydata, setCurrencydata] = useState([]);
  const [cmsdata, setcmsdata] = useState([]);
  const [validationnErr, setvalidationnErr] = useState({});
  const [stakevalidationerr, setstakevalidationerr] = useState({});
  const [flexstakevalidation, setflexstakevalidation] = useState({});
  const [loader, setLoader] = useState(true);
  const [symbol, setSymbol] = useState("");
  const [buttonLoader, setButtonLoader] = useState(false);
  const [buttonLoaderStake, setButtonLoaderStake] = useState(false);
  const [showOtcModal, setShowOtcModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // to control modal visibility

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 7;

  const [filterKeyword, setFilterKeyword] = useState("");
  const [otcSettings, setOtcSettings] = useState({
    currencySymbol: "", // Default value
    otcStatus: false,
    minQuantity: 0,
    maxQuantity: 0,
  });

  const initialFormData = {
    currencySymbol: "",
    currencyName: "",
    coinType: "", // 1 for crypto, 2 for FIAT
    currencyType: "", // 1 for coin, 2 for token
    minSwap: 0,
    maxSwap: 0,
    swapFee: 0,
    swapStatus: 1, // 0 for Deactive, 1 for Active
    minWithdrawLimit: 0,
    minimumDeposit: 0,
    maximumDeposit: 0,
    withdrawFee: 0,
    maxWithdrawLimit: 0,
    withdrawStatus: "", // 0 for Deactive, 1 for Active
    depositStatus: "", // 0 for Deactive, 1 for Active
    status: "", // 0 for Deactive, 1 for Active
    // launchpadStatus: "",
    p2p_status: "1",
    erc20token: "",
    trc20token: "",
    bep20token: "",
    matictoken: "",
    soltoken: "",
    arb20token: "",
    contractAddress_erc20: "",
    coinDecimal_erc20: "",
    contractAddress_trc20: "",
    coinDecimal_trc20: "",
    contractAddress_bep20: "",
    coinDecimal_bep20: "",
    contractAddress_matic: "",
    coinDecimal_matic: "",
    contractAddress_sol: "",
    coinDecimal_sol: "",
    contractAddress_arb: "",
    coinDecimal_arb: "",
    Currency_image: "",
    maximumDeposit: 0,
    minimumDeposit: 0,
    // stakeDepositFee:0,
    // stakeWitdrawFee:0,
    // tokenPrice:0
    fiatminimumDeposit: 0,
    fiatmaximumDeposit: 0,
    fiatminimumWithdraw: 0,
    fiatmaximumWithdraw: 0,
    fiatwithdrawFee: 0,
    fiatdepositFee: 0,
  };

  const [formData, setFormData, formDataref] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // const sanitizedValue = value.replace(/\s/g, "");
    const sanitizedValue = value;
    const updatedFormData = { ...formData, [name]: sanitizedValue };
    setFormData(updatedFormData);
    const errors = validateForm(updatedFormData);
    setvalidationnErr(errors);
  };

  const handleSubmit = async (e) => {
    // console.log("knjkmkmkmkmk",e);
    e.preventDefault();
    const errors = validateForm(formData);
    console.log(errors, "errors");
    if (Object.keys(errors).length > 0) {
      setvalidationnErr(errors);
      return;
    }
    setvalidationnErr({});
    const allowedSymbols = ["BTC", "ETH", "BNB", "TRX"];

    if (
      formData.coinType == "1" &&
      !allowedSymbols.includes(formData.currencySymbol)
    ) {
      toast.error("Not supported blockchain");
      return;
    } else {
      console.log("Form data submitted:", formData);
      var datas = {
        apiUrl: apiService.currencyAddUpdate,
        payload: formData,
      };

      setButtonLoader(true);
      var response = await postMethod(datas);
      setButtonLoader(false);
      console.log(response, "=-=-=-=response=-=-=");

      if (response.status) {
        toast.success(response.Message);
      } else {
        toast.error(response.Message);
      }
      getUserDetails();
      setAdd(false);
      setstakingpage(false);
      setotcpage(false);
      setstakeflex(false);
      setFormData({});
      setStakingData({});
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };
  useEffect(() => {
    getUserDetails(currentPage);
  }, [currentPage, filterKeyword]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [filteredUsers]);

  const getUserDetails = async (page = 1) => {
    setLoader(true);

    const data = {
      apiUrl: apiService.allCurrencyListCrypto,
      payload: { page, limit: 5, keyword: filterKeyword }, // Include the keyword here
    };
    const response = await postMethod(data);
    setLoader(false);

    if (response.status) {
      setFilteredUsers(response.data);
      setTotalPages(response.totalPages);
    } else {
      setCurrencydata([]);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (value.length === 1 && value.startsWith(" ")) return;
    setFilterKeyword(value);
  };

  const [imageName, setimageName] = useState("");

  const handleFileChange = (val) => {
    try {
      console.log(val);

      const fileExtension = val.name.split(".").at(-1);
      const fileSize = val.size;
      const fileName = val.name;
      setimageName(fileName);

      if (
        fileExtension != "png" &&
        fileExtension != "jpg" &&
        fileExtension != "jpeg" &&
        fileExtension != "webp"
      ) {
        toast.error(
          "File does not support. You must use .png or .jpg or .jpeg or .webp "
        );
      } else if (fileSize > 10000000) {
        toast.error("Please upload a file smaller than 1 MB");
      } else {
        const data = new FormData();
        data.append("file", val);
        data.append("upload_preset", env.upload_preset);
        data.append("cloud_name", env.cloud_name);
        fetch(
          "https://api.cloudinary.com/v1_1/" + env.cloud_name + "/auto/upload",
          { method: "post", body: data }
        )
          .then((resp) => resp.json())
          .then((data) => {
            const imageUrl = data.secure_url;

            // Update the state with the image URL
            setFormData((prevState) => ({
              ...prevState,
              Currency_image: imageUrl,
            }));
            // Validate the form with the updated form data
            // validateForm({
            //   ...formData,
            //   Currency_image: imageUrl,
            // });
            formData.Currency_image = imageUrl;
            console.log(formData, "formData");
            validateForm(formData);
            validationnErr.Currency_image = "";
          })
          .catch((err) => {
            console.log(err);
            toast.error("Please try again later");
          });
      }
    } catch (error) {
      console.log(error);
      toast.error("Please try again later");
    }
  };

  const getEditDetails = async (data, symbol) => {
    console.log(symbol, "symbol");

    setSymbol(symbol);

    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.viewOneCurrency,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    setLoader(false);
    if (response.status) {
      setFormData(response.Message);
       setFormData((prevState) => ({
              ...prevState,
              fiatwithdrawFee: response.Message.withdrawFee,
            }));
      setAdd(true);
      console.log(formData, "=-=-=-=response=-=-=");
    } else {
      setcmsdata({});
    }
  };

  const deletecurrency = async (data) => {
    console.log(data, "data");

    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.deletecurrency,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    setLoader(false);
    console.log(response, "=-=-=-=response=-=-=");

    if (response.status) {
      toast.success(response.Message);
      getUserDetails();
      handleClose();
      // setAdd(true);
    } else {
      toast.error(response.Message);

      // setcmsdata({});
    }
  };

  const validateForm = (values) => {
    const errors = {};

    // Common validations
    if (!values.currencySymbol) {
      errors.currencySymbol = "Currency Symbol is required";
    } else if (values.currencySymbol.length > 20) {
      errors.currencySymbol = "Max 20 characters allowed";
    }

    if (!values.currencyName) {
      errors.currencyName = "Currency Name is required";
    } else if (values.currencyName.length > 50) {
      errors.currencyName = "Max 50 characters allowed";
    }

    if (!values.Currency_image) {
      errors.Currency_image = "Currency Image is required";
    }

    // if (!values.stakeDepositFee) {
    //   errors.stakeDepositFee = "Staking deposit fee is required";
    // } else if (values.stakeDepositFee < 0) {
    //   errors.stakeDepositFee = "Value must be positive";
    // }
    // if (!values.stakeWitdrawFee) {
    //   errors.stakeWitdrawFee = "Staking withdraw is required";
    // } else if (values.stakeWitdrawFee < 0) {
    //   errors.stakeWitdrawFee = "Value must be positive";
    // }
    // if (!values.minSwap) {
    //   errors.minSwap = "Minimum Swap is required";
    // } else if (values.minSwap < 0) {
    //   errors.minSwap = "Value must be positive";
    // }
    // if (!values.maxSwap) {
    //   errors.maxSwap = "Maximum Swap is required";
    // } else if (values.maxSwap < values.minSwap) {
    //   errors.maxSwap = "Max Swap must be greater than Min Swap";
    // }

    // if (!values.swapFee) {
    //   errors.swapFee = "Swap Fee is required";
    // } else if (values.swapFee < 0) {
    //   errors.swapFee = "Value must be positive";
    // }

    if (!values.minWithdrawLimit) {
      errors.minWithdrawLimit = "Minimum Withdraw Limit is required";
    } else if (values.minWithdrawLimit < 0) {
      errors.minWithdrawLimit = "Value must be positive";
    }

    // if (formData.coinType == "1") {
    //   if (!values.minimumDeposit) {
    //     errors.minimumDeposit = "Minimum Deposit Limit is required";
    //   } else if (values.minimumDeposit < 0) {
    //     errors.minimumDeposit = "Value must be positive";
    //   }
    //   if (!values.maximumDeposit) {
    //     errors.maximumDeposit = "Minimum Deposit Limit is required";
    //   } else if (values.maximumDeposit < 0) {
    //     errors.maximumDeposit = "Value must be positive";
    //   }
    // }

    if (!values.fiatwithdrawFee) {
      errors.fiatwithdrawFee = "Withdraw Fee is required";
    } else if (values.fiatwithdrawFee < 0) {
      errors.fiatwithdrawFee = "Value must be positive";
    }

    if (!values.maxWithdrawLimit) {
      errors.maxWithdrawLimit = "Maximum Withdraw Limit is required";
    } else if (values.maxWithdrawLimit < values.minWithdrawLimit) {
      errors.maxWithdrawLimit =
        "Max Withdraw Limit must be greater than Min Withdraw Limit";
    }

    // Validations for status fields
    // if (
    //   values.swapStatus == undefined ||
    //   values.swapStatus == "" ||
    //   values.swapStatus == null
    // ) {
    //   errors.swapStatus = "Swap Status is required";
    // }

    // if (
    //   values.withdrawStatus == undefined ||
    //   values.withdrawStatus == "" ||
    //   values.withdrawStatus == null
    // ) {
    //   errors.withdrawStatus = "Withdraw Status is required";
    // }

    // if (
    //   values.depositStatus == undefined ||
    //   values.depositStatus == "" ||
    //   values.depositStatus == null
    // ) {
    //   errors.depositStatus = "Deposit Status is required";
    // }

    if (
      values.status == undefined ||
      values.status == "" ||
      values.status == null
    ) {
      errors.status = "Status is required";
    }

    // if (
    //   values.coinType == undefined ||
    //   values.coinType == "" ||
    //   values.coinType == null
    // ) {
    //   errors.coinType = "coinType is required";
    // }

    // // Conditional validations based on coinType
    // if (values.coinType == 1) {
    //   if (
    //     values.currencyType == undefined ||
    //     values.currencyType == "" ||
    //     values.currencyType == null
    //   ) {
    //     errors.currencyType = "Currency Type is required";
    //   }

    // if (
    //   values.launchpadStatus == undefined ||
    //   values.launchpadStatus == "" ||
    //   values.launchpadStatus == null
    // ) {
    //   errors.launchpadStatus = "Launchpad Status is required";
    // }
    // } else if (values.coinType == 2) {
    //   if (
    //     values.p2p_status == undefined ||
    //     values.p2p_status == "" ||
    //     values.p2p_status == null
    //   ) {
    //     errors.p2p_status = "P2P Status is required";
    //   }
    // }

    // Conditional validations for tokens
    // if (values.currencyType == 2) {
    //   if (
    //     values.erc20token == undefined ||
    //     values.erc20token == "" ||
    //     values.erc20token == null
    //   ) {
    //     errors.erc20token = "erc20token is required";
    //   }

    //   if (
    //     values.trc20token == undefined ||
    //     values.trc20token == "" ||
    //     values.trc20token == null
    //   ) {
    //     errors.trc20token = "trc20token is required";
    //   }

    //   if (
    //     values.bep20token == undefined ||
    //     values.bep20token == "" ||
    //     values.bep20token == null
    //   ) {
    //     errors.bep20token = "bep20token is required";
    //   }

    //   if (values.erc20token == 1) {
    //     if (!values.contractAddress_erc20) {
    //       errors.contractAddress_erc20 = "ERC20 Contract Address is required";
    //     }
    //     if (!values.coinDecimal_erc20) {
    //       errors.coinDecimal_erc20 = "ERC20 Coin Decimal is required";
    //     } else if (values.coinDecimal_erc20 < 0) {
    //       errors.coinDecimal_erc20 = "Value must be positive";
    //     }
    //   }

    //   if (values.trc20token == 1) {
    //     if (!values.contractAddress_trc20) {
    //       errors.contractAddress_trc20 = "TRC20 Contract Address is required";
    //     }
    //     if (!values.coinDecimal_trc20) {
    //       errors.coinDecimal_trc20 = "TRC20 Coin Decimal is required";
    //     } else if (values.coinDecimal_trc20 < 0) {
    //       errors.coinDecimal_trc20 = "Value must be positive";
    //     }
    //   }

    //   if (values.bep20token == 1) {
    //     if (!values.contractAddress_bep20) {
    //       errors.contractAddress_bep20 = "BEP20 Contract Address is required";
    //     }
    //     if (!values.coinDecimal_bep20) {
    //       errors.coinDecimal_bep20 = "BEP20 Coin Decimal is required";
    //     } else if (values.coinDecimal_bep20 < 0) {
    //       errors.coinDecimal_bep20 = "Value must be positive";
    //     }
    //   }

    //   if (
    //     values.matictoken == undefined ||
    //     values.matictoken == "" ||
    //     values.matictoken == null
    //   ) {
    //     errors.matictoken = "matictoken is required";
    //   }

    //   if (values.matictoken == 1) {
    //     if (!values.contractAddress_matic) {
    //       errors.contractAddress_matic = "Matic Contract Address is required";
    //     }
    //     if (!values.coinDecimal_matic) {
    //       errors.coinDecimal_matic = "Matic Coin Decimal is required";
    //     } else if (values.coinDecimal_matic < 0) {
    //       errors.coinDecimal_matic = "Value must be positive";
    //     }
    //   }

    //   if (
    //     values.soltoken == undefined ||
    //     values.soltoken == "" ||
    //     values.soltoken == null
    //   ) {
    //     errors.soltoken = "soltoken is required";
    //   }

    //   if (values.soltoken == 1) {
    //     if (!values.contractAddress_sol) {
    //       errors.contractAddress_sol = "Solana Contract Address is required";
    //     }
    //     if (!values.coinDecimal_sol) {
    //       errors.coinDecimal_sol = "Solana Coin Decimal is required";
    //     } else if (values.coinDecimal_sol < 0) {
    //       errors.coinDecimal_sol = "Value must be positive";
    //     }
    //   }

    //   if (
    //     values.arb20token == undefined ||
    //     values.arb20token == "" ||
    //     values.arb20token == null
    //   ) {
    //     errors.arb20token = "arb20token is required";
    //   }

    //   if (values.arb20token == 1) {
    //     if (!values.contractAddress_arb) {
    //       errors.contractAddress_arb = "Solana Contract Address is required";
    //     }
    //     if (!values.coinDecimal_arb) {
    //       errors.coinDecimal_arb = "Solana Coin Decimal is required";
    //     } else if (values.coinDecimal_arb < 0) {
    //       errors.coinDecimal_arb = "Value must be positive";
    //     }
    //   }
    // }
    return errors;
  };

  const sentback = async (data) => {
    setOtcValidationErr({});
    setvalidationnErr({});
    setAdd(false);
    setstakingpage(false);
    setotcpage(false);
    setFormData(initialFormData);
  };

  const stakingstate = async (data, id) => {
    var obj = {
      currencyId: id,
    };
    var datas = {
      apiUrl: apiService.getStaking,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    console.log(response, "=-=-=-=response=-=-=");
    setLoader(false);
    if (response.status) {
      setStakingData(response.Message);
    } else {
      await getEditDetails(id);
      console.log(formDataref.current);
      setStakingData({
        currencyName: formDataref.current.currencyName,
        currencySymbol: formDataref.current.currencySymbol,
        currencyImage: formDataref.current.Currency_image,
        currencyId: formDataref.current._id,
      });
    }

    setstakingpage(true);
    if (data == "Fixed") {
      setstakeflex(false);
    } else {
      setstakeflex(true);
    }
  };

  const handleOtcSettingsChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === "otcStatus") {
      formattedValue = value === "Active" ? true : false;
    }

    setOtcSettings((prevSettings) => {
      const updatedSettings = { ...prevSettings, [name]: formattedValue };

      // Validate the updated settings
      const validationErrors = validateOtcSettings(updatedSettings);
      setOtcValidationErr(validationErrors);

      return updatedSettings;
    });
  };

  const [stakingdata, setStakingData] = useState({
    currencySymbol: "",
    currencyName: "",
    firstDuration: 0,
    secondDuration: 0,
    thirdDuration: 0,
    fourthDuration: 0,
    APRinterest: 0,
    maximumStaking: 0,
    minimumStaking: 0,
    FistDurationAPY: 0,
    SecondDurationAPY: 0,
    ThirdDurationAPY: 0,
    FourthDurationAPY: 0,
    minimumStakingflex: 0,
    maximumStakingflex: 0,
    status: "",
    statusflex: "Deactive",
  });

  const handlestakeChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...stakingdata, [name]: value };
    setStakingData(updatedFormData);

    const errors = validateFixedStaking(updatedFormData);
    setstakevalidationerr(errors);
  };

  const handleflexstakeChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...stakingdata, [name]: value };
    setStakingData(updatedFormData);

    const errors = validateFlexibleStaking(updatedFormData);
    setflexstakevalidation(errors);
  };
  const validateOtcSettings = (otcSettings) => {
    let errors = {};

    // Ensure the values are valid numbers and not zero
    const isValidNumber = (value) =>
      /^\d*\.?\d+$/.test(value) && Number(value) > 0;

    if (!isValidNumber(otcSettings.minQuantity)) {
      errors.minQuantity =
        "Minimum Quantity must be a valid number greater than 0 ";
    }

    if (!isValidNumber(otcSettings.maxQuantity)) {
      errors.maxQuantity =
        "Maximum Quantity must be a valid number greater than 0";
    }

    // Ensure minQuantity < maxQuantity
    if (Number(otcSettings.minQuantity) > Number(otcSettings.maxQuantity)) {
      errors.quantityRange =
        "Minimum Quantity cannot be greater than Maximum Quantity";
    }

    return errors;
  };

  const handlestakeSubmit = async (e, type) => {
    e.preventDefault();
    console.log(type);
    let errors = {};

    if (type == "Fixed") {
      setStakingData((prev) => ({ ...prev, statusflex: "Deactive" }));
      errors = validateFixedStaking(stakingdata);
      if (Object.keys(errors).length > 0) {
        setstakevalidationerr(errors);
        Object.values(errors).forEach((err) => toast.error(err));
        return;
      }
      setstakevalidationerr({});
    } else if (type === "Flexible") {
      errors = validateFlexibleStaking(stakingdata);
      if (Object.keys(errors).length > 0) {
        setflexstakevalidation(errors);
        Object.values(errors).forEach((err) => toast.error(err));
        return;
      }
      setflexstakevalidation({});
    } else if (type === "OTC") {
      errors = validateOtcSettings(otcSettings);
      if (Object.keys(errors).length > 0) {
        setOtcValidationErr(errors);

        // Trigger toast errors for each error in the errors object
        Object.values(errors).forEach((err) => toast.error(err));

        return; // Don't proceed if there are validation errors
      }

      setOtcValidationErr({}); // Clear previous errors if validation passed
    }

    const payload =
      type === "OTC"
        ? {
            ...otcSettings,
            minQuantity: Number(otcSettings.minQuantity), // Ensure it's a number
            maxQuantity: Number(otcSettings.maxQuantity),
          }
        : stakingdata;
    const apiUrl =
      type === "OTC"
        ? apiService.editOtcSettings
        : apiService.updateStakingFlexible;

    console.log("Form data submitted:", payload);
    const data = { apiUrl, payload };

    try {
      setButtonLoaderStake(true); // Show button loader

      const response = await postMethod(data);
      console.log("Response:", response);
      setButtonLoaderStake(false); // Hide loader after response

      if (response.status) {
        toast.success(response.Message);

        if (type === "OTC") {
          setTimeout(() => {
            setotcpage(false); // Auto-close popup
          }, 500);
        }
        sentback();
      } else {
        toast.error(response.Message);
      }

      getUserDetails();
      setAdd(false);
      setstakeflex(false);
      setFormData({});
      setStakingData({});
      if (type === "OTC") {
        setOtcSettings({});
      }
      sentback();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  };

  const validateFixedStaking = (values) => {
    const errors = {};

    const minimumStaking = parseFloat(values.minimumStaking);
    const maximumStaking = parseFloat(values.maximumStaking);

    if (!values.currencySymbol) {
      errors.currencySymbol = "Currency Symbol is required";
    } else if (values.currencySymbol.length > 5) {
      errors.currencySymbol = "Max 5 characters allowed";
    }

    if (!values.currencyName) {
      errors.currencyName = "Currency Name is required";
    } else if (values.currencyName.length > 50) {
      errors.currencyName = "Max 50 characters allowed";
    }

    if (!values.firstDuration) {
      errors.firstDuration = "First Duration Limit is required";
    }

    if (!values.secondDuration) {
      errors.secondDuration = "Second Duration Limit is required";
    }

    if (!values.thirdDuration) {
      errors.thirdDuration = "Third Duration Limit is required";
    }
    if (!values.fourthDuration) {
      errors.fourthDuration = "Fourth Duration Limit is required";
    }

    if (!values.FistDurationAPY) {
      errors.FistDurationAPY = "First Duration APY is required";
    }

    if (!values.SecondDurationAPY) {
      errors.SecondDurationAPY = "Second Duration APY is required";
    }

    if (!values.ThirdDurationAPY) {
      errors.ThirdDurationAPY = "Third Duration APY is required";
    }

    if (!values.FourthDurationAPY) {
      errors.FourthDurationAPY = "Fourth Duration APY is required";
    }

    if (!values.minimumStaking) {
      errors.minimumStaking = "Minimum Staking Limit is required";
    }

    if (!values.maximumStaking) {
      errors.maximumStaking = "Maximum Staking Limit is required";
    } else if (maximumStaking <= minimumStaking) {
      console.log(typeof values.maximumStaking, typeof values.minimumStaking);
      errors.maximumStaking =
        "Max Staking Limit must be greater than Min Staking Limit";
    }

    if (!values.status) {
      errors.status = "Status is required";
    }

    return errors;
  };

  const validateFlexibleStaking = (values) => {
    const errors = {};

    const minimumStaking = parseFloat(values.minimumStakingflex);
    const maximumStaking = parseFloat(values.maximumStakingflex);

    if (!values.currencySymbol) {
      errors.currencySymbol = "Currency Symbol is required";
    } else if (values.currencySymbol.length > 5) {
      errors.currencySymbol = "Max 5 characters allowed";
    }

    if (!values.currencyName) {
      errors.currencyName = "Currency Name is required";
    } else if (values.currencyName.length > 50) {
      errors.currencyName = "Max 50 characters allowed";
    }

    if (!values.APRinterest) {
      errors.APRinterest = "APY Interest is required";
    } else if (values.APRinterest < 0) {
      errors.APRinterest = "Value must be positive";
    }

    if (!values.minimumStakingflex) {
      errors.minimumStakingflex = "Minimum Staking Limit is required";
    }

    if (!values.maximumStakingflex) {
      errors.maximumStakingflex = "Maximum Staking Limit is required";
    } else if (maximumStaking <= minimumStaking) {
      errors.maximumStakingflex =
        "Max Staking Limit must be greater than Min Staking Limit";
    }

    if (!values.statusflex) {
      errors.statusflex = "Status is required";
    }

    return errors;
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-xl-2 col-lg-3 d-none d-lg-block px-0">
            <Sidebar />
          </div>

          <div className="col-xl-10 col-lg-9 col-12 px-0">
            <div className="pos_sticky">
              <Sidebar_2 />
            </div>

            {/* {loader ? (
              <SkeletonwholeProject />
            ) : ( */}
            <>
              <div className="px-4 transaction_padding_top">
                {stakingpage == false && otcpage == false ? (
                  <div className="px-2 my-4 transaction_padding_top tops">
                    <div className="headerss">
                      <span className="dash-head">Currency Settings</span>

                      <div className="usr_mng_rgt">
                        {add == false ? (
                          <>
                            <div className="filter_container">
                              <input
                                className="filter_input"
                                placeholder="Search currencyname"
                                value={filterKeyword}
                                ref={inputRef}
                                onChange={handleFilterChange}
                              />
                              <i className="fa-solid fa-magnifying-glass"></i>
                            </div>
                            {/* <button
                              onClick={() => setAdd(true)}
                              className="export_btn"
                            >
                              Add
                              <i className="fa-solid fa-circle-plus"></i>
                            </button> */}
                          </>
                        ) : (
                          <button
                            className="export_btn"
                            onClick={() => sentback()}
                          >
                            Back
                          </button>
                        )}
                      </div>
                    </div>
                    {add == false ? (
                      <div className="my-5 trans-table">
                        <div className="table-responsive">
                          <table className="w_100">
                            <thead className="trans-head">
                              <tr>
                                <th>S.No</th>
                                <th>Currency Image</th>
                                <th>Name</th>
                                <th>Symbol</th>
                                <th>Status</th>
                                {/* <th>Fixed Staking</th>
                              <th>Flexible Staking</th> */}
                                {/*<th>OTC Settings</th> */}
                                <th>Action</th>
                                {/* <th>Delete</th> */}
                              </tr>
                            </thead>
                            {loader == true ? (
                              // <tr>
                              //   <td colSpan={9}>
                              //     <div className="empty_data my-4">
                              //       <div className="plus_14_ff">
                              //         <div className="loader_main loader_mainChange">
                              //           <ScaleLoader
                              //             color="#dfc822"
                              //             height={60}
                              //             width={5}
                              //           />
                              //           <p style={{ marginTop: "10px" }}></p>
                              //         </div>
                              //       </div>
                              //     </div>
                              //   </td>
                              // </tr>
                              <tbody>
                                {rows.map((_, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {Array.from({ length: cols }).map(
                                      (_, colIndex) => (
                                        <td key={colIndex}>
                                          <Skeleton
                                            variant="rounded"
                                            height={22}
                                            sx={{
                                              bgcolor: "#b8b8b833",
                                              borderRadius: "6px",
                                            }}
                                          />
                                        </td>
                                      )
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            ) : (
                              <tbody>
                                {filteredUsers.length > 0 ? (
                                  filteredUsers.map((item, i) => (
                                    <tr key={item._id}>
                                      <td>
                                        <span className="plus_14_ff">
                                          {i + 1}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          <img
                                            width="35px"
                                            src={item.Currency_image}
                                            alt="Currency"
                                          />
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.name}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.symbol}
                                        </span>
                                      </td>
                                      <td>
                                        {item.status == "Active" ? (
                                          <span className="plus_14_ff text-success">
                                            {item.status}
                                          </span>
                                        ) : (
                                          <span className="plus_14_ff text-danger">
                                            {item.status}
                                          </span>
                                        )}
                                      </td>
                                      {/* <td>
                                    <span className="plus_14_ff ed-icon-fz">
                                      <i
                                        className="fa-regular fa-pen-to-square cursor-pointer"
                                        onClick={() =>
                                          stakingstate("Fixed", item._id)
                                        }
                                      ></i>
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff ed-icon-fz">
                                      <i
                                        className="fa-regular fa-pen-to-square cursor-pointer"
                                        onClick={() =>
                                          stakingstate("FLexible", item._id)
                                        }
                                      ></i>
                                    </span>
                                  </td> */}
                                      {/* <td>
                                    <span className="plus_14_ff ed-icon-fz">
                                      <i
                                        className="fa-regular fa-pen-to-square cursor-pointer"
                                        onClick={() =>
                                          handleOtcSettings(item._id)
                                        }
                                      ></i>
                                    </span>
                                  </td> */}

                                      <td>
                                        <span className="plus_14_ff ed-icon-fz">
                                          <i
                                            className="fa-regular fa-pen-to-square cursor-pointer"
                                            onClick={() =>
                                              getEditDetails(
                                                item._id,
                                                item.symbol
                                              )
                                            }
                                          ></i>
                                        </span>
                                      </td>
                                      {/* <td>
                                        <span className="plus_14_ff ed-icon-fz">
                                          <i
                                            className="fa-regular fa-trash-can text-danger cursor-pointer"
                                            // onClick={() => deletecurrency(item._id)}
                                            onClick={() => handleOpen()}
                                          ></i>
                                        </span>
                                      </td> */}

                                      <Modal
                                        aria-labelledby="transition-modal-title"
                                        aria-describedby="transition-modal-description"
                                        open={open}
                                        onClose={handleClose}
                                        closeAfterTransition
                                        slots={{ backdrop: Backdrop }}
                                        slotProps={{
                                          backdrop: {
                                            timeout: 500,
                                          },
                                        }}
                                      >
                                        <Fade in={open}>
                                          <Box
                                            sx={style}
                                            className="popup_modal-delete"
                                          >
                                            <div className="popup_modal-title">
                                              <span>
                                                <span className="popup_modal-title-icon">
                                                  <i className="fa-solid fa-triangle-exclamation"></i>
                                                </span>
                                                Confirm Delete
                                              </span>
                                            </div>
                                            <div className="popup_modal-content">
                                              <p>
                                                Are you sure you want to
                                                permanently delete this item?
                                              </p>
                                            </div>
                                            <div className="popup_modal-btn-wrap">
                                              <button
                                                className="popup_modal-btn-cancel"
                                                onClick={() => handleClose()}
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                className="popup_modal-btn-confirm"
                                                onClick={() =>
                                                  deletecurrency(item._id)
                                                }
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          </Box>
                                        </Fade>
                                      </Modal>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={9}>
                                      <div className="empty_data my-4">
                                        <div className="plus_14_ff">
                                          No Records Found
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}

                                {filteredUsers.length > 0 ? (
                                  <tr className="text-center">
                                    <td colSpan="9">
                                      <div className="paginationcss">
                                        <ReactPaginate
                                          previousLabel={"<"}
                                          nextLabel={">"}
                                          forcePage={currentPage - 1}
                                          breakLabel={"..."}
                                          pageCount={totalPages}
                                          marginPagesDisplayed={1}
                                          pageRangeDisplayed={2}
                                          onPageChange={handlePageClick}
                                          containerClassName={
                                            "pagination pagination-md justify-content-center"
                                          }
                                          pageClassName={"page-item"}
                                          pageLinkClassName={"page-link"}
                                          previousClassName={"page-item"}
                                          previousLinkClassName={"page-link"}
                                          nextClassName={"page-item"}
                                          nextLinkClassName={"page-link"}
                                          breakClassName={"page-item"}
                                          breakLinkClassName={"page-link"}
                                          activeClassName={"active"}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  ""
                                )}
                              </tbody>
                            )}
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="currencyinput mt-5">
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Currency Symbol
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              name="currencySymbol"
                              value={formData.currencySymbol}
                              onChange={handleChange}
                              placeholder="Currency Symbol"
                              className="form-control"
                              required
                            />
                            <div className="help-block">
                              {validationnErr.currencySymbol && (
                                <div className="error">
                                  {validationnErr.currencySymbol}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Currency Name
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              name="currencyName"
                              value={formData.currencyName}
                              onChange={handleChange}
                              placeholder="Currency Name"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.currencyName && (
                                <div className="error">
                                  {validationnErr.currencyName}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Currency Image
                          </label>
                          <div className="col-lg-6">
                            <div className="radio">
                              <div className="imagefile">
                                <input
                                  type="file"
                                  onChange={(e) =>
                                    handleFileChange(e.target.files[0])
                                  }
                                />{" "}
                                {imageName == ""
                                  ? "Upload Currency Image"
                                  : imageName}
                              </div>
                              <img src={formData.Currency_image} width="50px" />
                            </div>
                            <div className="help-block">
                              {validationnErr.Currency_image && (
                                <div className="error">
                                  {validationnErr.Currency_image}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* 
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Token Price
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              name="tokenPrice"
                              value={formData.tokenPrice}
                              onChange={handleChange}
                              placeholder="Currency Name"
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.tokenPrice && (
                                <div className="error">
                                  {validationnErr.tokenPrice}
                                </div>
                              )}
                            </div>
                          </div>
                        </div> */}

                        {/* <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                          Staking Deposit fees %
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              name="stakeDepositFee"
                              value={formData.stakeDepositFee}
                              onChange={handleChange}
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              placeholder="Currency Name"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.stakeDepositFee && (
                                <div className="error">
                                  {validationnErr.stakeDepositFee}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Staking withdraw fees %
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              name="stakeWitdrawFee"
                              value={formData.stakeWitdrawFee}
                              onChange={handleChange}
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              placeholder="Currency Name"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.stakeWitdrawFee && (
                                <div className="error">
                                  {validationnErr.stakeWitdrawFee}
                                </div>
                              )}
                            </div>
                          </div>
                        </div> */}

                        {/* <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Asset Type
                          </label>
                          <div className="col-lg-6">
                            <div className="radio">
                              <div>
                                <input
                                  type="radio"
                                  name="coinType"
                                  value="1"
                                  onChange={handleChange}
                                  checked={formData.coinType == "1"}
                                />{" "}
                                Crypto
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name="coinType"
                                  value="2"
                                  onChange={handleChange}
                                  checked={formData.coinType == "2"}
                                />{" "}
                                FIAT
                              </div>
                            </div>
                            <div className="help-block">
                              {validationnErr.coinType && (
                                <div className="error">
                                  {validationnErr.coinType}
                                </div>
                              )}
                            </div>
                          </div>
                        </div> */}

                        {/* {formData.coinType == "1" && (
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Currency Type
                            </label>
                            <div className="col-lg-6">
                              <div className="radio">
                                <div>
                                  <input
                                    type="radio"
                                    name="currencyType"
                                    value="1"
                                    onChange={handleChange}
                                    checked={formData.currencyType == "1"}
                                  />{" "}
                                  Coin
                                </div>
                                <div>
                                  <input
                                    type="radio"
                                    name="currencyType"
                                    value="2"
                                    onChange={handleChange}
                                    checked={formData.currencyType == "2"}
                                  />{" "}
                                  Token
                                </div>
                              </div>
                              <div className="help-block">
                                {validationnErr.currencyType && (
                                  <div className="error">
                                    {validationnErr.currencyType}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )} */}

                        {/* {formData.currencyType == "2" &&
                          formData.coinType == "1" && (
                            <>
                              <div className="form-group row">
                                <label className="col-lg-6 col-form-label form-control-label">
                                  ERC20 Token
                                </label>
                                <div className="col-lg-6">
                                  <div className="radio">
                                    <div>
                                      <input
                                        type="radio"
                                        name="erc20token"
                                        value="1"
                                        onChange={handleChange}
                                        checked={formData.erc20token == "1"}
                                      />{" "}
                                      Active
                                    </div>
                                    <div>
                                      <input
                                        type="radio"
                                        name="erc20token"
                                        value="2"
                                        onChange={handleChange}
                                        checked={formData.erc20token == "2"}
                                      />{" "}
                                      Deactive
                                    </div>
                                  </div>
                                  <div className="help-block">
                                    {validationnErr.erc20token && (
                                      <div className="error">
                                        {validationnErr.erc20token}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {formData.erc20token == "1" && (
                                <>
                                  <div className="form-group row">
                                    <label className="col-lg-6 col-form-label form-control-label">
                                      ERC20 Contract Address
                                    </label>
                                    <div className="col-lg-6">
                                      <input
                                        type="text"
                                        name="contractAddress_erc20"
                                        value={formData.contractAddress_erc20}
                                        onChange={handleChange}
                                        placeholder="ERC20 Contract Address"
                                        className="form-control"
                                      />
                                      <div className="help-block">
                                        {validationnErr.contractAddress_erc20 && (
                                          <div className="error">
                                            {
                                              validationnErr.contractAddress_erc20
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="form-group row">
                                    <label className="col-lg-6 col-form-label form-control-label">
                                      ERC20 Coin Decimal
                                    </label>
                                    <div className="col-lg-6">
                                      <input
                                        type="number"
                                        min={0}
                                        name="coinDecimal_erc20"
                                        value={formData.coinDecimal_erc20}
                                        onChange={handleChange}
                                        onKeyDown={(evt) =>
                                          ["e", "E", "+", "-"].includes(
                                            evt.key
                                          ) && evt.preventDefault()
                                        }
                                        placeholder="ERC20 Coin Decimal"
                                        className="form-control"
                                      />
                                      <div className="help-block">
                                        {validationnErr.coinDecimal_erc20 && (
                                          <div className="error">
                                            {validationnErr.coinDecimal_erc20}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              <div className="form-group row">
                                <label className="col-lg-6 col-form-label form-control-label">
                                  TRC20 Token
                                </label>
                                <div className="col-lg-6">
                                  <div className="radio">
                                    <div>
                                      <input
                                        type="radio"
                                        name="trc20token"
                                        value="1"
                                        onChange={handleChange}
                                        checked={formData.trc20token == "1"}
                                      />{" "}
                                      Active
                                    </div>
                                    <div>
                                      <input
                                        type="radio"
                                        name="trc20token"
                                        value="2"
                                        onChange={handleChange}
                                        checked={formData.trc20token == "2"}
                                      />{" "}
                                      Deactive
                                    </div>
                                  </div>
                                  <div className="help-block">
                                    {validationnErr.trc20token && (
                                      <div className="error">
                                        {validationnErr.trc20token}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {formData.trc20token == "1" && (
                                <>
                                  <div className="form-group row">
                                    <label className="col-lg-6 col-form-label form-control-label">
                                      TRC20 Contract Address
                                    </label>
                                    <div className="col-lg-6">
                                      <input
                                        type="text"
                                        name="contractAddress_trc20"
                                        value={formData.contractAddress_trc20}
                                        onChange={handleChange}
                                        placeholder="TRC20 Contract Address"
                                        className="form-control"
                                      />
                                      <div className="help-block">
                                        {validationnErr.contractAddress_trc20 && (
                                          <div className="error">
                                            {
                                              validationnErr.contractAddress_trc20
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="form-group row">
                                    <label className="col-lg-6 col-form-label form-control-label">
                                      TRC20 Coin Decimal
                                    </label>
                                    <div className="col-lg-6">
                                      <input
                                        type="number"
                                        min={0}
                                        name="coinDecimal_trc20"
                                        value={formData.coinDecimal_trc20}
                                        onChange={handleChange}
                                        placeholder="TRC20 Coin Decimal"
                                        className="form-control"
                                      />
                                      <div className="help-block">
                                        {validationnErr.coinDecimal_trc20 && (
                                          <div className="error">
                                            {validationnErr.coinDecimal_trc20}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              <div className="form-group row">
                                <label className="col-lg-6 col-form-label form-control-label">
                                  BEP20 Token
                                </label>
                                <div className="col-lg-6">
                                  <div className="radio">
                                    <div>
                                      <input
                                        type="radio"
                                        name="bep20token"
                                        value="1"
                                        onChange={handleChange}
                                        checked={formData.bep20token == "1"}
                                      />{" "}
                                      Active
                                    </div>
                                    <div>
                                      <input
                                        type="radio"
                                        name="bep20token"
                                        value="2"
                                        onChange={handleChange}
                                        checked={formData.bep20token == "2"}
                                      />{" "}
                                      Deactive
                                    </div>
                                  </div>
                                  <div className="help-block">
                                    {validationnErr.bep20token && (
                                      <div className="error">
                                        {validationnErr.bep20token}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {formData.bep20token == "1" && (
                                <>
                                  <div className="form-group row">
                                    <label className="col-lg-6 col-form-label form-control-label">
                                      BEP20 Contract Address
                                    </label>
                                    <div className="col-lg-6">
                                      <input
                                        type="text"
                                        name="contractAddress_bep20"
                                        value={formData.contractAddress_bep20}
                                        onChange={handleChange}
                                        placeholder="BEP20 Contract Address"
                                        className="form-control"
                                      />
                                      <div className="help-block">
                                        {validationnErr.contractAddress_bep20 && (
                                          <div className="error">
                                            {
                                              validationnErr.contractAddress_bep20
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="form-group row">
                                    <label className="col-lg-6 col-form-label form-control-label">
                                      BEP20 Coin Decimal
                                    </label>
                                    <div className="col-lg-6">
                                      <input
                                        type="number"
                                        min={0}
                                        name="coinDecimal_bep20"
                                        value={formData.coinDecimal_bep20}
                                        onChange={handleChange}
                                        placeholder="BEP20 Coin Decimal"
                                        className="form-control"
                                      />
                                      <div className="help-block">
                                        {validationnErr.coinDecimal_bep20 && (
                                          <div className="error">
                                            {validationnErr.coinDecimal_bep20}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              <div className="form-group row">
                                <label className="col-lg-6 col-form-label form-control-label">
                                  Matic Token
                                </label>
                                <div className="col-lg-6">
                                  <div className="radio">
                                    <div>
                                      <input
                                        type="radio"
                                        name="matictoken"
                                        value="1"
                                        onChange={handleChange}
                                        checked={formData.matictoken == "1"}
                                      />{" "}
                                      Active
                                    </div>
                                    <div>
                                      <input
                                        type="radio"
                                        name="matictoken"
                                        value="2"
                                        onChange={handleChange}
                                        checked={formData.matictoken == "2"}
                                      />{" "}
                                      Deactive
                                    </div>
                                  </div>
                                  <div className="help-block">
                                    {validationnErr.matictoken && (
                                      <div className="error">
                                        {validationnErr.matictoken}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {formData.matictoken == "1" && (
                                <>
                                  <div className="form-group row">
                                    <label className="col-lg-6 col-form-label form-control-label">
                                      Matic Contract Address
                                    </label>
                                    <div className="col-lg-6">
                                      <input
                                        type="text"
                                        name="contractAddress_matic"
                                        value={formData.contractAddress_matic}
                                        onChange={handleChange}
                                        placeholder="Matic Contract Address"
                                        className="form-control"
                                      />
                                      <div className="help-block">
                                        {validationnErr.contractAddress_matic && (
                                          <div className="error">
                                            {
                                              validationnErr.contractAddress_matic
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="form-group row">
                                    <label className="col-lg-6 col-form-label form-control-label">
                                      Matic Coin Decimal
                                    </label>
                                    <div className="col-lg-6">
                                      <input
                                        type="number"
                                        min={0}
                                        name="coinDecimal_matic"
                                        value={formData.coinDecimal_matic}
                                        onChange={handleChange}
                                        placeholder="Matic Coin Decimal"
                                        className="form-control"
                                      />
                                      <div className="help-block">
                                        {validationnErr.coinDecimal_matic && (
                                          <div className="error">
                                            {validationnErr.coinDecimal_matic}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              <div className="form-group row">
                                <label className="col-lg-6 col-form-label form-control-label">
                                  Solana Token
                                </label>
                                <div className="col-lg-6">
                                  <div className="radio">
                                    <div>
                                      <input
                                        type="radio"
                                        name="soltoken"
                                        value="1"
                                        onChange={handleChange}
                                        checked={formData.soltoken == "1"}
                                      />{" "}
                                      Active
                                    </div>
                                    <div>
                                      <input
                                        type="radio"
                                        name="soltoken"
                                        value="2"
                                        onChange={handleChange}
                                        checked={formData.soltoken == "2"}
                                      />{" "}
                                      Deactive
                                    </div>
                                  </div>
                                  <div className="help-block">
                                    {validationnErr.soltoken && (
                                      <div className="error">
                                        {validationnErr.soltoken}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {formData.soltoken == "1" && (
                                <>
                                  <div className="form-group row">
                                    <label className="col-lg-6 col-form-label form-control-label">
                                      Solana Contract Address
                                    </label>
                                    <div className="col-lg-6">
                                      <input
                                        type="text"
                                        name="contractAddress_sol"
                                        value={formData.contractAddress_sol}
                                        onChange={handleChange}
                                        placeholder="Solana Contract Address"
                                        className="form-control"
                                      />
                                      <div className="help-block">
                                        {validationnErr.contractAddress_sol && (
                                          <div className="error">
                                            {validationnErr.contractAddress_sol}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="form-group row">
                                    <label className="col-lg-6 col-form-label form-control-label">
                                      Solana Coin Decimal
                                    </label>
                                    <div className="col-lg-6">
                                      <input
                                        type="number"
                                        min={0}
                                        name="coinDecimal_sol"
                                        value={formData.coinDecimal_sol}
                                        onChange={handleChange}
                                        placeholder="Solana Coin Decimal"
                                        className="form-control"
                                      />
                                      <div className="help-block">
                                        {validationnErr.coinDecimal_sol && (
                                          <div className="error">
                                            {validationnErr.coinDecimal_sol}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              <div className="form-group row">
                                <label className="col-lg-6 col-form-label form-control-label">
                                  Arbitrum Token
                                </label>
                                <div className="col-lg-6">
                                  <div className="radio">
                                    <div>
                                      <input
                                        type="radio"
                                        name="arb20token"
                                        value="1"
                                        onChange={handleChange}
                                        checked={formData.arb20token == "1"}
                                      />{" "}
                                      Active
                                    </div>
                                    <div>
                                      <input
                                        type="radio"
                                        name="arb20token"
                                        value="2"
                                        onChange={handleChange}
                                        checked={formData.arb20token == "2"}
                                      />{" "}
                                      Deactive
                                    </div>
                                  </div>
                                  <div className="help-block">
                                    {validationnErr.arb20token && (
                                      <div className="error">
                                        {validationnErr.arb20token}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {formData.arb20token == "1" && (
                                <>
                                  <div className="form-group row">
                                    <label className="col-lg-6 col-form-label form-control-label">
                                      Arbitrum Contract Address
                                    </label>
                                    <div className="col-lg-6">
                                      <input
                                        type="text"
                                        name="contractAddress_arb"
                                        value={formData.contractAddress_arb}
                                        onChange={handleChange}
                                        placeholder="Arbitrum Contract Address"
                                        className="form-control"
                                      />
                                      <div className="help-block">
                                        {validationnErr.contractAddress_arb && (
                                          <div className="error">
                                            {validationnErr.contractAddress_arb}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="form-group row">
                                    <label className="col-lg-6 col-form-label form-control-label">
                                      Arbitrum Coin Decimal
                                    </label>
                                    <div className="col-lg-6">
                                      <input
                                        type="number"
                                        min={0}
                                        name="coinDecimal_arb"
                                        value={formData.coinDecimal_arb}
                                        onChange={handleChange}
                                        placeholder="Arbitrum Coin Decimal"
                                        className="form-control"
                                      />
                                      <div className="help-block">
                                        {validationnErr.coinDecimal_arb && (
                                          <div className="error">
                                            {validationnErr.coinDecimal_arb}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          )}

                        {formData.coinType == "1" ? (
                          <>
                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Withdraw Fees (%)
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="number"
                                  onKeyDown={(evt) =>
                                    ["e", "E", "+", "-"].includes(evt.key) &&
                                    evt.preventDefault()
                                  }
                                  name="withdrawFee"
                                  value={formData.withdrawFee}
                                  onChange={handleChange}
                                  placeholder="Withdraw fees"
                                  className="form-control"
                                />
                                <div className="help-block">
                                  {validationnErr.withdrawFee && (
                                    <div className="error">
                                      {validationnErr.withdrawFee}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Deposit Fees (in Rs)
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="number"
                                  onKeyDown={(evt) =>
                                    ["e", "E", "+", "-"].includes(evt.key) &&
                                    evt.preventDefault()
                                  }
                                  name="fiatdepositFee"
                                  value={formData.fiatdepositFee}
                                  onChange={handleChange}
                                  placeholder="Depsoit fees"
                                  className="form-control"
                                />
                                <div className="help-block">
                                  {validationnErr.fiatdepositFee && (
                                    <div className="error">
                                      {validationnErr.fiatdepositFee}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div> */}
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Withdraw Fees (in Rs)
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              name="fiatwithdrawFee"
                              value={formData.fiatwithdrawFee}
                              onChange={handleChange}
                              placeholder="Withdraw fees"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.fiatwithdrawFee && (
                                <div className="error">
                                  {validationnErr.fiatwithdrawFee}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* </>
                        )} */}

                        {/* <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Minimum Swap
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number "
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              name="minSwap"
                              value={formData.minSwap}
                              onChange={handleChange}
                              placeholder="Minimum Swap"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.minSwap && (
                                <div className="error">
                                  {validationnErr.minSwap}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Maximum Swap
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              name="maxSwap"
                              value={formData.maxSwap}
                              onChange={handleChange}
                              placeholder="Maximum Swap"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.maxSwap && (
                                <div className="error">
                                  {validationnErr.maxSwap}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Swap Fees (%)
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              name="swapFee"
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              value={formData.swapFee}
                              onChange={handleChange}
                              placeholder="Swap fees"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.swapFee && (
                                <div className="error">
                                  {validationnErr.swapFee}
                                </div>
                              )}
                            </div>
                          </div>
                        </div> */}

                        {/* {formData.coinType == "1" ? ( */}
                        {/* <> */}
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Minimum Withdraw
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              name="minWithdrawLimit"
                              value={formData.minWithdrawLimit}
                              onChange={handleChange}
                              placeholder="Minimum Withdraw"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.minWithdrawLimit && (
                                <div className="error">
                                  {validationnErr.minWithdrawLimit}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Maximum Withdraw
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              name="maxWithdrawLimit"
                              value={formData.maxWithdrawLimit}
                              onChange={handleChange}
                              placeholder="Maximum Withdraw"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.maxWithdrawLimit && (
                                <div className="error">
                                  {validationnErr.maxWithdrawLimit}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* </> */}
                        {/* // ) : (
                        //   ""
                        // )} */}

                        {/* {formData.coinType == "1" && (
                          <>
                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Minimum Deposit
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="text"
                                  name="minimumDeposit"
                                  value={formData.minimumDeposit}
                                  onChange={handleChange}
                                  placeholder="Enter the deposit limit"
                                  className="form-control"
                                />
                                <div className="help-block">
                                  {validationnErr.minimumDeposit && (
                                    <div className="error">
                                      {validationnErr.minimumDeposit}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Maximum Deposit
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="text"
                                  name="maximumDeposit"
                                  value={formData.maximumDeposit}
                                  onChange={handleChange}
                                  placeholder="Enter the deposit limit"
                                  className="form-control"
                                />
                                <div className="help-block">
                                  {validationnErr.maximumDeposit && (
                                    <div className="error">
                                      {validationnErr.maximumDeposit}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {formData.coinType == "2" ? (
                          <>
                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Minimum Deposit
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="text"
                                  name="fiatminimumDeposit"
                                  value={formData.fiatminimumDeposit}
                                  onChange={handleChange}
                                  placeholder="Enter the deposit limit"
                                  className="form-control"
                                />
                                <div className="help-block">
                                  {validationnErr.fiatminimumDeposit && (
                                    <div className="error">
                                      {validationnErr.fiatminimumDeposit}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Maximum Deposit
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="text"
                                  name="fiatmaximumDeposit"
                                  value={formData.fiatmaximumDeposit}
                                  onChange={handleChange}
                                  placeholder="Enter the deposit limit"
                                  className="form-control"
                                />
                                <div className="help-block">
                                  {validationnErr.fiatmaximumDeposit && (
                                    <div className="error">
                                      {validationnErr.fiatmaximumDeposit}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Minimum Withdraw
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="text"
                                  name="fiatminimumWithdraw"
                                  value={formData.fiatminimumWithdraw}
                                  onChange={handleChange}
                                  placeholder="Enter the withdraw limit"
                                  className="form-control"
                                />
                                <div className="help-block">
                                  {validationnErr.fiatminimumWithdraw && (
                                    <div className="error">
                                      {validationnErr.fiatminimumWithdraw}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Maximum Withdraw
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="text"
                                  name="fiatmaximumWithdraw"
                                  value={formData.fiatmaximumWithdraw}
                                  onChange={handleChange}
                                  placeholder="Enter the withdraw limit"
                                  className="form-control"
                                />
                                <div className="help-block">
                                  {validationnErr.fiatmaximumWithdraw && (
                                    <div className="error">
                                      {validationnErr.fiatmaximumWithdraw}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : null} */}

                        {/* Additional fields for depositStatus, withdrawStatus, etc. */}
                        {/* <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Deposit Status
                          </label>
                          <div className="col-lg-6">
                            <div className="radio">
                              <div>
                                <input
                                  type="radio"
                                  name="depositStatus"
                                  value="Active"
                                  onChange={handleChange}
                                  checked={formData.depositStatus == "Active"}
                                />{" "}
                                Active
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name="depositStatus"
                                  value="DeActive"
                                  onChange={handleChange}
                                  checked={formData.depositStatus == "DeActive"}
                                />{" "}
                                Deactive
                              </div>
                            </div>
                            <div className="help-block">
                              {validationnErr.depositStatus && (
                                <div className="error">
                                  {validationnErr.depositStatus}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Withdraw Status
                          </label>
                          <div className="col-lg-6">
                            <div className="radio">
                              <div>
                                <input
                                  type="radio"
                                  name="withdrawStatus"
                                  value="Active"
                                  onChange={handleChange}
                                  checked={formData.withdrawStatus == "Active"}
                                />{" "}
                                Active
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name="withdrawStatus"
                                  value="DeActive"
                                  onChange={handleChange}
                                  checked={
                                    formData.withdrawStatus == "DeActive"
                                  }
                                />{" "}
                                Deactive
                              </div>
                            </div>
                            <div className="help-block">
                              {validationnErr.withdrawStatus && (
                                <div className="error">
                                  {validationnErr.withdrawStatus}
                                </div>
                              )}
                            </div>
                          </div>
                        </div> */}

                        {/* <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Swap Status
                          </label>
                          <div className="col-lg-6">
                            <div className="radio">
                              <div>
                                <input
                                  type="radio"
                                  name="swapStatus"
                                  value="1"
                                  onChange={handleChange}
                                  checked={formData.swapStatus == "1"}
                                />{" "}
                                Active
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name="swapStatus"
                                  value="0"
                                  onChange={handleChange}
                                  checked={formData.swapStatus == "0"}
                                />{" "}
                                Deactive
                              </div>
                            </div>
                            <div className="help-block">
                              {validationnErr.swapStatus && (
                                <div className="error">
                                  {validationnErr.swapStatus}
                                </div>
                              )}
                            </div>
                          </div>
                        </div> */}

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Status
                          </label>
                          <div className="col-lg-6">
                            <div className="radio">
                              <div>
                                <input
                                  type="radio"
                                  name="status"
                                  value="Active"
                                  onChange={handleChange}
                                  checked={formData.status == "Active"}
                                />{" "}
                                Active
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name="status"
                                  value="Deactive"
                                  onChange={handleChange}
                                  checked={formData.status == "Deactive"}
                                />{" "}
                                Deactive
                              </div>
                            </div>
                            <div className="help-block">
                              {validationnErr.status && (
                                <div className="error">
                                  {validationnErr.status}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* {formData.coinType == "1" && (
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Launchpad Status
                          </label>
                          <div className="col-lg-6">
                            <div className="radio">
                              <div>
                                <input
                                  type="radio"
                                  name="launchpadStatus"
                                  value="Active"
                                  onChange={handleChange}
                                  checked={formData.launchpadStatus == "Active"}
                                />{" "}
                                Active
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name="launchpadStatus"
                                  value="DeActive"
                                  onChange={handleChange}
                                  checked={
                                    formData.launchpadStatus == "DeActive"
                                  }
                                />{" "}
                                Deactive
                              </div>
                            </div>
                            <div className="help-block">
                              {validationnErr.launchpadStatus && (
                                <div className="error">
                                  {validationnErr.launchpadStatus}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )} */}

                        {/* {formData.coinType == "2" && ( */}
                        {/* <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            P2P Status
                          </label>
                          <div className="col-lg-6">
                            <div className="radio">
                              <div>
                                <input
                                  type="radio"
                                  name="p2p_status"
                                  value="1"
                                  onChange={handleChange}
                                  checked={formData.p2p_status == "1"}
                                />{" "}
                                Active
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name="p2p_status"
                                  value="0"
                                  onChange={handleChange}
                                  checked={formData.p2p_status == "0"}
                                />{" "}
                                Deactive
                              </div>
                            </div>
                            <div className="help-block">
                              {validationnErr.p2p_status && (
                                <div className="error">
                                  {validationnErr.p2p_status}
                                </div>
                              )}
                            </div>
                          </div>
                        </div> */}
                        {/* )} */}

                        <div className="form-group row justify-content-center">
                          <div className="col-lg-4">
                            {buttonLoader == false ? (
                              <button
                                type="submit"
                                className="d-block w_100"
                                onClick={handleSubmit}
                              >
                                Submit
                              </button>
                            ) : (
                              <button type="submit" className="d-block w_100">
                                Loading ...
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : stakingpage == true && otcpage == false ? (
                  <div className="px-2 my-4 transaction_padding_top tops">
                    <div className="headerss">
                      <span className="dash-head">
                        {" "}
                        {stakeflex == false
                          ? "Fixed Staking Details"
                          : "Flexible Staking Details"}
                      </span>

                      <button onClick={() => sentback()}>Back</button>
                    </div>
                    {stakeflex == false ? (
                      <div className="currencyinput mt-5">
                        <form>
                          {/* Currency Name */}
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Currency Name
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="text"
                                name="currencyName"
                                value={stakingdata.currencyName}
                                onChange={handlestakeChange}
                                placeholder="Currency Name"
                                className="form-control"
                              />
                              <div className="help-block">
                                {stakevalidationerr.currencyName && (
                                  <div className="error">
                                    {stakevalidationerr.currencyName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Currency Symbol */}
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Currency Symbol
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="text"
                                name="currencySymbol"
                                value={stakingdata.currencySymbol}
                                onChange={handlestakeChange}
                                placeholder="Currency Symbol"
                                className="form-control"
                              />
                              <div className="help-block">
                                {stakevalidationerr.currencySymbol && (
                                  <div className="error">
                                    {stakevalidationerr.currencySymbol}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Duration First */}
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Duration First
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                min={0}
                                name="firstDuration"
                                value={stakingdata.firstDuration}
                                onChange={handlestakeChange}
                                placeholder="Duration First"
                                className="form-control"
                              />
                              <div className="help-block">
                                {stakevalidationerr.firstDuration && (
                                  <div className="error">
                                    {stakevalidationerr.firstDuration}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* First Duration APY */}
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              First Duration APY
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                min={0}
                                name="FistDurationAPY"
                                value={stakingdata.FistDurationAPY}
                                onChange={handlestakeChange}
                                placeholder="First Duration APY"
                                className="form-control"
                              />
                              <div className="help-block">
                                {stakevalidationerr.FistDurationAPY && (
                                  <div className="error">
                                    {stakevalidationerr.FistDurationAPY}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Duration Second
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                min={0}
                                name="secondDuration"
                                value={stakingdata.secondDuration}
                                onChange={handlestakeChange}
                                placeholder="Duration Second"
                                className="form-control"
                              />
                              <div className="help-block">
                                {stakevalidationerr.secondDuration && (
                                  <div className="error">
                                    {stakevalidationerr.secondDuration}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Second Duration APY */}
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Second Duration APY
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                min={0}
                                name="SecondDurationAPY"
                                value={stakingdata.SecondDurationAPY}
                                onChange={handlestakeChange}
                                placeholder="Second Duration APY"
                                className="form-control"
                              />
                              <div className="help-block">
                                {stakevalidationerr.SecondDurationAPY && (
                                  <div className="error">
                                    {stakevalidationerr.SecondDurationAPY}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Duration Third
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                min={0}
                                name="thirdDuration"
                                value={stakingdata.thirdDuration}
                                onChange={handlestakeChange}
                                placeholder="Duration Third"
                                className="form-control"
                              />
                              <div className="help-block">
                                {stakevalidationerr.thirdDuration && (
                                  <div className="error">
                                    {stakevalidationerr.thirdDuration}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Third Duration APY */}
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Third Duration APY
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                min={0}
                                name="ThirdDurationAPY"
                                value={stakingdata.ThirdDurationAPY}
                                onChange={handlestakeChange}
                                placeholder="Third Duration APY"
                                className="form-control"
                              />
                              <div className="help-block">
                                {stakevalidationerr.ThirdDurationAPY && (
                                  <div className="error">
                                    {stakevalidationerr.ThirdDurationAPY}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Duration Fourth
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                min={0}
                                name="fourthDuration"
                                value={stakingdata.fourthDuration}
                                onChange={handlestakeChange}
                                placeholder="Duration Fourth"
                                className="form-control"
                              />
                              <div className="help-block">
                                {stakevalidationerr.fourthDuration && (
                                  <div className="error">
                                    {stakevalidationerr.fourthDuration}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Fourth Duration APY */}
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Fourth Duration APY
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                min={0}
                                name="FourthDurationAPY"
                                value={stakingdata.FourthDurationAPY}
                                onChange={handlestakeChange}
                                placeholder="Fourth Duration APY"
                                className="form-control"
                              />
                              <div className="help-block">
                                {stakevalidationerr.FourthDurationAPY && (
                                  <div className="error">
                                    {stakevalidationerr.FourthDurationAPY}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Minimum Staking
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                min={0}
                                name="minimumStaking"
                                value={stakingdata.minimumStaking}
                                onChange={handlestakeChange}
                                placeholder="Minimum Staking"
                                className="form-control"
                              />
                              <div className="help-block">
                                {stakevalidationerr.minimumStaking && (
                                  <div className="error">
                                    {stakevalidationerr.minimumStaking}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Maximum Staking
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                min={0}
                                name="maximumStaking"
                                value={stakingdata.maximumStaking}
                                onChange={handlestakeChange}
                                placeholder="Maximum Staking"
                                className="form-control"
                              />
                              <div className="help-block">
                                {stakevalidationerr.maximumStaking && (
                                  <div className="error">
                                    {stakevalidationerr.maximumStaking}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Status
                            </label>
                            <div className="col-lg-6">
                              <div className="radio">
                                <div>
                                  <input
                                    type="radio"
                                    name="status"
                                    value="Active"
                                    onChange={handlestakeChange}
                                    checked={stakingdata.status === "Active"}
                                  />{" "}
                                  Active
                                </div>
                                <div>
                                  <input
                                    type="radio"
                                    name="status"
                                    value="Deactive"
                                    onChange={handlestakeChange}
                                    checked={stakingdata.status === "Deactive"}
                                  />{" "}
                                  Deactive
                                </div>
                              </div>
                              <div className="help-block">
                                {stakevalidationerr.status && (
                                  <div className="error">
                                    {stakevalidationerr.status}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </form>
                        <div className="form-group row justify-content-center">
                          <div className="col-lg-4">
                            {buttonLoaderStake == false ? (
                              <button
                                type="submit"
                                className="d-block w_100"
                                onClick={(e) => handlestakeSubmit(e, "Fixed")}
                              >
                                Submit
                              </button>
                            ) : (
                              <button type="submit" className="d-block w_100">
                                Loading ...
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="currencyinput mt-5">
                        <form>
                          {/* Currency Name */}
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Currency Name
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="text"
                                name="currencyName"
                                value={stakingdata.currencyName}
                                onChange={handleflexstakeChange}
                                placeholder="Currency Name"
                                className="form-control"
                              />

                              <div className="help-block">
                                {flexstakevalidation.currencyName && (
                                  <div className="error">
                                    {flexstakevalidation.currencyName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Currency Symbol */}
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Currency Symbol
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="text"
                                name="currencySymbol"
                                value={stakingdata.currencySymbol}
                                onChange={handleflexstakeChange}
                                placeholder="Currency Symbol"
                                className="form-control"
                              />
                              <div className="help-block">
                                {flexstakevalidation.currencySymbol && (
                                  <div className="error">
                                    {flexstakevalidation.currencySymbol}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Duration First */}
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              APR Interest
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                min={0}
                                name="APRinterest"
                                value={stakingdata.APRinterest}
                                onChange={handleflexstakeChange}
                                placeholder="APR Interest"
                                className="form-control"
                              />
                              <div className="help-block">
                                {flexstakevalidation.APRinterest && (
                                  <div className="error">
                                    {flexstakevalidation.APRinterest}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Minimum Staking
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                name="minimumStakingflex"
                                value={stakingdata.minimumStakingflex}
                                onChange={handleflexstakeChange}
                                placeholder="Minimum Staking"
                                className="form-control"
                              />
                              <div className="help-block">
                                {flexstakevalidation.minimumStakingflex && (
                                  <div className="error">
                                    {flexstakevalidation.minimumStakingflex}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Maximum Staking
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="Number"
                                min={0}
                                name="maximumStakingflex"
                                value={stakingdata.maximumStakingflex}
                                onChange={handleflexstakeChange}
                                placeholder="Maximum Staking"
                                className="form-control"
                              />
                              <div className="help-block">
                                {flexstakevalidation.maximumStakingflex && (
                                  <div className="error">
                                    {flexstakevalidation.maximumStakingflex}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Status
                            </label>
                            <div className="col-lg-6">
                              <div className="radio">
                                <div>
                                  <input
                                    type="radio"
                                    name="statusflex"
                                    value="Active"
                                    onChange={handleflexstakeChange}
                                    checked={
                                      stakingdata.statusflex === "Active"
                                    }
                                  />{" "}
                                  Active
                                </div>
                                <div>
                                  <input
                                    type="radio"
                                    name="statusflex"
                                    value="Deactive"
                                    onChange={handleflexstakeChange}
                                    checked={
                                      stakingdata.statusflex === "Deactive"
                                    }
                                  />{" "}
                                  Deactive
                                </div>
                              </div>
                              <div className="help-block">
                                {flexstakevalidation.statusflex && (
                                  <div className="error">
                                    {flexstakevalidation.statusflex}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Buttons */}
                        </form>
                        <div className="form-group row justify-content-center">
                          <div className="col-lg-4">
                            {buttonLoaderStake == false ? (
                              <button
                                type="submit"
                                className="d-block w_100"
                                onClick={(e) =>
                                  handlestakeSubmit(e, "Flexible")
                                }
                              >
                                Submit
                              </button>
                            ) : (
                              <button type="submit" className="d-block w_100">
                                Loading ...
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : stakingpage === false && otcpage === true ? (
                  <div className="px-2 my-4 transaction_padding_top tops">
                    <div className="headerss">
                      <span className="dash-head">
                        {otcpage === true
                          ? "OTC Staking Details"
                          : "Flexible Staking Details"}
                      </span>
                      <button onClick={() => sentback()}>Back</button>
                    </div>
                    <div className="currencyinput mt-5">
                      <form onSubmit={(e) => handlestakeSubmit(e, "OTC")}>
                        {/* Minimum Quantity */}
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Minimum Quantity
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              name="minQuantity"
                              value={otcSettings.minQuantity}
                              onChange={handleOtcSettingsChange}
                              className="form-control"
                              pattern="^\d+(\.\d+)?$" // Numeric validation
                              title="Enter a valid number"
                            />
                            {otcValidationErr.minQuantity && (
                              <span className="error" style={{ color: "red" }}>
                                {otcValidationErr.minQuantity}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Maximum Quantity */}
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Maximum Quantity
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              name="maxQuantity"
                              value={otcSettings.maxQuantity}
                              onChange={handleOtcSettingsChange}
                              className="form-control"
                              pattern="^\d+(\.\d+)?$" // Numeric validation
                              title="Enter a valid number"
                            />
                            {otcValidationErr.maxQuantity && (
                              <span className="error" style={{ color: "red" }}>
                                {otcValidationErr.maxQuantity}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* OTC Status */}
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            OTC Status
                          </label>
                          <div className="col-lg-6">
                            <div className="radio">
                              <div>
                                <input
                                  type="radio"
                                  name="otcStatus"
                                  value="Active"
                                  checked={otcSettings.otcStatus === true}
                                  onChange={handleOtcSettingsChange}
                                />{" "}
                                Active
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name="otcStatus"
                                  value="Deactive"
                                  checked={otcSettings.otcStatus === false}
                                  onChange={handleOtcSettingsChange}
                                />{" "}
                                Deactive
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row justify-content-center">
                          <div className="col-lg-4">
                            {buttonLoaderStake === false ? (
                              <button type="submit" className="d-block w_100">
                                Submit OTC Settings
                              </button>
                            ) : (
                              <button
                                type="submit"
                                className="d-block w_100"
                                disabled
                              >
                                Loading ...
                              </button>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </>
            {/* )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
