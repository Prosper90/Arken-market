import React, { useEffect } from "react";
import Header from "./Header";
// import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import useState from "react-usestateref";
import { postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import { toast } from "react-toastify";

function ForgotPassword() {
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [counter, setCounter] = useState(0);
  const [isResendVisible, setIsResendVisible] = useState(false);
  const [OTP, setOTP] = useState("");
  const [activeStatus, seractiveStatus] = useState(false);

  const navigate = useNavigate();

  const initialFormValue = {
    email: "",
  };

  const initialFormValue1 = {
    password: "",
    confirmPassword: "",
  };

  const [emailValidate, setemailValidate, emailValidateref] = useState(false);
  const [validationnErr, setvalidationnErr] = useState("");
  const [formValue, setFormValue] = useState(initialFormValue);
  const [buttonLoader, setbuttonLoader] = useState(false);

  const [passwordValidate, setpasswordValidate, passwordValidateref] =
    useState(false);
  const [formValue1, setFormValue1] = useState(initialFormValue1);
  const [
    confirmPasswordValidate,
    setconfirmPasswordValidate,
    confirmPasswordValidateref,
  ] = useState(false);
  const [validationnErr1, setvalidationnErr1] = useState("");
  const [passHide, setPasshide] = useState(false);
  const [inputType, setinputType] = useState("password");
  const [passHidconf, setPasshideconf] = useState(false);
  const [inputTypeconf, setinputTypeconf] = useState("password");

  const { email } = formValue;
  const { password, confirmPassword } = formValue1;

  const handleChange = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/\s/g, "");
    let formData = { ...formValue, ...{ [name]: sanitizedValue } };
    setFormValue(formData);
    validate(formData);
  };
  const handleChange1 = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    let formData1 = { ...formValue1, ...{ [name]: value } };
    setFormValue1(formData1);
    validate1(formData1);
  };

  const validate = async (values) => {
    const errors = {};
    if (!values.email) {
      errors.email = "Email is a required field!";
      setemailValidate(true);
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(values.email)
    ) {
      errors.email = "Invalid email address!";
      setemailValidate(true);
    } else if (
      !/^[a-zA-Z0-9._%+-]*[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(
        values.email
      )
    ) {
      errors.email =
        "Invalid email address! Email must contain at least one character.";
      setemailValidate(true);
    } else if (values.email.length > 254) {
      errors.email = "Email address is too long!";
      setemailValidate(true);
    } else {
      setemailValidate(false);
    }
    setvalidationnErr(errors);
    return errors;
  };
  const showsuccessToast = (message) => {
    toast.dismiss();
    toast.success(message);
  };

  const showerrorToast = (message) => {
    toast.dismiss();
    toast.error(message);
  };
  const validate1 = async (values) => {
    const errors1 = {};

    if (!values.password) {
      errors1.password = "Password is a required field";
      setpasswordValidate(true);
    } else if (values.password.length < 5 || values.password.length > 25) {
      setpasswordValidate(true);
      errors1.password = "Password should not below 5 above 25 letters !";
    } else if (!values.password.match(/[a-z]/g)) {
      setpasswordValidate(true);
      errors1.password = "Please enter at least lower character !";
    } else if (!values.password.match(/[A-Z]/g)) {
      setpasswordValidate(true);
      errors1.password = "Please enter at least upper character !";
    } else if (!values.password.match(/[0-9]/g)) {
      setpasswordValidate(true);
      errors1.password = "Please enter at One digit character !";
    } else if (!values.password.match(/[!@#$%^&*]/g)) {
      setpasswordValidate(true);
      errors1.password = "Please enter at least one special character !";
    } else if (!values.confirmPassword) {
      setpasswordValidate(false);
      errors1.confirmPassword = "Confirm password is a required field";
      setconfirmPasswordValidate(true);
    } else if (
      values.password &&
      values.confirmPassword &&
      values.password !== values.confirmPassword
    ) {
      errors1.confirmPassword = "Password and Confirm password does not match";
      setconfirmPasswordValidate(true);
    } else {
      setconfirmPasswordValidate(false);
    }

    setvalidationnErr1(errors1);
    return errors1;
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

  useEffect(() => {
    let timer;
    if (counter > 0) {
      timer = setTimeout(() => setCounter(counter - 1), 1000);
    } else if (counter === 0 && isEmailSubmitted) {
      setIsResendVisible(true);
    }
    return () => clearTimeout(timer);
  }, [counter, isEmailSubmitted]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    validate(formValue);
    try {
      if (formValue.email != "" && emailValidateref.current == false) {
        var obj = {
          email: formValue.email,
        };
        var data = {
          apiUrl: apiService.forgotemailotp,
          payload: obj,
        };
        setbuttonLoader(true);
        var resp = await postMethod(data);
        console.log(resp, "==-=-resp");
        setbuttonLoader(false);
        if (resp.status == true) {
          toast.success(resp.Message);
          setIsEmailSubmitted(true);
          setCounter(60);
          setIsResendVisible(false);
        } else {
          toast.error(resp.Message);
        }
      }
    } catch (error) {
      setbuttonLoader(false);
    }
  };
  const [validateMsg, setValidateMsg] = useState("");
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      if (OTP !== "") {
        setValidateMsg(" ");
        var obj = {
          emailOtp: OTP,
          email: formValue.email,
        };
        var data = {
          apiUrl: apiService.forgototpverify,
          payload: obj,
        };
        setbuttonLoader(true);
        var resp = await postMethod(data);
        setbuttonLoader(false);
        if (resp.status == true) {
          showsuccessToast(resp.Message);
          seractiveStatus(true);
        } else {
          showerrorToast(resp.Message);
        }
      } else {
        setValidateMsg("Enter OTP");
      }
    } catch (error) {
      setbuttonLoader(false);
    }
  };

  const handleResend = async () => {
    try {
      if (formValue.email !== "" && emailValidateref.current == false) {
        var obj = {
          email: formValue.email,
        };
        var data = {
          apiUrl: apiService.resendemailotp,
          payload: obj,
        };
        setCounter(60);
        setIsResendVisible(false);

        setbuttonLoader(true);
        var resp = await postMethod(data);
        setbuttonLoader(false);

        if (resp.status === true) {
          showsuccessToast(resp.Message);
        } else {
          showerrorToast(resp.Message);
        }
      }
    } catch (error) {
      //   console.error("Error resending OTP", error);
      setbuttonLoader(false);
    }
  };

  const formSubmitchange = async () => {
    validate1(formValue1);
    if (
      passwordValidateref.current === false &&
      confirmPasswordValidateref.current === false
    ) {
      var obj = {
        password: formValue1.password,
        confimPassword: formValue1.confirmPassword,
        email: formValue.email,
      };

      // console.log(obj, "=-=-=-=-=-=-=-==-=");
      var data = {
        apiUrl: apiService.resetpassword,
        payload: obj,
      };
      setbuttonLoader(true);
      var resp = await postMethod(data);
      setbuttonLoader(false);
      setFormValue1(initialFormValue1);
      if (resp.status == true) {
        showsuccessToast(resp.Message);
        navigate("/");
      } else {
        showerrorToast(resp.Message);
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="admin_login_card">
        <div className="container">
          <div className="row mx-0 mark_pagi">
            <div className="col-lg-6">
              {activeStatus == false ? (
                <div className="admin_login_main">
                  <div className="hero_subhead">
                    <div className="hotpic_bot_sbhd">
                      <span className="hero_head text-align-center">
                        Forgot Password
                      </span>
                      <Link to="/">
                        <h6 className="pls_20_ff cursor-pointer">
                          Login{" "}
                          <i class="fa-solid fa-arrow-right-long ml-2"></i>
                        </h6>
                      </Link>
                    </div>
                    <div className="ycho_inner mt-4">
                      <div className="hotpic_bot_hd">
                        <span className="hero_sub_inner">Email</span>
                        <input
                          type="text"
                          name="email"
                          value={email}
                          onChange={handleChange}
                          className="input-field w-100"
                          placeholder="Enter the email"
                          disabled={isEmailSubmitted}
                        />
                        {emailValidateref.current == true ? (
                          <p className="errorcss"> {validationnErr.email} </p>
                        ) : (
                          ""
                        )}
                      </div>
                      {isEmailSubmitted && (
                        <>
                          <div className="hotpic_bot_hd">
                            <span className="hero_sub_inner">
                              Verification code
                            </span>
                            <input
                              className="admin_login_imput"
                              type="text"
                              placeholder="Enter  code"
                              value={OTP}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (e.target.value == "") {
                                  setOTP("");
                                  setValidateMsg("Enter OTP");
                                } else if (
                                  /^\d*$/.test(value) &&
                                  value.length <= 4
                                ) {
                                  setOTP(value);
                                } else {
                                  setValidateMsg("");
                                }
                              }}
                            />
                            {validateMsg ? (
                              <p className="errorcss"> {validateMsg} </p>
                            ) : (
                              ""
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="d-flex justify-content-center w_100">
                      {!isEmailSubmitted ? (
                        <>
                          {!buttonLoader ? (
                            <div
                              className="lan_had_con"
                              onClick={handleEmailSubmit}
                            >
                              <span className="con_lan_con">Submit</span>
                            </div>
                          ) : (
                            <div className="lan_had_con">
                              <span className="con_lan_con">Loading ...</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {!buttonLoader ? (
                            <div
                              className="lan_had_con"
                              onClick={handleResetPassword}
                            >
                              <span className="con_lan_con">
                                Reset Password
                              </span>
                            </div>
                          ) : (
                            <div className="lan_had_con">
                              <span className="con_lan_con">Loading ...</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {isEmailSubmitted && (
                      <div className="foot">
                        <p className="hero_sub_inner">
                          Didn't receive a code ?
                          {isResendVisible ? (
                            <span
                              onClick={handleResend}
                              className="hero_sub_inner cursor-pointer"
                            >
                              <a className="text-yellow"> Resend</a>
                            </span>
                          ) : (
                            <span className="text-yellow"> {counter}s</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="admin_login_main">
                  <div className="hero_subhead">
                    <div className="hotpic_bot_sbhd">
                      <span className="hero_head text-align-center">
                        Reset Password
                      </span>
                      <Link to="/">
                        <h6 className="pls_20_ff cursor-pointer">
                          Login{" "}
                          <i class="fa-solid fa-arrow-right-long ml-2"></i>
                        </h6>
                      </Link>
                    </div>
                    <div className="ycho_inner mt-4">
                      <div className="hotpic_bot_hd">
                        <span className="hero_sub_inner">New Password</span>
                        <div className="flex_input_posion">
                          <input
                            className="admin_login_imput"
                            placeholder="Enter new password"
                            type={inputType}
                            name="password"
                            value={password}
                            minLength={6}
                            maxLength={15}
                            onChange={handleChange1}
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

                        {passwordValidate == true ? (
                          <p className="text-danger">
                            {" "}
                            {validationnErr1.password}{" "}
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="hotpic_bot_hd">
                        <span className="hero_sub_inner">
                          Confirm New Password
                        </span>
                        <div className="flex_input_posion">
                          <input
                            className="admin_login_imput"
                            placeholder="Re-Enter the password"
                            type={inputTypeconf}
                            name="confirmPassword"
                            value={confirmPassword}
                            minLength={6}
                            maxLength={15}
                            onChange={handleChange1}
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
                          <p className="text-danger">
                            {" "}
                            {validationnErr1.confirmPassword}{" "}
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="d-flex justify-content-center w_100">
                      {!buttonLoader ? (
                        <div className="lan_had_con" onClick={formSubmitchange}>
                          <span className="con_lan_con">Reset Password</span>
                        </div>
                      ) : (
                        <div className="lan_had_con">
                          <span className="con_lan_con">Loading ...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
