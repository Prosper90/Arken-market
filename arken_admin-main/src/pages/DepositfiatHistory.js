import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import Moment from "moment";
import ReactPaginate from "react-paginate";
import { getMethod, postMethod } from "../core/service/common.api";
import useState from "react-usestateref";
import apiService from "../core/service/detail";
import { Box, Modal } from "@material-ui/core";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";

function Dashboard() {
  const [Usersdata, setUsersdata, Usersdataref] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [depositID, setDepositID] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [rejectopen, setRejectopen] = useState(false);
  const [open, setOpen] = useState(false);
  const [rejectError, setRejectError] = useState("");

  const [rejectloader, setRejectLoader] = useState(false);
  const [confirmloader, setconfirmLoader] = useState(false);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setRejectopen(false);
    setRejectReason("");
  };

  // useEffect(() => {
  //   getUserDetails(currentPage);
  // }, [currentPage]);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  const [buttonLoader, setButtonLoader] = useState(false);

  useEffect(() => {
    getUserDetails(currentPage, filterKeyword);
  }, [currentPage, filterKeyword]);

  const getUserDetails = async (page = 1, keyword = "") => {
    // setButtonLoader(true);
    var datas = {
      apiUrl: apiService.getdepositinfo,
      payload: { page, limit: 5, filterKeyword: keyword },
    };
    var response = await getMethod(datas);
    // console.log(response, "=-=-=-=response=-=-=");
    if (response.status) {
      // setButtonLoader(false);
      setUsersdata(response.data);
      // setTotalPages(response.data.length/5);
      // setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } else {
      // setButtonLoader(false);
      setUsersdata([]);
    }
  };

  const handleFilterChange = (e) => {
    setFilterKeyword(e.target.value);
    setCurrentPage(1);
  };
  const handleVerify = async (id) => {
    await handleOpen();
    setDepositID(id);
  };
  const handleReject = async (id) => {
    await handleOpen();
    setDepositID(id);
    setRejectopen(true);
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    setCurrentPage(selectedPage);
    // getUserDetails(selectedPage);
  };

  const confirmDeposit = async (e) => {
    e.preventDefault();

    try {
      if (depositID) {
        setconfirmLoader(true);
        const bankData = {
          depositId: depositID,
          verifyStatus: 1,
        };

        const requestData = {
          apiUrl: apiService.verifyDeposit,
          payload: bankData,
        };
        const response = await postMethod(requestData);

        if (response.status === true) {
          toast.success(response.message);
          getUserDetails();
          setDepositID("");
          setOpen(false);
          setconfirmLoader(false);
        } else {
          toast.error(response.message);
          getUserDetails();
          setDepositID("");
          setOpen(false);
          setconfirmLoader(false);
        }
      } else {
        toast.error("Please fill all required fields.");
      }
    } catch (error) {
      console.error("Error adding bank:", error);
      handleClose();
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleRejectAdm = async (e) => {
    e.preventDefault();

    try {
      if (!rejectReason.trim()) {
        setRejectError("Reason for rejection is required.");
        return;
      }
      setRejectLoader(true);

      const bankData = {
        depositId: depositID,
        verifyStatus: 2,
        reason: rejectReason,
      };

      const requestData = {
        apiUrl: apiService.verifyDeposit,
        payload: bankData,
      };

      const response = await postMethod(requestData);
      if (response.status === true) {
        toast.success(response.message);
        getUserDetails();
        setDepositID("");
        setOpen(false);
        setRejectopen(false);
        setRejectReason("");
        setRejectLoader(false);
      } else {
        toast.error(response.message);
        getUserDetails();
        setDepositID("");
        setOpen(false);
        setRejectopen(false);
        setRejectReason("");
        setRejectLoader(false);
      }
    } catch (error) {
      console.error("Error adding bank:", error);
      handleClose();
      toast.error("Something went wrong. Please try again.");
    }
  };

  // const filteredUsers = Usersdata.filter((user) =>
  //   user.username.toLowerCase().includes(filterKeyword)
  // );

  return (
    <div>
      {buttonLoader == true ? (
        <div className="loadercss">
          <ScaleLoader
            height={50} width={5}
            color="#dfc822"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      ) : (
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
                    <span className="dash-head">Fiat Deposit Request </span>
                    {/* <div>
                    <input
                      className="filters"
                      placeholder="Enter Username to filter"
                      value={filterKeyword}
                      onChange={handleFilterChange}
                    />
                  </div> */}
                  </div>
                  <div className="table-responsive my-5 trans-table">
                    <table className="w_100">
                      <thead className="trans-head">
                        <tr>
                          <th>S.No</th>
                          <th>Username</th>
                          <th>Transaction Id</th>
                          <th>Transaction Type</th>
                          <th>Amount</th>
                          <th>Fees</th>
                          <th>Transaction Amount</th>
                          <th>Proof</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Usersdataref?.current?.length > 0 ? (
                          Usersdataref?.current?.map((item, i) => (
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
                                <span className="plus_14_ff txntype_maxwidth">
                                  {item.txId}
                                </span>
                              </td>
                              <td>
                                <span className="plus_14_ff ">
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
                                <label className="plus_14_ff">
                                  <a href={item.tx_img} target="_blank">
                                    <i class="fa-solid fa-eye"></i>
                                  </a>
                                </label>
                              </td>
                              <td>
                                <label className="plus_14_ff">
                                  {Moment(item.createdAt).format("lll")}
                                </label>
                              </td>
                              <td className="d-flex">
                                {/* Action Buttons */}
                                <button
                                  className="btn btn_green btn-success "
                                  onClick={() => handleVerify(item._id)}
                                >
                                  Approve
                                  {/* <i class="fa-solid fa-circle-check"></i> */}
                                </button>
                                <button
                                  className="btn btn_red btn-danger"
                                  onClick={() => handleReject(item._id)}
                                >
                                  Reject
                                  {/* <i class="fa-solid fa-circle-xmark"></i> */}
                                </button>
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

                        {Usersdataref?.current?.length > 0 ? (
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

                  <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="email-popup-modal-title"
                    aria-describedby="email-popup-modal-description"
                  >
                    <Box sx={style} className="modals_support">
                      <div className="container">
                        <div className="row">
                          <div className="col-lg-12 support-modal">
                            <div>
                              <div className="support-left-flex">
                                <h5 className="support-modal-title">
                                  {rejectopen
                                    ? "Reject Deposit"
                                    : "Confirm Deposit"}
                                </h5>
                                <i
                                  className="fa-regular fa-circle-xmark cross_circle"
                                  onClick={() => handleClose()}
                                ></i>
                              </div>

                              <div className="support-modal-tops">
                                {rejectopen ? (
                                  <div className="mb-3 reject_Reason">
                                    <label
                                      htmlFor="rejectReason"
                                      className="form-label fw-bold"
                                    >
                                      Reason for rejection:
                                    </label>
                                    <textarea
                                      id="rejectReason"
                                      className={`form-control  form_control_textarea${
                                        rejectError ? "is-invalid" : ""
                                      }`}
                                      rows="4"
                                      placeholder="Type your reason here..."
                                      value={rejectReason}
                                      onChange={(e) => {
                                        setRejectReason(e.target.value);
                                        setRejectError("");
                                      }}
                                      style={{ resize: "none" }}
                                    ></textarea>
                                    {rejectError && (
                                      <div className="text-danger mt-1">
                                        {rejectError}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <h6>
                                    Are you sure you want to confirm the
                                    Deposit?
                                  </h6>
                                )}
                              </div>

                              <div className="support-modal-tops d-flex justify-content-center w-100">
                                <div className="d-flex justify-content-center gap-10">
                                  <button
                                    className="action_btn_closed"
                                    onClick={() => handleClose()}
                                  >
                                    Cancel
                                  </button>

                                  {rejectopen ? (
                                    rejectloader == true ? (
                                      <button className="action_btn_closed">
                                        Loading...
                                      </button>
                                    ) : (
                                      <button
                                        className="action_btn_closed"
                                        onClick={(e) => handleRejectAdm(e)}
                                      >
                                        Submit
                                      </button>
                                    )
                                  ) : confirmloader == true ? (
                                    <button className="action_btn_closed">
                                      loading...
                                    </button>
                                  ) : (
                                    <button
                                      className="action_btn_closed"
                                      onClick={(e) => confirmDeposit(e)}
                                    >
                                      Confirm
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Box>
                  </Modal>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
