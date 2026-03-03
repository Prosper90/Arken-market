import React, { useEffect } from "react";
import useState from "react-usestateref";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import { postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import ReactPaginate from "react-paginate";
import Moment from "moment";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import { ScaleLoader } from "react-spinners";
import { Skeleton } from "@mui/material";
import CsvDownloader from "react-csv-downloader";
import { toast } from "react-toastify";
import FromDatePicker from "./fromdatepicker";
import ToDatePicker from "./todatepicker";
import { FaFilter } from "react-icons/fa6";

function PartnerSubmissions() {
  const [loader, setLoader] = useState(false);
  const [partnerDatas, setPartnerDatas] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [onedata, setOnedata, oneDataref] = useState({});
  const [viewStatus, setviewStatus] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [csvData, setCsvData, csvDataref] = useState([]);

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 8;
  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };

  useEffect(() => {
    getPartnerDetails(currentPage);
  }, [currentPage]);

  const getPartnerDetails = async (page = 1) => {
    setLoader(true);
    const data = {
      apiUrl: apiService.partner_list,
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
      setPartnerDatas(response.data);
      setCsvData(response.csv_data);
      setTotalPages(response.totalPages);
    }
  };

  const viewdata = (item) => {
    setOnedata(item);
    setviewStatus(true);
  };

  const handleFilterChange = (e) => {
    // const value = e.target.value;
    // // Remove leading spaces
    // if (value.startsWith(" ")) return;

    // setFilterKeyword(e.target.value);
    // setCurrentPage(1);
    getPartnerDetails();
  };

  const download_csv = () => {
    if (csvDataref.current?.length > 0) {
      toast.success("Partner Details Download Successfully.");
    } else {
      toast.error("No records Found");
    }
  };

  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-xl-2 col-lg-3 d-none d-lg-block px-0">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="col-xl-10 col-lg-9 col-12 px-0">
            <div className="pos_sticky">
              <Sidebar_2 />
            </div>

            {viewStatus == false ? (
              <>
                {/* {loader ? (
                  <SkeletonwholeProject />
                ) : ( */}
                <>
                  <div className="px-4 transaction_padding_top">
                    <div className="px-2 my-4 transaction_padding_top tops">
                      <div className="headerss">
                        <span className="dash-head">Partner Submissions</span>
                        <div className="usr_mng_rgt">
                          {/* <div className="filter_container">
                            <input
                              className="filter_input"
                              placeholder="Search username "
                              value={filterKeyword}
                              onChange={handleFilterChange}
                            />
                            <i className="fa-solid fa-magnifying-glass"></i>
                          </div> */}
                          <div className="filter_container">
                            <input
                              className="filter_input"
                              placeholder="Search username "
                              value={filterKeyword}
                              // ref={inputRef}
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
                          <div onClick={download_csv} className="">
                            <CsvDownloader
                              text="Download"
                              className="float-right csv-filter-change export_btn"
                              filename="Partner Details  Details"
                              extension=".csv"
                              disabled={!(csvDataref.current?.length > 0)}
                              datas={csvDataref.current}
                            >
                              Export{" "}
                              <i class="fa fa-download" aria-hidden="true"></i>
                            </CsvDownloader>
                          </div>
                        </div>
                      </div>

                      <div className="my-5 trans-table">
                        <div className="table-responsive ">
                          <table className="w_100">
                            <thead className="trans-head">
                              <tr>
                                <th>S.No</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Company</th>
                                <th>Subject</th>
                                <th>Message</th>
                                <th>Date & Time</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            {loader ? (
                              // <tr>
                              //   <td colSpan={7}>
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
                                {partnerDatas.length > 0 ? (
                                  partnerDatas.map((item, i) => (
                                    <tr key={item._id}>
                                      <td>
                                        <span className="plus_14_ff">
                                          {i + 1}
                                        </span>
                                      </td>

                                      <td>
                                        <span className="plus_14_ff">
                                          {item.name}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.email}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.company}
                                        </span>
                                      </td>

                                      <td>
                                        <span className="plus_14_ff">
                                          {item.subject}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.message
                                            ? item.message.substring(0, 10)
                                            : ""}
                                          ...
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {Moment(item.createdAt).format("lll")}
                                        </span>
                                      </td>
                                      <td
                                        className="cursor-pointer"
                                        onClick={() => viewdata(item)}
                                      >
                                        <span className="plus_14_ff hot_view_mn">
                                          View
                                        </span>
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

                                {partnerDatas.length > 0 && (
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
                    </div>
                  </div>
                </>
                {/* )} */}
              </>
            ) : (
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">Parter Details</span>
                    <button
                      onClick={() => {
                        setviewStatus(false);
                      }}
                    >
                      Back
                    </button>
                  </div>
                  <div className="currencyinput mt-5">
                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Name
                      </label>
                      <div className="col-lg-6">
                        <span className="plus_14_ff">
                          {oneDataref.current.name}
                        </span>
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Email
                      </label>
                      <div className="col-lg-6">
                        <span className="plus_14_ff wordbreak">
                          {oneDataref.current.email}
                        </span>
                      </div>
                    </div>

                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Company
                      </label>
                      <div className="col-lg-6">
                        <span className="plus_14_ff wordbreak">
                          {oneDataref.current.company}
                        </span>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Subject
                      </label>
                      <div className="col-lg-6">
                        <span className="plus_14_ff wordbreak">
                          {oneDataref.current.subject}
                        </span>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-lg-6 col-form-label form-control-label">
                        Message
                      </label>
                      <div className="col-lg-6">
                        <span className="plus_14_ff wordbreak">
                          {oneDataref.current.message}
                        </span>
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
}

export default PartnerSubmissions;
