import React, { useEffect } from "react";
import useState from "react-usestateref";
import { toast } from "react-toastify";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import Sidebar_2 from "./Nav_bar";
import { ScaleLoader } from "react-spinners";
import Sidebar from "./Sidebar";
import ReactPaginate from "react-paginate";

function Stakemanage() {
  const [formData, setFormData, formDataref] = useState({
    stakeDepositFee: 0,
    stakeWitdrawFee: 0,
    tokenPrice: 0,
    minimumClaim: 0,
    maximumClaim: 0,
    id: "",
  });

  const [buttonLoader, setButtonLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    getstakeDetails();
  }, []);

  const getstakeDetails = async () => {
    try {
      setLoader(true);
      const data = {
        apiUrl: apiService.getStakesettings,
      };
      const response = await postMethod(data);
      if (response.status) {
        console.log(response.data);
        setFormData((prevData) => ({
          ...prevData,
          stakeDepositFee: +response.data.stakeDepositFee,
          stakeWitdrawFee: +response.data.stakeWitdrawFee,
          tokenPrice: +response.data.tokenPrice,
          id: response.data._id,
          minimumClaim: response.data.minimumClaim,
          maximumClaim: response.data.maximumClaim,
        }));
        console.log(formDataref.current, "0-----");
        setLoader(false);
      } else {
        setLoader(false);
      }
    } catch (error) {
      console.log("getstakedata erroroororo");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formDataref.current, [name]: value });
    validate();
  };

  const validate = () => {
    const newErrors = {};
    if (!formDataref.current.tokenPrice) {
      newErrors.tokenPrice = "Token Price is required.";
    } else if (isNaN(Number(formDataref.current.tokenPrice))) {
      newErrors.tokenPrice = "Token Price must be a valid number.";
    }
    if (!formDataref.current.stakeDepositFee) {
      newErrors.stakeDepositFee = "Staking deposit fee is required";
    } else if (formDataref.current.stakeDepositFee < 0) {
      newErrors.stakeDepositFee = "Value must be positive";
    }
    if (!formDataref.current.stakeWitdrawFee) {
      newErrors.stakeWitdrawFee = "Staking withdraw is required";
    } else if (formDataref.current.stakeWitdrawFee < 0) {
      newErrors.stakeWitdrawFee = "Value must be positive";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitdata = async (e) => {
    try {
      e.preventDefault();
      if (
        formDataref.current.stakeWitdrawFee != "" &&
        formDataref.current.stakeDepositFee != "" &&
        formDataref.current.minimumClaim != "" &&
        formDataref.current.maximumClaim != "" &&
        formDataref.current.tokenPrice != ""
      ) {
        var datas = {
          apiUrl: apiService.updatestakesetting,
          payload: formDataref.current,
        };
        setButtonLoader(true);
        var response = await postMethod(datas);
        setButtonLoader(false);
        console.log(response, "=-=-=-=response=-=-=");

        if (response.status) {
          toast.success(response.Message);
          getstakeDetails();
        } else {
          toast.error(response.Message);
        }
      } else {
        validate();
      }
    } catch (error) {
      console.log("getstakedata erroroororo");
    }
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
              </div>

              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">Staking Settings</span>
                  </div>
                  <div className="currencyinput mt-5">
                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Token Price
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="number"
                          id="numberInput"
                          minLength={0}
                          name="tokenPrice"
                          value={formDataref.current.tokenPrice}
                          placeholder="Token Price"
                          onChange={handleInputChange}
                          className="form-control"
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(
                              /[^0-9.]/g,
                              ""
                            );
                          }}
                          onKeyDown={(evt) =>
                            ["e", "E", "+", "-"].includes(evt.key) &&
                            evt.preventDefault()
                          }
                        />
                        <div className="help-block">
                          {errors.tokenPrice && (
                            <div className="error">{errors.tokenPrice}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Staking Deposit fees %
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="number"
                          name="stakeDepositFee"
                          value={formDataref.current.stakeDepositFee}
                          onChange={handleInputChange}
                          onKeyDown={(evt) =>
                            ["e", "E", "+", "-"].includes(evt.key) &&
                            evt.preventDefault()
                          }
                          placeholder="Staking Deposit fees"
                          className="form-control"
                        />
                        <div className="help-block">
                          {errors.stakeDepositFee && (
                            <div className="error">
                              {errors.stakeDepositFee}
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
                          value={formDataref.current.stakeWitdrawFee}
                          onChange={handleInputChange}
                          onKeyDown={(evt) =>
                            ["e", "E", "+", "-"].includes(evt.key) &&
                            evt.preventDefault()
                          }
                          placeholder="Staking withdraw fees"
                          className="form-control"
                        />
                        <div className="help-block">
                          {errors.stakeWitdrawFee && (
                            <div className="error">
                              {errors.stakeWitdrawFee}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Minimum Claim
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="number"
                          id="numberInput"
                          minLength={0}
                          name="minimumClaim"
                          value={formDataref.current.minimumClaim}
                          placeholder="Maximum Claim"
                          onChange={handleInputChange}
                          className="form-control"
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(
                              /[^0-9.]/g,
                              ""
                            );
                          }}
                          onKeyDown={(evt) =>
                            ["e", "E", "+", "-"].includes(evt.key) &&
                            evt.preventDefault()
                          }
                        />
                        <div className="help-block">
                          {errors.minimumClaim && (
                            <div className="error">{errors.minimumClaim}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Maximum claim
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="number"
                          id="numberInput"
                          minLength={0}
                          name="maximumClaim"
                          value={formDataref.current.maximumClaim}
                          placeholder="Maximum Claim"
                          onChange={handleInputChange}
                          className="form-control"
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(
                              /[^0-9.]/g,
                              ""
                            );
                          }}
                          onKeyDown={(evt) =>
                            ["e", "E", "+", "-"].includes(evt.key) &&
                            evt.preventDefault()
                          }
                        />
                        <div className="help-block">
                          {errors.maximumClaim && (
                            <div className="error">{errors.maximumClaim}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="form-group row justify-content-center">
                      <div className="col-lg-4">
                        {buttonLoader == false ? (
                          <button
                            type="submit"
                            className="d-block w_100"
                            onClick={submitdata}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Stakemanage;
