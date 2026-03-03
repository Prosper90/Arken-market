import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import Moment from "moment";
import ReactPaginate from "react-paginate";
import { getMethod, postMethod } from "../core/service/common.api";
import useState from "react-usestateref";
import apiService from "../core/service/detail";

function P2Porders() {
    const [historyState, setHistoryState, historyStateref] =
    useState("OrderHistory");

    const [UsersdataOrders, setUsersdataOrders, UsersdataOrdersref] = useState(
        []
      );
      const [filterKeywordOrders, setFilterKeywordOrders] = useState("");
      const [currentPageOrders, setCurrentPageOrders] = useState(1);
      const [totalPagesOrders, setTotalPagesOrders] = useState(0);    

    const [Usersdata, setUsersdata, Usersdataref] = useState([]);
    const [filterKeyword, setFilterKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const handleHistory = async (value) => {
        setHistoryState(value);
      };
      
      useEffect(() => {
        getOrdersHistory(currentPageOrders,filterKeywordOrders);
      }, [currentPageOrders,filterKeywordOrders]);

      useEffect(() => {
        getConfirmOrders(currentPage,filterKeyword);
      }, [currentPage,filterKeyword]);

      const getOrdersHistory = async (page = 1, keyword = "") => {
        var datas = {
            apiUrl: apiService.getP2Porders,
            payload: { page, limit: 5,filterKeyword: keyword  },
          };
          var response = await postMethod(datas);
          if (response.status) {
            setUsersdataOrders(response.data);
            // setTotalPages(response.data.length/5);
            // setCurrentPage(response.currentPage);
            setTotalPagesOrders(response.totalPages);
            setCurrentPageOrders(response.currentPage);
          } else {
            setUsersdataOrders([]);
          }
      }

      const getConfirmOrders = async (page = 1, keyword = "") => {
        var datas = {
            apiUrl: apiService.getP2PconfirmOrders,
            payload: { page, limit: 5,filterKeyword: keyword  },
          };
          var response = await postMethod(datas);
          if (response.status) {
            setUsersdata(response.data);
            // setTotalPages(response.data.length/5);
            // setCurrentPage(response.currentPage);
            setTotalPages(response.totalPages);
            setCurrentPage(response.currentPage);
          } else {
            setUsersdata([]);
          }
      }

      const handleFilterChange = (e) => {
        setFilterKeywordOrders(e.target.value);
        setCurrentPageOrders(1);
      };

      const handleFilterChangeConfirm = (e) => {
        setFilterKeyword(e.target.value);
        setCurrentPage(1);
      };

      const handlePageClick = (data) => {
        const selectedPage = data.selected + 1;
        setCurrentPageOrders(selectedPage);
      };

      const handlePageClickConfirm = (data) => {
        const selectedPage = data.selected + 1;
        setCurrentPage(selectedPage);
      };

  return (
    <div>
         <div className="container-fluid">
         <div className="row">
         <div className="col-lg-2 px-0">
            <Sidebar />
          </div>
          <div className="col-lg-10 px-0">
          <div className="pos_sticky">
              <Sidebar_2 />
            </div>
            <div className="px-4 transaction_padding_top">
            <div className="px-2 my-4 transaction_padding_top tops">
                 <div className="headerss">
                  <span className="dash-head">Users P2P History </span>
                  <div>
                    {historyStateref.current == "OrderHistory"? (
                    <input
                      className="filters"
                      placeholder="Enter OrderId to filter"
                      value={filterKeywordOrders}
                      onChange={handleFilterChange}
                    />
                 ) : (
                        <input
                        className="filters"
                        placeholder="Enter OrderId to filter"
                        value={filterKeyword}
                        onChange={handleFilterChangeConfirm}
                        />
                    )}
                  </div>
                </div>
                <div className="">
                <nav>
                    <div
                      class="nav nav-tabs history_main_nav"
                      id="nav-tab"
                      role="tablist"
                    >
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
                        Orders History
                      </span>
                      <span
                        class={
                          historyStateref.current == "ConfirmHistory"
                            ? "nav-link active"
                            : "nav-link"
                        }
                        id="nav-profile-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#nav-profile"
                        role="tab"
                        aria-controls="nav-profile"
                        aria-selected="false"
                        onClick={() => handleHistory("ConfirmHistory")}
                      >
                      Confirm Orders
                      </span>
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
                      <div class="table-responsive my-5 trans-table">
                        <table className="w_100">
                          <thead className="trans-head">
                            <tr>
                              <th>OrderId</th>
                              <th>Email</th>
                              <th>From</th>
                              <th>To</th>
                              <th>Amount</th>
                              <th>Price</th>
                              <th>From limit</th>
                              <th>To limit</th>
                              <th>Available quantity</th>
                              <th>Order Type</th>
                              <th>Order Status</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {UsersdataOrdersref.current.length > 0 ? (
                              UsersdataOrdersref.current.map((item, i) => (
                                <tr key={item._id}>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.orderId}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.email}
                                    </span>
                                  </td>
                                  <td>
                                  <span className="plus_14_ff">
                                      {item.fromCurrency}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.toCurrency}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.totalAmount}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.price}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.fromLimit}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.toLimit}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.available_qty}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.orderType}
                                    </span>
                                  </td>
                                  <td>
                                    {item.order_status == "processing" ? (
                                    <span className="plus_14_ff" style={{
                                        color:"yellow"
                                    }}>
                                    {item.order_status}
                                  </span>
                                    ) : item.order_status == "pending" ? (
                                        <span className="plus_14_ff" style={{
                                            color:"orange"
                                        }}>
                                        {item.order_status}
                                      </span>
                                    ) : item.order_status == "cancelled" ? (
                                        <span className="plus_14_ff" style={{
                                            color:"red"
                                        }}>
                                        {item.order_status}
                                      </span>
                                    ) : (
                                        <span className="plus_14_ff" style={{
                                            color:"green"
                                        }}>
                                        {item.order_status}
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {Moment(item.createdAt).format("lll")}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={12}>
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
                                <td colSpan="12">
                                  <div className="paginationcss">
                                    <ReactPaginate
                                      previousLabel={"<"}
                                      nextLabel={">"}
                                      breakLabel={"..."}
                                      pageCount={totalPagesOrders}
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

                    <div
                      class={`${
                        historyStateref.current === "ConfirmHistory"
                          ? "show active"
                          : ""
                      } tab-pane fade`}
                      id="nav-profile"
                      role="tabpanel"
                      aria-labelledby="nav-profile-tab"
                    >
                      <div class="table-responsive my-5 trans-table">
                        <table className="w_100">
                          <thead className="trans-head">
                            <tr>
                              <th>OrderId</th>
                              <th>From</th>
                              <th>To</th>
                              <th>Type</th>
                              <th>Price</th>
                              <th>Payment Type</th>
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
                                      {item.fromUser}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.toUser}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.type}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.price}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.paymentType}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {Moment(item.createdDate).format("lll")}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7}>
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
                                <td colSpan="7">
                                  <div className="paginationcss">
                                    <ReactPaginate
                                      previousLabel={"<"}
                                      nextLabel={">"}
                                      breakLabel={"..."}
                                      pageCount={totalPages}
                                      marginPagesDisplayed={1}
                                      pageRangeDisplayed={2}
                                      onPageChange={handlePageClickConfirm}
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
            </div>
         </div>
    </div>
  )
}

export default P2Porders;