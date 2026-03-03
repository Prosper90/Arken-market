import React, { useEffect } from "react";
import useState from "react-usestateref";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import { toast } from "react-toastify";
import { getMethod, postMethod } from "../core/service/common.api";
import { ScaleLoader } from "react-spinners";
import apiService from "../core/service/detail";

function RewardSettings() {
  const [loader, setLoader] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [validationErr, setValidationErr] = useState({});
  const [currencyList, setCurrencyList] = useState([]);
  const [rewardData, setRewardData, rewardDataref] = useState({
    kycStatus: "",
    kycCurrency: "",
    kycAmount: "",
    depositStatus: "",
    depositCurrency: "",
    depositAmount: "",
    minDeposit: "",
    tradeStatus: "",
    tradeCurrency: "",
    tradeAmount: "",
  });

  useEffect(() => {
    fetchCurrencyList();
    fetchRewardData();
  }, []);

  // Fetch the currency list
  const fetchCurrencyList = async () => {
    try {
      const data = {
        apiUrl: apiService.tradecurrency,
      };
      const response = await getMethod(data);

      if (response.status) {
        const formattedData = Object.values(response.data).map((item) => {
          const [id, label] = item.split("_");
          return { id, label };
        });
        setCurrencyList(formattedData);
      } else {
        setCurrencyList([]);
      }
    } catch (error) {
      console.error("Error fetching currency list:", error);
    }
  };

  // Fetch existing reward data if available
  const fetchRewardData = async () => {
    try {
      const data = {
        apiUrl: apiService.getRewardManagement,
      };
      const response = await getMethod(data);

      if (response.status && response.data) {
        setRewardData(response.data);

        // console.log(rewardDataref.current, "rewardData");
      }
    } catch (error) {
      console.error("Error fetching reward data:", error);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRewardData({
      ...rewardData,
      [name]: value,
    });
  };

  // Validate form inputs before submitting
  const validateForm = () => {
    const errors = {};

    // KYC Reward Validation
    if (rewardDataref.current.kycStatus == "1") {
      if (!rewardDataref.current.kycCurrency) {
        errors.kycCurrency = "KYC Reward Currency is required";
      }
      if (
        !rewardDataref.current.kycAmount ||
        rewardDataref.current.kycAmount <= 0
      ) {
        errors.kycAmount = "KYC Reward Amount must be greater than 0";
      }
    }

    // Deposit Reward Validation
    if (rewardDataref.current.depositStatus == "1") {
      if (!rewardDataref.current.depositCurrency) {
        errors.depositCurrency = "Deposit Reward Currency is required";
      }
      if (
        !rewardDataref.current.depositAmount ||
        rewardDataref.current.depositAmount <= 0
      ) {
        errors.depositAmount = "Deposit Reward Amount must be greater than 0";
      }
      if (
        !rewardDataref.current.minDeposit ||
        rewardDataref.current.minDeposit <= 0
      ) {
        errors.minDeposit = "Minimum Deposit Amount must be greater than 0";
      }
    }

    // Trade Reward Validation
    if (rewardDataref.current.tradeStatus == "1") {
      if (!rewardDataref.current.tradeCurrency) {
        errors.tradeCurrency = "Trade Reward Currency is required";
      }
      if (
        !rewardDataref.current.tradeAmount ||
        rewardDataref.current.tradeAmount <= 0
      ) {
        errors.tradeAmount = "Trade Reward Amount must be greater than 0";
      }
    }

    // Set validation errors
    setValidationErr(errors);

    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  // Submit form data
  const formSubmit = async () => {
    setButtonLoader(true);

    // console.log(rewardData, "rewardData");
    if (!validateForm()) {
      toast.error("Please correct the validation errors.");
      setButtonLoader(false);
      return;
    }
    try {
      const data = {
        apiUrl: apiService.rewardManagement,
        payload: rewardData,
      };

      const response = await postMethod(data);

      if (response.status) {
        toast.success(response.message);
        fetchRewardData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    } finally {
      setButtonLoader(false);
    }
  };

  return (
    <div>
      {loader ? (
        <div className="loadercss">
          <ScaleLoader
           height={50} width={5}
            color="#dfc822"
            ariaLabel="bars-loading"
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
              </div>
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">Reward Management</span>
                  </div>

                  <div className="row justify-content-center mt-5">
                    <div className="currencyinput col-lg-9">
                      {/* KYC Reward */}
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          KYC
                        </label>
                        <div className="col-lg-6">
                          <div className="radio">
                            <div>
                              <input
                                type="radio"
                                name="kycStatus"
                                value="1"
                                onChange={handleChange}
                                checked={rewardDataref.current.kycStatus == "1"}
                              />{" "}
                              Active
                            </div>
                            <div>
                              <input
                                type="radio"
                                name="kycStatus"
                                value="0"
                                onChange={handleChange}
                                checked={rewardDataref.current.kycStatus == "0"}
                              />{" "}
                              Deactive
                            </div>
                          </div>

                          <div className="help-block">
                            {validationErr.kycStatus && (
                              <div className="error">
                                {validationErr.kycStatus}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {rewardData.kycStatus == "1" && (
                        <>
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              KYC Reward Currency
                            </label>
                            <div className="col-lg-6">
                              <select
                                name="kycCurrency"
                                value={rewardDataref.current.kycCurrency}
                                onChange={handleChange}
                                className="inputselect"
                              >
                                <option value="">Select Currency</option>
                                {currencyList.map((currency) => (
                                  <option key={currency.id} value={currency.id}>
                                    {currency.label}
                                  </option>
                                ))}
                              </select>
                              <div className="help-block">
                                {validationErr.kycCurrency && (
                                  <div className="error">
                                    {validationErr.kycCurrency}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              KYC Reward Amount
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="number"
                                name="kycAmount"
                                min={0}
                                onKeyDown={(evt) =>
                                  ["e", "E", "+", "-"].includes(evt.key) &&
                                  evt.preventDefault()
                                }
                                value={rewardDataref.current.kycAmount}
                                onChange={handleChange}
                                className="inputselect"
                              />
                              <div className="help-block">
                                {validationErr.kycAmount && (
                                  <div className="error">
                                    {validationErr.kycAmount}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Deposit Reward */}
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Deposit Reward
                        </label>
                        <div className="col-lg-6">
                          <div className="radio">
                            <div>
                              <input
                                type="radio"
                                name="depositStatus"
                                value="1"
                                onChange={handleChange}
                                checked={
                                  rewardDataref.current.depositStatus == "1"
                                }
                              />{" "}
                              Active
                            </div>
                            <div>
                              <input
                                type="radio"
                                name="depositStatus"
                                value="0"
                                onChange={handleChange}
                                checked={
                                  rewardDataref.current.depositStatus == "0"
                                }
                              />{" "}
                              Deactive
                            </div>
                          </div>
                          <div className="help-block">
                            {validationErr.depositStatus && (
                              <div className="error">
                                {validationErr.depositStatus}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {rewardDataref.current.depositStatus == "1" && (
                        <>
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Deposit Reward Currency
                            </label>
                            <div className="col-lg-6">
                              <select
                                name="depositCurrency"
                                value={rewardDataref.current.depositCurrency}
                                onChange={handleChange}
                                className="inputselect"
                              >
                                <option value="">Select Currency</option>
                                {currencyList.map((currency) => (
                                  <option key={currency.id} value={currency.id}>
                                    {currency.label}
                                  </option>
                                ))}
                              </select>
                              <div className="help-block">
                                {validationErr.depositCurrency && (
                                  <div className="error">
                                    {validationErr.depositCurrency}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Deposit Reward Amount
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="number"
                                name="depositAmount"
                                min={0}
                                onKeyDown={(evt) =>
                                  ["e", "E", "+", "-"].includes(evt.key) &&
                                  evt.preventDefault()
                                }
                                value={rewardDataref.current.depositAmount}
                                onChange={handleChange}
                                className="inputselect"
                              />
                              <div className="help-block">
                                {validationErr.depositAmount && (
                                  <div className="error">
                                    {validationErr.depositAmount}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Minimum Deposit Amount to Get Reward (USDT)
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="number"
                                min={0}
                                onKeyDown={(evt) =>
                                  ["e", "E", "+", "-"].includes(evt.key) &&
                                  evt.preventDefault()
                                }
                                name="minDeposit"
                                value={rewardDataref.current.minDeposit}
                                onChange={handleChange}
                                className="inputselect"
                              />
                              <div className="help-block">
                                {validationErr.minDeposit && (
                                  <div className="error">
                                    {validationErr.minDeposit}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Trade Reward */}
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Trade Reward
                        </label>
                        <div className="col-lg-6">
                          <div className="radio">
                            <div>
                              <input
                                type="radio"
                                name="tradeStatus"
                                value="1"
                                onChange={handleChange}
                                checked={
                                  rewardDataref.current.tradeStatus == "1"
                                }
                              />{" "}
                              Active
                            </div>
                            <div>
                              <input
                                type="radio"
                                name="tradeStatus"
                                value="0"
                                onChange={handleChange}
                                checked={
                                  rewardDataref.current.tradeStatus == "0"
                                }
                              />{" "}
                              Deactive
                            </div>
                          </div>
                          <div className="help-block">
                            {validationErr.tradeStatus && (
                              <div className="error">
                                {validationErr.tradeStatus}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {rewardDataref.current.tradeStatus == "1" && (
                        <>
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Trade Reward Currency
                            </label>
                            <div className="col-lg-6">
                              <select
                                name="tradeCurrency"
                                value={rewardDataref.current.tradeCurrency}
                                onChange={handleChange}
                                className="inputselect"
                              >
                                <option value="">Select Currency</option>
                                {currencyList.map((currency) => (
                                  <option key={currency.id} value={currency.id}>
                                    {currency.label}
                                  </option>
                                ))}
                              </select>
                              <div className="help-block">
                                {validationErr.tradeCurrency && (
                                  <div className="error">
                                    {validationErr.tradeCurrency}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Trade Reward Amount
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="number"
                                min={0}
                                onKeyDown={(evt) =>
                                  ["e", "E", "+", "-"].includes(evt.key) &&
                                  evt.preventDefault()
                                }
                                name="tradeAmount"
                                value={rewardDataref.current.tradeAmount}
                                onChange={handleChange}
                                className="inputselect"
                              />
                              <div className="help-block">
                                {validationErr.tradeAmount && (
                                  <div className="error">
                                    {validationErr.tradeAmount}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={formSubmit}
                          className="btn btn-primary"
                          disabled={buttonLoader}
                        >
                          {buttonLoader ? "Submitting..." : "Submit"}
                        </button>
                      </div>
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

export default RewardSettings;
