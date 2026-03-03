import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import ReactPaginate from "react-paginate";
import useState from "react-usestateref";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import { getMethod, postMethod } from "../core/service/common.api";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import apiService from "../core/service/detail";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/material/Typography";
import { TextField, MenuItem, Button, Skeleton } from "@mui/material";
import Moment from "moment";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import * as XLSX from "xlsx";
import FromDatePicker from "./fromdatepicker";
import ToDatePicker from "./todatepicker";
import { FaFilter } from "react-icons/fa6";
import CsvDownloader from "react-csv-downloader";
function Profits() {
  const [currency, setCurrency, currencyref] = useState("USDT"); // Default value
  const [fromDate, setFromDate, fromDateref] = useState(""); // To store From date
  const [toDate, setToDate, toDateref] = useState(""); // To store To date

  const [Usersdata, setUsersdata, Usersdataref] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [CsvData, setCsvData, CsvDataref] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [totalProfitUSDT, setTotalProfitUSDT] = useState(0);
  const [totalProfitINR, setTotalProfitINR] = useState(0);
  const [todayProfitUsdt, setTodayProfitUsdt] = useState(0);
  const [todayProfitInr, setTodayProfitInr] = useState(0);
  const [customProfitUSDT, setCustomProfitUSDT] = useState(0);
  const [customProfitINR, setCustomProfitINR] = useState(0);

  const [FromDateprofits, setFromDateprofits] = useState(0);
  const [ToDateProfits, setToDateProfits] = useState(0);

  const [userDownloaddata, setUserDownloaddata, userDownloaddataref] = useState(
    []
  );
  const [loader, setLoader] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
    // console.log(event.target.value, "---------event.target.value---------");
  };

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 6;
  useEffect(() => {
    getProfitDetails(currentPage);
  }, []);

  useEffect(() => {
    getProfitDatas(currentPage);
  }, [currentPage]);

  const getProfitDetails = async (page = 1) => {
    var data = {
      apiUrl: apiService.getadminProfitDetails,
      payload: {
        page,
        limit: 5,
        from: fromDateref.current,
        to: toDateref.current,
      },
    };
    // setLoader(true);
    var resp = await postMethod(data);
    // setLoader(false);
    // console.log(resp, "----=--=-=-=resp-=-=-=-=");
    if (resp.status) {
      setTotalProfitUSDT(resp.totalFeesInUSDT);
      setTotalProfitINR(resp.totalFeesInINR);
      setTodayProfitUsdt(resp.todayProfitInUSDT);
      setTodayProfitInr(resp.todayProfitInINR);
      setCustomProfitUSDT(resp.customProfitInUSDT);
      setCustomProfitINR(resp.customProfitInINR);
    }
  };

  const handleDate = async (e, type) => {
    if (type == "From") {
      setFromDate(e.target.value);
    } else {
      setToDate(e.target.value);
    }
    getProfitDetails(1);
  };

  const getProfitDatas = async (page = 1) => {
    try {
      var datas = {
        apiUrl: apiService.getProfit,
        payload: { page, limit: 5 ,
          keyword:filterKeyword,
FromDateprofits:FromDateprofits,
ToDateProfits:ToDateProfits,
        },
      };
      setLoader(true);
      var response = await postMethod(datas);
      setLoader(false);
      // console.log(response, "=-=-=-=response=-=-=");
      if (response.status) {
        setCsvData(response.csv_data);
        setUsersdata(response.value);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
      } else {
        setUsersdata([]);
      }
    } catch (error) {}
  };

  const download_csv = () => {
    if (CsvDataref.current?.length > 0) {
      toast.success("Profits Download Successfully.");
    } else {
      toast.error("No records Found");
    }
  };

  const handleFilterChange = () => {
    getProfitDatas();
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    setCurrentPage(selectedPage);
  };

  // const downloadData = async () => {
  //   try {
  //     console.log("download clcicked");
  //     var data = {
  //       apiUrl: apiService.downloadProfits,
  //     };
  //     var resp = await getMethod(data);
  //     // console.log(resp,"-----download resp-----");
  //     setUserDownloaddata(resp.value);
  //     if (resp.status == true) {
  //       const fieldsToExport = [
  //         "email",
  //         "currency",
  //         "currencyname",
  //         "orderid",
  //         "type",
  //         "fees",
  //         "profit_amount",
  //         "date",
  //       ];
  //       const filteredData = userDownloaddataref.current.map((item) => {
  //         const filteredItem = {};
  //         fieldsToExport.forEach((field) => {
  //           // filteredItem[field] = item[field];
  //           if (field === "date") {
  //             filteredItem[field] = Moment(item[field]).format("lll");
  //           } else {
  //             filteredItem[field] = item[field];
  //           }
  //         });
  //         return filteredItem;
  //       });
  //       const worksheet = XLSX.utils.json_to_sheet(filteredData);
  //       const workbook = XLSX.utils.book_new();
  //       XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  //       XLSX.writeFile(workbook, "profitdetails.xlsx");
  //       toast.success("Profits File Downloaded");
  //     }
  //   } catch (error) {}
  // };
  const downloadData = async () => {
    try {
      console.log("Download clicked");

      const data = {
        apiUrl: apiService.downloadProfits,
      };

      const resp = await getMethod(data);
      setUserDownloaddata(resp.value);

      if (resp.status === true) {
        // ✅ Field label to key mapping
        const fieldsToExport = {
          Email: "email",
          Currency: "currency",
          "Currency name": "currencyname",
          "Order Id": "orderid",
          Type: "type",
          Fees: "fees",
          "Profit Amount": "profit_amount",
          Date: "date",
        };

        // ✅ Format and map data
        const filteredData = userDownloaddataref.current.map((item) => {
          const filteredItem = {};
          Object.entries(fieldsToExport).forEach(([label, key]) => {
            filteredItem[label] =
              key === "date"
                ? Moment(item[key] || "").format("lll")
                : item[key] ?? "";
          });
          return filteredItem;
        });

        // ✅ Create Excel sheet
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, "profitdetails.xlsx");

        toast.success("Profits File Downloaded");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download profits file");
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
                    <span className="dash-head"> Profits </span>
                  </div>
                  <div className="my-4 trans-table">
                    <div className="table-responsive ">
                      <table className="w_100">
                        <thead className="trans-head">
                          <tr>
                            <th>Currency</th>
                            <th>Total Profit</th>
                            <th>Today Profit</th>
                            <th>
                              <div className="custo_head">
                                Customize Date
                                <div className="custo_head_inside">
                                  From :{" "}
                                  <input
                                    name="fromDate"
                                    type="date"
                                    aria-multiline={today}
                                    value={fromDate}
                                    onChange={(e) => handleDate(e, "From")}
                                    className="custo_inp_date"
                                  />
                                  To :{" "}
                                  <input
                                    name="toDate"
                                    type="date"
                                    max={today}
                                    value={toDate}
                                    onChange={(e) => handleDate(e, "To")}
                                    className="custo_inp_date"
                                  />
                                </div>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <TextField
                                select
                                value={currency}
                                onChange={handleCurrencyChange}
                                variant="outlined"
                                size="small"
                                fullWidth
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: "#111 !important",
                                    border: "1px solid #dfc822 !important",
                                    borderRadius: "12px !important",
                                    width: "140px !important",
                                    boxShadow: "none !important",
                                    textAlign: "center",
                                    "& .MuiSelect-select": {
                                      textAlign: "center", // Centers the selected text
                                      color: "#fff !important", // Sets the text color to white
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                      {
                                        borderColor: "transparent !important", // Removes blue border on focus
                                      },
                                  },
                                }}
                              >
                                <MenuItem value="USDT">USDT</MenuItem>
                                <MenuItem value="INR">INR</MenuItem>
                              </TextField>
                            </td>
                            <td>
                              {currencyref.current == "USDT" ? (
                                <span className="plus_14_ff plus_21_ff">
                                  {parseFloat(totalProfitUSDT).toFixed(4)}
                                </span>
                              ) : (
                                <span className="plus_14_ff plus_21_ff">
                                  {parseFloat(totalProfitINR).toFixed(4)}
                                </span>
                              )}
                            </td>
                            <td>
                              {currencyref.current == "USDT" ? (
                                <span className="plus_14_ff plus_21_ff">
                                  {parseFloat(todayProfitUsdt).toFixed(4)}
                                </span>
                              ) : (
                                <span className="plus_14_ff plus_21_ff">
                                  {parseFloat(todayProfitInr).toFixed(4)}
                                </span>
                              )}
                            </td>
                            <td>
                              {currencyref.current == "USDT" ? (
                                <span className="plus_14_ff plus_21_ff">
                                  {parseFloat(customProfitUSDT).toFixed(4)}
                                </span>
                              ) : (
                                <span className="plus_14_ff plus_21_ff">
                                  {parseFloat(customProfitINR).toFixed(4)}
                                </span>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2 my-5">
                    <div className=" d-flex justify-content-end w_100 profit">
                      <div className="filter_container">
                        <input
                          className="filter_input"
                          placeholder="Search by email"
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
                        onSearch={(date) => setFromDateprofits(date)}
                      />

                      <ToDatePicker
                        placeholder="DD-MM-YYYY"
                        fromDate={fromDate}
                        onSearch={(date) => setToDateProfits(date)}
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
                          filename="Profit Details"
                          extension=".csv"
                          disabled={!(CsvDataref.current?.length > 0)}
                          datas={CsvDataref.current}
                        >
                          Export{" "}
                          <i class="fa fa-download" aria-hidden="true"></i>
                        </CsvDownloader>
                      </div>
                      {/* <div className="mb-3 px-2"> */}
                      {/* <button
                          onClick={() => downloadData()}
                          className="export_btn"
                        >
                          Click here to download
                          <i className="fa-regular fa-circle-down"></i>
                        </button> */}
                      {/* </div> */}
                    </div>
                    <div className="trans-table">
                      <div class="table-responsive">
                        <table className="w_100">
                          <thead className="trans-head">
                            <tr>
                              <th>SI.NO</th>
                              <th>Email</th>
                              <th>Currency</th>
                              <th>Type</th>
                              <th>Profit</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          {loader == true ? (
                            // <tr>
                            //   <td colSpan={6}>
                            //     <div className="empty_data">
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
                                  <tr>
                                    <td>
                                      <span className="plus_14_ff">
                                        {i + 1}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.email}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.currency}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.type}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {parseFloat(item.profit_amount).toFixed(
                                          8
                                        )}
                                      </span>
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
                                  <td colSpan={6}>
                                    <div className="empty_data">
                                      <div className="plus_14_ff">
                                        No Records Found
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              {Usersdataref.current.length > 0 ? (
                                <tr className="text-center">
                                  <td colSpan="6">
                                    <div className="paginationcss">
                                      <ReactPaginate
                                        previousLabel={"<"}
                                        nextLabel={">"}
                                        breakLabel={"..."}
                                        pageCount={totalPages}
                                        marginPagesDisplayed={1}
                                        forcePage={currentPage - 1}
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
              </div>
            </>
            {/* )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profits;
