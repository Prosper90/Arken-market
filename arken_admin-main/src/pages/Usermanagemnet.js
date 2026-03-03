import React, { useEffect, useRef } from "react";
import useState from "react-usestateref";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import * as Yup from "yup";
import ReactPaginate from "react-paginate";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import { FaFilter } from "react-icons/fa6";

// import Modal from "@mui/joy/Modal";
import Moment from "moment";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ModalClose from "@mui/joy/ModalClose";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/material/Typography";
import { toast } from "react-toastify";
import { Bars } from "react-loader-spinner";
import CsvDownloader from "react-csv-downloader";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import { ScaleLoader } from "react-spinners";
import { Skeleton } from "@mui/material";
import FromDatePicker from "./fromdatepicker";
import ToDatePicker from "./todatepicker";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};

function Dashboard() {
  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 9;

  const inputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [ModalOpen, setModalOpen] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [userKYC, setuserKYC, userKYCref] = useState("");
  const [Nextstep, setNextstep] = useState(false); // Default to p2p_wallet
  const formvalue = {
    reason: "",
  };
  const [formData, setFormData, formDataref] = useState(formvalue);
  const [loader, setLoader] = useState(true);
  const [buttonLoaderApprove, setButtonLoaderApprove] = useState(false);
  const [buttonLoaderReject, setButtonLoaderReject] = useState(false);
  const [rejectbuttonLoader, setrejectbuttonLoader] = useState(false);
  const [Err, setErr] = useState(false);
  const [Errmessage, setErrmessage] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [userId, setuserId, userIdref] = useState("");
  const [userStatus, setuserStatus, userStatusref] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  console.log(fromDate, "fromDate==");
  const [csvData, setCsvData, csvDataref] = useState([]);

  useEffect(() => {
    getUserDetails(currentPage);
  }, [currentPage]);

  // useEffect(() => {
  //   get_user_details_csv();
  // }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [filteredUsers]);

  const getUserDetails = async (page = 1) => {
    setLoader(true);
    const data = {
      apiUrl: apiService.activatedUserList,
      payload: {
        page,
        limit: 5,
        keyword: filterKeyword,
        fromDate: fromDate,
        toDate: toDate,
      },
    };
    const response = await postMethod(data);
    setLoader(false);
    if (response.status) {
      setTotalPages(response.totalPages);
      setFilteredUsers(response.data);
      setCsvData(response.csv_data);
    } else {
      setFilteredUsers([]);
    }
  };

  const handledisableChange = (e) => {
    const { name, value } = e.target;
    const sanitized = value.replace(/^\s+/, ""); // Remove leading spaces only
    const updatedFormData = { ...formData, [name]: sanitized };
    setFormData(updatedFormData);
    if (!sanitized) {
      setErr(true);
      setErrmessage("reason is required");
    } else {
      setErr(false);
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    console.log("---", currentStatus);
    try {
      if (currentStatus === 0 && !formDataref.current.reason) {
        setErr(true);
        setErrmessage("Reason is required");
        return;
      }
      setButtonLoaderReject(true);
      setErr(false);
      const data = {
        apiUrl: apiService.changeUserAccountStatus,
        payload: {
          _id: userId,
          status: currentStatus,
          reason: formDataref.current.reason,
        },
      };

      const response = await postMethod(data);
      setButtonLoaderReject(false);

      if (response.status) {
        toast.success("User Account Status Updated Successfully");
        getUserDetails(currentPage);
        handleClose();
        setFormData((prevState) => ({
          ...prevState,
          reason: "",
        }));
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error updating status. Please try again later.");
    }
  };

  // const handleStatusChange = async (userId, currentStatus) => {
  //   try {
  //     // const newStatus = currentStatus === 0 ? 1 : 0;
  //     const data = {
  //       apiUrl: apiService.changeUserAccountStatus,
  //       payload: { _id: userId, status: currentStatus },
  //     };
  //     const response = await postMethod(data);
  //     if (response.status) {
  //       toast.success("User Account Status Updated Successfully");
  //       getUserDetails(currentPage);
  //       handleClose()
  //       // Refresh user data after status change
  //     } else {
  //       toast.error("Something Went Wrong. Please Try Again later");
  //     }
  //   } catch (error) {
  //     toast.error("Error updating status. Please try again later.");
  //   }
  // };

  const kycAprove = async (userId, _id) => {
    try {
      const data = {
        apiUrl: apiService.kycAprove,
        payload: { userId: userId, _id: _id },
      };
      setButtonLoaderApprove(true);
      const response = await postMethod(data);
      setButtonLoaderApprove(false);
      if (response.status) {
        toast.success(response.Message);
        setNextstep(false);
        getUserDetails(currentPage); // Refresh user data after status change
      } else {
        toast.error("Something Went Wrong. Please Try Again later");
        setNextstep(false);
      }
    } catch (error) {
      toast.error("Error updating status. Please try again later.");
    }
  };

  const kycRejectSchema = Yup.object().shape({
    reason: Yup.string()
      .min(5, "Reason must be at least 5 characters long")
      .max(250, "Reason must be at most 250 characters long")
      .required("Reason is required"),
  });

  const kycReject = async (userId, _id) => {
    try {
      const reason = document.querySelector('input[name="reason"]').value;

      // Validate the input using the Yup schema
      await kycRejectSchema.validate({ reason });

      const data = {
        apiUrl: apiService.kycReject,
        payload: { userId: userId, _id: _id, reason: reason },
      };
      setButtonLoaderReject(true);
      const response = await postMethod(data);
      setButtonLoaderReject(false);
      if (response.status) {
        toast.success(response.Message);
        setNextstep(false);
        setIsModalOpen(false);
        getUserDetails(currentPage); // Refresh user data after status change
      } else {
        toast.error("Something Went Wrong. Please Try Again later");
        setNextstep(false);
      }
    } catch (error) {
      if (error.name === "ValidationError") {
        toast.error(error.message);
      } else {
        toast.error("Error updating status. Please try again later.");
      }
    }
  };

  const getuserKYC = async (userId) => {
    // console.log(
    //   "hdcknckndknncdkeacsk"
    // )
    try {
      // const newStatus = currentStatus === 0 ? 1 : 0;
      const data = {
        apiUrl: apiService.getKyclist,
        payload: { _id: userId },
      };
      setLoader(true);
      const response = await postMethod(data);
      setLoader(false);
      if (response.status) {
        setuserKYC(response.data);
        setNextstep(true); // Refresh user data after status change
      } else {
        toast.error("Something Went Wrong. Please Try Again later");
      }
    } catch (error) {
      toast.error("Error updating status. Please try again later.");
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (value.startsWith(" ")) return;
    setFilterKeyword(value);
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };

  const get_user_details_csv = async () => {
    try {
      const data = {
        apiUrl: apiService.get_user_details_csv,
      };
      setLoader(true);
      const response = await postMethod(data);
      setLoader(false);
      if (response.status) {
        setCsvData(response.data);
      }
    } catch (error) {
      toast.error("Error updating status. Please try again later.");
    }
  };

  // const download_csv = () => {
  //   toast.success("User Details Download Successfully.");
  // };
  const download_csv = () => {
    if (csvDataref.current?.length > 0) {
      toast.success("User Details Download Successfully.");
    } else {
      toast.error("No records Found");
    }
  };
  const handleFilterchange = () => {
    console.log("Filter work");
    getUserDetails();
  };
  const [loadingUserId, setLoadingUserId] = useState(null);

  const handleLiqiutyChange = async (userId, liquidity_status) => {
    try {
      const data = {
        apiUrl: apiService.updateLiquidityProvider,
        payload: { userId: userId, liquidity_status: liquidity_status },
      };

      const response = await postMethod(data);

      if (response.status) {
        toast.success("Liquidity Status Updated Successfully");
        getUserDetails(currentPage);
      } else {
        toast.error(
          response.message || "Something went wrong. Please try again later"
        );
      }
    } catch (error) {
      console.error("Liquidity update error:", error);
      toast.error("Error updating status. Please try again later.");
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
            {Nextstep == false ? (
              <>
                <div className="px-4 transaction_padding_top">
                  <div className="px-2 my-4 transaction_padding_top tops">
                    <div className="headerss">
                      <span className="dash-head">User Management</span>
                      <div className="usr_mng_rgt">
                        {/* old */}
                        {/* <input
                              className="filters"
                              ref={inputRef}
                              placeholder="Enter Username to filter"
                              value={filterKeyword}
                              onChange={handleFilterChange}
                            /> */}

                        {/* new */}
                        <div className="filter_container">
                          <input
                            className="filter_input"
                            ref={inputRef}
                            placeholder="Search username"
                            value={filterKeyword}
                            onChange={(e) => {
                              const value = e.target.value;
                              console.log(value, "value");
                              if (value.length === 1 && value.startsWith(" "))
                                return;
                              setFilterKeyword(value);
                            }}
                            // onChange={handleFilterChange}
                          />
                          <i className="fa-solid fa-magnifying-glass"></i>
                        </div>
                        <FromDatePicker
                          placeholder="DD-MM-YYYY"
                          onSearch={(date) => setFromDate(date)}
                        />

                        <ToDatePicker
                          placeholder="DD-MM-YYYY"
                          fromDate={fromDate}
                          onSearch={(date) => setToDate(date)}
                        />

                        <div
                          className="btn_add"
                          onClick={() => handleFilterchange()}
                        >
                          <span>Filter</span>
                          <FaFilter />
                        </div>

                        {/* {filteredUsers.length > 0 && ( */}
                        {/* <div onClick={download_csv}>
                          <CsvDownloader
                            text="Download"
                            className="float-right csv-filter-change export_btn"
                            filename="User Details"
                            extension=".csv"
                            disabled={!(csvDataref.current?.length > 0)}
                            datas={csvDataref.current}
                          >
                            Export{" "}
                            <i
                              className="fa fa-download"
                              aria-hidden="true"
                            ></i>
                          </CsvDownloader>
                        </div> */}
                        {/* )} */}
                      </div>
                    </div>
                    <div className="my-5 trans-table">
                      <div className="table-responsive ">
                        <table className="w_100">
                          <thead className="trans-head">
                            <tr>
                              <th>S.No</th>
                              <th>FirstName</th>
                              <th>Telegram ID</th>
                              <th>Username</th>
                              <th>Wallet Verified</th>
                              <th>Win Rate</th>
                              <th>Total Predictions</th>
                              <th>Total Wins</th>
                              <th>Total Loss</th>
                              <th>Date & Time</th>
                            </tr>
                          </thead>
                          {/* {loader == true ? (
                              <tr>
                                <td colSpan={9}>
                                  <div className="loader_main loader_mainChange">
                                    <Skeleton/>
                                    {/* <ScaleLoader
                                      color="#dfc822"
                                      height={50}
                                      width={5}
                                    /> */}
                          {/* <p style={{ marginTop: "10px" }}></p>
                                  </div>
                                </td>
                              </tr>
                            ) : ( */}
                          <tbody>
                            {loader == true ? (
                              rows.map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                  {Array.from({ length: cols }).map(
                                    (_, colIndex) => (
                                      <td key={colIndex}>
                                        <Skeleton
                                          variant="rounded"
                                          height={22}
                                          sx={{
                                            bgcolor: "#b8b8b833",
                                            borderRadius: "6px",
                                          }}
                                        />
                                      </td>
                                    )
                                  )}
                                </tr>
                              ))
                            ) : (
                              <>
                                {filteredUsers.length > 0 ? (
                                  filteredUsers.map((item, i) => (
                                    <tr key={item._id}>
                                      <td>
                                        <span className="plus_14_ff">
                                          {i + 1}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.firstName}
                                        </span>
                                      </td>

                                      {/* <td>
                              <span className="plus_14_ff">{item.internalID}</span>
                            </td> */}
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.telegramId}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                         {'@'} {item.username}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                         {item.walletVerified === true  ? 'Verifed' : 'Not Verified'}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                         {item.winRate ?? '0%' }
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                         {item.totalPredictions ?? 0 }
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                         {item.totalWins ?? 0 }
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                         {item.totalLosses ?? 0 }
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {Moment(item.createdAt).format("lll")}
                                        </span>
                                      </td>
                                      

                                      <Modal
                                        aria-labelledby="transition-modal-title"
                                        aria-describedby="transition-modal-description"
                                        open={open}
                                        onClose={handleClose}
                                        closeAfterTransition
                                        slots={{ backdrop: Backdrop }}
                                        slotProps={{
                                          backdrop: {
                                            timeout: 500,
                                          },
                                        }}
                                      >
                                        <Fade in={open}>
                                          <Box
                                            sx={style}
                                            className="popup_modal-delete"
                                          >
                                            <div className="popup_modal-title">
                                              <span>
                                                <span className="popup_modal-title-icon">
                                                  {/* <i className="fa-solid fa-triangle-exclamation"></i> */}
                                                </span>
                                                Disable User
                                              </span>
                                            </div>
                                            <div className="popup_modal-content">
                                              <div className="form-group row">
                                                <label className="col-lg-12 col-form-label form-control-label">
                                                  Disable Reason
                                                </label>
                                                <div className="col-lg-12">
                                                  <textarea
                                                    type="text"
                                                    name="reason"
                                                    maxLength={250}
                                                    value={formData.reason}
                                                    onChange={
                                                      handledisableChange
                                                    }
                                                    placeholder="Enter Disable reason"
                                                    className="form-control"
                                                    required
                                                  />
                                                  <div className="help-block">
                                                    {Err == true ? (
                                                      <div className="text-red dep-error-text">
                                                        {Errmessage}
                                                      </div>
                                                    ) : (
                                                      ""
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="popup_modal-btn-wrap">
                                              <button
                                                className="popup_modal-btn-cancel"
                                                onClick={() => handleClose()}
                                              >
                                                Cancel
                                              </button>
                                              {buttonLoaderReject == true ? (
                                                <button className="popup_modal-btn-confirm">
                                                  Loading...
                                                </button>
                                              ) : (
                                                <button
                                                  className="popup_modal-btn-confirm"
                                                  onClick={() => {
                                                    handleStatusChange(
                                                      userIdref.current,
                                                      userStatusref.current
                                                    );
                                                  }}
                                                >
                                                  Disable User
                                                </button>
                                              )}
                                            </div>
                                          </Box>
                                        </Fade>
                                      </Modal>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={8}>
                                      <div className="empty_data my-4">
                                        <div className="plus_14_ff">
                                          No Records Found
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                                {filteredUsers.length > 0 ? (
                                  <tr className="text-center">
                                    <td colSpan="9">
                                      <div className="paginationcss">
                                        <ReactPaginate
                                          previousLabel={"<"}
                                          nextLabel={">"}
                                          breakLabel={"..."}
                                          pageCount={totalPages}
                                          marginPagesDisplayed={1}
                                          pageRangeDisplayed={2}
                                          onPageChange={handlePageClick}
                                          containerClassName={
                                            "pagination pagination-md justify-content-center"
                                          }
                                          pageClassName={"page-item"}
                                          forcePage={currentPage - 1}
                                          pageLinkClassName={"page-link"}
                                          previousClassName={"page-item"}
                                          previousLinkClassName={"page-link"}
                                          nextClassName={"page-item"}
                                          nextLinkClassName={"page-link"}
                                          breakClassName={"page-item"}
                                          breakLinkClassName={"page-link"}
                                          activeClassName={"active"}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  ""
                                )}
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">User KYC Details</span>

                    <button onClick={() => setNextstep(false)}>Back</button>
                  </div>
                  <div className="my-4 currencyinput">
                    <span className="new_kyc_sidehead">Step - 1 :-</span>
                    <div className="form-group row mt-3">
                      <label className="col-lg-6 col-form-label form-control-label new_ky_rah">
                        Full name :
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.fullName}
                          placeholder="Full Name"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Date Of Birth :
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.dob}
                          placeholder="DOB"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Nationality :
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.nationality}
                          placeholder="Nationality"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Residential :
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.residential}
                          placeholder="Residential"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>

                    <span className="new_kyc_sidehead my-3">Step - 2 :-</span>
                    <div className="form-group row mt-3">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Proof Type :
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.verfiType}
                          placeholder="Residential"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>

                    {/* <span className="new_kyc_sidehead my-3">Step - 3 :-</span> */}
                    <div className="form-group row mt-3">
                      <label className="col-lg-6 col-form-label form-control-label">
                        {userKYCref.current.verfiType} :
                      </label>
                      <div className="col-lg-6">
                        <div className="newky_man">
                          <div className="d-flex flex-column gap-2">
                            <span className="">Front</span>
                            <img
                              src={userKYCref.current.proof1}
                              className="imagebox"
                              width="100%"
                            />
                            {userKYCref.current.kycStatus == 2 ? (
                              <Link
                                to={userKYCref.current.proof1}
                                className="kycbtn"
                                target="_blank"
                              >
                                View
                              </Link>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="d-flex flex-column gap-2">
                            <span className="">Back</span>
                            <img
                              src={userKYCref.current.proof2}
                              className="imagebox"
                              width="100%"
                            />
                            {userKYCref.current.kycStatus == 2 ? (
                              <Link
                                to={userKYCref.current.proof2}
                                className="kycbtn"
                                target="_blank"
                              >
                                View
                              </Link>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <span className="new_kyc_sidehead my-3">Step - 3 :-</span>

                    <div className="form-group row mt-3">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Proof Type :
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.verifyAddressType}
                          placeholder="Residential"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="form-group row mt-3">
                      <label className="col-lg-6 col-form-label form-control-label">
                        {userKYCref.current.verifyAddressType} :
                      </label>
                      <div className="col-lg-6">
                        <div className="newky_man">
                          <div className="d-flex flex-column gap-2">
                            <span className="">Front</span>
                            <img
                              src={userKYCref.current.AddressDocFront}
                              className="imagebox"
                              width="100%"
                            />
                            {userKYCref.current.kycStatus == 2 ? (
                              <Link
                                to={userKYCref.current.AddressDocFront}
                                className="kycbtn"
                                target="_blank"
                              >
                                View
                              </Link>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className="d-flex flex-column gap-2">
                            <span className="">Back</span>
                            <img
                              src={userKYCref.current.AddressDocBack}
                              className="imagebox"
                              width="100%"
                            />
                            {userKYCref.current.kycStatus == 2 ? (
                              <Link
                                to={userKYCref.current.AddressDocBack}
                                className="kycbtn"
                                target="_blank"
                              >
                                View
                              </Link>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* <div className="form-group row mt-3">
                        <label className="col-lg-6 col-form-label form-control-label">
                        Pan number: 
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            value={userKYCref.current.panNumber}
                            placeholder="Residential"
                            className="form-control"
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="form-group row mt-3">
                        <label className="col-lg-6 col-form-label form-control-label">
                     Pan Proof Front:
                        </label>
                        <div className="col-lg-6">
                          <div className="newky_man">
                              <div className="d-flex flex-column gap-2">
                                <img src={userKYCref.current.panproof} className="imagebox" width="100%" />
                                {userKYCref.current.kycStatus == 2 ? (
                          <Link to={userKYCref.current.panproof} className="kycbtn" target="_blank">
                            View
                          </Link>
                        ) : ""}
                              </div>  
                             
                           </div> 
                        </div>
                      </div> */}

                    <span className="new_kyc_sidehead my-3">Step - 4 :-</span>
                    <div className="form-group row mt-3">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Selfie Proof :
                      </label>
                      <div className="col-lg-6">
                        <div className="d-flex">
                          <div className="">
                            <img
                              src={userKYCref.current.proof3}
                              className="imagebox"
                              width="100%"
                            />
                            {userKYCref.current.kycStatus == 2 ? (
                              <Link
                                to={userKYCref.current.proof3}
                                className="kycbtn"
                                target="_blank"
                              >
                                View
                              </Link>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* <span className="new_kyc_sidehead my-3">Step - 6 :-</span>
                      <div className="form-group row mt-3">
                        <label className="col-lg-6 col-form-label form-control-label new_ky_rah">
                          Holder name : 
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            value={userKYCref.current.holderName}
                            placeholder="Holder Name"
                            className="form-control"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Bank name : 
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            value={userKYCref.current.bankName}
                            placeholder="Bank Name"
                            className="form-control"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                        Branch Name : 
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            value={userKYCref.current.branchName}
                            placeholder="Branch Name"
                            className="form-control"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                        Account Number : 
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            value={userKYCref.current.accNumber}
                            placeholder="Account Number"
                            className="form-control"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                        IFSC Code : 
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            value={userKYCref.current.ifscCode}
                            placeholder="IFSC Code"
                            className="form-control"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="form-group row mt-3">
                        <label className="col-lg-6 col-form-label form-control-label">
                        Bank Statement : 
                        </label>
                        <div className="col-lg-6">
                          <div className="d-flex">
                              <div className="">
                                <img src={userKYCref.current.bankStatement} className="imagebox" width="100%" />
                                {userKYCref.current.kycStatus == 2 ? (
                          <Link to={userKYCref.current.bankStatement} className="kycbtn" target="_blank">
                            View
                          </Link>
                        ) : ""}
                              </div>
                           </div> 
                        </div>
                      </div>
                       <span className="new_kyc_sidehead my-3">Step - 7 :-</span>
                      <div className="form-group row mt-3">
                        <label className="col-lg-6 col-form-label form-control-label new_ky_rah">
                          Occupation : 
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            value={userKYCref.current.occupation}
                            placeholder="Occupation"
                            className="form-control"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Source of Income : 
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            value={userKYCref.current.incomeSource}
                            placeholder="Source of Income"
                            className="form-control"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                        Annual Income : 
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            value={userKYCref.current.annualIncome}
                            placeholder="Annual Income"
                            className="form-control"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                        Trading Experience : 
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            value={userKYCref.current.tradingExp}
                            placeholder="Trading Experience"
                            className="form-control"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                        Purpose : 
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            value={userKYCref.current.purpose}
                            placeholder="Purpose"
                            className="form-control"
                            readOnly
                          />
                        </div>
                      </div> */}

                    {/* <div className="headerss">
                      <span className="text-white h5"> Nationality : {userKYCref.current.nationality}</span>
                      <span className="text-white h5"> Verify Type : {userKYCref.current.verfiType} </span>

                    </div> */}

                    {/* <div className="row justify-content-around">
                      <div className="col-lg-3 ">
                        <img src={userKYCref.current.proof1} className="imagebox" width="100%" />

                        {userKYCref.current.kycStatus == 2 ? (
                          <Link to={userKYCref.current.proof1} className="kycbtn" target="_blank">
                            View
                          </Link>
                        ) : ""}
                      </div>
                      <div className="col-lg-3 ">
                        <img src={userKYCref.current.proof2} className="imagebox" width="100%" />


                        {userKYCref.current.kycStatus == 2 ? (
                          <Link to={userKYCref.current.proof2} className="kycbtn" target="_blank">
                            View
                          </Link>
                        ) : ""}

                      </div>
                      <div className="col-lg-3 ">
                        <img src={userKYCref.current.proof3} className="imagebox" width="100%" />


                        {userKYCref.current.kycStatus == 2 ? (
                          <Link to={userKYCref.current.proof3} className="kycbtn" target="_blank">
                            View
                          </Link>
                        ) : ""}
                      </div>
                    </div> */}

                    {userKYCref.current.kycStatus == 2 ? (
                      <div className="row justify-content-center">
                        <div className="col-lg-4 reject">
                          <button onClick={() => setIsModalOpen(true)}>
                            Reject
                          </button>
                        </div>

                        <div className="col-lg-4 Approve">
                          {buttonLoaderApprove == false ? (
                            <button
                              onClick={() =>
                                kycAprove(
                                  userKYCref.current.userId,
                                  userKYCref.current._id
                                )
                              }
                            >
                              Approve
                            </button>
                          ) : (
                            <button>Loading ...</button>
                          )}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Modal
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Sheet
            variant="outlined"
            sx={{
              minWidth: 500,
              borderRadius: "md",
              p: 3,
              boxShadow: "lg",
            }}
          >
            <ModalClose variant="plain" sx={{ m: 1 }} />
            <Typography
              component="h2"
              id="modal-title"
              level="h4"
              textColor="inherit"
              fontWeight="lg"
              mb={1}
            ></Typography>
            <Typography id="modal-desc">
              <h3 className="connect_a_connect_text">KYC Reject Details</h3>
              <div className="ycho_inner mt-4">
                <input
                  type="text"
                  name="reason"
                  className="filters w_100"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter the reason for rejection"
                  minLength="5"
                  maxLength="250"
                />

                <div className="reject w_100">
                  {buttonLoaderReject == false ? (
                    <button
                      className="my-3"
                      onClick={() =>
                        kycReject(
                          userKYCref.current.userId,
                          userKYCref.current._id
                        )
                      }
                    >
                      Reject
                    </button>
                  ) : (
                    <button className="my-3">Loading ...</button>
                  )}
                </div>
              </div>
            </Typography>
          </Sheet>
        </Modal>
      </div>
      {/* )} */}
    </div>
  );
}

export default Dashboard;
