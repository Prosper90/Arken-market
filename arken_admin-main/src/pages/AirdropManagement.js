import React, { useEffect } from "react";
import useState from "react-usestateref";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import { toast } from "react-toastify";
import { getMethod, postMethod } from "../core/service/common.api";
import { ScaleLoader } from "react-spinners";
import apiService from "../core/service/detail";

function AirdropManagement() {
  const [loader, setLoader] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [validationErr, setValidationErr] = useState({});
  const [dropStartAmPm, setDropStartAmPm] = useState("AM");
  const [airdropData, setAirdropData, airdropDataref] = useState({
    dropTime: "",
    dropStart: "",
    dropEnd: "",
    dropDate: "",
    firstthreeToken: "",
    fourfiveToken: "",
    sixtotenToken: "",
    aftertenToken: "",
    status: "",
  });

  useEffect(() => {
    fetchAirdropData();
  }, []);

  const fetchAirdropData = async () => {
    try {
      const data = {
        apiUrl: apiService.getAirdropManagement,
      };
      const response = await getMethod(data);

      if (response.status && response.data) {
        const { dropStart, dropDate } = response.data;
        // Split dropStart into number and AM/PM
        const timeValue = dropStart.slice(0, -2); // Get the time part (e.g., "6" from "6PM")
        const amPmValue = dropStart.slice(-2); // Get the AM/PM part

        const formattedDropDate = new Date(dropDate)
          .toISOString()
          .split("T")[0];

        setAirdropData({
          ...response.data,
          dropStart: timeValue,
          dropDate: formattedDropDate,
        });

        // Set the AM/PM radio button based on fetched value
        setDropStartAmPm(amPmValue);
        // console.log(airdropDataref.current, "Airdropdata");
      }
    } catch (error) {
      // console.error("Error fetching reward data:", error);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAirdropData({
      ...airdropData,
      [name]: value,
    });

    // Validate form field
    validateForm({ ...airdropData, [name]: value });
  };

  const handleAmPmChange = (e) => {
    setDropStartAmPm(e.target.value); // Update AM/PM value
  };

  const validateForm = (value) => {
    const errors = {};

    // Check if dropTime is empty
    if (!value.dropTime) {
      errors.dropTime = "Drop time is a required field";
    }

    if (!value.dropStart) {
      errors.dropStart = "Drop start is a required field";
    }

    if (!value.dropEnd) {
      errors.dropEnd = "Drop end is a required field";
    }

    if (!value.dropDate) {
      errors.dropDate = "Drop date is a required field";
    }

    if (!value.firstthreeToken) {
      errors.firstthreeToken = "First three token amount is a required field";
    }

    if (!value.fourfiveToken) {
      errors.fourfiveToken = "Four five token amount is a required field";
    }

    if (!value.sixtotenToken) {
      errors.sixtotenToken = "Six to ten token amount is a required field";
    }
    if (!value.aftertenToken) {
      errors.aftertenToken = "After ten token amount is a required field";
    }

    if (!value.status) {
      errors.status = "Status is a required field";
    }

    // Set validation errors
    setValidationErr(errors);

    return Object.keys(errors).length === 0;
  };

  // Submit form data
  const formSubmit = async () => {
    setButtonLoader(true);

    if (!validateForm(airdropData)) {
      toast.error("Please correct the validation errors.");
      setButtonLoader(false);
      return;
    }
    const finalDropStart = `${airdropData.dropStart}${dropStartAmPm}`;

    // console.log(airdropData,"airdropData-----finalDropStart",finalDropStart);
    try {
      const data = {
        apiUrl: apiService.airdropManagement,
        payload: { ...airdropData, dropStart: finalDropStart },
      };

      const response = await postMethod(data);

      if (response.status) {
        toast.success(response.message);
        fetchAirdropData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      // console.error("Error submitting form:", error);
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
                    <span className="dash-head">Airdrop Management</span>
                  </div>

                  <div className="row justify-content-center mt-5">
                    <div className="currencyinput col-lg-9">
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Airdrop Interval (hrs)
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="number"
                            name="dropTime"
                            min={0}
                            onKeyDown={(evt) =>
                              ["e", "E", "+", "-"].includes(evt.key) &&
                              evt.preventDefault()
                            }
                            value={airdropDataref.current.dropTime}
                            onChange={handleChange}
                            className="inputselect"
                          />
                          <div className="help-block">
                            {validationErr.dropTime && (
                              <div className="error">
                                {validationErr.dropTime}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Airdrop Start Time
                        </label>
                        <div className="col-lg-6 flex_input_posion">
                          <input
                            type="number"
                            name="dropStart"
                            min={0}
                            onKeyDown={(evt) =>
                              ["e", "E", "+", "-"].includes(evt.key) &&
                              evt.preventDefault()
                            }
                            value={airdropDataref.current.dropStart}
                            onChange={handleChange}
                            className="inputselect"
                          />
                          <div className="air_abs">
                            <label className="hero_main">
                              <input
                                type="radio"
                                value="AM"
                                checked={dropStartAmPm === "AM"}
                                onChange={handleAmPmChange}
                                className="mr-1"
                              />
                              AM
                            </label>
                            <label className="hero_main">
                              <input
                                type="radio"
                                value="PM"
                                checked={dropStartAmPm === "PM"}
                                onChange={handleAmPmChange}
                                className="mr-1"
                              />
                              PM
                            </label>
                          </div>
                          <div className="help-block d-flex justify-content-start">
                            {validationErr.dropStart && (
                              <div className="error">
                                {validationErr.dropStart}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Airdrop End Time (hrs)
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="number"
                            name="dropEnd"
                            min={0}
                            onKeyDown={(evt) =>
                              ["e", "E", "+", "-"].includes(evt.key) &&
                              evt.preventDefault()
                            }
                            value={airdropDataref.current.dropEnd}
                            onChange={handleChange}
                            className="inputselect"
                          />
                          <div className="help-block">
                            {validationErr.dropEnd && (
                              <div className="error">
                                {validationErr.dropEnd}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Airdrop Date
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="date"
                            name="dropDate"
                            value={airdropDataref.current.dropDate}
                            onChange={handleChange}
                            className="inputselect"
                          />
                          <div className="help-block">
                            {validationErr.dropDate && (
                              <div className="error">
                                {validationErr.dropDate}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          First Three Token Amount
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="number"
                            name="firstthreeToken"
                            min={0}
                            onKeyDown={(evt) =>
                              ["e", "E", "+", "-"].includes(evt.key) &&
                              evt.preventDefault()
                            }
                            value={airdropDataref.current.firstthreeToken}
                            onChange={handleChange}
                            className="inputselect"
                          />
                          <div className="help-block">
                            {validationErr.firstthreeToken && (
                              <div className="error">
                                {validationErr.firstthreeToken}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Four Five Token Amount
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="number"
                            name="fourfiveToken"
                            min={0}
                            onKeyDown={(evt) =>
                              ["e", "E", "+", "-"].includes(evt.key) &&
                              evt.preventDefault()
                            }
                            value={airdropDataref.current.fourfiveToken}
                            onChange={handleChange}
                            className="inputselect"
                          />
                          <div className="help-block">
                            {validationErr.fourfiveToken && (
                              <div className="error">
                                {validationErr.fourfiveToken}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Six To Ten Token Amount
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="number"
                            name="sixtotenToken"
                            min={0}
                            onKeyDown={(evt) =>
                              ["e", "E", "+", "-"].includes(evt.key) &&
                              evt.preventDefault()
                            }
                            value={airdropDataref.current.sixtotenToken}
                            onChange={handleChange}
                            className="inputselect"
                          />
                          <div className="help-block">
                            {validationErr.sixtotenToken && (
                              <div className="error">
                                {validationErr.sixtotenToken}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          After Ten Token Amount
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="number"
                            name="aftertenToken"
                            min={0}
                            onKeyDown={(evt) =>
                              ["e", "E", "+", "-"].includes(evt.key) &&
                              evt.preventDefault()
                            }
                            value={airdropDataref.current.aftertenToken}
                            onChange={handleChange}
                            className="inputselect"
                          />
                          <div className="help-block">
                            {validationErr.aftertenToken && (
                              <div className="error">
                                {validationErr.aftertenToken}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

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
                                value="1"
                                onChange={handleChange}
                                checked={airdropDataref.current.status == "1"}
                              />{" "}
                              Active
                            </div>
                            <div>
                              <input
                                type="radio"
                                name="status"
                                value="0"
                                onChange={handleChange}
                                checked={airdropDataref.current.status == "0"}
                              />{" "}
                              Deactive
                            </div>
                          </div>
                          <div className="help-block">
                            {validationErr.status && (
                              <div className="error">
                                {validationErr.status}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group mt-4 row justify-content-center">
                        <div className="col-lg-4">
                          <button
                            type="submit"
                            onClick={formSubmit}
                            className="d-block w_100"
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
        </div>
      )}
    </div>
  );
}

export default AirdropManagement;
