import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import Moment from "moment";
import ReactPaginate from "react-paginate";
import { getMethod, postMethod } from "../core/service/common.api";
import useState from "react-usestateref";
import apiService from "../core/service/detail";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import CsvDownloader from "react-csv-downloader";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import { Skeleton } from "@mui/material";
import FromDatePicker from "./fromdatepicker";
import ToDatePicker from "./todatepicker";
import { FaFilter } from "react-icons/fa";
function UserTrade() {
  const [historyState, setHistoryState, historyStateref] =
    useState("OrderHistory");
  console.log(historyStateref.current, "historyStateref==");
  const [Usersdata, setUsersdata, Usersdataref] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loader, setLoader] = useState(true);

  const [UsersdataOrders, setUsersdataOrders, UsersdataOrdersref] = useState(
    []
  );
  const [filterKeywordOrders, setFilterKeywordOrders] = useState("");
  const [currentPageOrders, setCurrentPageOrders] = useState(1);
  const [totalPagesOrders, setTotalPagesOrders] = useState(0);

  const [UsersdataCancel, setUsersdataCancel, UsersdataCancelref] = useState(
    []
  );
  const [filterKeywordCancel, setFilterKeywordCancel] = useState("");
  const [currentPageCancel, setCurrentPageCancel] = useState(1);
  const [totalPagesCancel, setTotalPagesCancel] = useState(0);
  const [ActiveOrderscsvData, setActiveOrderscsvData, ActiveOrderscsvDataref] = 
    useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [
    OrdersHistorycsvData,
    setOrdersHistorycsvData,
    OrdersHistorycsvDataref,
  ] = useState([]);
  const [CancelOrderscsvData, setCancelOrderscsvData, CancelOrderscsvDataref] =
    useState([]);

  const handleHistory = async (value) => {
    setHistoryState(value);
    console.log(value, "value");
  };
  console.log(
    historyStateref.current,
    Usersdataref.current.length,
    Usersdataref.current
  );

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 9;
  useEffect(() => {
    getActiveOrders(currentPage);
    // getActiveOrders_csv();
    // getOrdersHistory_csv();
    // getCancelOrders_csv();
  }, [currentPage]);

  useEffect(() => {
    getOrdersHistory(currentPageOrders);
  }, [currentPageOrders]);

  useEffect(() => {
    getCancelOrders(currentPageCancel);
  }, [currentPageCancel]);



  const getActiveOrders = async (page = 1) => {
    setLoader(true);
    var datas = {
      apiUrl: apiService.getActiveOrders,
      payload: { page, limit: 5,keyword: filterKeyword,
        fromDate: fromDate,
        toDate: toDate, },
    };
    var response = await postMethod(datas);
    setLoader(false);
    if (response.status) {
      setUsersdata(response.data.length>0?response.data:[]);
      // setTotalPages(response.data.length/5);
      // setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setActiveOrderscsvData(response.csv_data);

      setCurrentPage(response.currentPage);
    } else {
      setUsersdata([]);
    }
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    setCurrentPage(selectedPage);
  };

  const getOrdersHistory = async (page = 1) => {
    var datas = {
      apiUrl: apiService.getOrdersHistory,
      payload: { page, limit: 5 ,keyword: filterKeyword,
        fromDate: fromDate,
        toDate: toDate,},
    };
    var response = await postMethod(datas);
    if (response.status) {
      setUsersdataOrders(response.data.length>0?response.data:[]);
      // setTotalPages(response.data.length/5);
      // setCurrentPage(response.currentPage);
      setTotalPagesOrders(response.totalPages);
        setOrdersHistorycsvData(response.csv_data);

      setCurrentPageOrders(response.currentPage);
    } else {
      setUsersdataOrders([]);
    }
  };

  const handlePageClickOrders = (data) => {
    const selectedPage = data.selected + 1;
    setCurrentPageOrders(selectedPage);
  };

  const getCancelOrders = async (page) => {
    var datas = {
      apiUrl: apiService.getCancelOrdersHistory,
      payload: { page, limit: 5,keyword: filterKeyword,
        fromDate: fromDate,
        toDate: toDate, },
    };
    var response = await postMethod(datas);
    if (response.status) {
      setUsersdataCancel(response.result.length>0?response.result:[]);
         setCancelOrderscsvData(response.csv_data);
    
      // setTotalPages(response.data.length/5);
      // setCurrentPage(response.currentPage);
      setTotalPagesCancel(response.totalPages);
      setCurrentPageCancel(response.currentPage);
    } else {
      setUsersdataCancel([]);
    }
  };

  const handlePageClickCancel = (data) => {
    const selectedPage = data.selected + 1;
    setCurrentPageCancel(selectedPage);
  };

  const getActiveOrders_csv = async () => {
    var datas = {
      apiUrl: apiService.getActiveOrders_csv,
    };
    var response = await postMethod(datas);
    if (response.status) {
      setActiveOrderscsvData(response.data);
    } else {
    }
  };

  const getOrdersHistory_csv = async () => {
    var datas = {
      apiUrl: apiService.getOrdersHistory_csv,
    };
    var response = await postMethod(datas);
    if (response.status) {
      setOrdersHistorycsvData(response.data);
      
    } else {
    }
  };

  const getCancelOrders_csv = async () => {
    var datas = {
      apiUrl: apiService.getCancelOrdersHistory_csv,
    };
    var response = await postMethod(datas);
    if (response.status) {
      console.log(response, "response.data");
      setCancelOrderscsvData(response.result);
      
    } else {
    }
  };

  const handleFilterchange = () => {
    console.log("Filter work");
    getActiveOrders(1)
getCancelOrders(1)
getOrdersHistory(1)
  };

  const download_csv = (value) => {
    console.log(value,"value");
    if (value == "Active Order") {
      if(ActiveOrderscsvDataref.current.length>0){
          toast.success("Active Orders Download Successfully.");
      }else{
        toast.error("No records found")
      }
    } else if (value == "Order") {
        if(OrdersHistorycsvDataref.current.length>0){
      toast.success("Trade Order Details Download Successfully.");
      }else{
        toast.error("No records found")
      }
    } else {
      if(CancelOrderscsvDataref.current.length>0){
      toast.success("Cancel Order  Details Download Successfully.");
      }else{
        toast.error("No records found")
      }
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
            </div>{" "}
            {/* {loader ? (
              <SkeletonwholeProject />
            ) : ( */}
            <>
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">Users Trade History </span>
                  </div>
                  <div className="">
                    <nav>
                      <div className="filter_head">
                        <div
                          class="nav nav-tabs history_main_nav"
                          id="nav-tab"
                          role="tablist"
                        >
                          {/* <span
                          // class="nav-link active"
                          class={
                            historyStateref.current == "OrderHistory"
                              ? "nav-link active"
                              : "nav-link"
                          }
                          id="nav-home-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#nav-home"
                          role="tab"
                          aria-controls="nav-home"
                          aria-selected="true"
                          onClick={() => handleHistory("OrderHistory")}
                        > */}
                          <span
                            // class="nav-link active"
                            class={
                              historyStateref.current == "OrderHistory"
                                ? "nav-link active"
                                : "nav-link"
                            }
                            id="nav-home-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#nav-home"
                            role="tab"
                            aria-controls="nav-home"
                            aria-selected="true"
                            onClick={() => handleHistory("OrderHistory")}
                          >
                            Order History
                          </span>
                          <span
                            class={
                              historyStateref.current == "OpenHistory"
                                ? "nav-link active"
                                : "nav-link"
                            }
                            id="nav-profile-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#nav-profile"
                            role="tab"
                            aria-controls="nav-profile"
                            aria-selected="false"
                            onClick={() => handleHistory("OpenHistory")}
                          >
                            Open Orders
                          </span>
                          <span
                            class={
                              historyStateref.current == "CancelHistory"
                                ? "nav-link active"
                                : "nav-link"
                            }
                            id="nav-contact-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#nav-contact"
                            role="tab"
                            aria-controls="nav-contact"
                            aria-selected="false"
                            onClick={() => handleHistory("CancelHistory")}
                          >
                            Cancel Orders
                          </span>
                        </div>

                        <div>
                          {
                          historyStateref.current == "OrderHistory" ? (
                              <div className="right_head">
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
                                <div
                                  onClick={() => download_csv("Order")}
                                  className=""
                                >
                                  <CsvDownloader
                                    text="Download"
                                    className="btn_add float-right csv-filter-change text-dark"
                                    filename="Order  Details"
                                    extension=".csv"
                              disabled={!(OrdersHistorycsvDataref.current?.length > 0)}

                                    datas={OrdersHistorycsvDataref.current}
                                  >
                                    Export Orders{" "}
                                    <i
                                      class="fa fa-download"
                                      aria-hidden="true"
                                    ></i>
                                  </CsvDownloader>
                                </div>
                              </div>
                          ) : historyStateref.current == "OpenHistory" ? (
                            // UsersdataOrdersref.current.length > 0 ? (
                              <>
                                <div className="right_head">
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
                                  <div
                                    onClick={() => download_csv("Active Order")}
                                    className="fromandtodate"
                                  >
                                    <CsvDownloader
                                      text="Download"
                                      className="btn_add float-right csv-filter-change text-dark"
                                      filename="Order Details"
                                      extension=".csv"
                              disabled={!(ActiveOrderscsvDataref.current?.length > 0)}
                                      datas={ActiveOrderscsvDataref.current}
                                    >
                                     Export Orders{" "}
                                      <i
                                        class="fa fa-download"
                                        aria-hidden="true"
                                      ></i>
                                    </CsvDownloader>
                                  </div>
                                </div>
                              </>
                            // ) : (
                            //   ""
                            // )
                          ) : historyStateref.current == "CancelHistory" ? (
                            <div className="right_head">
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
                              <div
                                onClick={() => download_csv("Cancel order")}
                                className=""
                              >
                                <CsvDownloader
                                  text="Download"
                                  className="btn_add float-right csv-filter-change text-dark"
                                  filename="Cancel order  Details"
                                  extension=".csv"
                              disabled={!(CancelOrderscsvDataref.current?.length > 0)}
                                  
                                  datas={CancelOrderscsvDataref.current}
                                >
                               Export Orders{" "}
                                  <i
                                    class="fa fa-download"
                                    aria-hidden="true"
                                  ></i>
                                </CsvDownloader>
                              </div>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </nav>

                    <div class="tab-content" id="nav-tabContent">
                      <div
                        class={`${
                          historyStateref.current === "OrderHistory"
                            ? "show active"
                            : ""
                        } tab-pane fade`}
                        id="nav-home"
                        role="tabpanel"
                        aria-labelledby="nav-home-tab"
                      >
                        {" "}
                        <div className="my-5 trans-table">
                          <div class="table-responsive ">
                            <table className="w_100">
                              <thead className="trans-head">
                                <tr>
                                  <th>orderId</th>
                                  <th>UserName</th>
                                  <th>Pair</th>
                                  <th>Type</th>
                                  <th>price</th>
                                  <th>Amount</th>
                                  <th>Total</th>
                                  <th>Fee</th>
                                  <th>Date</th>
                                </tr>
                              </thead>
                              {loader == true ? (
                                // <tr>
                                //   <td colSpan={9}>
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
                                  {UsersdataOrdersref.current.length > 0 ? (
                                    UsersdataOrdersref.current.map(
                                      (item, i) => (
                                        <tr key={item._id}>
                                          <td>
                                            <span className="plus_14_ff">
                                              {item.orderId}
                                            </span>
                                          </td>
                                          <td>
                                            <span className="plus_14_ff">
                                              {item.type == "buy"
                                                ? item.buyername
                                                : item.sellername}
                                              {/* {item.sellername} */}
                                            </span>
                                          </td>
                                          <td>
                                            <span className="plus_14_ff">
                                              {item.pair}
                                            </span>
                                          </td>
                                          <td>
                                            <span className="plus_14_ff">
                                              {item.type}
                                            </span>
                                          </td>
                                          <td>
                                            <span className="plus_14_ff">
                                              {item.askPrice}
                                            </span>
                                          </td>
                                          <td>
                                            <span className="plus_14_ff">
                                              {item.askAmount}
                                            </span>
                                          </td>
                                          <td>
                                            <span className="plus_14_ff">
                                              {item.total}
                                            </span>
                                          </td>
                                          <td>
                                            <span className="plus_14_ff">
                                              {parseFloat(
                                                item.sell_fee
                                              ).toFixed(4)}
                                              {/* {item.sell_fee} */}
                                            </span>
                                          </td>
                                          <td>
                                            <span className="plus_14_ff">
                                              {Moment(item.created_at).format(
                                                "lll"
                                              )}
                                            </span>
                                          </td>
                                        </tr>
                                      )
                                    )
                                  ) : (
                                    <tr>
                                      <td colSpan={9}>
                                        <div className="empty_data">
                                          <div className="plus_14_ff">
                                            No Records Found
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                  {UsersdataOrdersref.current.length > 0 ? (
                                    <tr className="text-center">
                                      <td colSpan="9">
                                        <div className="paginationcss">
                                          <ReactPaginate
                                            previousLabel={"<"}
                                            nextLabel={">"}
                                            breakLabel={"..."}
                                            pageCount={totalPagesOrders}
                                            forcePage={currentPage - 1}
                                            marginPagesDisplayed={1}
                                            pageRangeDisplayed={2}
                                            onPageChange={handlePageClickOrders}
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
                      <div
                        class={`${
                          historyStateref.current === "OpenHistory"
                            ? "show active"
                            : ""
                        } tab-pane fade`}
                        id="nav-profile"
                        role="tabpanel"
                        aria-labelledby="nav-profile-tab"
                      >
                        <div className="my-5 trans-table">
                          <div class="table-responsive">
                            <table className="w_100">
                              <thead className="trans-head">
                                <tr>
                                  <th>orderId</th>
                                  <th>UserName</th>
                                  <th>Pair</th>
                                  <th>Type</th>
                                  <th>Side</th>
                                  <th>Amount</th>
                                  <th>Price</th>
                                  <th>Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Usersdataref.current.length > 0 ? (
                                  Usersdataref.current.map((item, i) => (
                                    <tr key={item._id}>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.orderId}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.username}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.pairName}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.ordertype}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.tradeType}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.amount}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.price}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {Moment(item.createddate).format(
                                            "lll"
                                          )}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={8}>
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
                                    <td colSpan="8">
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
                            </table>
                          </div>
                        </div>
                      </div>
                      <div
                        class={`${
                          historyStateref.current === "CancelHistory"
                            ? "show active"
                            : ""
                        } tab-pane fade`}
                        id="nav-contact"
                        role="tabpanel"
                        aria-labelledby="nav-contact-tab"
                      >
                        <div className="my-5 trans-table">
                          <div className="table-responsive">
                            <table className="w_100">
                              <thead className="trans-head">
                                <tr>
                                  <th>orderId</th>
                                  <th>UserName</th>
                                  <th>Pair</th>
                                  <th>Type</th>
                                  <th>Side</th>
                                  <th>Amount</th>
                                  <th>Price</th>
                                  <th>Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {UsersdataCancelref.current.length > 0 ? (
                                  UsersdataCancelref.current.map((item, i) => (
                                    <tr>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.orderId}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.username}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.pairName}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.ordertype}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.tradeType}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.amount}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.price}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          {item.createddate}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={8}>
                                      <div className="empty_data">
                                        <div className="plus_14_ff">
                                          No Records Found
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                                {UsersdataCancelref.current.length > 0 ? (
                                  <tr className="text-center">
                                    <td colSpan="8">
                                      <div className="paginationcss">
                                        <ReactPaginate
                                          previousLabel={"<"}
                                          nextLabel={">"}
                                          breakLabel={"..."}
                                          pageCount={totalPagesCancel}
                                          marginPagesDisplayed={1}
                                          pageRangeDisplayed={2}
                                          onPageChange={handlePageClickCancel}
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
                            </table>
                          </div>
                        </div>
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

export default UserTrade;
