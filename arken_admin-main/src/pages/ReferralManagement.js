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
    referralStatus: "",
    referralCurrency: "",
    referralAmount: "",
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
    if (rewardDataref.current.referralStatus == "1") {
      if (!rewardDataref.current.referralCurrency) {
        errors.referralCurrency = "Referral Reward Currency is required";
      }
      if (
        !rewardDataref.current.referralAmount ||
        rewardDataref.current.referralAmount <= 0 ||
        rewardDataref.current.referralAmount >= 100
      ) {
        errors.referralAmount =
          "Referral Reward percentage must be greater than 0 and less than 100%";
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

    if (!validateForm()) {
      toast.error("Please correct the validation errors.");
      setButtonLoader(false);
      return;
    }
    try {
      const data = {
        apiUrl: apiService.referralrewardManagement,
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
      {loader == false ? (
        <div className="loader_main loader_mainChange">
          <ScaleLoader color="#dfc822" height={60} width={5} />
          <p style={{ marginTop: "10px" }}></p>
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
                    <span className="dash-head">Referral Management</span>
                  </div>

                  <div className="row justify-content-center mt-5">
                    <div className="currencyinput col-lg-9">
                      {/* KYC Reward */}
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          First Deposit Referral Reward
                        </label>
                        <div className="col-lg-6">
                          <div className="radio">
                            <div>
                              <input
                                type="radio"
                                name="referralStatus"
                                value="1"
                                onChange={handleChange}
                                checked={
                                  rewardDataref.current.referralStatus == "1"
                                }
                              />{" "}
                              Active
                            </div>
                            <div>
                              <input
                                type="radio"
                                name="referralStatus"
                                value="0"
                                onChange={handleChange}
                                checked={
                                  rewardDataref.current.referralStatus == "0"
                                }
                              />{" "}
                              Deactive
                            </div>
                          </div>

                          <div className="help-block">
                            {validationErr.referralStatus && (
                              <div className="error">
                                {validationErr.referralStatus}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {rewardData.referralStatus == "1" && (
                        <>
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Reward Currency
                            </label>
                            <div className="col-lg-6">
                              <select
                                name="referralCurrency"
                                value={rewardDataref.current.referralCurrency}
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
                                {validationErr.referralCurrency && (
                                  <div className="error">
                                    {validationErr.referralCurrency}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="form-group row">
                            <label className="col-lg-6 col-form-label form-control-label">
                              Reward percentage
                            </label>
                            <div className="col-lg-6">
                              <input
                                type="number"
                                name="referralAmount"
                                min={0}
                                max={100}
                                onKeyDown={(evt) =>
                                  ["e", "E", "+", "-"].includes(evt.key) &&
                                  evt.preventDefault()
                                }
                                value={rewardDataref.current.referralAmount}
                                onChange={handleChange}
                                className="inputselect"
                              />
                              <div className="help-block">
                                {validationErr.referralAmount && (
                                  <div className="error">
                                    {validationErr.referralAmount}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="form-group row justify-content-center">
                        <div className="col-lg-4">
                          {buttonLoader == false ? (
                            <button
                              type="submit"
                              className="d-block w_100"
                              onClick={formSubmit}
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
                      {/* <div className="mt-4">
                                                <button
                                                    type="button"
                                                    onClick={formSubmit}
                                                    className="btn "
                                                    disabled={buttonLoader}
                                                >
                                                    {buttonLoader ? "Submitting..." : "Submit"}
                                                </button>
                                            </div> */}
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
