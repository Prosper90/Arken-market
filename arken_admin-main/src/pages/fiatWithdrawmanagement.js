import React, { useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import Moment from "moment";
import ReactPaginate from "react-paginate";
import { postMethod } from "../core/service/common.api";
import useState from "react-usestateref";
import apiService from "../core/service/detail";
import { toast } from "react-toastify";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import { ScaleLoader } from "react-spinners";
import CsvDownloader from "react-csv-downloader";
import { Skeleton } from "@mui/material";

import FromDatePicker from "./fromdatepicker";
import ToDatePicker from "./todatepicker";
import { FaFilter } from "react-icons/fa6";

function Dashboard() {
  const inputRef = useRef(null);
  const [add, setadd] = useState(false);
  const [Usersdata, setUsersdata, Usersdataref] = useState([]);
  const [selected, setselected, selectedref] = useState({});
  const [filterKeyword, setFilterKeyword] = useState("");
  const [loader, setLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 5; // Define how many items per page
  const [buttonLoaderReject, setButtonLoaderReject] = useState(false);
  const [buttonLoaderApprove, setButtonLoaderApprove] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [csvData, setCsvData, csvDataref] = useState([]);

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 8;
  useEffect(() => {
    getUserDetails(currentPage);
  }, [currentPage]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [Usersdata]);

  const getUserDetails = async (page, Keyword = filterKeyword) => {
    setLoader(true);
    var datas = {
      apiUrl: apiService.get_all_user_fiat_withdraw,
      payload: {
        currentPage: page,
        pageSize: pageSize,
        filterKeyword: Keyword,
        fromDate: fromDate,
        toDate: toDate,
      },
    };
    var response = await postMethod(datas);
    if (response.status) {
      setUsersdata(response.data);
      setPageCount(response.totalPages);
      setCsvData(response.csv_data);
      setCurrentPage(response.currentPage);
      setLoader(false);
    } else {
      setUsersdata([]);
      setLoader(false);
    }
  };

  const Reject = async () => {
    var obj = {
      _id: selectedref.current._id,
      currency: selectedref.current.currency_symbol,
      amount: selectedref.current.receiveamount,
      reason: "invalid transaction",
      uname: selectedref.current.user_name,
      email: selectedref.current.email,
      status: "cancel",
    };

    var datas = {
      apiUrl: apiService.admin_withdraw_approve,
      payload: obj,
    };
    setButtonLoaderReject(true);
    var response = await postMethod(datas);
    setButtonLoaderReject(false);
    if (response.status) {
      toast.success(response.message);
      getUserDetails(1);
      setadd(false);
    } else {
      toast.error(response.message);
      getUserDetails(1);
      setadd(false);
    }
  };

  const Approvewithdraw = async () => {
    var obj = {
      _id: selectedref.current._id,
      currency: selectedref.current.currency_symbol,
      amount: selectedref.current.receiveamount,
      uname: selectedref.current.user_name,
      email: selectedref.current.email,
      status: "confirm",
    };

    var datas = {
      apiUrl: apiService.admin_withdraw_approve,
      payload: obj,
    };
    setButtonLoaderApprove(true);
    var response = await postMethod(datas);
    setButtonLoaderApprove(false);
    if (response.status) {
      toast.success(response.message);
      getUserDetails(1);
      setadd(false);
    } else {
      toast.error(response.message);
      getUserDetails(1);
      setadd(false);
    }
  };

  const handleFilterChange = (e) => {
    // const value = e.target.value;
    // if (value.length === 1 && value.startsWith(" ")) return;
    // setFilterKeyword(value);
    getUserDetails(1);
  };

  // const filteredUsers = Usersdata.filter((user) =>
  //   user.user_name.toLowerCase().includes(filterKeyword.toLowerCase())
  // );

  const edit = async (data) => {
    setselected(data);
    setadd(true);
  };

  const handleChange = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/\s/g, "");
    let formData = { ...selectedref.current, ...{ [name]: sanitizedValue } };
    setselected(formData);
  };

  const handlePageClick = (event) => {
    const selectedPage = event.selected;
    setCurrentPage(selectedPage + 1);
    // getUserDetails(selectedPage + 1);
  };

  const get_withdraw_details_csv = async () => {
    try {
      const data = {
        apiUrl: apiService.get_withdraw_details_csv,
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

  const download_csv = () => {
    if (csvDataref.current?.length > 0) {
      toast.success("Withdraw Transaction Download Successfully.");
    } else {
      toast.error("No records Found");
    }
  };

  return (
    <div>
      {" "}
      <div className="container-fluid">
        <div className="row">
          <div className="col-xl-2 col-lg-3 d-none d-lg-block px-0">
            <Sidebar />
          </div>

          <div className="col-xl-10 col-lg-9 col-12 px-0">
            <div className="pos_sticky">
              <Sidebar_2 />
            </div>
            {/* {loader ? (
              <SkeletonwholeProject />
            ) : ( */}
            <>
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">Bank Withdraw History</span>
                    <div className="usr_mng_rgt">
                      {add === false ? (
                        <>
                          <div className="filter_container">
                            <input
                              className="filter_input"
                              placeholder="Search username "
                              value={filterKeyword}
                              ref={inputRef}
                              onChange={(e) => {
                                const value = e.target.value;
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
                        </>
                      ) : (
                        <button
                          className="export_btn"
                          onClick={() => setadd(false)}
                        >
                          Back
                        </button>
                      )}

                      {/* {Usersdataref.current.length > 0 ? ( */}
                      <div onClick={download_csv} className="">
                        <CsvDownloader
                          text="Download"
                          className="float-right csv-filter-change export_btn"
                          filename="Withdraw Transaction Details"
                          extension=".csv"
                          disabled={!(csvDataref.current?.length > 0)}
                          datas={csvDataref.current}
                        >
                          Export{" "}
                          <i class="fa fa-download" aria-hidden="true"></i>
                        </CsvDownloader>
                      </div>
                      {/* ) : (
                          ""
                        )} */}
                    </div>
                  </div>
                  {add === false ? (
                    <div className="my-5 trans-table">
                      <div className="table-responsive ">
                        <table className="w_100">
                          <thead className="trans-head">
                            <tr>
                              <th>S.No</th>
                              <th>Username</th>
                              <th>Currency</th>
                              <th>Amount</th>
                              <th>Transfer Amount</th>
                              <th>Fees</th>
                              <th>Status</th>
                              <th>Date</th>
                              {/* <th>Action</th> */}
                            </tr>
                          </thead>
                          {loader == true ? (
                            // <tr>
                            //   <td colSpan={9}>
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
                              {Usersdataref.current.length > 0 ? (
                                Usersdataref.current.map((item, i) => (
                                  <tr key={item._id}>
                                    <td>
                                      <span className="plus_14_ff">
                                        {i + 1}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.bankDetails.name}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.currency}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.amount}
                                      </span>
                                    </td>
                                    <td>
                                      <label className="plus_14_ff">
                                        {item.receiveAmount}
                                      </label>
                                    </td>
                                    <td>
                                      <label className="plus_14_ff">
                                        {item.fees
                                          ? parseFloat(item.fees).toFixed(2)
                                          : 0.0}
                                      </label>
                                    </td>
                                    <td>
                                      {item.status == 1
                                      ?<label className="plus_14_ff text-warning">Pending</label>   : item.status == 2?<label className="plus_14_ff text-success">Completed</label>:<label className="plus_14_ff text-danger">Cancelled</label>}
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {Moment(item.createdDate).format("lll")}
                                      </span>
                                    </td>
                                    {/* <td><span className="plus_14_ff"><i className="fa-regular fa-pen-to-square cursor-pointer" onClick={() => edit(item)}></i></span></td> */}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={9}>
                                    <div className="empty_data my-4">
                                      <div className="plus_14_ff">
                                        No Records Found
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              {Usersdataref.current.length > 0 ? (
                                <tr className="text-center">
                                  <td colSpan="9">
                                    <div className="paginationcss">
                                      <ReactPaginate
                                        previousLabel={"<"}
                                        nextLabel={">"}
                                        breakLabel={"..."}
                                        pageCount={pageCount}
                                        forcePage={currentPage - 1}
                                        marginPagesDisplayed={2}
                                        pageRangeDisplayed={5}
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
                  ) : (
                    <div className="row justify-content-center mt-5">
                      <div className="currencyinput col-lg-9">
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            User Name
                          </label>
                          <div className="col-lg-6">
                            <input
                              className="form-control"
                              disabled
                              type="text"
                              value={selectedref.current.user_name}
                              placeholder="Currency Name"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Currency
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              placeholder="Currency Symbol"
                              value={selectedref.current.currency_symbol}
                              disabled
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Withdraw Amount
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              placeholder="Contract Address"
                              disabled
                              className="form-control"
                              value={selectedref.current.amount}
                            />
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Receive Amount
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              value={selectedref.current.receiveamount}
                              disabled
                              placeholder="Currency Decimal"
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Fees
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              value={selectedref.current.fees}
                              disabled
                              placeholder="Contract Address"
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            To Address
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              value={selectedref.current.withdraw_address}
                              disabled
                              placeholder="Currency Decimal"
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Transaction Id
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              disabled
                              className="form-control"
                              value={selectedref.current.txn_id}
                            />
                          </div>
                        </div>
                        <div className="form-group row justify-content-around mt-4">
                          <label className="col-lg-4 d-flex align-items-center w_100">
                            {buttonLoaderReject == false ? (
                              <button
                                className="btn btn-primary btn-lg float-right w_100"
                                onClick={() => Reject()}
                              >
                                Reject
                              </button>
                            ) : (
                              <button className="btn btn-primary btn-lg float-right w_100">
                                Loading ...
                              </button>
                            )}
                          </label>
                          <div className="col-lg-4 d-flex align-items-center">
                            {buttonLoaderApprove == false ? (
                              <button
                                className="btn btn-lg btn-primary float-left w_100"
                                onClick={() => Approvewithdraw()}
                              >
                                Approve
                              </button>
                            ) : (
                              <button className="btn btn-lg btn-primary float-left w_100">
                                Loading ...
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
            {/* )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
