import React, { useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import Moment from "moment";
import ReactPaginate from "react-paginate";
import { getMethod, postMethod } from "../core/service/common.api";
import useState from "react-usestateref";
import apiService from "../core/service/detail";
import { toast } from "react-toastify";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import { ScaleLoader } from "react-spinners";
import CsvDownloader from "react-csv-downloader";


import FromDatePicker from "./fromdatepicker";
import ToDatePicker from "./todatepicker";
import { FaFilter } from "react-icons/fa6";

function Dashboard() {
  const inputRef = useRef(null);
  const [Usersdata, setUsersdata, Usersdataref] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 7;
  // useEffect(() => {
  //   getUserDetails(currentPage);
  // }, [currentPage]);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    getUserDetails(currentPage);
    // get_deposit_details_csv();
  }, [currentPage]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [Usersdata]);

  const getUserDetails = async (page = 1, keyword = filterKeyword) => {
    setLoader(true);

    var datas = {
      apiUrl: apiService.get_all_user_deposit,
      payload: {
        page,
        limit: 5,
        keyword: keyword,
        fromDate: fromDate,
        toDate: toDate,
      },
    };
    var response = await postMethod(datas);
    setLoader(false);
    // console.log(response, "=-=-=-=response=-=-=");
    if (response.status) {
      setUsersdata(response.data);
      // setTotalPages(response.data.length/5);
      // setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
      setCsvData(response.csv_data);
    } else {
      setUsersdata([]);
    }
  };

  const handleFilterChange = (e) => {
    getUserDetails();
    // const value = e.target.value;
    // if (value.length === 1 && value.startsWith(" ")) return;
    // setFilterKeyword(value);
    // setCurrentPage(1);
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    setCurrentPage(selectedPage);
    // getUserDetails(selectedPage);
  };

  // const filteredUsers = Usersdata.filter((user) =>
  //   user.username.toLowerCase().includes(filterKeyword)
  // );
  const [csvData, setCsvData, csvDataref] = useState([]);

  const get_deposit_details_csv = async () => {
    try {
      const data = {
        apiUrl: apiService.get_deposit_details_csv,
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
  //   toast.success("Deposit Transaction Download Successfully.");
  // };
  const download_csv = () => {
    if (csvDataref.current?.length > 0) {
      toast.success("Deposit Transaction Download Successfully.");
    } else {
      toast.error("No records Found");
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
            {/* {loader ? (
              <SkeletonwholeProject />
            ) : ( */}
            <>
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">Crypto Deposit History </span>
                    <div className="usr_mng_rgt">
                      <div className="filter_container">
                        <input
                          className="filter_input"
                          placeholder="Search username "
                          value={filterKeyword}
                          ref={inputRef}
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
                      {/* {Usersdataref.current.length > 0 ? ( */}
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
                          filename="Deposit Transaction Details"
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
                  <div className="my-5 trans-table">
                    <div class="table-responsive">
                      <table className="w_100">
                        <thead className="trans-head">
                          <tr>
                            <th>S.No</th>
                            <th>Username</th>
                            <th>Transaction Id </th>
                            <th>Currency</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        {loader == true ? (
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
                                      <div
                                        className="w-full h-[22px] bg-[#b8b8b833] rounded-[6px] animate-pulse"
                                      ></div>
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
                                    <span className="plus_14_ff">{i + 1}</span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.username}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.txnid}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.currencySymbol}
                                    </span>
                                  </td>
                                  <td>
                                    <label className="plus_14_ff">
                                      {item.amount}
                                    </label>
                                  </td>
                                  <td>
                                    <label className="plus_14_ff">
                                      {item.status}
                                    </label>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {Moment(item.date).format("lll")}
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
                            {Usersdataref.current.length > 0 ? (
                              <tr className="text-center">
                                <td colSpan="7">
                                  <div className="paginationcss">
                                    <ReactPaginate
                                      previousLabel={"<"}
                                      nextLabel={">"}
                                      breakLabel={"..."}
                                      forcePage={currentPage - 1}
                                      pageCount={totalPages}
                                      marginPagesDisplayed={2}
                                      pageRangeDisplayed={5}
                                      onPageChange={handlePageClick}
                                      containerClassName={
                                        "pagination pagination-md justify-content-center "
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
            {/* )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
