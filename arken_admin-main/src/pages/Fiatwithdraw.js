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

function Dashboard() {
    const [Usersdata, setUsersdata, Usersdataref] = useState([]);
    const [filterKeyword, setFilterKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [depositID, setDepositID] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [buttonLoader, setbuttonLoader] = useState(false);
    const [rejectopen, setRejectopen] = useState(false);
    const [open, setOpen] = useState(false);
    const [rejectError, setRejectError] = useState("");
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


    useEffect(() => {
        getUserDetails(currentPage, filterKeyword);
    }, [currentPage, filterKeyword]);

    const getUserDetails = async (page = 1, keyword = "") => {
        var datas = {
            apiUrl: apiService.getfiatWithdraw,
            payload: { page, limit: 5, filterKeyword: keyword.trim() }, // Ensure no extra spaces
        };
        var response = await getMethod(datas);
        console.log("API Response:", response); // Debugging purpose

        if (response.status) {
            setUsersdata(response.data);
            setTotalPages(response.totalPages);
            setCurrentPage(response.currentPage);
        } else {
            setUsersdata([]); // Ensure empty data is set correctly
        }
    };



    const handleFilterChange = (e) => {
        setFilterKeyword(e.target.value); // Allow input without trimming immediately
        setCurrentPage(1);
    };


    const handleVerify = async (id) => {
        await handleOpen()
        setDepositID(id)
    };
    const handleReject = async (id) => {
        await handleOpen()
        setDepositID(id)
        setRejectopen(true)
    };
    useEffect(() => {
        if (!depositID) {
            getUserDetails(currentPage, filterKeyword);
        }
    }, [depositID]);

    const handlePageClick = (data) => {
        const selectedPage = data.selected + 1;
        setCurrentPage(selectedPage);
        // getUserDetails(selectedPage);
    };

    const confirmDeposit = async (e) => {
        e.preventDefault();

        try {
            if (depositID) {

                const bankData = {
                    withdrawId: depositID,
                    verifyStatus: 1,
                }

                const requestData = {
                    apiUrl: apiService.verifyWithdraw,
                    payload: bankData,
                };

                setbuttonLoader(true);
                const response = await postMethod(requestData);
                setbuttonLoader(false);

                if (response.status === true) {
                    toast.success(response.message);
                    setDepositID('')
                    await getUserDetails(currentPage, filterKeyword);
                    setOpen(false)
                } else {
                    toast.error(response.message);

                    setDepositID('')
                    await getUserDetails(currentPage, filterKeyword);
                    setOpen(false)
                }
            } else {
                toast.error("Please fill all required fields.");
            }
        } catch (error) {
            console.error("Error adding bank:", error);
            setbuttonLoader(false);
            handleClose()
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

            const bankData = {
                withdrawId: depositID,
                verifyStatus: 2,
                reason: rejectReason
            }

            const requestData = {
                apiUrl: apiService.verifyWithdraw,
                payload: bankData,
            };

            setbuttonLoader(true);
            const response = await postMethod(requestData);
            setbuttonLoader(false);

            if (response.status === true) {
                toast.success(response.message);
                setDepositID('')
                await getUserDetails(currentPage, filterKeyword);
                setOpen(false)
                setRejectopen(false);
                setRejectReason("");
            } else {
                toast.error(response.message);
                setDepositID('')
                await getUserDetails(currentPage, filterKeyword);
                setOpen(false);
                setRejectopen(false);
                setRejectReason("");
            }
        } catch (error) {
            console.error("Error adding bank:", error);
            setbuttonLoader(false);
            handleClose()
            toast.error("Something went wrong. Please try again.");
        }
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
                                    <span className="dash-head">Fiat Withdraw Request </span>
                                    <div>
                                        <input
                                            className="filters"
                                            placeholder="Enter Username to filter"
                                            value={filterKeyword}
                                            onChange={handleFilterChange}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    getUserDetails(1, filterKeyword); // Trigger search on Enter key
                                                }
                                            }}
                                        />

                                    </div>
                                </div>
                                <div className="table-responsive my-5 trans-table">
                                    <table className="w_100">
                                        <thead className="trans-head">
                                            <tr>
                                                {/* <th>S.No</th> */}
                                                <th>Username</th>
                                                <th>Transaction Type</th>
                                                <th>Account Name</th>
                                                <th>Bank Name/UPI Code</th>
                                                <th>Branch Name</th>
                                                <th>Account Number</th>
                                                <th>IFSC Code</th>
                                                <th>Amount</th>
                                                <th>Fees</th>
                                                <th>Transaction Amount</th>
                                                <th>Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Usersdataref?.current?.length > 0 ? (
                                                Usersdataref?.current?.map((item, i) => (
                                                    <tr key={item._id}>
                                                        {/* <td>
                                                            <span className="plus_14_ff">{i + 1}</span>
                                                        </td> */}
                                                        <td className="three_dots">
                                                            <span className="plus_14_ff ">
                                                                {item.displayname}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="plus_14_ff">{item.tx_type}</span>

                                                        </td>

                                                        <td>
                                                            <span className="plus_14_ff">{item.accname}</span>
                                                        </td>
                                                        <td>
                                                            <span className="plus_14_ff">{item.bankname ? item.bankname : item.upi_code}</span>
                                                        </td>
                                                        <td>
                                                            <span className="plus_14_ff">{item.branch}</span>
                                                        </td>
                                                        <td>
                                                            <span className="plus_14_ff">{item.accnumber}</span>
                                                        </td>
                                                        <td>
                                                            <span className="plus_14_ff">{item.ifsc_code}</span>
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
                                                                {Moment(item.createdAt).format("lll")}
                                                            </label>
                                                        </td>
                                                        <td>
                                                            {/* Action Buttons */}
                                                            <button
                                                                className="btn btn_green"
                                                                onClick={() => handleVerify(item._id)}
                                                            >
                                                                <i class="fa-solid fa-circle-check"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn_red"
                                                                onClick={() => handleReject(item._id)}
                                                            >
                                                                <i class="fa-solid fa-circle-xmark"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={20}>
                                                        <div className="empty_data my-4">
                                                            <div className="plus_14_ff">No Records Found</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}

                                            {Usersdataref?.current?.length > 0 ? (
                                                <tr className="text-center">
                                                    <td colSpan="20">
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
                                                                    ? "Reject Withdraw"
                                                                    : "Confirm Withdraw"}
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
                                                                        className={`form-control  form_control_textarea${rejectError ? "is-invalid" : ""
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
                                                                    Are you sure you want to confirm the Withdraw?
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
                                                                    <button
                                                                        className="action_btn_closed"
                                                                        onClick={(e) => handleRejectAdm(e)}
                                                                    >
                                                                        Submit
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
        </div>
    );
}

export default Dashboard;
