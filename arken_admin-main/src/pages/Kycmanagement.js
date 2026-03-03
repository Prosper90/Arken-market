import React, { useEffect, useRef } from "react";
import useState from "react-usestateref";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import ReactPaginate from "react-paginate";
import { postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import { Link } from "react-router-dom";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import { toast } from "react-toastify";
import { Bars } from "react-loader-spinner";
import CsvDownloader from "react-csv-downloader";
import { ScaleLoader } from "react-spinners";
import { Skeleton } from "@mui/material";

import FromDatePicker from "./fromdatepicker";
import ToDatePicker from "./todatepicker";
import { FaFilter } from "react-icons/fa6";

function Dashboard() {
  const inputRef = useRef(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userKYCCSV, setuserKYCCSV, userKYCCSVref] = useState("");
  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 7;
  const [userKYC, setuserKYC, userKYCref] = useState("");
  const [Nextstep, setNextstep] = useState(false);

  const [loader, setLoader] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    getUserDetails(currentPage );
    // getKyclistCSV();
  }, [currentPage]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [filteredUsers]);

  const getUserDetails = async (page = 1, keyword = filterKeyword) => {
 try{
      setLoader(true);
   const data = {
      apiUrl: apiService.activatedUserKycList,
      payload: { page, limit: 5, keyword: keyword ,fromDate: fromDate,
        toDate: toDate,},
    };
    const response = await postMethod(data);
      setLoader(false);
    if (response.status) {
      setTotalPages(response.totalPages);
      setFilteredUsers(response.data);
      setuserKYCCSV(response.kycDatacsv);
    } else {
      setFilteredUsers([]);
    }
 }catch(err){
  console.log(err)
 }
  };

  const getuserKYC = async (userId) => {
    try {
      const data = {
        apiUrl: apiService.getKyclist,
        payload: { _id: userId },
      };
      setLoader(true);
      const response = await postMethod(data);
      setLoader(false);
      if (response.status) {
        setuserKYC(response.data);
        setNextstep(true);
      } else {
        toast.error("Something Went Wrong. Please Try Again later");
      }
    } catch (error) {
      toast.error("Error updating status. Please try again later.");
    }
  };

  const getKyclistCSV = async (keyword=filterKeyword) => {
    try {
      var obj = {
        keyword: keyword,
        fromData: fromDate,
        toData: toDate,
      };
      const data = {
        apiUrl: apiService.getKyclistCSV,
        payload: obj,
      };
      setLoader(true);
      const response = await postMethod(data);
      setLoader(false);
      if (response.status) {
        setuserKYCCSV(response.data);
      } else {
        toast.error("Something Went Wrong. Please Try Again later");
      }
    } catch (error) {
      toast.error("Error updating status. Please try again later.");
    }
  };

  const handleFilterChange = async (e) => {
    // const value = e.target.value;
    // if (value.length === 1 && value.startsWith(" ")) return;
    // setFilterKeyword(value);
    // setCurrentPage(1);
    await getUserDetails(1);
    // await getKyclistCSV();
  };

  const download_csv = () => {
    if (userKYCCSVref.current?.length > 0) {
      toast.success("Kyc Details Download Successfully.");
    } else {
      toast.error("No records Found");
    }
  };
  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
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
                {/* {loader ? (
                  <SkeletonwholeProject />
                ) : ( */}
                <>
                  <div className="px-4 transaction_padding_top">
                    <div className="px-2 my-4 transaction_padding_top tops">
                      <div className="headerss">
                        <span className="dash-head">KYC Management</span>
                        <div className="usr_mng_rgt">
                          <div className="filter_container">
                            <input
                              className="filter_input"
                              placeholder="Search username"
                              value={filterKeyword}
                              ref={inputRef}
                              onChange={(e) => {
                                const value = e.target.value;
                                console.log(value,"value");
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
                            onClick={() => handleFilterChange()}
                          >
                            <span>Filter</span>
                            <FaFilter />
                          </div>
                          {/* {userKYCCSVref.current?.length > 0 ? ( */}
                          <div onClick={download_csv}>
                            <CsvDownloader
                              text="Download"
                              className="float-right csv-filter-change export_btn"
                              filename="Kyc Details"
                              extension=".csv"
                              datas={userKYCCSVref.current}
                              disabled={!(userKYCCSVref.current?.length > 0)}
                            >
                              Export{" "}
                              <i class="fa fa-download" aria-hidden="true"></i>
                            </CsvDownloader>
                          </div>
                          {/* ) : (
                            "" */}
                          {/* )} */}
                        </div>
                      </div>
                      <div className="trans-table my-5">
                        <div className="table-responsive">
                          <table className="w_100">
                            <thead className="trans-head">
                              <tr>
                                <th>S.No</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Aadhar Status</th>
                                <th>Pan Status</th>
                                <th>Bank Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            {loader == true ? (
                              // <tr>
                              //   <td colSpan={8}>
                              //     <div className="empty_data my-4">
                              //       <div className="plus_14_ff">
                              //         <div className="loader_main loader_mainChange">
                              //           <ScaleLoader
                              //             color="#dfc822"
                              //             height={60}
                              //             width={5}
                              //           />
                              //           <p style={{ marginTop: "10px" }}></p>
                              //         </div>
                              //       </div>
                              //     </div>
                              //   </td>
                              // </tr>
                              <tbody>
                                {rows.map((_, rowIndex) => (
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
                                ))}
                              </tbody>
                            ) : (
                              <tbody>
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
                                          {item.displayname}
                                        </span>
                                      </td>

                                      <td>
                                        <span className="plus_14_ff">
                                          {item.email}
                                        </span>
                                      </td>

                                      <td>
                                        {item.aadharStatus == "success" ? (
                                          <span className="plus_14_ff text-success">
                                            Verified{" "}
                                          </span>
                                        ) : (
                                          <span className="plus_14_ff text-warning">
                                            Not Upload
                                          </span>
                                        )}
                                      </td>

                                      <td>
                                        {item.panStatus == "success" ? (
                                          <span className="plus_14_ff text-success">
                                            Verified
                                          </span>
                                        ) : (
                                          <span className="plus_14_ff text-warning">
                                            Not Upload
                                          </span>
                                        )}
                                      </td>

                                      <td>
                                        {item.bankStatus == "success" ? (
                                          <span className="plus_14_ff text-success">
                                            Verified{" "}
                                          </span>
                                        ) : (
                                          <span className="plus_14_ff text-warning">
                                            Not Upload{" "}
                                          </span>
                                        )}
                                      </td>

                                      <td>
                                        {item.kyc_status == 0 ? (
                                          <span className="plus_14_ff ">
                                            Not Upload
                                          </span>
                                        ) : (
                                          <button
                                            className=""
                                            onClick={() => getuserKYC(item._id)}
                                          >
                                            View
                                          </button>
                                        )}
                                      </td>
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
                                    <td colSpan="8">
                                      <div className="paginationcss">
                                        <ReactPaginate
                                          previousLabel={"<"}
                                          nextLabel={">"}
                                          breakLabel={"..."}
                                          forcePage={currentPage - 1}
                                          pageCount={totalPages}
                                          marginPagesDisplayed={1}
                                          pageRangeDisplayed={2}
                                          onPageChange={handlePageClick}
                                          containerClassName={
                                            "pagination pagination-md justify-content-center"
                                          }
                                          pageClassName={"page-item"}
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
                              </tbody>
                            )}
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
                {/* // )} */}
              </>
            ) : (
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">
                      {userKYCref.current.aadharName
                        ? userKYCref.current.aadharName
                        : "User"}{" "}
                      KYC Details
                    </span>

                    <button onClick={() => setNextstep(false)}>Back</button>
                  </div>
                  <div className="my-4 currencyinput">
                    <div className="form-group row mt-3">
                      <label className="col-lg-6 col-form-label form-control-label new_ky_rah">
                        Full Name:
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.aadharName}
                          placeholder="Full Name"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="form-group row mt-3">
                      <label className="col-lg-6 col-form-label form-control-label new_ky_rah">
                        Father Name:
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.fatherName}
                          placeholder="Father Name"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="form-group row mt-3">
                      <label className="col-lg-6 col-form-label form-control-label new_ky_rah">
                        Aadhar Number:
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.aadharNumber}
                          placeholder="Aadhar Number"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="form-group row mt-3">
                      <label className="col-lg-6 col-form-label form-control-label new_ky_rah">
                        Pan Number:
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.panNumber}
                          placeholder="Pan Number"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="form-group row mt-3">
                      <label className="col-lg-6 col-form-label form-control-label new_ky_rah">
                        Bank Account Number:
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.beneAccNo}
                          placeholder="Bank Account Number"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="form-group row mt-3">
                      <label className="col-lg-6 col-form-label form-control-label new_ky_rah">
                        IFSC Code:
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.ifsc}
                          placeholder="Ifsc Code"
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
                        Gender :
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={
                            userKYCref.current.gender == "M"
                              ? "Male"
                              : userKYCref.current.gender == "F"
                              ? "Female"
                              : ""
                          }
                          placeholder="Gender"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Address :
                      </label>
                      <div className="col-lg-6">
                        <input
                          type="text"
                          value={userKYCref.current.address}
                          placeholder="Address"
                          className="form-control"
                          readOnly
                        />
                      </div>
                    </div>

                    {userKYCref.current.aadharStatus == "success" && (
                      <div className="form-group row mt-3">
                        <label className="col-lg-6 col-form-label form-control-label">
                          National ID :
                        </label>
                        <div className="col-lg-6">
                          <div className="newky_man">
                            <div className="d-flex flex-column gap-2">
                              <span className="">Front</span>
                              <img
                                src={userKYCref.current.frontDoc}
                                className="imagebox"
                                width="100%"
                              />
                              <Link
                                to={userKYCref.current.frontDoc}
                                className="kycbtn"
                                target="_blank"
                              >
                                View
                              </Link>
                            </div>
                            <div className="d-flex flex-column gap-2">
                              <span className="">Back</span>
                              <img
                                src={userKYCref.current.backDoc}
                                className="imagebox"
                                width="100%"
                              />
                              <Link
                                to={userKYCref.current.backDoc}
                                className="kycbtn"
                                target="_blank"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {userKYCref.current.panStatus == "success" && (
                      <div className="form-group row mt-3">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Pan Card:
                        </label>
                        <div className="col-lg-6">
                          <div className="newky_man">
                            <div className="d-flex flex-column gap-2">
                              <span className="">Pan Card Image</span>
                              <img
                                src={userKYCref.current.panDocs}
                                className="imagebox"
                                width="100%"
                              />
                              <Link
                                to={userKYCref.current.panDocs}
                                className="kycbtn"
                                target="_blank"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
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
  );
}

export default Dashboard;
