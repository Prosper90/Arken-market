import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import useState from "react-usestateref";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar_2 from "./Nav_bar";
import apiService from "../core/service/detail";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { env } from "../core/service/envconfig";
import { ScaleLoader } from "react-spinners";
import { postMethod, getMethod } from "../core/service/common.api";
import { setuid } from "process";

const getUpiProvider = (upiId) => {
  if (!upiId) return "Unknown";

  const providerMap = {
    "@ybl": "PhonePe",
    "@oksbi": "Google Pay",
    "@okhdfcbank": "Google Pay",
    "@okicici": "Google Pay",
    "@okaxis": "Google Pay",
    "@okkotak": "Google Pay",
    "@okboi": "Google Pay",
    "@okcanarabank": "Google Pay",
    "@paytm": "Paytm",
    "@apl": "Amazon Pay",
    "@upi": "BHIM UPI",
    "@hdfcbank": "HDFC Bank",
    "@icici": "ICICI Bank",
    "@axisbank": "Axis Bank",
    "@sbi": "State Bank of India",
    "@kotak": "Kotak Mahindra Bank",
    "@yesbankltd": "YES Bank",
    "@federal": "Federal Bank",
    "@indus": "IndusInd Bank",
    "@idbi": "IDBI Bank",
    "@idfc": "IDFC FIRST Bank",
    "@barodampay": "Bank of Baroda",
    "@pnb": "Punjab National Bank",
    "@canarabank": "Canara Bank",
    "@unionbank": "Union Bank of India",
    "@aubank": "AU Small Finance Bank",
    "@dbs": "DBS Bank",
    "@hsbc": "HSBC Bank",
    "@jkb": "Jammu & Kashmir Bank",
    "@rbl": "RBL Bank",
    "@uco": "UCO Bank",
    "@boi": "Bank of India",
    "@saraswat": "Saraswat Bank",
    "@kbl": "Karnataka Bank",
    "@psb": "Punjab & Sind Bank",
  };

  const handle = Object.keys(providerMap).find((key) => upiId.includes(key));

  return handle ? providerMap[handle] : "Unknown";
};

function Dashboard() {
  const [loader, setLoader] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buttonLoader, setbuttonLoader] = useState(false);
  const [buttonLoaderupi, setbuttonLoaderupi] = useState(false);
  const [isbankDetailsboo, setBankDetailsboo] = useState(false);
  const [isupiDetailsboo, setUpiDetailsboo] = useState(false);
  const [bankData, setBanks] = useState([]);
  const [upiId, setUpiId] = useState("");
  const [upiAppName, setupiAppName] = useState("");
  const [providerName, setProviderName] = useState("");
  const [isValidUpi, setIsValidUpi] = useState(false);
  const [titleTab, setTitleTab] = useState("fiatdeposit");
  const [contentTab, setContentTab] = useState("bankdeposit");
  const [bankCheck, setBankCheck] = useState("");
  const [upiCheck, setUpiCheck] = useState("");
  const [bankCode, setBankCode] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    holderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branch: "",
  });

  const [errors, setErrors] = useState({
    holderName: false,
    accountNumber: false,
    ifscCode: false,
  });

  const [touched, setTouched] = useState({
    holderName: false,
    accountNumber: false,
    ifscCode: false,
  });
  const [formDataupi, setFormDataupi] = useState({
    upiid: "",
    upiAppName: "",
  });

  const [errorsupi, setErrorsupi] = useState({
    upiid: false,
    upiAppName: false,
  });

  const [touchedupi, setTouchedupi] = useState({
    upiid: false,
    upiAppName: false,
  });

  useEffect(() => {
    getBankDetails();
  }, []);

  // const validateUpi = (upi) => {
  //   const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  //   if (upiRegex.test(upi)) {
  //     setIsValidUpi(true);
  //     setProviderName(getUpiProvider(upi));
  //   } else {
  //     setIsValidUpi(false);
  //     setProviderName("Invalid UPI");
  //   }
  // };

  const handleChange = async (e) => {
    const { id, value } = e.target;

    setFormData({ ...formData, [id]: value });

    if (touched[id]) {
      validateField(id, value);
    }

    // Fetch bank details on valid IFSC input
    if (id === "ifscCode" && value.length === 11) {
      fetchBankDetails(value);
    }
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    setTouched({ ...touched, [id]: true });
    validateField(id, value);
  };
  const handleBlurupi = (e) => {
    const { id, value } = e.target;
    setTouchedupi({ ...touched, [id]: true });
    validateField(id, value);
  };

  const validateField = (field, value) => {
    let isValid = true;

    if (field === "holderName") {
      isValid = value.trim().length >= 3;
    } else if (field === "accountNumber") {
      isValid = /^[0-9]{9,18}$/.test(value);
    } else if (field === "ifscCode") {
      isValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value); // IFSC Code Pattern Validation
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: !isValid,
    }));
  };

  // Fetch bank name & branch using Razorpay API
  const fetchBankDetails = async (ifscCode) => {
    try {
      const response = await fetch(`https://ifsc.razorpay.com/${ifscCode}`);
      if (!response.ok) throw new Error("Invalid IFSC Code");

      const bankDetails = await response.json();
      setFormData((prev) => ({
        ...prev,
        bankName: bankDetails.BANK,
        branch: bankDetails.BRANCH,
      }));
      setBankCode(bankDetails.BANKCODE);
    } catch (error) {
      console.error("Error fetching bank details:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        ifscCode: true,
      }));
    }
  };

  const getBankDetails = async () => {
    try {
      var data = {
        apiUrl: apiService.addedBanks,
      };

      var resp = await getMethod(data);

      if (resp.status == true && resp.data) {
        setBanks(resp.data);
      } else {
        setBanks([]);
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
      setBanks([]);
    }
  };

  const isFormValid =
    Object.values(errors).every((error) => !error) &&
    Object.values(formData).every((value) => value.trim() !== "");

  const handleTabClick = (tab) => {
    setTitleTab(tab);
  };

  const handleContentTabClick = (tab) => {
    setContentTab(tab);
  };

  const openBankdetails = () => {
    setBankDetailsboo(true);
    setFormData({
      holderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      branch: "",
    });
  };
  const openUpidetails = () => {
    setUpiDetailsboo(true);
    setUpiId("");
    setupiAppName("");
    setIsValidUpi(false);
    setUpiCheck("");
  };

  const bankUsingDepo = async (e) => {
    e.preventDefault();
    setBankDetailsboo(false);

    try {
      if (
        formData.accountNumber &&
        formData.bankName &&
        formData.ifscCode &&
        formData.branch
      ) {
        const bankData = {
          Account_Number: formData.accountNumber,
          Bank_Name: formData.bankName,
          IFSC_code: formData.ifscCode,
          Branch_Name: formData.branch,
          Bankshort_Name: bankCode,
          Holder_Name: formData.holderName,
        };

        const requestData = {
          apiUrl: apiService.addBank,
          payload: bankData,
        };

        setbuttonLoader(true);
        const response = await postMethod(requestData);
        setbuttonLoader(false);

        console.log(response, "== API Response ==");

        if (response.status === true) {
          toast.success("Bank added successfully!");
          getBankDetails();
          setFormData({
            holderName: "",
            accountNumber: "",
            ifscCode: "",
            bankName: "",
            branch: "",
          });
          setBankCheck("");
        } else {
          toast.error(response.Message);
          setFormData({
            holderName: "",
            accountNumber: "",
            ifscCode: "",
            bankName: "",
            branch: "",
          });
          setBankCheck("");
        }
      } else {
        toast.error("Please fill all required fields.");
      }
    } catch (error) {
      console.error("Error adding bank:", error);
      setbuttonLoader(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const validateUpiAppName = (upiApp) => {
    if (upiApp.length < 3) {
      setErrorsupi((prev) => ({
        ...prev,
        upiAppName: "UPI App Name must be at least 3 characters",
      }));
    } else {
      setErrorsupi((prev) => ({ ...prev, upiAppName: "" }));
    }
  };

  // Function to validate UPI ID format
  const validateUpi = (upi) => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (upiRegex.test(upi)) {
      setIsValidUpi(true);
      setProviderName(getUpiProvider(upi)); // Extract provider name from UPI ID
    } else {
      setIsValidUpi(false);
      setProviderName(""); // Clear provider name if invalid
    }
  };

  const upiUsingDepo = async (e) => {
    e.preventDefault();
    setUpiDetailsboo(false);

    try {
      if (upiId && upiAppName) {
        const bankData = {
          UPI_code: upiId,
          type: upiAppName,
        };

        const requestData = {
          apiUrl: apiService.addBank,
          payload: bankData,
        };

        setbuttonLoaderupi(true);
        const response = await postMethod(requestData);
        setbuttonLoaderupi(false);

        console.log(response, "== API Response ==");

        if (response.status === true) {
          toast.success("Bank added successfully!");
          getBankDetails();
          setUpiId("");
          setupiAppName("");
          setUpiCheck("");
          setIsValidUpi(false);
        } else {
          toast.error(response.Message);
          setFormData({
            holderName: "",
            accountNumber: "",
            ifscCode: "",
            bankName: "",
            branch: "",
          });
          setUpiCheck("");
          setIsValidUpi(false);
        }
      } else {
        toast.error("Please fill all required fields.");
      }
    } catch (error) {
      console.error("Error adding bank:", error);
      setbuttonLoaderupi(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleBankCheck = (bank, data) => {
    setBankCheck(bank);
    console.log(data, "data.Holder_Name");
    setFormData({
      holderName: String(data.Holder_Name || ""),
      accountNumber: String(data.Account_Number || ""),
      ifscCode: String(data.IFSC_code || ""),
      bankName: String(data.Bank_Name || ""),
      branch: String(data.Branch_Name || ""),
    });
    setBankDetailsboo(true);
  };
  const handleUpiCheck = (bank, data) => {
    setUpiCheck(bank);
    setUpiId(data.UPI_code || "");
    setupiAppName(data.type || "");
    validateUpi(data.UPI_code);
    setUpiDetailsboo(true);
  };

  return (
    <div>
      {loader == true ? (
        <div className="loadercss">
          <ScaleLoader
          height={50} width={5}
            color="#dfc822"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      ) : (
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-2 px-0">
              <Sidebar />
            </div>
            <div className="col-lg-10 px-0">
              <div className="pos_sticky">
                <Sidebar_2 />
                <div className="px-4 transaction_padding_top">
                  <div className="newInnerRight ">
                    <div className="dep-content-wrap">
                      <div className="dep-content-head">
                        <button
                          className={`dep-content-title-btn ${
                            contentTab === "bankdeposit" ? "active" : ""
                          }`}
                          onClick={() => handleContentTabClick("bankdeposit")}
                        >
                          Bank Deposit
                        </button>
                        <button
                          className={`dep-content-title-btn ${
                            contentTab === "upideposit" ? "active" : ""
                          }`}
                          onClick={() => handleContentTabClick("upideposit")}
                        >
                          UPI Deposit
                        </button>
                      </div>

                      {contentTab === "bankdeposit" ? (
                        <>
                          <div className="dep-content-body">
                            <div className="row gr-fd-row">
                              <div className="col-lg-6">
                                <div className="dep-ct-bdy-left">
                                  <div className="dep-num-title-wrap">
                                    <span>1</span>
                                    <h5>Select currency & bank</h5>
                                  </div>

                                  <h6 className="dep-label dep-mt-24">
                                    Currency
                                  </h6>
                                  <div className="dep-curr-wrap">
                                    <img
                                      src={require("../assets/india.webp")}
                                      alt=""
                                    />
                                    <h4 className="dep-curr-title">
                                      Indian Rupees
                                    </h4>
                                    <span className="dep-curr-span">INR</span>
                                  </div>

                                  <h6 className="dep-label dep-mt-24">Bank</h6>
                                  <div className="dep-bank-lists">
                                    {/* Add Bank Card always visible */}
                                    <div className="dep-bank-grid">
                                      <div
                                        className={`dep-bank-outernew`}
                                        onClick={() => openBankdetails()} // Add bank details logic here
                                      >
                                        <img
                                          src={require("../assets/bank.png")}
                                          alt="Add Bank"
                                        />
                                        <div>
                                          <h5 className="dep-bank-titlenew">
                                            {"Add Bank"}
                                          </h5>
                                        </div>
                                      </div>
                                      {bankData?.map((item) => {
                                        return item.banks?.map((data) => {
                                          let bankLogo = require("../assets/Default.png"); // Default image
                                          if (
                                            data.Bank_Name ===
                                            "State Bank of India"
                                          ) {
                                            bankLogo = require("../assets/SBI.png"); // SBI specific logo
                                          } else if (
                                            data.Bank_Name === "Axis Bank"
                                          ) {
                                            bankLogo = require("../assets/AXis.png"); // Axis Bank specific logo
                                          } else if (
                                            data.Bank_Name === "ICICI Bank"
                                          ) {
                                            bankLogo = require("../assets/ICICI.png"); // ICICI Bank specific logo
                                          } else if (
                                            data.Bank_Name === "HDFC Bank"
                                          ) {
                                            bankLogo = require("../assets/HDFC.png"); // HDFC Bank specific logo
                                          } else if (
                                            data.Bank_Name ===
                                            "Kotak Mahindra Bank"
                                          ) {
                                            bankLogo = require("../assets/kotak.png"); // Kotak Bank specific logo
                                          } else if (
                                            data.Bank_Name ===
                                            "Punjab National Bank"
                                          ) {
                                            bankLogo = require("../assets/PNB.png"); // Punjab National Bank specific logo
                                          } else if (
                                            data.Bank_Name === "Bank of Baroda"
                                          ) {
                                            bankLogo = require("../assets/BOB.png"); // Bank of Baroda specific logo
                                          } else if (
                                            data.Bank_Name === "IDFC FIRST Bank"
                                          ) {
                                            bankLogo = require("../assets/union.png"); // IDFC FIRST Bank specific logo
                                          } else if (
                                            data.Bank_Name === "Canara Bank"
                                          ) {
                                            bankLogo = require("../assets/Canara.png"); // Canara Bank specific logo
                                          } else if (
                                            data.Bank_Name ===
                                            "Union Bank of India"
                                          ) {
                                            bankLogo = require("../assets/Unionbank.png"); // Union Bank of India specific logo
                                          }

                                          return (
                                            <div
                                              key={data._id}
                                              className={`dep-bank-outer ${
                                                bankCheck === data.Bank_Name
                                                  ? "active"
                                                  : ""
                                              }`}
                                              onClick={() =>
                                                handleBankCheck(
                                                  data.Bank_Name,
                                                  data
                                                )
                                              }
                                            >
                                              {/* Use the dynamically selected logo */}
                                              <img
                                                src={bankLogo}
                                                alt={data.Bank_Name}
                                              />

                                              <div>
                                                <h5 className="dep-bank-title">
                                                  {data.Bank_Name}
                                                </h5>
                                                <div className="d-flex gap-2 mt-2 subtitle_shortname">
                                                  <span className="dep-bank-subtitle">
                                                    {data.Bankshort_Name}
                                                  </span>
                                                  <span className="dep-bank-fee">
                                                    {"0% fees"}
                                                  </span>
                                                </div>
                                              </div>

                                              {bankCheck === data.Bank_Name && (
                                                <span className="dep-bank-check">
                                                  <i className="fa-solid fa-check"></i>
                                                </span>
                                              )}
                                            </div>
                                          );
                                        });
                                      })}
                                    </div>
                                  </div>

                                  <button
                                    className="primary-btn w-100 mt-4"
                                    disabled={!isFormValid || buttonLoader}
                                    onClick={(e) => bankUsingDepo(e)}
                                    style={{
                                      backgroundColor: isFormValid
                                        ? "#dfc822"
                                        : "#1e5a43",
                                      cursor:
                                        !isFormValid || buttonLoader
                                          ? "not-allowed"
                                          : "pointer",
                                    }}
                                  >
                                    {buttonLoader ? (
                                      <span>
                                        <i className="fa fa-spinner fa-spin"></i>{" "}
                                      </span>
                                    ) : (
                                      "Submit"
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div className="col-lg-6">
                                <div className="dep-ct-bdy-right">
                                  <div className="dep-num-title-wrap">
                                    <span>2</span>
                                    <h5>Payment Details</h5>
                                  </div>

                                  <div className="dep-notes-wrap">
                                    <span className="dep-nt-span">Note:</span>
                                    <p className="dep-notes-txt">
                                      Always verify the admin bank account
                                      details{" "}
                                      <span className="dep-nt-span">
                                        (account number, name, and IFSC){" "}
                                      </span>
                                      before processing any transaction to
                                      prevent errors or fraud
                                    </p>
                                  </div>
                                  {isbankDetailsboo == true ? (
                                    <>
                                      <div className="dep-cpy-wrap">
                                        <h3 className="dep-cpy-title">
                                          Enter the bank details
                                        </h3>

                                        <div className="row">
                                          {/* Bank Holder Name */}
                                          <div className="col-lg-12 dep-mb-30">
                                            <label
                                              className="dep-label dep-mt-24"
                                              htmlFor="holderName"
                                            >
                                              Bank Holder Name
                                            </label>
                                            <div className="dep-input-wrap">
                                              <input
                                                type="text"
                                                placeholder="Enter the holder name"
                                                className="dep-input-nw"
                                                id="holderName"
                                                value={formData.holderName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                              />
                                              {errors.holderName &&
                                                touched.holderName && (
                                                  <span className="dep-error-text">
                                                    Holder name must be at least
                                                    3 characters
                                                  </span>
                                                )}
                                            </div>
                                          </div>

                                          {/* Account Number */}
                                          <div className="col-lg-12 dep-mb-30">
                                            <label
                                              className="dep-label dep-mt-24"
                                              htmlFor="accountNumber"
                                            >
                                              Account Number
                                            </label>
                                            <div className="dep-input-wrap">
                                              <input
                                                type="number"
                                                placeholder="Enter your Account Number"
                                                className="dep-input-nw"
                                                id="accountNumber"
                                                value={formData.accountNumber}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                              />
                                              {errors.accountNumber &&
                                                touched.accountNumber && (
                                                  <span className="dep-error-text">
                                                    Enter a valid 9-18 digit
                                                    account number
                                                  </span>
                                                )}
                                            </div>
                                          </div>

                                          {/* IFSC Code */}
                                          <div className="col-lg-12 dep-mb-30">
                                            <label
                                              className="dep-label dep-mt-24"
                                              htmlFor="ifscCode"
                                            >
                                              IFSC Code
                                            </label>
                                            <div className="dep-input-wrap">
                                              <input
                                                type="text"
                                                placeholder="Enter the IFSC Code"
                                                className="dep-input-nw"
                                                id="ifscCode"
                                                value={formData.ifscCode}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                              />
                                            </div>
                                            {errors.ifscCode &&
                                              touched.ifscCode && (
                                                <span className="dep-error-text">
                                                  Invalid IFSC Code
                                                </span>
                                              )}
                                          </div>

                                          {/* Bank Name (Auto-filled) */}
                                          <div className="col-xxl-6 col-lg-12">
                                            <h6 className="dep-label dep-mt-24">
                                              Bank Name
                                            </h6>
                                            <div className="dep-cpy-input-wrap">
                                              <span className="dep-cpy-in-txt">
                                                {formData.bankName || ""}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Auto-Filled Branch Name */}
                                          <div className="col-xxl-6 col-lg-12">
                                            <h6 className="dep-label dep-mt-24">
                                              Branch
                                            </h6>
                                            <div className="dep-cpy-input-wrap">
                                              <span className="dep-cpy-in-txt">
                                                {formData.branch || ""}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="dep-content-body">
                            <div className="row gr-fd-row">
                              <div className="col-lg-6">
                                <div className="dep-ct-bdy-left">
                                  <div className="dep-num-title-wrap">
                                    <span>1</span>
                                    <h5>Select currency & bank</h5>
                                  </div>

                                  <h6 className="dep-label dep-mt-24">
                                    Currency
                                  </h6>
                                  <div className="dep-curr-wrap">
                                    <img
                                      src={require("../assets/india.webp")}
                                      alt=""
                                    />
                                    <h4 className="dep-curr-title">
                                      Indian Rupees
                                    </h4>
                                    <span className="dep-curr-span">INR</span>
                                  </div>

                                  <h6 className="dep-label dep-mt-24">Bank</h6>
                                  <div className="dep-bank-lists">
                                    {/* Add Bank Card always visible */}
                                    <div className="dep-bank-grid">
                                      <div
                                        className={`dep-bank-outernew`}
                                        onClick={() => openUpidetails()} // Add bank details logic here
                                      >
                                        <img
                                          src={require("../assets/bank.png")}
                                          alt="Add Bank"
                                        />
                                        <div>
                                          <h5 className="dep-bank-titlenew">
                                            {"Add UPI App"}
                                          </h5>
                                        </div>
                                      </div>
                                      {bankData?.map((item) => {
                                        return item.upis?.map((data) => {
                                          let bankLogo = require("../assets/Defaultupi.png"); // Default image
                                          if (data.type === "PhonePe") {
                                            bankLogo = require("../assets/Phonepe.png"); // SBI specific logo
                                          } else if (
                                            data.type === "Google Pay"
                                          ) {
                                            bankLogo = require("../assets/Gpay.png"); // Axis Bank specific logo
                                          } else if (data.type === "Paytm") {
                                            bankLogo = require("../assets/Paytm.png"); // ICICI Bank specific logo
                                          } else if (
                                            data.type === "Amazon Pay"
                                          ) {
                                            bankLogo = require("../assets/APay.png"); // HDFC Bank specific logo
                                          } else if (data.type === "BHIM UPI") {
                                            bankLogo = require("../assets/Bhim.png"); // Kotak Bank specific logo
                                          } else if (
                                            data.type === "HDFC Bank"
                                          ) {
                                            bankLogo = require("../assets/HDFC.png"); // Punjab National Bank specific logo
                                          } else if (
                                            data.type === "ICICI Bank"
                                          ) {
                                            bankLogo = require("../assets/ICICI.png"); // Bank of Baroda specific logo
                                          }

                                          return (
                                            <div
                                              key={data._id}
                                              className={`dep-bank-outer ${
                                                upiCheck === data.type
                                                  ? "active"
                                                  : ""
                                              }`}
                                              onClick={() =>
                                                handleUpiCheck(data.type, data)
                                              }
                                            >
                                              <img
                                                src={bankLogo}
                                                alt={data.type}
                                              />

                                              <div>
                                                <h5 className="dep-bank-title">
                                                  {data.type}
                                                </h5>
                                                <div className="d-flex gap-2 mt-2 subtitle_shortname">
                                                  <span className="dep-bank-fee">
                                                    {"0% fees"}
                                                  </span>
                                                </div>
                                              </div>

                                              {upiCheck === data.type && (
                                                <span className="dep-bank-check">
                                                  <i className="fa-solid fa-check"></i>
                                                </span>
                                              )}
                                            </div>
                                          );
                                        });
                                      })}
                                    </div>
                                  </div>
                                  <button
                                    className="primary-btn w-100 mt-4"
                                    disabled={
                                      !isValidUpi ||
                                      upiAppName.length < 3 ||
                                      buttonLoaderupi
                                    }
                                    onClick={(e) => upiUsingDepo(e)}
                                    style={{
                                      backgroundColor:
                                        isValidUpi && upiAppName.length >= 3
                                          ? "#dfc822"
                                          : "#1e5a43",
                                      cursor:
                                        !isValidUpi ||
                                        upiAppName.length < 3 ||
                                        buttonLoaderupi
                                          ? "not-allowed"
                                          : "pointer",
                                    }}
                                  >
                                    {buttonLoaderupi ? (
                                      <span>
                                        <i className="fa fa-spinner fa-spin"></i>
                                      </span>
                                    ) : (
                                      "Submit"
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div className="col-lg-6">
                                <div className="dep-ct-bdy-right">
                                  <div className="dep-num-title-wrap">
                                    <span>2</span>
                                    <h5>Payment Details</h5>
                                  </div>
                                  <div className="dep-notes-wrap">
                                    <span className="dep-nt-span">Note:</span>
                                    <p className="dep-notes-txt">
                                      Ensure to deposit via UPI only from{" "}
                                      <span className="dep-nt-span">
                                        your own UPI ID{" "}
                                      </span>
                                      to avoid transaction issues.
                                    </p>
                                  </div>
                                  {isupiDetailsboo == true ? (
                                    <>
                                      <div className="dep-mb-30">
                                        <label
                                          className="dep-label dep-mt-24"
                                          htmlFor="upiAppName"
                                        >
                                          UPI App Name
                                        </label>
                                        <div className="dep-input-wrap">
                                          <input
                                            type="text"
                                            placeholder="Enter the UPI App Name"
                                            className="dep-input-nw"
                                            id="upiAppName"
                                            value={upiAppName}
                                            onChange={(e) => {
                                              setupiAppName(e.target.value);
                                              validateUpiAppName(
                                                e.target.value
                                              );
                                            }}
                                            onBlur={() =>
                                              setTouchedupi((prev) => ({
                                                ...prev,
                                                upiAppName: true,
                                              }))
                                            }
                                          />
                                          {errorsupi.upiAppName &&
                                            touchedupi.upiAppName && (
                                              <span className="dep-error-text">
                                                {errorsupi.upiAppName}
                                              </span>
                                            )}
                                        </div>
                                      </div>

                                      {/* UPI ID Input Field */}
                                      <div className="dep-mb-30">
                                        <label
                                          className="dep-label dep-mt-24"
                                          htmlFor="upiId"
                                        >
                                          UPI ID
                                        </label>
                                        <div className="dep-input-wrap">
                                          <input
                                            type="text"
                                            placeholder="Enter UPI ID"
                                            className="dep-input-nw"
                                            value={upiId}
                                            onChange={(e) => {
                                              setUpiId(e.target.value);
                                              validateUpi(e.target.value);
                                            }}
                                            id="upiId"
                                          />
                                          {upiId && (
                                            <p
                                              style={{
                                                color: isValidUpi
                                                  ? "#dfc822"
                                                  : "red",
                                                marginTop: "6px",
                                              }}
                                            >
                                              {isValidUpi
                                                ? ""
                                                : "Invalid UPI ID"}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

{
  /* <div className="dashboard_table margnewprk_asstdash">
                    <div className="staking-flex ">
                      <h5 className="opt-title neweiassdash">Assets</h5>
                    </div>
                    <div className="table-responsive table-cont dash_table_content">
                      <table className="table ">
                        <thead>
                          <tr className="stake-head">
                            <th className="p-l-15">Assets</th>
                            <th className="table_center_text opt-nowrap txt-center pad-left-23">
                              On Orders
                            </th>
                            <th className="table_center_text opt-nowrap txt-center pad-left-23">
                              Available Balance
                            </th>
                            <th className="table_center_text opt-nowrap txt-center pad-left-23">
                              Total Balance
                            </th>
                            <th className="text-end p-r-25">Action</th>
                          </tr>
                        </thead>

                        <tbody> */
}
{
  /* {balanceDetails && balanceDetails.length > 0 ? (
                            balanceDetails.map((item, i) => {
                              return (
                                <tr key={i}>
                                  <td className="table-flex">
                                    <img src={item?.currencyImage} alt="" />
                                    <div className="table-opt-name">
                                      <h4 className="opt-name font_14">
                                        {item?.currencysymbol}
                                      </h4>
                                      <h3 className="opt-sub font_14">
                                        {item?.currencyName}
                                      </h3>
                                    </div>
                                  </td>
                                  <td className="opt-term font_14 table_center_text pad-left-23">
                                    {parseFloat(
                                      item?.holdAmount +
                                        parseFloat(item?.p2phold)
                                    ).toFixed(4)}
                                    {item?.currencysymbol}
                                  </td>
                                  <td className="opt-term font_14 table_center_text pad-left-23">
                                    {parseFloat(
                                      item?.currencyBalance +
                                        parseFloat(item?.p2p)
                                    ).toFixed(4)}{" "}
                                    {item?.currencysymbol}
                                  </td>
                                  <td className="opt-term font_14 table_center_text pad-left-23">
                                    {parseFloat(
                                      item?.currencyBalance +
                                        parseFloat(item?.holdAmount) +
                                        parseFloat(item?.p2p) +
                                        parseFloat(item?.p2phold)
                                    ).toFixed(4)}{" "}
                                    {item?.currencysymbol}{" "}
                                  </td>
                                  <td className="opt-btn-flex text-end pad-left-23">
                                    <Link
                                      to="/deposit"
                                      className="deposit_top_button"
                                    >
                                      <button className="action_btn">
                                        Deposit
                                      </button>
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="text-center py-5">
                                <div className="empty_data">
                                  <div className="empty_data_img">
                                    <img
                                      src={require("../assets/No-data.webp")}
                                      width="100px"
                                    />
                                  </div>
                                  <div className="no_records_text">
                                    No Assets Found
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )} */
}
{
  /* </tbody>
                      </table> */
}

{
  /* {balanceDetails && balanceDetails.length > 0 ? (
                        <div className="pagination">
                          <Stack spacing={2}>
                            <Pagination
                              count={Math.ceil(total / recordPerPage)}
                              page={currentPage}
                              onChange={handlePageChange}
                              size="small"
                              sx={{
                                "& .MuiPaginationItem-root": {
                                  color: "#fff", // Default text color for pagination items
                                  // backgroundColor: "#2D1E23",
                                  // "&:hover": {
                                  //   backgroundColor: "#453a1f",
                                  //   color: "#ffc630",
                                  // },
                                },
                                "& .Mui-selected": {
                                  backgroundColor: "#ffc630 !important", // Background color for selected item
                                  color: "#000", // Text color for selected item
                                  "&:hover": {
                                    backgroundColor: "#ffc630",
                                    color: "#000",
                                  },
                                },
                                "& .MuiPaginationItem-ellipsis": {
                                  color: "#fff", // Color for ellipsis
                                },
                                "& .MuiPaginationItem-icon": {
                                  color: "#fff", // Color for icon (if present)
                                },
                              }}
                              // renderItem={(item) => (
                              //   <PaginationItem
                              //     slots={{
                              //       previous: ArrowBackIcon,
                              //       next: ArrowForwardIcon,
                              //     }}
                              //     {...item}
                              //   />
                              // )}
                            />
                          </Stack>
                        </div>
                      ) : (
                        ""
                      )} */
}
{
  /* </div>
                  </div> */
}
