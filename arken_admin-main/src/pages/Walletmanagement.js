import React, { useEffect, useRef } from "react";
import useState from "react-usestateref";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import ReactPaginate from "react-paginate";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import Sheet from "@mui/joy/Sheet";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import Typography from "@mui/material/Typography";
import { ScaleLoader } from "react-spinners";
import { RxCrossCircled } from "react-icons/rx";
import { Skeleton } from "@mui/material";

function Dashboard() {
  const inputRef = useRef(null);
  const [balance, setBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [walletData, setWalletData, walletDataref] = useState([]);
  const [walletBalance, setWalletBalance] = useState([]);
  const [walletAddress, setWalletAddress] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loader, setloader] = useState(true);
  // useEffect(() => {
  //   fetchWalletList(1);
  // }, []);

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 5;
  useEffect(() => {
    fetchWalletList(currentPage, filterKeyword);
  }, [currentPage, filterKeyword]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [walletData]);

  const fetchWalletList = async (page = 1, keyword = "") => {
    console.log(page);
    try {
      setloader(true);
      var datas = {
        apiUrl: apiService.activatedUserList,
        payload: { page, limit: 5, keyword: keyword },
      };
      var response = await postMethod(datas);
      setloader(false);

      setWalletData(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWalletBalance = async (userId) => {
    try {
      const obj = { userId: userId };
      var datas = {
        apiUrl: apiService.userbalance,
        payload: obj,
      };
      var response = await postMethod(datas);
      setWalletBalance(response.Message);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWalletAddress = async (userId) => {
    try {
      const obj = { userId: userId };
      var datas = {
        apiUrl: apiService.useraddress,
        payload: obj,
      };
      var response = await postMethod(datas);
      var datas1 = {
        apiUrl: apiService.allCurrencyListCrypto,
      };
      var currenciesResponse = await postMethod(datas1);
      setWalletAddress(response.Message);
      setCurrencies(currenciesResponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenDialog = (userId) => {
    console.log(userId, "=-=-userId=--");
    setSelectedUserId(userId);
    fetchWalletBalance(userId);
    setModalType("balance");
    setIsModalOpen(true);
  };

  const handleOpenAddressDialog = (userId) => {
    console.log(userId, "=-=-userId=--");
    setSelectedUserId(userId);
    fetchWalletAddress(userId);
    setModalType("address");
    setIsModalOpen(true);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (value.length === 1 && value.startsWith(" ")) return;
    setFilterKeyword(value);
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    setCurrentPage(selectedPage);
    fetchWalletList(selectedPage);
  };

  // const filteredUsers = walletData.filter((user) =>
  //   user.email.toLowerCase().includes(filterKeyword.toLowerCase())
  // );

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
                    <span className="dash-head">Wallet Management</span>
                    <div className="usr_mng_rgt">
                      <div className="filter_container">
                        <input
                          className="filter_input"
                          placeholder="Search name"
                          value={filterKeyword}
                          ref={inputRef}
                          onChange={handleFilterChange}
                        />{" "}
                        <i className="fa-solid fa-magnifying-glass"></i>
                      </div>
                    </div>
                  </div>
                  <div className="my-5 trans-table">
                    <div class="table-responsive">
                      <table className="w_100">
                        <thead className="trans-head">
                          <tr>
                            <th>S.No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>View Balance</th>
                            <th>View Address</th>
                          </tr>
                        </thead>
                        {loader == true ? (
                          // <tr>
                          //   <td colSpan={5}>
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
                            {walletDataref.current.length > 0 ? (
                              walletDataref.current.map((item, i) => (
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
                                    <span className="plus_14_ff">
                                      {item.email}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff ed-icon-fz">
                                      <i
                                        className="fa-solid fa-eye cursor-pointer"
                                        onClick={() =>
                                          handleOpenDialog(item._id)
                                        }
                                      ></i>
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff ed-icon-fz">
                                      <i
                                        className="fa-solid fa-eye cursor-pointer"
                                        onClick={() =>
                                          handleOpenAddressDialog(item._id)
                                        }
                                      ></i>
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5}>
                                  <div className="empty_data my-4">
                                    <div className="plus_14_ff">
                                      No Records Found
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        )}
                      </table>
                      {walletDataref.current.length > 0 ? (
                        <div className="pagination_outer">
                          <div className="paginationcss">
                            <ReactPaginate
                              previousLabel={"<"}
                              nextLabel={">"}
                              breakLabel={"..."}
                              pageCount={totalPages}
                              marginPagesDisplayed={1}
                              pageRangeDisplayed={2}
                              onPageChange={handlePageClick}
                              forcePage={currentPage - 1}
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
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
            {/* // )} */}
          </div>

          <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            className="wallet_mng_modal"
          >
            {modalType === "balance" ? (
              <Sheet
                variant="outlined"
                sx={{
                  minWidth: 500,
                  borderRadius: "md",
                  p: 3,
                  boxShadow: "lg",
                }}
                className="wallet_mng_sheet"
              >
                {/* <ModalClose variant="plain" sx={{ m: 1 }} /> */}
                {/* <Typography
                  component="h2"
                  id="modal-title"
                  level="h4"
                  textColor="inherit"
                  fontWeight="lg" 
                  mb={1}
                ></Typography> */}
                <div id="modal-desc">
                  <div className="wlt_mng_top">
                    <h3 className="connect_a_connect_text mb-0">
                      Wallet Balance Details
                    </h3>
                    <RxCrossCircled
                      className="wlt_mng_icon"
                      onClick={() => setIsModalOpen(false)}
                    />
                  </div>
                  <div className="ycho_inner_model wlt_mng_desc_box">
                    {walletBalance.length > 0 ? (
                      walletBalance.map((item, index) => (
                        <div
                          key={index}
                          className="d-flex my-2 justify-content-between align-items-center"
                        >
                          <img
                            width="26px"
                            src={item.image}
                            alt={item.currencyname}
                          />
                          <p className="text-white mb-0 ml-4">
                            {item.currencyname} : {item.balance}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center w-100 mt-4">
                        <p className="text-white">No data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </Sheet>
            ) : (
              <Sheet
                variant="outlined"
                sx={{
                  minWidth: 500,
                  borderRadius: "md",
                  p: 3,
                  boxShadow: "lg",
                }}
                className="wallet_mng_sheet"
              >
                {/* <ModalClose variant="plain" sx={{ m: 1 }} />
                <Typography
                  component="h2"
                  id="modal-title"
                  level="h4"
                  textColor="inherit"
                  fontWeight="lg"
                  mb={1}
                ></Typography> */}
                <div id="modal-desc">
                  <div className="wlt_mng_top">
                    <h3 className="connect_a_connect_text mb-0">
                      Wallet Address Details
                    </h3>
                    <RxCrossCircled
                      className="wlt_mng_icon"
                      onClick={() => setIsModalOpen(false)}
                    />
                  </div>
                  <div className="ycho_inner_model wlt_mng_desc_box">
                    {walletAddress.length > 0 ? (
                      walletAddress.map((item, index) => (
                        <div
                          key={index}
                          className="d-flex my-2 justify-content-between align-items-center"
                        >
                          <img
                            width="26px"
                            src={item.image}
                            alt={item.currencyname}
                          />
                          <p className="text-white mb-0 mx-3">
                            {item.currencyname} : {item.address}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center w-100 mt-4">
                        <p className="text-white">No data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </Sheet>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
