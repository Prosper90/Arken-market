import React, { useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import useState from "react-usestateref";
import { toast } from "react-toastify";
import Sidebar_2 from "./Nav_bar";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import ReactPaginate from "react-paginate";
import Moment from "moment";
import { ScaleLoader } from "react-spinners";
import { BiSupport } from "react-icons/bi";
import { FaRegUserCircle } from "react-icons/fa";
import CsvDownloader from "react-csv-downloader";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import { Skeleton } from "@mui/material";
import FromDatePicker from "./fromdatepicker";
import ToDatePicker from "./todatepicker";
import { FaFilter } from "react-icons/fa6";

function HighRiskWalletAdmin() {
  const inputRef = useRef(null);
  const [add, setAdd] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [oneData, setOneData, oneDataref] = useState("");
  const [loader, setLoader] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [walletData, setWalletData] = useState([]);
  const [exportData, setExportData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 7;
  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };

  useEffect(() => {
    getWalletDetails(currentPage);
  }, [currentPage]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [walletData]);

  const getWalletDetails = async (page = 1) => {
    setLoader(true);
    const data = {
      apiUrl: apiService.highriskwallet_list,
      payload: { page, limit: 5, filterKeyword: filterKeyword,fromDate:fromDate,
toDate:toDate },
    };
    const response = await postMethod(data);
    setLoader(false);
    if (response.status) {
      setWalletData(response.data);
      setExportData(response.exportData);
      setTotalPages(response.totalPages);
    } else {
      setWalletData([]);
    }
  };

  const getViewDetails = async (id) => {
    setAdd(true);
    const datas = {
      apiUrl: apiService.highriskwallet_view,
      payload: { _id: id },
    };
    setLoader(true);
    const response = await postMethod(datas);
    setLoader(false);
    if (response.status) {
      setOneData(response.data[0]);
      setSelectedRecordId(response.data[0]._id);
    }
  };

  const sentback = () => {
    setAdd(false);
    setOneData({});
  };
  const download_csv = () => {
    if (exportData.length > 0) {
      toast.success("Report Download Successfully.");
    } else {
      toast.error("No records Found");
    }
  };
  const handleFilterChange = (e) => {
    getWalletDetails(1)
    // const value = e.target.value;
    // if (value.length === 1 && value[0] === " ") return;

    // setFilterKeyword(value);
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
            {/* {loader == true ? (
              <div className="loader_main loader_mainChange">
                <ScaleLoader color="#dfc822" height={60} width={5} />
                <p style={{ marginTop: "10px" }}></p>
              </div>
            ) : ( */}
            {/* {loader ? (
              <SkeletonwholeProject />
            ) : ( */}
            <>
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="suspi_userhead">
                    <div className="headerss">
                      <span className="dash-head">Suspicious Users</span>
                    </div>
                    <div className="usr_mng_rgt">
                      {!add ? (
                       <> 
                       <div className="filter_container">
                          <input
                            className="filter_input"
                            placeholder="Search by email"
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
                                                  </div></>
                      ) : (
                        ""
                      )}
                      {/* {exportData.length > 0 ? (
  ) : (
                          ""
                        )} */}
                      <div onClick={download_csv}>
                        <CsvDownloader
                          text="Download"
                          className="float-right csv-filter-change export_btn"
                          filename="Report Details"
                          extension=".csv"
                          disabled={!(exportData?.length > 0)}
                          datas={exportData.map((item) => {
                            const { kyc, ...rest } = item;

                            const formatted = Object.fromEntries(
                              Object.entries(rest).map(([key, value]) => [
                                key.charAt(0).toUpperCase() + key.slice(1),
                                value === null ||
                                value === undefined ||
                                value === ""
                                  ? "-"
                                  : value,
                              ])
                            );

                            const formattedKyc = kyc
                              ? Object.fromEntries(
                                  Object.entries(kyc).map(([key, value]) => [
                                    `Kyc_${
                                      key.charAt(0).toUpperCase() + key.slice(1)
                                    }`,
                                    value === null ||
                                    value === undefined ||
                                    value === ""
                                      ? "-"
                                      : value,
                                  ])
                                )
                              : {};

                            return {
                              ...formatted,
                              ...formattedKyc,
                            };
                          })}
                        >
                          Export{" "}
                          <i className="fa fa-download" aria-hidden="true"></i>
                        </CsvDownloader>
                      </div>

                      {add ? (
                        <button
                          className="export_btn"
                          onClick={() => sentback()}
                        >
                          Back
                        </button>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>

                  {add === false ? (
                    <div className="my-5 trans-table">
                      <div className="table-responsive">
                        <table className="w_100">
                          <thead className="trans-head">
                            <tr>
                              <th>S.No</th>
                              <th>Date & Time</th>
                              <th>Email</th>
                              <th>Suspicious Address</th>
                              <th>Type</th>
                              <th>Amount</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          {loader ? (
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
                            // <tbody>
                            //   <tr>
                            //     <td
                            //       colSpan={7}
                            //       style={{
                            //         textAlign: "center",
                            //         padding: "20px 0",
                            //       }}
                            //     >
                            //       <div className="loader_main loader_mainChange">
                            //         <ScaleLoader
                            //           color="#dfc822"
                            //           height={60}
                            //           width={5}
                            //         />

                            //         <p style={{ marginTop: "10px" }}></p>
                            //       </div>
                            //     </td>
                            //   </tr>
                            // </tbody>
                            <tbody>
                              {walletData.length > 0 ? (
                                walletData.map((item, i) => (
                                  <tr key={item._id}>
                                    <td>
                                      <span className="plus_14_ff">
                                        {i + 1}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {Moment(item.createdAt).format("lll")}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.email}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.suspiAddress}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.type}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.amount ? item.amount : "-"}
                                      </span>
                                    </td>
                                    <td>
                                      <span
                                        className="plus_14_ff cur_change_eye"
                                        onClick={() => getViewDetails(item._id)}
                                      >
                                        <i class="fa-solid fa-eye"></i>
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={7}>
                                    <div className="empty_data my-4">
                                      <div className="plus_14_ff">
                                        No Records Found
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              {walletData.length > 0 && totalPages > 1 && (
                                <tr className="text-center">
                                  <td colSpan="6">
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
                                        forcePage={currentPage - 1}
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
                              )}
                            </tbody>
                          )}
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="currencyinput mt-5">
                      {/* Email */}
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Email
                        </label>
                        <div className="col-lg-6">
                          <span className="plus_14_ff">
                            {oneDataref.current.email}
                          </span>
                        </div>
                      </div>

                      {/* Suspicious Address */}
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Suspicious Address
                        </label>
                        <div className="col-lg-6">
                          <span className="plus_14_ff">
                            {oneDataref.current.suspiAddress}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Amount
                        </label>
                        <div className="col-lg-6">
                          <span className="plus_14_ff">
                            {oneDataref.current.amount
                              ? oneDataref.current.amount
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Transaction Hash */}
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Transaction Hash
                        </label>
                        <div className="col-lg-6">
                          <span className="plus_14_ff wordbreak">
                            {oneDataref.current.transHash
                              ? oneDataref.current.transHash
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Type
                        </label>
                        <div className="col-lg-6">
                          <span className="plus_14_ff">
                            {oneDataref.current.type}
                          </span>
                        </div>
                      </div>

                      {/* Remarks */}
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Remarks
                        </label>
                        <div className="col-lg-6">
                          <span className="plus_14_ff">
                            {oneDataref.current.remarks}
                          </span>
                        </div>
                      </div>

                      {/* KYC Details */}
                      {oneDataref.current.kyc && (
                        <>
                          {/* <h5 className="mt-4 mb-2 font-semibold">KYC Details</h5> */}

                          {Object.entries(oneDataref.current.kyc).map(
                            ([key, value]) => {
                              // Capitalize first letter
                              const displayKey =
                                key.charAt(0).toUpperCase() + key.slice(1);

                              return (
                                <div className="form-group row" key={key}>
                                  <label className="col-lg-6 col-form-label form-control-label">
                                    {displayKey}
                                  </label>
                                  <div className="col-lg-6">
                                    {String(value).startsWith("http") ? (
                                      <a
                                        href={value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="plus_14_ff text-blue-600 underline"
                                      >
                                        View Document
                                      </a>
                                    ) : (
                                      <span className="plus_14_ff">
                                        {String(value)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
            {/* )} */}
            {/* // )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HighRiskWalletAdmin;
