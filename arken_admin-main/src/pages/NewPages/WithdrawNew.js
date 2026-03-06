import React, { useEffect, useRef } from "react";
import useState from "react-usestateref";
import Sidebar from "../Sidebar";
import SkeletonwholeProject from "../SkeletonwholeProject";
import Sidebar_2 from "../Nav_bar";

import ReactPaginate from "react-paginate";
import Moment from "moment";
import FromDatePicker from "../fromdatepicker";
import ToDatePicker from "../todatepicker";
import { FaFilter } from "react-icons/fa6";
import { toast } from "react-toastify";
import CsvDownloader from "react-csv-downloader";
import { MdAddCircle } from "react-icons/md";
import apiService from "../../core/service/detail";
import { postMethod } from "../../core/service/common.api";

const WithdrawNew = () => {
  useEffect(() => {
    getUserDetails();
  }, [0]);

  const [userdata, setuserdata, userdataref] = useState("");
  const [loader, setLoader] = useState(false);
  const [DepositData, setDepositData, DepositDataref] = useState([]);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [csvData, setCsvData, csvDataref] = useState([]);
  const inputRef = useRef(null);
  const [filterKeyword, setFilterKeyword] = useState("");
  const rows = Array.from({ length: 4 }); // 4 rows
  const cols = 4;

  //   const DepositData = [
  //     {
  //       id: 1,
  //       email: "testinguserdevsdev@gmail.com",
  //       dateTime: "2025-11-25T08:38:07.641Z",
  //       username: "testinguserdevsdev",
  //       kycStatus: 2,
  //       disableUser: "demo",
  //     },
  //     {
  //       id: 2,
  //       email: "rajeshwaran242@gmail.com",
  //       dateTime: "2025-11-25T05:34:51.573Z",
  //       username: "rajeshwaran242",
  //       kycStatus: 2,
  //       disableUser: "demo",
  //     },
  //     {
  //       id: 3,
  //       email: "gohosi5109@izeao.com",
  //       dateTime: "2025-11-24T11:01:32.594Z",
  //       username: "gohosi5109",
  //       kycStatus: 2,
  //       disableUser: "demo",
  //     },
  //     {
  //       id: 3,
  //       email: "rajeshwarans@beleaftechnologies.com",
  //       dateTime: "2025-11-21T08:55:07.356Z",
  //       username: "rajeshwarans",
  //       kycStatus: 1,
  //       disableUser: "demo",
  //     },
  //     {
  //       id: 4,
  //       email: "capitalexc1.4@gmail.com",
  //       dateTime: "2025-11-19T15:45:59.736Z",
  //       username: "capitalexc1.4",
  //       kycStatus: 0,
  //       disableUser: "demo",
  //     },
  //   ];

  //   useEffect(() => {
  //       setCsvData(eventCreactionDetails);
  //   }, []);

  //   useEffect(() => {
  //     inputRef.current?.focus();
  //   }, [eventCreactionDetails]);

  const getUserDetails = async (page = 1, keyword = filterKeyword) => {
    try {
      setLoader(true);

      var datas = {
        apiUrl: apiService.get_all_user_withdraw,
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
        setDepositData(response.data);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
        // let csvData = [];
        // console.log(response.data,"response.data")
        // for (let i = 0; i < response.data; i++) {
        //   var element = response.data[i];
        //   console.log(element)
        //   var obj = {
        //     Address: element.withdraw_address,
        //     status: element.status=="1"?"Completed":"Cancel",
        //     Amount: element.amount,
        //     Date: Moment(element.created_at).format("lll"),
        //   };
        //   csvData.push(obj);
        // }
        // console.log(csvData,"csvDaxxxta")
        // setCsvData(csvData);
        let csvData = [];

console.log(response.data, "response.data");

for (let i = 0; i < response.data.length; i++) {
  const element = response.data[i];

  const obj = {
    Address: element.withdraw_address,
    status: element.status === "1" ? "Completed" : "Cancel",
    Amount: element.amount,
    Date: Moment(element.created_at).format("lll"),
  };

  csvData.push(obj);
}

console.log(csvData, "csvData");
setCsvData(csvData);

      } else {
        setDepositData([]);
      }
    } catch (error) {
      setDepositData([]);
      console.log(error, "-");
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };

  const handleFilterchange = () => {
    console.log("Filter work");
    getUserDetails()
  };

  const download_csv = () => {
    console.log(csvData,"csvData")
    if (csvDataref.current?.length > 0) {
      toast.success("Withdraw Details Download Successfully.");
    } else {
      toast.error("No records Found");
    }
  };
  return (
    <div>
      {/* {loader == true ? (
        <SkeletonwholeProject />
      ) : ( */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-xl-2 col-lg-3 d-none d-lg-block px-0">
            <Sidebar />
          </div>

          <>
            <div className="col-xl-10 col-lg-9 col-12 px-0">
              <div className="pos_sticky">
                <Sidebar_2 />
              </div>

              {/* {loader == true ? (
                                <SkeletonwholeProject />
                            ) : ( */}
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">Withdraw</span>
                    <div className="usr_mng_rgt">
                      <div className="filter_container">
                        <input
                          className="filter_input"
                          ref={inputRef}
                          placeholder="Search Address"
                          value={filterKeyword}
                          onChange={(e) => {
                            const value = e.target.value;
                            console.log(value, "value");
                            if (value.length === 1 && value.startsWith(" "))
                              return;
                            setFilterKeyword(value);
                          }}
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

                      <div onClick={download_csv}>
                        <CsvDownloader
                          text="Download"
                          className="float-right csv-filter-change export_btn"
                          filename="Withdraw Details"
                          extension=".csv"
                          disabled={!(csvData?.length > 0)}
                          datas={csvData}
                        >
                          Export{" "}
                          <i className="fa fa-download" aria-hidden="true"></i>
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
                            <th>Address</th>
                            <th>Amount</th>
                            <th>Date & Time</th>
                            {/* <th>Kyc Status</th> */}
                            {/* <th>Disable User</th> */}
                          </tr>
                        </thead>
                        {loader == true ? (
                          <tbody>
                            {rows.map((_, rowIndex) => (
                              <tr key={rowIndex}>
                                {Array.from({ length: cols }).map(
                                  (_, colIndex) => (
                                    <td key={colIndex}>
                                      <div className="h-5 rounded bg-white/10 animate-pulse" />
                                    </td>
                                  )
                                )}
                              </tr>
                            ))}
                          </tbody>
                        ) : (
                          <tbody>
                            {/* {loader == true ? (
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
                                                    ) : ( */}
                            <>
                              {DepositData.length > 0 ? (
                                DepositData.map((item, i) => (
                                  <tr key={i}>
                                    <td>
                                      <span className="plus_14_ff">
                                        {i + 1}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.withdraw_address}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.amount}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {Moment(item.dateTime).format("lll")}
                                      </span>
                                    </td>
                                    {/* <td>
                                    <span className="plus_14_ff">
                                      {item.kycStatus}
                                    </span>
                                  </td> */}
                                    {/* <td>
                                    <span className="plus_14_ff">
                                      {item.disableUser}
                                    </span>
                                  </td> */}
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

                              {/* table pagination */}
                              {DepositData.length > 0 ? (
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
                          </tbody>
                        )}
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              {/* )} */}
            </div>
          </>
        </div>
      </div>
      {/* )} */}
    </div>
  );
};

export default WithdrawNew;
