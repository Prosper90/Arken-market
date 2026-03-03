import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import Moment from "moment";
import ReactPaginate from "react-paginate";
import { getMethod,postMethod } from "../core/service/common.api";
import useState from "react-usestateref";
import apiService from "../core/service/detail";
import moment from "moment";
function Userstakehistory() {
  const [stakeData, setstakeData, stakeDataref] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [choosingtype, setchoosingtype, choosingtyperef] = useState("all");

  useEffect(() => {
    getStakingHistory(currentPage);
  }, [currentPage]);

  // const getUserDetails = async (page = 1, keyword = "") => {
  //   var datas = {
  //     apiUrl: apiService.getStakePlansHistoryAdmin,
  //     payload: { FilPerpage: 5, FilPage: pagem },
  //   };
  //   var response = await postMethod(datas);
  //   if (response.status) {
  //     setUsersdata(response.all_data);
  //     setTotalPages(response.stakeDatacount);
  //     setCurrentPage(response.currentPage);
  //   } else {
  //     setUsersdata([]);
  //   }
  // };

  
    const getStakingHistory = async (page) => {
      try {
        var data = {
          apiUrl: apiService.getAllstakingHistory,
          payload: { FilPerpage: 5, FilPage: page, type: "all" },
        };
        var resp = await postMethod(data);
        if (resp.status) {
          setstakeData(resp.data);
          setTotalPages(resp.total);
        }
      } catch (error) {
        // showErrorToast("Please try again later");
      }
    };
  

  const handlePageClick = (data) => {
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
                  <span className="dash-head">User Staking History </span>
                </div>
                <div class="table-responsive my-5  trans-table ">
                  <table className="w_100">
                    <thead className="trans-head">
                      <tr>
                        <th>S.No</th>
                        <th>User Name</th>
                        <th>Currency Name</th>
                        <th>Total Amount</th>
                        <th>Type</th>
                        <th>Total Interest</th>
                        <th>Stake Start Date</th>
                        <th>Stake End Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stakeDataref?.current?.length > 0 ? (
                        stakeDataref?.current?.map((item, i) => {
                          if(item.userId != null)
                          {
                            var get_time = new Date(item.date).getTime();
                            var interest_cycle =
                              item.type == "fixed" ? item.stakingPlan : "";
    
                            var added_date =
                              get_time + +interest_cycle * 24 * 60 * 60 * 1000;
    
                            var claim_date = "";
                            if (item.type == "fixed") {
                              claim_date = item.endDate;
                            } else {
                              claim_date = "-";
                            }
                            var currentDate = new Date().getTime();
                            var stakeEndDate = new Date(item.startDate).getTime();
                            var nextDay = +stakeEndDate + 1000 * 60 * 60 * 24;
                            claim_date = moment(claim_date).format("lll");
                            var cliii=""
                            if(+nextDay < +currentDate){
                            var cliii="false"
                            }else{
                            var cliii="true"
                            }
                          return(
                          <tr key={item._id}>
                            <td>
                              <span className="plus_14_ff">{i + 1}</span>
                            </td>
                             <td>
                              <span className="plus_14_ff">
                             {item.userId.displayname} 
                                        </span>
                                      </td>
                            <td>
                              <span className="plus_14_ff">
                              <img src={item.currencyImage} width="30px" />{" "}
                              {item.stakeCurrencsymbol}
                              </span>
                            </td>
                            <td>
                              <span className="plus_14_ff">
                             {item.stakeAmont} {item.stakeCurrencsymbol}
                                        </span>
                            </td>
                            <td>
                              <span className="plus_14_ff">
                              {item.type == "fixed"
                                ? "fixed"
                                : "flexible"
                              }
                              </span>
                            </td>
                            <td>
                              <label className="plus_14_ff">
                                <p>
                                 {parseFloat(item.totalInterest).toFixed(6)}{" "}
                                    {item.stakeCurrencsymbol}
                                  </p>
                              </label>
                            </td>
                            <td>
                              <label className="plus_14_ff">
                                {moment(item.startDate).format("lll")}
                              </label>
                            </td>
                            <td>
                              <label className="plus_14_ff">
                                {item.endDate?moment(item.endDate).format("lll"):"--"}
                              </label>
                            </td>
                            <td>
                              <label
                                className={`plus_14_ff colo ${
                                  item.status ==0 ||item.status ==1
                                    ? "Active"
                                    : "Completed"
                                }`}
                              >
                                {item.status ==0 ||item.status ==1? "Active" : "Completed"}
                              </label>
                            </td>
                          </tr>
                          )}
                        }
                      )
                      ) : (
                        <tr>
                          <td colSpan={9}>
                            <div className="empty_data my-4">
                              <div className="plus_14_ff">No Records Found</div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {stakeDataref?.current?.length > 0 ? (
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

export default Userstakehistory;
