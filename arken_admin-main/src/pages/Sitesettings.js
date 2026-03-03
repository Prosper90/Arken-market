import React, { useEffect } from "react";
import moment from "moment";
import axios from "axios";
import Sidebar from "./Sidebar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar_2 from "./Nav_bar";
import { toast, ToastContainer } from "react-toastify";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import { env } from "../core/service/envconfig";
import { FaCalendarAlt } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import useState from "react-usestateref";
import { ScaleLoader } from "react-spinners";

const ProfileComponent = () => {
  useEffect(() => {
    getSitedatas();
  }, []);

  const initialFormValue = {
    facebook: "",
    twitter: "",
    linkedIn: "",
    instagram: "",
    reddit: "",
    youtube: "",
    bitcointalk: "",
    telegram: "",
    coinGecko: "",
    copyrightText: "",
    coinMarketCap: "",
    email: "",
    whatsappNumber: "",
    footerContent: "",
    depositStatus: "",
    depositMaintenance: "",
    depStartDate: "",
    depExpectedDate: "",
    fiatdepositStatus: "",
    fiatdepositMaintenance: "",
    fiatdepStartDate: "",
    fiatdepExpectedDate: "",
    withdrawalStatus: "",
    withdrawalMaintenance: "",
    withdrawStartDate: "",
    withdrawExpectedDate: "",
    fiatwithdrawalStatus: "",
    fiatwithdrawalMaintenance: "",
    fiatwithdrawStartDate: "",
    fiatwithdrawExpectedDate: "",
    siteStatus: "",
    siteMaintenance: "",
    siteStartDate: "",
    siteExpectedDate: "",
    kycStatus: "",
    kycMaintenance: "",
    kycStartDate: "",
    kycExpectedDate: "",
    tradeStatus: "",
    tradeContent: "",
    tradeStartDate: "",
    tradeExpectedDate: "",
    tradeContent: "",
    liquidityStatus: "",
  };

  const [formValue, setFormValue] = useState(initialFormValue);

  const {
    facebook,
    twitter,
    linkedIn,
    instagram,
    reddit,
    youtube,
    bitcointalk,
    telegram,
    coinGecko,
    copyrightText,
    coinMarketCap,
    email,
    whatsappNumber,
    footerContent,
    liquidityStatus,
    depositStatus,
    depositMaintenance,
    depStartDate,
    depExpectedDate,
    fiatdepositStatus,
    fiatdepositMaintenance,
    fiatdepStartDate,
    fiatdepExpectedDate,
    withdrawalStatus,
    withdrawalMaintenance,
    withdrawStartDate,
    withdrawExpectedDate,
    fiatwithdrawalStatus,
    fiatwithdrawalMaintenance,
    fiatwithdrawStartDate,
    fiatwithdrawExpectedDate, 
    siteStatus,
    siteMaintenance,
    siteStartDate,
    siteExpectedDate,
    kycStatus,
    kycMaintenance,
    kycStartDate,
    kycExpectedDate,
    tradeStatus,
    tradeStartDate,
    tradeExpectedDate,
    tradeContent,
  } = formValue;

  const [imagePath, setImagePath] = useState("");
  const [url, setUrl] = useState("");
  const [url1, setUrl1] = useState("");
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [fileImage, setFileImage] = useState(true);

  const CustomDateInput = React.forwardRef(
    ({ value, onClick, placeholder }, ref) => (
      <div className="relative">
        <input
          type="text"
          readOnly
          value={value || ""}
          placeholder={placeholder}
          onClick={onClick}
          ref={ref}
          className="input-field pr-10"
        />
        <FaCalendarAlt
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
          onClick={onClick}
        />
      </div>
    )
  );

  const [siteLoader, setSiteLoader] = useState(true);

  const getSitedatas = async () => {
    setSiteLoader(true);
    const data = { apiUrl: apiService.getSitedata };
    const resp = await getMethod(data);
    setSiteLoader(false);
    console.log(resp.data, "resp.data");
    if (resp.status === true && resp.data) {
      const mapped = {
        ...initialFormValue,
        ...resp.data,
        depStartDate: resp.data.depositStartdate,
        depExpectedDate: resp.data.depositEndDate,
        fiatdepStartDate: resp.data.fiatdepositStartdate,
        fiatdepExpectedDate: resp.data.fiatdepositEndDate,
        withdrawStartDate: resp.data.withdrawStartdate,
        withdrawExpectedDate: resp.data.withdrawEndDate,
        fiatwithdrawStartDate: resp.data.fiatwithdrawStartDate,
        fiatwithdrawExpectedDate: resp.data.fiatwithdrawEndDate,
        siteStartDate: resp.data.siteStartdate,
        siteExpectedDate: resp.data.siteEndDate,
        kycStartDate: resp.data.kycStartdate,
        kycExpectedDate: resp.data.kycEndDate,
        tradeStartDate: resp.data.tradeStartdate,
        tradeExpectedDate: resp.data.tradeEndDate,
      };
      setFormValue(mapped);
    }
  };
  const handleChange = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    const sanitizedValue =
      name === "copyrightText" ? value : value.replace(/\s/g, "");
    let formData = { ...formValue, ...{ [name]: sanitizedValue } };
    setFormValue(formData);
  };

  const handleTextChange = async (e) => {
    let addrressData = { ...formValue, depositMaintenance: e.target.value };
    setFormValue(addrressData);
  };

  const handleTextChangewithdrawalMaintenance = async (e) => {
    let addrressData = { ...formValue, withdrawalMaintenance: e.target.value };
    setFormValue(addrressData);
  };
  const handleTextChangefiatwithdrawalMaintenance = async (e) => {
    let addrressData = { ...formValue, fiatwithdrawalMaintenance: e.target.value };
    setFormValue(addrressData);
  };
  const handleTextChangesite = async (e) => {
    let addrressData = { ...formValue, siteMaintenance: e.target.value };
    setFormValue(addrressData);
  };

  const handleTextChangefooter = async (e) => {
    let addrressData = { ...formValue, footerContent: e.target.value };
    setFormValue(addrressData);
  };

  const handleTextChangeKyc = async (e) => {
    let addrressData = { ...formValue, kycMaintenance: e.target.value };
    setFormValue(addrressData);
  };

  const handleTextChangeTrade = async (e) => {
    let addrressData = { ...formValue, tradeContent: e.target.value };
    setFormValue(addrressData);
  };

  // const [depositstatus, setdepositstatus] = useState("");
  // const [withdrawstatus, setwithdrawstatus] = useState("");
  // const [sitestatus, setsitestatus] = useState("");
  // const [kycstatus, setkycstatus] = useState("");
  const [logo, setlogo] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [favIcon, setfavIcon] = useState("");
  const [siteLogo, setsiteLogo, siteLogoref] = useState("");
  const [siteLogoname, setsiteLogoname, siteLogonameref] = useState("");
  const [siteLogoLoad, setsiteLogoLoad] = useState(false);
  const [favicon, setFavicon, favIconref] = useState("");
  const [faviconName, setFaviconname, favIconnameref] = useState("");
  const [faviconLoad, setfaviconLoad] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [validLogoproof, setvalidLogoproof] = useState(0);
  const [validFaviconProof, setvalidFaviconProof] = useState(0);

  // const handledepositStatusChange = (e) => {
  //   setdepositstatus(e.target.value);
  // };
  // const handlewithdrawStatusChange = (e) => {
  //   setwithdrawstatus(e.target.value);
  // };
  // const handlesiteStatusChange = (e) => {
  //   setsitestatus(e.target.value);
  // };
  // const handleKycStatusChange = (e) => {
  //   setkycstatus(e.target.value);
  // };
  function handleFileChange(type, event) {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split(".").at(-1);
      const fileSize = file.size;
      const fileName = file.name;
      if (
        fileExtension != "png" &&
        fileExtension != "webp" &&
        fileExtension != "jpeg"
      ) {
        toast.error(
          "File does not support. You must use .png or .jpg or .jpeg "
        );
      } else if (fileSize > 10000000) {
        toast.error("Please upload a file smaller than 1 MB");
      } else {
        type == "siteLogo" ? setsiteLogoLoad(true) : setfaviconLoad(true);
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", env.upload_preset);
        data.append("cloud_name", env.cloud_name);
        fetch(
          "https://api.cloudinary.com/v1_1/" + env.cloud_name + "/auto/upload",
          { method: "post", body: data }
        )
          .then((resp) => resp.json())
          .then((data) => {
            // console.log(type, "type");
            if (type == "siteLogo") {
              setsiteLogoLoad(false);
              setvalidLogoproof(1);
              setsiteLogo(data.secure_url);
              setsiteLogoname(file.name);
            }
            if (type == "favicon") {
              setfaviconLoad(false);
              setvalidFaviconProof(1);
              setFavicon(data.secure_url);
              setFaviconname(file.name);
            }
          })
          .catch((err) => {
            // console.log(err);
            toast.error("Please try again later");
          });
      }
    }
  }

  const formSubmit = async () => {
    const errors = {};

    if (formValue.depositStatus === "Deactive") {
      if (!formValue.depStartDate) {
        errors.depStartDate = "Start date is required.";
      }
      if (!formValue.depExpectedDate) {
        errors.depExpectedDate = "Expected date is required.";
      } else if (
        formValue.depStartDate &&
        new Date(formValue.depExpectedDate) < new Date(formValue.depStartDate)
      ) {
        errors.depExpectedDate = "Expected date must be after start date.";
      }
      if (!formValue.depositMaintenance?.trim()) {
        errors.depositMaintenance = "Maintenance content is required.";
      }
    }
    if (formValue.fiatdepositStatus === "Deactive") {
      if (!formValue.fiatdepStartDate) {
        errors.fiatdepStartDate = "Start date is required.";
      }
      if (!formValue.fiatdepExpectedDate) {
        errors.fiatdepExpectedDate = "Expected date is required.";
      } else if (
        formValue.fiatdepStartDate &&
        new Date(formValue.fiatdepExpectedDate) <
          new Date(formValue.fiatdepStartDate)
      ) {
        errors.fiatdepExpectedDate = "Expected date must be after start date.";
      }
      if (!formValue.fiatdepositMaintenance?.trim()) {
        errors.fiatdepositMaintenance = "Maintenance content is required.";
      }
    }
    if (formValue.withdrawalStatus === "Deactive") {
      if (!formValue.withdrawStartDate) {
        errors.withdrawStartDate = "Start date is required.";
      }
      if (!formValue.withdrawExpectedDate) {
        errors.withdrawExpectedDate = "Expected date is required.";
      } else if (
        formValue.withdrawStartDate &&
        new Date(formValue.withdrawExpectedDate) <
          new Date(formValue.withdrawStartDate)
      ) {
        errors.withdrawExpectedDate = "Expected date must be after start date.";
      }
      if (!formValue.withdrawalMaintenance?.trim()) {
        errors.withdrawalMaintenance = "Maintenance content is required.";
      }
    }

    if (formValue.fiatwithdrawalStatus === "Deactive") {
      if (!formValue.fiatwithdrawStartDate) {
        errors.fiatwithdrawStartDate = "Start date is required.";
      }
      if (!formValue.fiatwithdrawExpectedDate) {
        errors.fiatwithdrawExpectedDate = "Expected date is required.";
      } else if (
        formValue.fiatwithdrawStartDate &&
        new Date(formValue.fiatwithdrawExpectedDate) <
          new Date(formValue.fiatwithdrawStartDate)
      ) {
        errors.fiatwithdrawExpectedDate = "Expected date must be after start date.";
      }
      if (!formValue.fiatwithdrawalMaintenance?.trim()) {
        errors.fiatwithdrawalMaintenance = "Maintenance content is required.";
      }
    } 

    if (formValue.siteStatus === "Deactive") {
      if (!formValue.siteStartDate) {
        errors.siteStartDate = "Start date is required.";
      }
      if (!formValue.siteExpectedDate) {
        errors.siteExpectedDate = "Expected date is required.";
      } else if (
        formValue.siteStartDate &&
        new Date(formValue.siteExpectedDate) < new Date(formValue.siteStartDate)
      ) {
        errors.siteExpectedDate = "Expected date must be after start date.";
      }
      if (!formValue.siteMaintenance?.trim()) {
        errors.siteMaintenance = "Maintenance content is required.";
      }
    }

    if (formValue.kycStatus === "Deactive") {
      if (!formValue.kycStartDate) {
        errors.kycStartDate = "Start date is required.";
      }
      if (!formValue.kycExpectedDate) {
        errors.kycExpectedDate = "Expected date is required.";
      } else if (
        formValue.kycStartDate &&
        new Date(formValue.kycExpectedDate) < new Date(formValue.kycStartDate)
      ) {
        errors.kycExpectedDate = "Expected date must be after start date.";
      }
      if (!formValue.kycMaintenance?.trim()) {
        errors.kycMaintenance = "Maintenance content is required.";
      }
    }
    if (formValue.tradeStatus == "Deactive") {
      if (!formValue.tradeStartDate) {
        errors.tradeStartDate = "Start date is required.";
      }
      if (!formValue.tradeExpectedDate) {
        errors.tradeExpectedDate = "Expected date is required.";
      } else if (
        formValue.tradeStartDate &&
        new Date(formValue.tradeExpectedDate) <
          new Date(formValue.tradeStartDate)
      ) {
        errors.tradeExpectedDate = "Expected date must be after start date.";
      }
      if (!formValue.tradeContent?.trim()) {
        errors.tradeContent = "Maintenance content is required.";
      }
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix validation errors before submitting.");
      return;
    }

    setFormErrors({});

    formValue["siteLogo"] = siteLogoref.current;
    formValue["favicon"] = favIconref.current;
    formValue["fiatwithdrawEndDate"] = formValue.fiatwithdrawExpectedDate;
    formValue["depositEndDate"] = formValue.depExpectedDate;
    formValue["fiatdepositEndDate"] = formValue.fiatdepExpectedDate;
    formValue["withdrawEndDate"] = formValue.withdrawExpectedDate;
    formValue["siteEndDate"] = formValue.siteExpectedDate;
    formValue["kycEndDate"] = formValue.kycExpectedDate;
    formValue["tradeEndDate"] = formValue.tradeExpectedDate;

    console.log(formValue);
    var data = {
      apiUrl: apiService.sitesetting,
      payload: formValue,
    };

    setButtonLoader(true);
    var resp = await postMethod(data);
    setButtonLoader(false);

    if (resp.status === true) {
      toast.success(resp.message);
      setsiteLogo("");
      setvalidLogoproof(0);
      setFavicon("");
      setvalidFaviconProof(0);
      setsiteLogoname("");
      setFaviconname("");
      getSitedatas();
    } else {
      toast.error(resp.message);
    }
  };

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
            {siteLoader ? (
              <SkeletonwholeProject />
            ) : (
              <>
                <div className="px-4 transaction_padding_top">
                  <div className="px-2 my-4 transaction_padding_top tops">
                    <div className="headerss">
                      <span className="dash-head">Site Settings</span>
                    </div>
                    <div className="row justify-content-center mt-5">
                      <div className="col-xl-11 col-12">
                        <div className="st_set_box currencyinput">
                          <div className="main_div">
                            <div className="input-groups mt-0">
                              <h6 className="input-label">Facebook Link</h6>
                              <input
                                type="text"
                                name="facebook"
                                value={facebook}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Please enter facebook link"
                              />
                            </div>
                            <div className="input-groups mt-sm-0">
                              <h6 className="input-label">Twitter Link</h6>
                              <input
                                type="text"
                                name="twitter"
                                value={twitter}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Please enter twitter link"
                              />
                            </div>
                          </div>
                          <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">LinkedIn Link</h6>
                              <input
                                type="text"
                                name="linkedIn"
                                value={linkedIn}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Please enter linkedin link"
                              />
                            </div>
                            <div className="input-groups">
                              <h6 className="input-label">Instagram Link</h6>
                              <input
                                type="text"
                                name="instagram"
                                value={instagram}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Please enter instagram link"
                              />
                            </div>
                          </div>
                          <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">Reddit Link</h6>
                              <input
                                type="text"
                                name="reddit"
                                value={reddit}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Please enter reddit link"
                              />
                            </div>
                            <div className="input-groups">
                              <h6 className="input-label">Youtube Link</h6>
                              <input
                                type="text"
                                name="youtube"
                                value={youtube}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Please enter youtube link"
                              />
                            </div>
                            {/* <div className="input-groups">
                          <h6 className="input-label">Bitcointalk Link</h6>
                          <input
                            type="text"
                            name="bitcointalk"
                            value={bitcointalk}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Please enter bitcointalk link"
                          />
                        </div> */}
                          </div>
                          <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">Telegram Link</h6>
                              <input
                                type="text"
                                name="telegram"
                                value={telegram}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Please enter telegram link"
                              />
                            </div>
                            <div className="input-groups">
                              <h6 className="input-label">Coingecko Link</h6>
                              <input
                                type="text"
                                name="coinGecko"
                                value={coinGecko}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Please enter coingecko link"
                              />
                            </div>
                          </div>
                          <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">Copyright Text</h6>
                              <input
                                type="text"
                                name="copyrightText"
                                value={copyrightText}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Please enter copyright text"
                              />
                            </div>
                            <div className="input-groups">
                              <h6 className="input-label">
                                Coinmarketcap Link
                              </h6>
                              <input
                                type="text"
                                name="coinMarketCap"
                                value={coinMarketCap}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Please enter coinmarketcap link"
                              />
                            </div>
                          </div>
                          <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">Email</h6>
                              <input
                                type="text"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Please enter email address"
                              />
                            </div>
                            <div className="input-groups">
                              <h6 className="input-label">Whatsapp Number</h6>
                              <input
                                type="number"
                                min={0}
                                name="whatsappNumber"
                                value={whatsappNumber}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Please enter whatsapp number"
                              />
                            </div>
                          </div>
                          <div className="main_div main_upload_wrap">
                            <div className="input-groups">
                              <h6 className="input-label">Logo Upload</h6>
                              <div className="logo_upload">
                                {siteLogoLoad == false ? (
                                  validLogoproof == 0 ? (
                                    <>
                                      <div className="inner_frst_display">
                                        <i class="fa-solid fa-cloud-arrow-up fn-24"></i>
                                        <p>Upload the site logo</p>
                                      </div>
                                    </>
                                  ) : (
                                    <img
                                      src={siteLogoref.current}
                                      className="up_im_past"
                                      alt="siteLogo"
                                    />
                                  )
                                ) : (
                                  <div className="inner_frst_display">
                                    <i class="fa-solid fa-spinner fa-spin fa-lg"></i>
                                  </div>
                                )}

                                <input
                                  type="file"
                                  name="image"
                                  accept="image/*"
                                  className="input-field file-input"
                                  onChange={(e) =>
                                    handleFileChange("siteLogo", e)
                                  }
                                />

                                {siteLogonameref.current == "" ? (
                                  ""
                                ) : (
                                  <div className="mt-2">
                                    <input
                                      className="proofs_name w-100"
                                      disabled
                                      value={siteLogonameref.current}
                                    ></input>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="input-groups">
                              <h6 className="input-label">Favicon Upload</h6>
                              <div className="logo_upload">
                                {faviconLoad == false ? (
                                  validFaviconProof == 0 ? (
                                    <>
                                      <div className="inner_frst_display">
                                        <i class="fa-solid fa-cloud-arrow-up fn-24"></i>
                                        <p>Upload the site favicon</p>
                                      </div>
                                    </>
                                  ) : (
                                    <img
                                      src={favIconref.current}
                                      className="up_im_past"
                                      alt="siteLogo"
                                    />
                                  )
                                ) : (
                                  <div className="inner_frst_display">
                                    <i class="fa-solid fa-spinner fa-spin fa-lg"></i>
                                  </div>
                                )}

                                <input
                                  type="file"
                                  name="image"
                                  accept="image/*"
                                  className="input-field file-input"
                                  onChange={(e) =>
                                    handleFileChange("favicon", e)
                                  }
                                />

                                {favIconnameref.current == "" ? (
                                  ""
                                ) : (
                                  <div className="mt-2">
                                    <input
                                      className="proofs_name w-100"
                                      disabled
                                      value={favIconnameref.current}
                                    ></input>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">Deposit Status</h6>
                            </div>
                            <div className="input-groups">
                              <div className="radio-group mt-sm-3">
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="depositStatus"
                                    value="Active"
                                    className="radio-input"
                                    checked={
                                      formValue.depositStatus === "Active"
                                    }
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        depositStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Active
                                </label>
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="depositStatus"
                                    value="Deactive"
                                    className="radio-input"
                                    checked={
                                      formValue.depositStatus === "Deactive"
                                    }
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        depositStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Deactive
                                </label>
                              </div>

                              {formValue.depositStatus === "Deactive" && (
                                <div className="mt-3">
                                  <h6 className="input-label dep_start_date">
                                    Start Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.depStartDate
                                        ? new Date(formValue.depStartDate)
                                        : null
                                    }
                                    onChange={(date) => {
                                      setFormValue((prev) => ({
                                        ...prev,
                                        depStartDate: date,
                                        depExpectedDate:
                                          prev.depExpectedDate &&
                                          new Date(prev.depExpectedDate) < date
                                            ? null
                                            : prev.depExpectedDate,
                                      }));

                                      if (date) {
                                        setFormErrors((prev) => ({
                                          ...prev,
                                          depStartDate: "",
                                        }));
                                      }
                                    }}
                                    customInput={
                                      <CustomDateInput placeholder="Select start date & time" />
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={new Date()}
                                    placeholderText="Select start date and time"
                                    className={`input-field ${
                                      formErrors.depStartDate
                                        ? "error-border"
                                        : ""
                                    }`}
                                  />
                                  {formErrors.depStartDate && (
                                    <small className="error-text">
                                      {formErrors.depStartDate}
                                    </small>
                                  )}

                                  <h6 className="input-label mt-2 dep_start_date">
                                    Expected Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.depExpectedDate
                                        ? new Date(formValue.depExpectedDate)
                                        : null
                                    }
                                    onChange={(date) => {
                                      setFormValue({
                                        ...formValue,
                                        depExpectedDate: date,
                                      });

                                      if (date) {
                                        setFormErrors((prev) => ({
                                          ...prev,
                                          depExpectedDate: "",
                                        }));
                                      }
                                    }}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={
                                      formValue.depStartDate
                                        ? new Date(formValue.depStartDate)
                                        : new Date()
                                    }
                                    customInput={
                                      <CustomDateInput placeholder="Select expected date & time" />
                                    }
                                    placeholderText="Select expected date and time"
                                    className={`input-field ${
                                      formErrors.depExpectedDate
                                        ? "error-border"
                                        : ""
                                    }`}
                                  />
                                  {formErrors.depExpectedDate && (
                                    <small className="error-text">
                                      {formErrors.depExpectedDate}
                                    </small>
                                  )}

                                  <h6 className="input-label mt-2 dep_start_date">
                                    Deposit Maintenance Content
                                  </h6>
                                  <textarea
                                    maxLength="250"
                                    name="depositMaintenance"
                                    value={formValue.depositMaintenance || ""}
                                    onChange={(e) => {
                                      setFormValue({
                                        ...formValue,
                                        depositMaintenance: e.target.value,
                                      });

                                      if (e.target.value.trim() !== "") {
                                        setFormErrors((prev) => ({
                                          ...prev,
                                          depositMaintenance: "",
                                        }));
                                      }
                                    }}
                                    placeholder="Enter the deposit maintenance content"
                                    rows="2"
                                    className={`input-field fixed-textarea ${
                                      formErrors.depositMaintenance
                                        ? "error-border"
                                        : ""
                                    }`}
                                  />
                                  {formErrors.depositMaintenance && (
                                    <small className="error-text">
                                      {formErrors.depositMaintenance}
                                    </small>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">
                                Fiat Deposit Status
                              </h6>
                            </div>
                            <div className="input-groups">
                              <div className="radio-group mt-sm-3">
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="fiatdepositStatus"
                                    value="Active"
                                    className="radio-input"
                                    checked={
                                      formValue.fiatdepositStatus === "Active"
                                    }
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        fiatdepositStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Active
                                </label>
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="fiatdepositStatus"
                                    value="Deactive"
                                    className="radio-input"
                                    checked={
                                      formValue.fiatdepositStatus === "Deactive"
                                    }
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        fiatdepositStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Deactive
                                </label>
                              </div>

                              {formValue.fiatdepositStatus === "Deactive" && (
                                <div className="mt-3">
                                  <h6 className="input-label dep_start_date">
                                    Start Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.fiatdepStartDate
                                        ? new Date(formValue.fiatdepStartDate)
                                        : null
                                    }
                                    onChange={(date) => {
                                      setFormValue((prev) => ({
                                        ...prev,
                                        fiatdepStartDate: date,
                                        fiatdepExpectedDate:
                                          prev.fiatdepExpectedDate &&
                                          new Date(prev.fiatdepExpectedDate) <
                                            date
                                            ? null
                                            : prev.fiatdepExpectedDate,
                                      }));

                                      if (date) {
                                        setFormErrors((prev) => ({
                                          ...prev,
                                          fiatdepStartDate: "",
                                        }));
                                      }
                                    }}
                                    customInput={
                                      <CustomDateInput placeholder="Select start date & time" />
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={new Date()}
                                    placeholderText="Select start date and time"
                                    className={`input-field ${
                                      formErrors.fiatdepStartDate
                                        ? "error-border"
                                        : ""
                                    }`}
                                  />
                                  {formErrors.fiatdepStartDate && (
                                    <small className="error-text">
                                      {formErrors.fiatdepStartDate}
                                    </small>
                                  )}

                                  <h6 className="input-label mt-2 dep_start_date">
                                    Expected Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.fiatdepExpectedDate
                                        ? new Date(
                                            formValue.fiatdepExpectedDate
                                          )
                                        : null
                                    }
                                    onChange={(date) => {
                                      setFormValue({
                                        ...formValue,
                                        fiatdepExpectedDate: date,
                                      });

                                      if (date) {
                                        setFormErrors((prev) => ({
                                          ...prev,
                                          fiatdepExpectedDate: "",
                                        }));
                                      }
                                    }}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={
                                      formValue.fiatdepStartDate
                                        ? new Date(formValue.fiatdepStartDate)
                                        : new Date()
                                    }
                                    customInput={
                                      <CustomDateInput placeholder="Select expected date & time" />
                                    }
                                    placeholderText="Select expected date and time"
                                    className={`input-field ${
                                      formErrors.fiatdepExpectedDate
                                        ? "error-border"
                                        : ""
                                    }`}
                                  />
                                  {formErrors.fiatdepExpectedDate && (
                                    <small className="error-text">
                                      {formErrors.fiatdepExpectedDate}
                                    </small>
                                  )}

                                  <h6 className="input-label mt-2 dep_start_date">
                                    Fiat Deposit Maintenance Content
                                  </h6>
                                  <textarea
                                    maxLength="250"
                                    name="depositMaintenance"
                                    value={
                                      formValue.fiatdepositMaintenance || ""
                                    }
                                    onChange={(e) => {
                                      setFormValue({
                                        ...formValue,
                                        fiatdepositMaintenance: e.target.value,
                                      });

                                      if (e.target.value.trim() !== "") {
                                        setFormErrors((prev) => ({
                                          ...prev,
                                          fiatdepositMaintenance: "",
                                        }));
                                      }
                                    }}
                                    placeholder="Enter the deposit maintenance content"
                                    rows="2"
                                    className={`input-field fixed-textarea ${
                                      formErrors.fiatdepositMaintenance
                                        ? "error-border"
                                        : ""
                                    }`}
                                  />
                                  {formErrors.fiatdepositMaintenance && (
                                    <small className="error-text">
                                      {formErrors.fiatdepositMaintenance}
                                    </small>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">Withdrawal Status</h6>
                            </div>
                            <div className="input-groups">
                              <div className="radio-group mt-sm-3">
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="withdrawalStatus"
                                    value="Active"
                                    className="radio-input"
                                    checked={
                                      formValue.withdrawalStatus === "Active"
                                    }
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        withdrawalStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Active
                                </label>
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="withdrawalStatus"
                                    value="Deactive"
                                    className="radio-input"
                                    checked={
                                      formValue.withdrawalStatus === "Deactive"
                                    }
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        withdrawalStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Deactive
                                </label>
                              </div>
                              {formValue.withdrawalStatus === "Deactive" && (
                                <div className="mt-3">
                                  <h6 className="input-label dep_start_date">
                                    Start Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.withdrawStartDate
                                        ? new Date(formValue.withdrawStartDate)
                                        : null
                                    }
                                    onChange={(date) =>
                                      setFormValue({
                                        ...formValue,
                                        withdrawStartDate: date,
                                      })
                                    }
                                    customInput={
                                      <CustomDateInput placeholder="Select start date & time" />
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={new Date()}
                                    placeholderText="Select start date and time"
                                    className="input-field "
                                  />
                                  {formErrors.withdrawStartDate && (
                                    <small className="error-text">
                                      {formErrors.withdrawStartDate}
                                    </small>
                                  )}

                                  <h6 className="input-label mt-2 dep_start_date">
                                    Expected Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.withdrawExpectedDate
                                        ? new Date(
                                            formValue.withdrawExpectedDate
                                          )
                                        : null
                                    }
                                    onChange={(date) =>
                                      setFormValue({
                                        ...formValue,
                                        withdrawExpectedDate: date,
                                      })
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={
                                      formValue.withdrawStartDate
                                        ? new Date(formValue.withdrawStartDate)
                                        : new Date()
                                    }
                                    customInput={
                                      <CustomDateInput placeholder="Select expected date & time" />
                                    }
                                    placeholderText="Select expected date and time"
                                    className="input-field "
                                  />
                                  {formErrors.withdrawExpectedDate && (
                                    <small className="error-text">
                                      {formErrors.withdrawExpectedDate}
                                    </small>
                                  )}

                                  <h6 className="input-label mt-2 dep_start_date">
                                    Withdrawal Maintenance Content
                                  </h6>
                                  <textarea
                                    maxLength="250"
                                    name="withdrawalMaintenance"
                                    value={
                                      formValue.withdrawalMaintenance || ""
                                    }
                                    onChange={
                                      handleTextChangewithdrawalMaintenance
                                    }
                                    placeholder="Enter the withdrawal maintenance content"
                                    rows="2"
                                    className="input-field fixed-textarea "
                                  />
                                  {formErrors.withdrawalMaintenance && (
                                    <small className="error-text">
                                      {formErrors.withdrawalMaintenance}
                                    </small>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                             <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">Fiat Withdrawal Status</h6>
                            </div>
                            <div className="input-groups">
                              <div className="radio-group mt-sm-3">
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="fiatwithdrawalStatus"
                                    value="Active"
                                    className="radio-input"
                                    checked={
                                      formValue.fiatwithdrawalStatus === "Active"
                                    }
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        fiatwithdrawalStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Active
                                </label>
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="fiatwithdrawalStatus"
                                    value="Deactive"
                                    className="radio-input"
                                    checked={
                                      formValue.fiatwithdrawalStatus === "Deactive"
                                    }
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        fiatwithdrawalStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Deactive
                                </label>
                              </div>
                              {formValue.fiatwithdrawalStatus === "Deactive" && (
                                <div className="mt-3">
                                  <h6 className="input-label dep_start_date">
                                    Start Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.fiatwithdrawStartDate
                                        ? new Date(formValue.fiatwithdrawStartDate)
                                        : null
                                    }
                                    onChange={(date) =>
                                      setFormValue({
                                        ...formValue,
                                        fiatwithdrawStartDate: date,
                                      })
                                    }
                                    customInput={
                                      <CustomDateInput placeholder="Select start date & time" />
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={new Date()}
                                    placeholderText="Select start date and time"
                                    className="input-field "
                                  />
                                  {formErrors.fiatwithdrawStartDate && (
                                    <small className="error-text">
                                      {formErrors.fiatwithdrawStartDate}
                                    </small>
                                  )}

                                  <h6 className="input-label mt-2 dep_start_date">
                                    Fiat Expected Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.fiatwithdrawExpectedDate
                                        ? new Date(
                                            formValue.fiatwithdrawExpectedDate
                                          )
                                        : null
                                    }
                                    onChange={(date) =>
                                      setFormValue({
                                        ...formValue,
                                        fiatwithdrawExpectedDate: date,
                                      })
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={
                                      formValue.fiatwithdrawStartDate
                                        ? new Date(formValue.fiatwithdrawStartDate)
                                        : new Date()
                                    }
                                    customInput={
                                      <CustomDateInput placeholder="Select expected date & time" />
                                    }
                                    placeholderText="Select expected date and time"
                                    className="input-field "
                                  />
                                  {formErrors.fiatwithdrawExpectedDate && (
                                    <small className="error-text">
                                      {formErrors.fiatwithdrawExpectedDate}
                                    </small>
                                  )}

                                  <h6 className="input-label mt-2 dep_start_date">
                                    Fiat Withdrawal Maintenance Content
                                  </h6>
                                  <textarea
                                    maxLength="250"
                                    name="fiatwithdrawalMaintenance"
                                    value={
                                      formValue.fiatwithdrawalMaintenance || ""
                                    }
                                    onChange={
                                      handleTextChangefiatwithdrawalMaintenance
                                    }
                                    placeholder="Enter the withdrawal maintenance content"
                                    rows="2"
                                    className="input-field fixed-textarea "
                                  />
                                  {formErrors.fiatwithdrawalMaintenance && (
                                    <small className="error-text">
                                      {formErrors.fiatwithdrawalMaintenance}
                                    </small>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">
                                Site Maintenance Status
                              </h6>
                            </div>
                            <div className="input-groups">
                              <div className="radio-group mt-sm-3">
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="siteStatus"
                                    value="Active"
                                    className="radio-input"
                                    checked={formValue.siteStatus === "Active"}
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        siteStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Active
                                </label>
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="siteStatus"
                                    value="Deactive"
                                    className="radio-input"
                                    checked={
                                      formValue.siteStatus === "Deactive"
                                    }
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        siteStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Deactive
                                </label>
                              </div>

                              {formValue.siteStatus === "Deactive" && (
                                <div className="mt-3">
                                  <h6 className="input-label dep_start_date">
                                    Start Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.siteStartDate
                                        ? new Date(formValue.siteStartDate)
                                        : null
                                    }
                                    onChange={(date) =>
                                      setFormValue({
                                        ...formValue,
                                        siteStartDate: date,
                                      })
                                    }
                                    customInput={
                                      <CustomDateInput placeholder="Select start date & time" />
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={new Date()}
                                    placeholderText="Select start date and time"
                                    className="input-field "
                                  />
                                  {formErrors.siteStartDate && (
                                    <small className="error-text">
                                      {formErrors.siteStartDate}
                                    </small>
                                  )}
                                  <h6 className="input-label mt-2 dep_start_date">
                                    Expected Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.siteExpectedDate
                                        ? new Date(formValue.siteExpectedDate)
                                        : null
                                    }
                                    onChange={(date) =>
                                      setFormValue({
                                        ...formValue,
                                        siteExpectedDate: date,
                                      })
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={
                                      formValue.siteStartDate
                                        ? new Date(formValue.siteStartDate)
                                        : new Date()
                                    }
                                    customInput={
                                      <CustomDateInput placeholder="Select expected date & time" />
                                    }
                                    placeholderText="Select expected date and time"
                                    className="input-field "
                                  />
                                  {formErrors.siteExpectedDate && (
                                    <small className="error-text">
                                      {formErrors.siteExpectedDate}
                                    </small>
                                  )}
                                  <h6 className="input-label mt-2 dep_start_date">
                                    Site Maintenance Content
                                  </h6>
                                  <textarea
                                    maxLength="250"
                                    name="siteMaintenance"
                                    value={formValue.siteMaintenance || ""}
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        siteMaintenance: e.target.value,
                                      })
                                    }
                                    placeholder="Enter the site maintenance content"
                                    rows="2"
                                    className="input-field fixed-textarea "
                                  />
                                  {formErrors.siteMaintenance && (
                                    <small className="error-text">
                                      {formErrors.siteMaintenance}
                                    </small>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">KYC Status</h6>
                            </div>
                            <div className="input-groups">
                              <div className="radio-group mt-sm-3">
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="kycStatus"
                                    value="Active"
                                    className="radio-input"
                                    checked={formValue.kycStatus === "Active"}
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        kycStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Active
                                </label>
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="kycStatus"
                                    value="Deactive"
                                    className="radio-input"
                                    checked={formValue.kycStatus === "Deactive"}
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        kycStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Deactive
                                </label>
                              </div>

                              {formValue.kycStatus === "Deactive" && (
                                <div className="mt-3">
                                  <h6 className="input-label dep_start_date">
                                    Start Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.kycStartDate
                                        ? new Date(formValue.kycStartDate)
                                        : null
                                    }
                                    onChange={(date) =>
                                      setFormValue({
                                        ...formValue,
                                        kycStartDate: date,
                                      })
                                    }
                                    customInput={
                                      <CustomDateInput placeholder="Select start date & time" />
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={new Date()}
                                    placeholderText="Select start date and time"
                                    className="input-field "
                                  />
                                  {formErrors.kycStartDate && (
                                    <small className="error-text">
                                      {formErrors.kycStartDate}
                                    </small>
                                  )}
                                  <h6 className="input-label mt-2 dep_start_date">
                                    Expected Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.kycExpectedDate
                                        ? new Date(formValue.kycExpectedDate)
                                        : null
                                    }
                                    onChange={(date) =>
                                      setFormValue({
                                        ...formValue,
                                        kycExpectedDate: date,
                                      })
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={
                                      formValue.kycStartDate
                                        ? new Date(formValue.kycStartDate)
                                        : new Date()
                                    }
                                    customInput={
                                      <CustomDateInput placeholder="Select expected date & time" />
                                    }
                                    placeholderText="Select expected date and time"
                                    className="input-field "
                                  />
                                  {formErrors.kycExpectedDate && (
                                    <small className="error-text">
                                      {formErrors.kycExpectedDate}
                                    </small>
                                  )}
                                  <h6 className="input-label mt-2 dep_start_date">
                                    KYC Maintenance Content
                                  </h6>
                                  <textarea
                                    maxLength="250"
                                    name="kycMaintenance"
                                    value={formValue.kycMaintenance || ""}
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        kycMaintenance: e.target.value,
                                      })
                                    }
                                    placeholder="Enter the KYC maintenance content"
                                    rows="2"
                                    className="input-field fixed-textarea "
                                  />{" "}
                                  {formErrors.kycMaintenance && (
                                    <small className="error-text">
                                      {formErrors.kycMaintenance}
                                    </small>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">Trade Status</h6>
                            </div>
                            <div className="input-groups">
                              <div className="radio-group mt-sm-3">
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="tradeStatus"
                                    value="Active"
                                    className="radio-input"
                                    checked={formValue.tradeStatus == "Active"}
                                    onChange={(e) => {
                                      setFormValue({
                                        ...formValue,
                                        tradeStatus: e.target.value,
                                      });
                                      console.log(formValue.tradeStatus);
                                    }}
                                  />
                                  Active
                                </label>
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="tradeStatus"
                                    value="Deactive"
                                    className="radio-input"
                                    checked={
                                      formValue.tradeStatus == "Deactive"
                                    }
                                    onChange={(e) => {
                                      console.log(e.target.value);
                                      setFormValue({
                                        ...formValue,
                                        tradeStatus: e.target.value,
                                      });
                                      console.log(formValue.tradeStatus);
                                    }}
                                  />
                                  Deactive
                                </label>
                              </div>

                              {formValue.tradeStatus === "Deactive" && (
                                <div className="mt-3">
                                  <h6 className="input-label dep_start_date">
                                    Start Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.tradeStartDate
                                        ? new Date(formValue.tradeStartDate)
                                        : null
                                    }
                                    onChange={(date) =>
                                      setFormValue({
                                        ...formValue,
                                        tradeStartDate: date,
                                      })
                                    }
                                    customInput={
                                      <CustomDateInput placeholder="Select start date & time" />
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={new Date()}
                                    placeholderText="Select start date and time"
                                    className="input-field "
                                  />{" "}
                                  {formErrors.tradeStartDate && (
                                    <small className="error-text">
                                      {formErrors.tradeStartDate}
                                    </small>
                                  )}
                                  <h6 className="input-label mt-2 dep_start_date">
                                    Expected Date & Time
                                  </h6>
                                  <DatePicker
                                    selected={
                                      formValue.tradeExpectedDate
                                        ? new Date(formValue.tradeExpectedDate)
                                        : null
                                    }
                                    onChange={(date) =>
                                      setFormValue({
                                        ...formValue,
                                        tradeExpectedDate: date,
                                      })
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    minDate={
                                      formValue.tradeStartDate
                                        ? new Date(formValue.tradeStartDate)
                                        : new Date()
                                    }
                                    customInput={
                                      <CustomDateInput placeholder="Select expected date & time" />
                                    }
                                    placeholderText="Select expected date and time"
                                    className="input-field "
                                  />
                                  {formErrors.tradeExpectedDate && (
                                    <small className="error-text">
                                      {formErrors.tradeExpectedDate}
                                    </small>
                                  )}
                                  <h6 className="input-label mt-2 dep_start_date">
                                    Trade Content
                                  </h6>
                                  <textarea
                                    maxLength="250"
                                    name="tradeContent"
                                    value={formValue.tradeContent || ""}
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        tradeContent: e.target.value,
                                      })
                                    }
                                    placeholder="Enter the trade content"
                                    rows="2"
                                    className="input-field fixed-textarea "
                                  />
                                  {formErrors.tradeContent && (
                                    <small className="error-text">
                                      {formErrors.tradeContent}
                                    </small>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="main_div">
                            <div className="input-groups">
                              <h6 className="input-label">Liquidity Status</h6>
                            </div>
                            <div className="input-groups">
                              <div className="radio-group mt-sm-3">
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="liquidityStatus"
                                    value="1"
                                    className="radio-input"
                                    checked={formValue.liquidityStatus === "1"}
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        liquidityStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Binance
                                </label>
                                <label className="radio-label">
                                  <input
                                    type="radio"
                                    name="liquidityStatus"
                                    value="0"
                                    className="radio-input"
                                    checked={formValue.liquidityStatus === "0"}
                                    onChange={(e) =>
                                      setFormValue({
                                        ...formValue,
                                        liquidityStatus: e.target.value,
                                      })
                                    }
                                  />
                                  Self
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="main_div">
                            {/* <div className="input-groups">
                          <h6 className="input-label">
                            KYC Status
                          </h6>
                          <div className="radio-group mt-3">
                            <label className="radio-label">
                              <input
                                type="radio"
                                name="kycstatus"
                                value="Active"
                                className="radio-input"
                                onChange={handleKycStatusChange}
                              />
                              Active
                            </label>
                            <label className="radio-label">
                              <input
                                type="radio"
                                name="kycstatus"
                                value="Deactive"
                                className="radio-input"
                                onChange={handleKycStatusChange}
                              />
                              Deactive
                            </label>
                          </div>
                        </div> */}
                            <div className="input-groups">
                              <h6 className="input-label">Footer Content</h6>
                            </div>
                            <div className="input-groups">
                              <textarea
                                maxLength="250"
                                name="footerContent"
                                value={footerContent}
                                onChange={handleTextChangefooter}
                                placeholder="Enter the footer content"
                                fluid
                                rows="2"
                                className="input-field fixed-textarea"
                              />
                            </div>
                          </div>
                          <div className="main_submit mt-5">
                            <div className="site_submain" onClick={formSubmit}>
                              {buttonLoader == false ? (
                                <span className="submit_site">Submit</span>
                              ) : (
                                <span className="submit_site">Loading ...</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>{" "}
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;
