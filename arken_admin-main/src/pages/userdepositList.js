import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import Moment from "moment";
import ReactPaginate from "react-paginate";
import { getMethod,postMethod } from "../core/service/common.api";
import useState from "react-usestateref";
import apiService from "../core/service/detail";

function Dashboard() {
  const [depositData, setdepositData, depositDataref] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // useEffect(() => {
  //   getUserDetails(currentPage);
  // }, [currentPage]);

  useEffect(() => {
    getfiatdeposit(currentPage, filterKeyword);
  }, [currentPage, filterKeyword]);
 
   const getfiatdeposit = async (page) =>{
     var datas = {
       apiUrl: apiService.getfiatdeposit,
       payload: { page, limit: 5,filterKeyword: filterKeyword  },
     };
       var response = await postMethod(datas);
         // console.log(response, "=-=-=-=response=-=-=");
         if (response.status) {
            setdepositData(response.data);
            setTotalPages(response.pagination.totalPages);
            setCurrentPage(response.pagination.currentPage);
         }

    }
  const handleFilterChange = (e) => {
    setFilterKeyword(e.target.value);
    setCurrentPage(1);
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    setCurrentPage(selectedPage);
    // getUserDetails(selectedPage);
  };

  // const filteredUsers = Usersdata.filter((user) =>
  //   user.username.toLowerCase().includes(filterKeyword)
  // );

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
                  <span className="dash-head"> Fiat Deposit History </span>
                  <div>
                    {/* <input
                      className="filters"
                      placeholder="Enter Username to filter"
                      value={filterKeyword}
                      onChange={handleFilterChange}
                    /> */}
                  </div>
                </div>
                <div class="table-responsive my-5  trans-table ">
                  <table className="w_100">
                    <thead className="trans-head">
                      <tr>
                        <th>S.No</th>
                        <th>Username</th>
                        <th>Transaction Id </th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Fees</th>
                        <th>Transfer Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depositDataref.current.length > 0 ? (
                        depositDataref.current.map((item, i) => (
                          <tr key={item._id}>
                            <td>
                              <span className="plus_14_ff">{i + 1}</span>
                            </td>
                            <td>
                              <span className="plus_14_ff">
                                {item.displayname}
                              </span>
                            </td>
                            <td>
                              <span className="plus_14_ff">{item.txId?.length >10 ?`${item.txId.substring(0, 10)}...`:item.txId}</span>
                            </td>
                            <td>
                              <span className="plus_14_ff">
                                {item.tx_type}
                              </span>
                            </td>
                            <td>
                              <label className="plus_14_ff">
                                {item.amount}
                              </label>
                            </td>
                            <td>
                              <label className="plus_14_ff">
                                {item.fees}
                              </label>
                            </td>
                            <td>
                              <label className="plus_14_ff">
                                {item.receive_amount}
                              </label>
                            </td>
                            <td>
                            {item.status =="Completed" ?
                             <label className="plus_14_ff colo">
                             {item.status}
                           </label>
                            :item.status =="Failed" ?
                            <label className="plus_14_ff dep-error-text ">
                            {item.status}
                          </label>:
                           <label className="plus_14_ff pendingcolo ">
                           {item.status}
                         </label>
                            }
                             
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
                          <td colSpan={7}>
                            <div className="empty_data my-4">
                              <div className="plus_14_ff">No Records Found</div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {depositDataref.current.length > 0 ? (
                                              <tr className="text-center">
                                              <td colSpan="7">
                                                <div className="paginationcss">
                                                  <ReactPaginate
                                                    previousLabel={"<"}
                                                    nextLabel={">"}
                                                    breakLabel={"..."}
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
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
