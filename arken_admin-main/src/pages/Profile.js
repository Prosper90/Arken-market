import React, { useEffect } from "react";
import moment from "moment";
import useState from "react-usestateref";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";

import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import { useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";

const ProfileComponent = () => {
  const [model, setModel] = useState({});
  const [adminDetail, setAdminDetail] = useState({});
  const [tfaDetails, setTfaDetails] = useState(0);

  useEffect(() => {
    getProfileData();
  }, []);

  const navigate = useNavigate();

  const initialFormValue = {
    oldpassword: "",
    password: "",
    confirmPassword: "",
  };
  const [formValue, setFormValue] = useState(initialFormValue);

  const { oldpassword, password, confirmPassword } = formValue;
  const [passwordValidate, setpasswordValidate, passwordValidateref] =
    useState(false);
  const [
    confirmPasswordValidate,
    setconfirmPasswordValidate,
    confirmPasswordValidateref,
  ] = useState(false);
  const [oldpassvalidate, setoldpassvalidate, oldpassvalidateref] =
    useState(false);
  const [passHide, setPasshide] = useState(false);
  const [inputType, setinputType] = useState("password");
  const [passHidconf, setPasshideconf] = useState(false);
  const [inputTypeconf, setinputTypeconf] = useState("password");
  const [passHidnew, setPasshidenew] = useState(false);
  const [inputTypenew, setinputTypenew] = useState("password");
  const [buttonLoader, setbuttonLoader] = useState(false);
  const [validationnErr, setvalidationnErr] = useState("");
  const [siteLoader, setSiteLoader] = useState(true);

  const validate = async (values) => {
    const errors = {};
    if (values.oldpassword == "") {
      errors.oldpassword = "Old password is required";
      setoldpassvalidate(true);
    } else {
      setoldpassvalidate(false);
    }

    if (values.password == "") {
      setpasswordValidate(true);
      errors.password = "Password is required";
    } else if (values.password.length < 5 || values.password.length > 15) {
      setpasswordValidate(true);
      errors.password =
        "New password is required and shouldnot below 5 above 15letters";
    } else if (!values.password.match(/[a-z]/g)) {
      setpasswordValidate(true);
      errors.password = "Please enter at least lower character";
    } else if (!values.password.match(/[A-Z]/g)) {
      setpasswordValidate(true);
      errors.password = "Please enter at least upper character";
    } else if (!values.password.match(/[0-9]/g)) {
      setpasswordValidate(true);
      errors.password = "Please enter One digit character";
    } else if (values.password == values.oldpassword) {
      errors.password = "Old password and New password should not be same";
      setpasswordValidate(true);
    } else {
      setpasswordValidate(false);
    }

    if (values.confirmPassword == "") {
      errors.confirmPassword = "Confirm password is a required";
      setconfirmPasswordValidate(true);
    } else if (values.confirmPassword != values.password) {
      setconfirmPasswordValidate(true);
      errors.confirmPassword = "Password and confirm password does not match";
    } else {
      setconfirmPasswordValidate(false);
    }
    setvalidationnErr(errors);
    return errors;
  };

  const handleChange = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    const cleanedValue = value.replace(/^\s+/, "");

    let formData = { ...formValue, ...{ [name]: cleanedValue } };
    setFormValue(formData);
    validate(formData);
  };

  const getProfileData = async () => {
    try {
      const datas = { apiUrl: apiService.getAdminTfaDetials };
      setSiteLoader(true);
      const resData = await getMethod(datas);
      console.log(resData, "=-=-=-resData");
      //   const resData = await getMethod(apiService.getAdminProfile);
      if (resData.status == true) {
        // setModel({ ...model, email: resData.data.email });
        setSiteLoader(false);
        setAdminDetail(resData.data);
        let tfastatus = sessionStorage.getItem("tfa_status");
        console.log(tfastatus, "tfastatus");
        setTfaDetails(tfastatus);
        // setTfaBtn(resData.data.tfa_status === 1 ? "Disable" : "Enable");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  // const submit = async (event) => {
  //   console.log(model, "knweknkewnkecnwek");

  //   event.preventDefault();
  //   console.log(model, "knweknkewnkecnwek");
  //   const { oldpass, newpass, cpass } = model;

  //   if (oldpass) {
  //   console.log(model, "knweknkewnkecnwek");

  //     try {
  //       // const checkPassData = await postMethod(apiService.checkPassword, {
  //       //   password: oldpass,
  //       // });

  //       var obj ={
  //         password: oldpass,
  //       }

  //       var data = {
  //         apiUrl: apiService.checkPassword,
  //         payload: obj,
  //     };
  //     var checkPassData = await postMethod(data);

  //   console.log(checkPassData, "knweknkewnkecnwek");

  //       if (!checkPassData.status) {
  //         toast.error(checkPassData.Message, "Error!");
  //       } else if (newpass === cpass) {
  //         // const updateProfileData = await postMethod(apiService.updateProfile, {

  //         // });

  //         var obj ={
  //           password: newpass,
  //         }

  //         var data = {
  //           apiUrl: apiService.updateProfile,
  //           payload: obj,
  //       };

  //     var updateProfileData = await postMethod(data);

  //         if (updateProfileData.status) {
  //           toast.success(updateProfileData.Message, "Success!");
  //           getProfileData();
  //           localStorage.clear();
  //           window.location.href = "/admin";
  //         } else {
  //           toast.error(updateProfileData.Message, "Error!");
  //         }
  //       } else {
  //         toast.error("Confirm Password is Mismatched", "Error!");
  //         getProfileData();
  //       }
  //     } catch (error) {
  //       console.error("Error submitting form:", error);
  //     }
  //   }
  // };
  const [admindata, setadmindata, admindataref] = useState();
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    getAdmin();
  }, [0]);
  const getAdmin = async () => {
    try {
      const token = sessionStorage.getItem("Voltrix_token");

      if (token) {
        const datas = {
          apiUrl: apiService.getAdmin,
          payload: { token },
        };

        const response = await postMethod(datas);
        if (response.data) setadmindata(response);
        setFormValueName((prev) => ({
          ...formValueName,
          name: response.data.userName,
        }));
      }
    } catch (err) {}
  };

  const formSubmit = async () => {
    validate(formValue);
    console.log(formValue, "formValue");
    if (
      confirmPasswordValidateref.current == false &&
      passwordValidateref.current == false &&
      oldpassvalidateref.current == false
    ) {
      console.log("=-=change comes=-=--'");
      var obj = {
        oldPass: formValue.oldpassword,
        password: formValue.password,
        cpass: formValue.confirmPassword,
      };

      var data = {
        apiUrl: apiService.adminChangePassword,
        payload: obj,
      };
      setbuttonLoader(true);
      var resp = await postMethod(data);
      // localStorage.setItem("useremail", resp.email);
      setbuttonLoader(false);
      if (resp.status == true) {
        toast.success(resp.Message);
        sessionStorage.clear();
        navigate("/");
        window.location.reload(true);
      } else {
        toast.error(resp.Message);
      }
    }
  };

  const passwordHide = (data) => {
    if (data == "hide") {
      setPasshide(true);
      setinputType("text");
    } else {
      setPasshide(false);
      setinputType("password");
    }
  };

  const passwordHideconf = (data) => {
    if (data == "hide") {
      setPasshideconf(true);
      setinputTypeconf("text");
    } else {
      setPasshideconf(false);
      setinputTypeconf("password");
    }
  };

  const passwordHidenewP = (data) => {
    if (data == "hide") {
      setPasshidenew(true);
      setinputTypenew("text");
    } else {
      setPasshidenew(false);
      setinputTypenew("password");
    }
  };

  const onKey = async (data) => {
    try {
      const resData = await postMethod(apiService.checkPassword, {
        password: data,
      });
      if (!resData.status) {
        toast.error(resData.Message, "Error!");
        getProfileData();
      }
    } catch (error) {
      console.error("Error checking password:", error);
    }
  };

  // const tfaStatus = async (event) => {
  //   event.preventDefault();
  //   try {

  //     var obj ={
  //       tfa_code: model.tfa_code,
  //     }

  //     var data = {
  //       apiUrl: apiService.updateTfa,
  //       payload: obj,
  //   };

  // var res = await postMethod(data);

  //     // const res = await postMethod(apiService.updateTfa, {
  //     //   tfa_code: model.tfa_code,
  //     // });
  //     if (res.status) {
  //       model.tfa_code = "";
  //       // setTfaBtn(res.tfa_status === 1 ? "Disable" : "Enable");
  //       getProfileData();
  //       toast.success(res.message);
  //     } else {
  //       toast.error(res.message);
  //     }
  //     event.target.reset();
  //   } catch (error) {
  //     console.error("Error updating TFA status:", error);
  //   }
  // };

  const [tfaCode, setTfaCode] = useState("");
  const [loaderButton, setloaderButton] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleSubmit = async () => {
    setValidationErrors({});
    if (!tfaCode || tfaCode === "") {
      toast("2FA code is required");
    } else {
      let tfaStatus = tfaDetails;
      console.log(tfaStatus, "--------tfaStatus---", tfaCode);
      var data = {
        apiUrl: apiService.adminChangeTfaStatus,
        payload: {
          userToken: tfaCode,
          tfaStatus: tfaStatus,
        },
      };
      setloaderButton(true);
      var resp = await postMethod(data);
      setloaderButton(false);
      if (resp.status) {
        showsuccessToast(resp.Message);
        setTfaCode("");
        getProfileData();
        sessionStorage.setItem("tfa_status", resp.result.tfa_status);
        if (typeof resp?.errors !== "undefined") {
          const isErrorEmpty = Object.keys(resp?.errors).length === 0;
          if (!isErrorEmpty) {
            setValidationErrors(resp?.errors);
          }
        } else {
        }
      } else {
        showerrorToast(resp.Message);
      }
    }
  };
  const copy = async (text) => {
    navigator.clipboard.writeText(text);
    showsuccessToast("Secret Key Copied");
  };
  const showsuccessToast = (message) => {
    toast.dismiss();
    toast.success(message);
  };

  const showerrorToast = (message) => {
    toast.dismiss();
    toast.error(message);
  };

  const [formValueName, setFormValueName] = useState({ name: "" });
  const [nameErr, setnameErr] = useState("");
  const handleChangeName = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    if (value == "") {
      setnameErr("Name is required");
    } else {
      setnameErr("");
    }
    const cleanedValue = value.replace(/^\s+/, "");

    let formData = { ...formValueName, ...{ [name]: cleanedValue } };
    setFormValueName(formData);
  };
  const nameSubmit = async () => {
    if (formValueName.name == "") {
      setnameErr("Name is required");
    } else {
      setnameErr("");
      var data = {
        apiUrl: apiService.nameUpdate,
        payload: { name: formValueName.name },
      };
      var resp = await postMethod(data);
      if (resp.status == true) {
        toast.success(resp.Message);
      } else {
        toast.error(resp.Message);
      }
    }
  };
  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-2 px-0">
            <Sidebar />
          </div>
          <div className="col-lg-10 px-0">
            <div className="pos_sticky">
              <Sidebar_2 />
            </div>
            {siteLoader ? (
              <SkeletonwholeProject />
            ) : (
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="row justify-content-center">
                    <div className="col-lg-6">
                      <div className="admin_login_main">
                        <div className="hero_subhead">
                          <span className="hero_head text-align-center mb-3">
                            Edit profile
                          </span>
                        </div>
                        <div className="ycho_inner">
                          <div className="hotpic_bot_hd">
                            <span className="hero_sub_inner">Email</span>
                            <div className="flex_input_posion">
                              <input
                                className="admin_login_imput"
                                name="email"
                                disabled
                                value={admindataref.current?.email}
                              />
                            </div>
                          </div>
                          <div className="hotpic_bot_hd">
                            <span className="hero_sub_inner">Name</span>
                            <div className="flex_input_posion">
                              <input
                                type="text"
                                className="admin_login_imput"
                                name="name"
                                value={formValueName.name}
                                maxLength={25}
                                onChange={handleChangeName}
                              />
                            </div>
                            {nameErr ? (
                              <small className="errorcss">{nameErr}</small>
                            ) : (
                              ""
                            )}
                          </div>
                          {buttonLoader == false ? (
                            <div
                              className="d-flex justify-content-center w_100"
                              onClick={nameSubmit}
                            >
                              <div className="lan_had_con">
                                <span className="con_lan_con ">Submit</span>
                              </div>
                            </div>
                          ) : (
                            <div className="d-flex justify-content-center w_100">
                              <div className="lan_had_con">
                                <span className="con_lan_con">Loading ...</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <hr className="mt-5"></hr>
                        <div className="hero_subhead mt-2">
                          <span className="hero_head text-align-center mt-3">
                            Change Password
                          </span>
                          <div className="ycho_inner">
                            <div className="hotpic_bot_hd">
                              <span className="hero_sub_inner">
                                Old Password
                              </span>
                              <div className="flex_input_posion">
                                <input
                                  className="admin_login_imput"
                                  type={inputType}
                                  name="oldpassword"
                                  minLength={6}
                                  maxLength={15}
                                  value={oldpassword}
                                  onChange={handleChange}
                                  placeholder="Enter old password"
                                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                />
                                {passHide == true ? (
                                  <i
                                    class="fa-regular fa-eye reg_eye"
                                    onClick={() => passwordHide("show")}
                                  ></i>
                                ) : (
                                  <i
                                    class="fa-regular fa-eye-slash reg_eye"
                                    onClick={() => passwordHide("hide")}
                                  ></i>
                                )}
                              </div>
                              {oldpassvalidate == true ? (
                                <small className="errorcss">
                                  {validationnErr.oldpassword}
                                </small>
                              ) : (
                                ""
                              )}
                            </div>
                            <div className="hotpic_bot_hd">
                              <span className="hero_sub_inner">
                                New Password
                              </span>
                              <div className="flex_input_posion">
                                <input
                                  className="admin_login_imput"
                                  type={inputTypenew}
                                  name="password"
                                  minLength={6}
                                  maxLength={15}
                                  value={password}
                                  onChange={handleChange}
                                  placeholder="Enter new password"
                                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                />
                                {passHidnew == true ? (
                                  <i
                                    class="fa-regular fa-eye reg_eye"
                                    onClick={() => passwordHidenewP("show")}
                                  ></i>
                                ) : (
                                  <i
                                    class="fa-regular fa-eye-slash reg_eye"
                                    onClick={() => passwordHidenewP("hide")}
                                  ></i>
                                )}
                              </div>
                              {passwordValidate == true ? (
                                <small className="errorcss">
                                  {" "}
                                  {validationnErr.password}{" "}
                                </small>
                              ) : (
                                ""
                              )}
                            </div>

                            <div className="hotpic_bot_hd">
                              <span className="hero_sub_inner">
                                Confirm Password
                              </span>
                              <div className="flex_input_posion">
                                <input
                                  className="admin_login_imput"
                                  type={inputTypeconf}
                                  name="confirmPassword"
                                  minLength={6}
                                  maxLength={15}
                                  value={confirmPassword}
                                  onChange={handleChange}
                                  placeholder="Re-Enter your new password"
                                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                />
                                {passHidconf == true ? (
                                  <i
                                    class="fa-regular fa-eye reg_eye"
                                    onClick={() => passwordHideconf("show")}
                                  ></i>
                                ) : (
                                  <i
                                    class="fa-regular fa-eye-slash reg_eye"
                                    onClick={() => passwordHideconf("hide")}
                                  ></i>
                                )}
                              </div>
                              {confirmPasswordValidate == true ? (
                                <small className="errorcss">
                                  {" "}
                                  {validationnErr.confirmPassword}{" "}
                                </small>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>

                          {buttonLoader == false ? (
                            <div
                              className="d-flex justify-content-center w_100"
                              onClick={formSubmit}
                            >
                              <div className="lan_had_con">
                                <span className="con_lan_con ">Submit</span>
                              </div>
                            </div>
                          ) : (
                            <div className="d-flex justify-content-center w_100">
                              <div className="lan_had_con">
                                <span className="con_lan_con">Loading ...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="admin_login_main">
                        <div className="hero_subhead">
                          {tfaDetails == 0 ? (
                            <span className="hero_head text-align-center">
                              Enable 2FA
                            </span>
                          ) : (
                            <span className="hero_head text-align-center">
                              Disable 2FA
                            </span>
                          )}
                          <div className="ycho_inner">
                            {tfaDetails == 0 && (
                              <div className="row enanle_2farow">
                                <div className="col-md-12 enable_2facol">
                                  <img
                                    src={adminDetail.tfa_url}
                                    width="150px"
                                    alt="qr code"
                                    className="p-2 bg-white rounded"
                                  />
                                </div>
                                <div className="col-md-12 enable_2facol">
                                  <p className="text_light_grey text-white mt-3 font_12 mb-2 acc-tok-mob">
                                    Scan QR Code or Enter Secret Key Manually
                                    <br />
                                    <div className="hotpic_bot_hd mt-4">
                                      <span className="hero_sub_inner">
                                        {" "}
                                        2FA Secret Key
                                      </span>
                                      <div className="flex_input_posion">
                                        <input
                                          className="admin_login_imput"
                                          type="text"
                                          value={adminDetail.tfaenablekey}
                                          readOnly
                                        />
                                        <i
                                          class="fa-solid fa-copy copy-key"
                                          onClick={() =>
                                            copy(adminDetail.tfaenablekey)
                                          }
                                        ></i>
                                      </div>
                                    </div>
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="hotpic_bot_hd">
                              <span className="hero_sub_inner">
                                Enter 2FA code
                              </span>
                              <input
                                className="admin_login_imput"
                                type="number"
                                min="0"
                                max="999999"
                                name="tfaCode"
                                value={tfaCode}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value.length <= 6) {
                                    setTfaCode(value);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "e" ||
                                    e.key === "E" ||
                                    e.key === "+" ||
                                    e.key === "-"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                placeholder="Enter 2fa code"
                                pattern="^\d{6}$"
                              />
                            </div>
                          </div>
                          {tfaDetails == 0 ? (
                            loaderButton == false ? (
                              <div
                                className="d-flex justify-content-center w_100"
                                onClick={handleSubmit}
                              >
                                <div className="lan_had_con">
                                  <span className="con_lan_con">Enable</span>
                                </div>
                              </div>
                            ) : (
                              <div className="d-flex justify-content-center w_100">
                                <div className="lan_had_con">
                                  <span className="con_lan_con">
                                    Loading ...
                                  </span>
                                </div>
                              </div>
                            )
                          ) : loaderButton == false ? (
                            <div
                              className="d-flex justify-content-center w_100"
                              onClick={handleSubmit}
                            >
                              <div className="lan_had_con">
                                <span className="con_lan_con">Disable</span>
                              </div>
                            </div>
                          ) : (
                            <div className="d-flex justify-content-center w_100">
                              <div className="lan_had_con">
                                <span className="con_lan_con">Loading ...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;
