import Header from "./Header";
import { toast } from "react-toastify";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useState from "react-usestateref";
import { postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import { setAuthorization } from "../core/service/axios";
import * as Yup from "yup"; // Import Yup

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Invalid email address!")
    .required("Email is required!"),
  password: Yup.string().trim().required("Password is required!"),
});

function Landing() {
  const initialFormValue = {
    email: "",
    password: "",
  };

  const navigate = useNavigate();
  const [formValue, setFormValue] = useState(initialFormValue);
  const [buttonLoader, setbuttonLoader] = useState(false);
  const [validationnErr, setvalidationnErr] = useState({});
  const [passHide, setPasshide] = useState(false);
  const [inputType, setinputType] = useState("password");
  const [Permissions, setPermissions, Permissionsref] = useState([]);
  const [admindata, setadmindata, admindataref] = useState();
  const LoginAdminDetails = async () => {
    try {
      const token = sessionStorage.getItem("Voltrix_token");
      if (!token) return;

      const datas = {
        apiUrl: apiService.getAdmin,
        payload: { token },
      };

      const response = await postMethod(datas);
      if (!response?.data) return;

      const adminInfo = response.data;
      const permissions = adminInfo.Permissions || [];

      setPermissions(permissions);
      setadmindata(adminInfo);

      // Subadmin: type === 0
      if (adminInfo.type === 0) {
        navigate("/dashboard");
        return;
      }

      // Admin: type === 1
      const routeMap = {
        Dashboard: "/dashboard",
        Usermanagement: "/usermanagement",
        notes: "/notes",
        kycmanagement: "/kycmanagement",
        walletmanagement: "/walletmanagement",
        cryptoDeposit: "/depositmanagement",
        Cmsmangement: "/cmsmanagement",
        faq: "/FaqMangement",
        userTrade: "/usertrade",
        cryptoWithdraw: "/withdrawmanagement",
        fiatWithdraw: "/fiatwithdrawmanagement",
        profitmanagement: "/profits",
        currencymangement: "/currencymangement",
        tradePairmangement: "/tradepair",
        supportCatagorymanagement: "/supportcategory",
        supportmangement: "/support",
        sitesetting: "/siteSetting",
      };

      // Navigate based on permissions
      if (permissions.includes("Dashboard")) {
        navigate("/dashboard");
      } else if (permissions.length > 0) {
        const firstPermission = permissions[0];
        const fallbackRoute = routeMap[firstPermission] || "/dashboard";
        navigate(fallbackRoute);
      } else {
        navigate("/dashboard"); // default fallback
      }
    } catch (err) {
      console.error("LoginAdminDetails error:", err);
      setPermissions([]);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("Voltrix_token");
    if (token) {
      LoginAdminDetails();
      // navigate("/dashboard");
    }
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    const cleanedValue =
      name === "email" || name === "password"
        ? value.replace(/^\s+/, "")
        : value;

    setFormValue((prevData) => ({
      ...prevData,
      [name]: cleanedValue,
    }));

    try {
      await validationSchema.validateAt(name, {
        ...formValue,
        [name]: cleanedValue,
      });

      setvalidationnErr((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name];
        return updatedErrors;
      });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        setvalidationnErr((prevErrors) => ({
          ...prevErrors,
          [name]: err.message,
        }));
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

  const showsuccessToast = (message) => {
    toast.dismiss();
    toast.success(message);
  };

  const showerrorToast = (message) => {
    toast.dismiss();
    toast.error(message);
  };

  const formSubmit = async () => {
    try {
      await validationSchema.validate(formValue, { abortEarly: false });
      setvalidationnErr({});

      setbuttonLoader(true);
      const data = {
        apiUrl: apiService.adminlogin,
        payload: formValue,
      };
      const resp = await postMethod(data);
      setbuttonLoader(false);

      if (resp?.tfa === 1) {
        sessionStorage.setItem("user_email", formValue.email);
        navigate("/verify-2fa");
      } else {
        if (resp?.status === true) {
          showsuccessToast(resp.Message);
          await setAuthorization(resp.token);
          sessionStorage.setItem("Voltrix_token", resp.token);
          sessionStorage.setItem("tfa_status", resp.tfa);
          sessionStorage.setItem("socket_token", resp.socketToken);
          sessionStorage.setItem("jwNkiKmttscotlox", resp.jwNkiKmttscotlox);
          LoginAdminDetails();
        } else {
          showerrorToast(resp?.Message || resp?.message || "Login failed. Please try again.");
        }
      }
    } catch (err) {
      setbuttonLoader(false);
      if (err instanceof Yup.ValidationError) {
        const errors = err.inner.reduce((acc, current) => {
          acc[current.path] = current.message;
          return acc;
        }, {});
        setvalidationnErr(errors);
      } else {
        showerrorToast("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div>
      {/* <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 4000 }}
      /> */}
      <Header />
      <div className="admin_login_card">
        <div className="container">
          <div className="row mx-0 mark_pagi">
            <div className="col-lg-6">
              <div className="admin_login_main">
                <div className="hero_subhead">
                  <span className="hero_head text-align-center">Log In</span>
                  <div className="ycho_inner">
                    <div className="hotpic_bot_hd">
                      <span className="hero_sub_inner">Email</span>
                      <input
                        className="admin_login_imput"
                        placeholder="Enter your email address"
                        type="text"
                        name="email"
                        value={formValue.email}
                        onChange={handleChange}
                      />
                      {validationnErr.email && (
                        <p className="errorcss">{validationnErr.email}</p>
                      )}
                    </div>
                    <div className="hotpic_bot_hd mb-0">
                      <span className="hero_sub_inner">Password</span>
                      <div className="flex_input_posion">
                        <input
                          className="admin_login_imput"
                          placeholder="Enter your password"
                          type={inputType}
                          name="password"
                          value={formValue.password}
                          onChange={handleChange}
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
                      {validationnErr.password && (
                        <p className="errorcss">{validationnErr.password}</p>
                      )}
                    </div>
                  </div>
                  <div className="d-flex flex-column justify-content-center w_100">
                    <div className="terms my-2">
                      <p>
                        <Link to="/forgotpassword">Forgot password?</Link>
                      </p>
                    </div>
                    {!buttonLoader ? (
                      <div className="lan_had_con" onClick={formSubmit}>
                        <span className="con_lan_con f16">Submit</span>
                      </div>
                    ) : (
                      <div className="lan_had_con">
                        <span className="con_lan_con f16">Loading ...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
