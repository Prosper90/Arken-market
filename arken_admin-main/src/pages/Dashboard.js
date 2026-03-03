import React, { useEffect } from "react";
import useState from "react-usestateref";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import ReactPaginate from "react-paginate";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import Moment from "moment";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import { jwtDecode } from "jwt-decode";

function Dashboard() {
  useEffect(() => {
    getUserDetails();
    // checkTokenExpiry();
  }, []);

  const navigate = useNavigate();

  // const checkTokenExpiry = () => {
  //   const token = sessionStorage.getItem("Voltrix_token");

  //   if (token) {
  //     const decodedToken = jwtDecode(token);
  //     const currentTime = Date.now() / 1000; // in seconds
  //     console.log(decodedToken.exp,"=-=-decodedToken.exp < current time",currentTime);
  //     if (decodedToken.exp < currentTime) {
  //       // Token is expired, log out the user
  //       sessionStorage.clear(); // Clear all session data
  //       toast.error("Session expired, please log in again");
  //       navigate("/"); // Redirect to login page
  //     }
  //   } else {
  //     navigate("/");
  //   }
  // };

  const [logindata, setlogindata, logindataref] = useState("");
  const [userdata, setuserdata, userdataref] = useState("");
  console.log(userdataref,'userdataref==')
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    getDashboardDetails(currentPage);
  }, [currentPage]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };

  const getDashboardDetails = async (page = 1) => {
    var datas = {
      apiUrl: apiService.adminlogg,
      payload: { page, limit: 5 },
    };
    // setLoader(true);
    var response = await postMethod(datas);
    // setLoader(false);
    console.log(response, "=-=-=-=response=-=-=");
    if (response.status) {
      setlogindata(response.Message);
      logindataref.current = response.Message;
      setTotalPages(response.totalPages);
    } else {
      setlogindata([]);
    }
  };

  const getUserDetails = async () => {
    var datas = {
      apiUrl: apiService.dashboardstats,
    };
    setLoader(true);
    var response = await getMethod(datas);
    setLoader(false);
    console.log(response, "=-=-=-=response=-=-=");
    if (response.status) {
      // setreferralUser(responce.data.length);
      setuserdata(response.data);
    } else {
      setuserdata("");
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

              {loader == true ? (
                <SkeletonwholeProject />
              ) : (
                <div
                  className="px-4 transaction_padding_top"
                  style={{ paddingTop: "50px" }}
                >
                  <div className="ycho_inner mt-5 mb-md-4 mb-3">
                    <span className="dash-head">Dashboard</span>
                  </div>
                  <div className="row g-2">
                    <div className="col-sm-4 mt-2 mt-sm-3">
                      <div className="dash_frst_scnd">
                        <div className="hero_subhead justify-content-center align-items-center">
                          <span className="pls_16_dd"> Total Users </span>
                          <span className="ychose_in_hed">
                            {userdataref && userdataref.current.totalUsers ? userdataref.current.totalUsers : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4 mt-2 mt-sm-3">
                      <div className="dash_frst_thrd">
                        <div className="hero_subhead justify-content-center align-items-center">
                          <span className="pls_16_dd"> Total Bets</span>
                          <span className="ychose_in_hed">
                            {userdataref && userdataref.current.totalBets ? userdataref.current.totalBets : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4 mt-2 mt-sm-3">
                      <div className="dash_frst_frth">
                        <div className="hero_subhead justify-content-center align-items-center">
                          <span className="pls_16_dd"> Active Bets </span>
                          <span className="ychose_in_hed">
                            {" "}
                            {userdataref && userdataref.current.activeBets ? userdataref.current.activeBets : 0}{" "}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4 mt-2 mt-sm-3">
                      <div className="dash_frst_frth">
                        <div className="hero_subhead justify-content-center align-items-center">
                          <span className="pls_16_dd"> Completed Bets </span>
                          <span className="ychose_in_hed">
                            {" "}
                            {userdataref && userdataref.current.completedBets ? userdataref.current.completedBets : 0 }{" "}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4 mt-2 mt-sm-3">
                      <div className="dash_frst_frth">
                        <div className="hero_subhead justify-content-center align-items-center">
                          <span className="pls_16_dd"> Highest Win rate </span>
                          <span className="ychose_in_hed">
                            {" "}
{userdataref?.current?.highestWinUser?.firstName || ""}

                          </span>
                        </div>
                      </div>
                    </div>
                    {/* <div className="col-sm-4 mt-2 mt-sm-3">
                      <div className="dash_frst_frth">
                        <div className="hero_subhead justify-content-center align-items-center">
                          <span className="pls_16_dd"> KOL Predictions </span>
                          <span className="ychose_in_hed">
                            {" "}
                            {userdataref.current.withdrawCount}{" "}
                          </span>
                        </div>
                      </div>
                    </div> */}
                  </div>

                    {/* <div className="row g-2 mt-sm-2 mt-lg-3">
                      <div className="col-sm-4 mt-2 mt-sm-3">
                        <div className="dash_frst_scnd">
                          <div className="hero_subhead justify-content-center align-items-center">
                            <span className="pls_16_dd"> Open Orders </span>
                            <span className="ychose_in_hed">
                              {userdataref.current.openOrdersCount}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-4 mt-2 mt-sm-3">
                        <div className="dash_frst_thrd">
                          <div className="hero_subhead justify-content-center align-items-center">
                            <span className="pls_16_dd"> Cancelled Orders</span>
                            <span className="ychose_in_hed">
                              {userdataref.current.cancelledCount}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-4 mt-2 mt-sm-3">
                        <div className="dash_frst_frth">
                          <div className="hero_subhead justify-content-center align-items-center">
                            <span className="pls_16_dd"> Completed Orders </span>
                            <span className="ychose_in_hed">
                              {" "}
                              {userdataref.current.ordersCount}{" "}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div> */}

                  <div className="px-2 my-4 transaction_padding_top">
                    <span className="dash-head">Admin Login History</span>
                    <div className="my-4 trans-table">
                      <div className="table-responsive">
                        <table className="w_100">
                          <thead className="trans-head">
                            <tr>
                              <th>SI.NO</th>
                              <th>Date & Time</th>
                              <th>Browser</th>
                              <th>Ip-Address</th>
                              {/* <th>Device</th> */}
                              <th>Os</th>
                            </tr>
                          </thead>
                          <tbody>
                            {logindataref.current &&
                            logindataref.current.length > 0 ? (
                              logindataref.current.map((item, i) => (
                                <tr key={i}>
                                  <td>
                                    <span className="plus_14_ff">{i + 1}</span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {Moment(item.createdDate).format("lll")}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.browser}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.ipAddress}
                                    </span>
                                  </td>
                                  {/* <td>
                                    <span className="plus_14_ff">
                                      {item.platform}
                                    </span>
                                  </td> */}
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.OS}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6}>
                                  <div className="empty_data my-4">
                                    <div className="plus_14_ff">
                                      No Records Found
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}

                            {logindataref.current &&
                            logindataref.current.length > 0 ? (
                              <tr className="text-center">
                                <td colSpan="6">
                                  <div className="paginationcss">
                                    <ReactPaginate
                                      previousLabel={"<"}
                                      nextLabel={">"}
                                      breakLabel={"**"}
                                      pageCount={totalPages}
                                      marginPagesDisplayed={1}
                                      pageRangeDisplayed={0}
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
                </div>
              )}
            </div>
          </>
        </div>
      </div>
      {/* )} */}
    </div>
  );
}

export default Dashboard;
