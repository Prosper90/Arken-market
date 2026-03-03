import React, { useEffect } from "react";
import moment from "moment";
import axios from "axios";
import Select from "react-select";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import { toast, ToastContainer } from "react-toastify";
import { env } from "../core/service/envconfig";
import { ScaleLoader } from "react-spinners";
import "react-toastify/dist/ReactToastify.css";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import useState from "react-usestateref";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Skeleton } from "@mui/material";

const customStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "#000",
    padding: "4px",
    color: "#fff",
    boxShadow: "none",
    outline: "none",
    width: window.innerWidth <= 575 ? "100%" : "34%",
  }),
  option: (styles, { isFocused }) => ({
    ...styles,
    color: "#fff",
    backgroundColor: isFocused ? "#444" : "#181a20",
    cursor: "pointer",
  }),
  singleValue: (styles) => ({
    ...styles,
    color: "#fff",
  }),
  menu: (styles) => ({
    ...styles,
    width: window.innerWidth <= 575 ? "100%" : "34%",
  }),
};

const ReferralRewardSettings = () => {
  useEffect(() => {
    getCurrency();
    getReferralSettings();
  }, []);

  const [siteLoader, setSiteLoader] = useState(true);
  const [referralSettings, setReferralSettings] = useState({});
  const [activecurreny, setActivecurreny] = useState([]);
  const [buttonLoader, setButtonLoader] = useState(false);

  const getReferralSettings = async () => {
    setSiteLoader(true);
    const data = {
      apiUrl: apiService.getplatformfee,
    };
    const resp = await getMethod(data);
    setSiteLoader(false);
    if (resp.status === true) {
      setReferralSettings(resp.data);
    }
  };
  const getCurrency = async () => {
    setSiteLoader(true);
    const data = {
      apiUrl: apiService.getcurrency,
    };
    const resp = await postMethod(data);
    setSiteLoader(false);
    if (resp.status === true) {
      const formatted = resp.data.map((item) => ({
        value: item.currencySymbol,
        label: item.currencySymbol,
        image: item.Currency_image,
      }));
      setActivecurreny(formatted);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      rewardPercentage: referralSettings?.feePercentage ?? 0,
      status: referralSettings?.status ?? true,
    },
    validationSchema: Yup.object({
      rewardPercentage: Yup.number()
        .required("Platform fee percentage is required")
        .max(100, "Platform fee percentage cannot exceed 100%"),
      status: Yup.boolean().required("Status is required"),
    }),
    onSubmit: async (values) => {
      console.log(values, "values");

      setButtonLoader(true);

      const formValue = {
        feePercentage: Number(values.rewardPercentage),
        status: values.status,
      };

      const data = {
        apiUrl: apiService.createPlatformfee,
        payload: formValue,
      };

      const resp = await postMethod(data);
      setButtonLoader(false);

      if (resp.status === true) {
        toast.success(resp.message);
        getReferralSettings();
      } else {
        toast.error(resp.message);
      }
    },
  });

  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="row">
        <div className="col-xl-2 col-lg-3 d-none d-lg-block px-0">
          <Sidebar />
        </div>

        <div className="col-xl-10 col-lg-9 col-12 px-0">
          <div className="pos_sticky">
            <Sidebar_2 />
          </div>

          {/* {siteLoader ? (
            <SkeletonwholeProject />
          ) : ( */}
          <div className="px-4 transaction_padding_top">
            <div className="px-2 my-4 transaction_padding_top tops">
              <div className="headerss mb-4">
                <span className="dash-head">Platform Fee Management</span>
              </div>

              {siteLoader ? (
                <div className="currencyinput pt-0 pl-5 w-100">
                  <Skeleton
                    variant="text"
                    className="skl_dsh_user_icon skl_dsh_user_hight"
                  />
                  {/* <ScaleLoader color="#dfc822" height={60} width={5} />
                    <p style={{ marginTop: "10px" }}></p> */}
                </div>
              ) : (
                <form
                  onSubmit={formik.handleSubmit}
                  className="currencyinput pt-0 pl-lg-5"
                >
                  <div className="input-groups">
                    <h6 className="input-label">Platform Fees %</h6>
                    <input
                      type="number"
                      name="rewardPercentage"
                      className="input-field"
                      placeholder="Enter reward percentage (e.g. 5)"
                      value={formik.values.rewardPercentage}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                    {formik.touched.rewardPercentage &&
                    formik.errors.rewardPercentage ? (
                      <div className="errorcss">
                        {formik.errors.rewardPercentage}
                      </div>
                    ) : null}
                  </div>


                  <div className="input-groups referral_status">
                    <h6 className="input-label">Platform Fee Status</h6>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formik.values.status}
                        onChange={(e) =>
                          formik.setFieldValue("status", e.target.checked)
                        }
                        onBlur={() => formik.setFieldTouched("status", true)}
                      />
                      <span className="slider round"></span>
                    </label>
                    {formik.touched.status && formik.errors.status ? (
                      <div className="errorcss">{formik.errors.status}</div>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <button
                      type="submit"
                      className="site_submain"
                      disabled={buttonLoader}
                    >
                      {buttonLoader ? "Loading..." : "Submit"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          {/* // )} */}
        </div>
      </div>
    </div>
  );
};

export default ReferralRewardSettings;
