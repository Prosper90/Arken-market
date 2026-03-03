import React, { useEffect, useRef, useState } from 'react'
import Sidebar from "../Sidebar";
import SkeletonwholeProject from "../SkeletonwholeProject";
import Sidebar_2 from "../Nav_bar";
import { getMethod, postMethod } from "../../core/service/common.api";
import apiService from "../../core/service/detail";
import ReactPaginate from "react-paginate";
import Moment from "moment";
import FromDatePicker from "../fromdatepicker";
import Box from "@mui/material/Box";
import Select from "react-select";

import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import ToDatePicker from "../todatepicker";
import { FaFilter } from "react-icons/fa6";
import { toast } from "react-toastify";
import CsvDownloader from "react-csv-downloader";
import { MdAddCircle } from "react-icons/md";


const customStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "#0b0808ff",
    padding: "0 4px",
    color: "#000",
    boxShadow: "none",
    outline: "none",
    minHeight: "44px",
    height: "44px",
  }),

  valueContainer: (styles) => ({
    ...styles,
    height: "44px",
    padding: "0 8px",
    display: "flex",
    alignItems: "center",
  }),

  input: (styles) => ({
    ...styles,
    margin: "0px",
    padding: "0px",
    color: "#fff",
  }),

  option: (styles, { isFocused }) => ({
    ...styles,
    color: "#000",
    backgroundColor: isFocused ? "#dfc822" : "#fff",
    cursor: "pointer",
  }),

  singleValue: (styles) => ({
    ...styles,
    color: "#fff",
    display: "flex",
    alignItems: "center",
  }),

  indicatorsContainer: (styles) => ({
    ...styles,
    height: "44px",
  }),
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};

const Resolution = () => {

    const [userdata, setuserdata, userdataref] = useState("");
    const [loader, setLoader] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
const [editData, setEditData] = useState(null);
const [editOutcome, setEditOutcome] = useState(null);
const [editPrice, setEditPrice] = useState("");
    const [open, setOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
        const [totalPages, setTotalPages] = useState(0);
        const [currentPage, setCurrentPage] = useState(1);
        const [fromDate, setFromDate] = useState("");
        const [toDate, setToDate] = useState("");
        const [csvData, setCsvData, csvDataref] = useState([]);
        const inputRef = useRef(null);
        const [filterKeyword, setFilterKeyword] = useState("");
  const [viewData, setViewData] = useState(null);


     const handleOpenEditClaim = (row) => {
  setEditData(row);

  const index = row.outcomes?.findIndex(
    o => o === row.outcomeLabel
  );

  if (index > -1) {
    setEditOutcome({
      label: row.outcomes[index],
      value: row.outcomes[index],
      price: row.outcomePrices[index]
    });
    setEditPrice(row.outcomePrices[index]);
  }

  setEditOpen(true);
};
     const handleView = (item) => {
  setViewData(item);
  setOpen(true);
};

const handleClose = () => {
  setOpen(false);
  setViewData(null);
};

    
        const eventCreactionDetails = [
            {
                "id": 1,
                "email": "testinguserdevsdev@gmail.com",
                "dateTime": "2025-11-25T08:38:07.641Z",
                "username": "testinguserdevsdev",
                "kycStatus": 2,
                "disableUser": "demo",
            },
            {
                "id": 2,
                "email": "rajeshwaran242@gmail.com",
                "dateTime": "2025-11-25T05:34:51.573Z",
                "username": "rajeshwaran242",
                "kycStatus": 2,
                "disableUser": "demo",
            },
            {
                "id": 3,
                "email": "gohosi5109@izeao.com",
                "dateTime": "2025-11-24T11:01:32.594Z",
                "username": "gohosi5109",
                "kycStatus": 2,
                "disableUser": "demo",
            },
            {
                "id": 3,
                "email": "rajeshwarans@beleaftechnologies.com",
                "dateTime": "2025-11-21T08:55:07.356Z",
                "username": "rajeshwarans",
                "kycStatus": 1,
                "disableUser": "demo",
            },
            {
                "id": 4,
                "email": "capitalexc1.4@gmail.com",
                "dateTime": "2025-11-19T15:45:59.736Z",
                "username": "capitalexc1.4",
                "kycStatus": 0,
                "disableUser": "demo",
            },
        ]
    
        useEffect(() => {
            getUserDetails(currentPage);
          }, [currentPage]);


        const getUserDetails = async (page = 1) => {
            setLoader(true);
            const data = {
              apiUrl: apiService.getpredictionmanagementlist,
              payload: {
                page,
                limit: 5,
                keyword: filterKeyword,
                fromDate: fromDate,
                toDate: toDate,
              },
            };
            const response = await postMethod(data);
            setLoader(false);
            if (response.status) {
              setTotalPages(response.totalPages);
              setFilteredUsers(response.data);
              setCsvData(response.csv_data);
            } else {
              setFilteredUsers([]);
            }
          };
          
    
        useEffect(() => {
            inputRef.current?.focus();
        }, [eventCreactionDetails]);
    

        const handleFilterchange = () => {
    console.log("Filter work");
    getUserDetails();
  };

 const handleManualClaimUpdate = async () => {
  if (!editData || !editOutcome) {
    return toast.error("Please select outcome"); 
  }

  try {
    const payload = {
      predictionId: editData._id,
      resolvedOutcome: editOutcome.value, 
    };

    const data = {
      apiUrl: apiService.manualSettlePrediction, 
      payload,
    };

    setButtonLoading(true);
    const response = await postMethod(data);
    setButtonLoading(false);

    if (response.status) {
      toast.success("Prediction settled successfully");
      setEditOpen(false); 
      getUserDetails(currentPage); 
    } else {
      toast.error(response.message || "Failed to settle prediction");
    }
  } catch (error) {
    setButtonLoading(false);
    toast.error(error.message || "Something went wrong");
  }
};


    
        const download_csv = () => {
            if (csvData?.length > 0) {
                toast.success("User Details Download Successfully.");
            } else {
                toast.error("No records Found");
            }
        };
    
        const handlePageClick = (data) => {
            setCurrentPage(data.selected + 1);
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
                                        <span className="dash-head">Resolution</span>
                                        <div className="usr_mng_rgt">
                                            <div className="filter_container">
                                                <input
                                                    className="filter_input"
                                                    ref={inputRef}
                                                    placeholder="Search username"
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

                                            {/* <div onClick={download_csv}>
                                                <CsvDownloader
                                                    text="Download"
                                                    className="float-right csv-filter-change export_btn"
                                                    filename="User Details"
                                                    extension=".csv"
                                                    disabled={!(csvData?.length > 0)}
                                                    datas={csvData}
                                                >
                                                    Export{" "}
                                                    <i
                                                        className="fa fa-download"
                                                        aria-hidden="true"
                                                    ></i>
                                                </CsvDownloader>
                                            </div> */}

                                            
                                            
                                        </div>
                                    </div>
                                  <div className="my-5 trans-table">
  <div className="table-responsive ">
    <table className="w_100">
      <thead className="trans-head">
        <tr>
          <th>S.No</th>
          <th>Question</th>
          <th>User</th>
          <th>Date & Time</th>
          <th>Bet Type</th>
          <th>Status</th>
          <th>Bet Amount</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((item, i) => (
              <tr key={item._id}>
                <td>
                  <span className="plus_14_ff">
                    {(currentPage - 1) * 10 + i + 1}
                  </span>
                </td>

                <td>
                  <span className="plus_14_ff">
                    {item.question || "-"}
                  </span>
                </td>

                <td>
                  <span className="plus_14_ff">
                    {item.user?.username || item.user?.firstName || "-"}
                  </span>
                </td>

                <td>
                  <span className="plus_14_ff">
                    {Moment(item.createdAt).format("lll")}
                  </span>
                </td>

                <td>
                <span
  className="plus_14_ff"
  style={{
    color: item.chatType === "group" ? "#ff9800" : "#4caf50" 
  }}
>
  {item.chatType
    ? item.chatType.charAt(0).toUpperCase() + item.chatType.slice(1)
    : ""}
</span>

                </td>

              <td>
  <span
    className="plus_14_ff"
    style={{
      color:
        item.status === "OPEN"
          ? "#1e88e5"
          : item.status === "WON"
          ? "#2e7d32"
          : item.status === "LOST"
          ? "#d32f2f"
          : item.status === "CLOSED"
          ? "#ed6c02"
          : "#000",
      fontWeight: "600",
    }}
  >
    {item.status}
  </span>
</td>

                <td>
                  <span className="plus_14_ff">
                    {item.amount} {item.currency}
                  </span>
                </td>

                <td>
                  {item.source === "manual" && item.status === "OPEN" ? (
                    <span
                      className="plus_14_ff cursor-pointer"
                      title="Edit"
                      onClick={() => handleOpenEditClaim(item)}
                    >
                    ✏️     
                    </span>
                  ) : (
                    <span
                      className="plus_14_ff cursor-pointer"
                      title="View"
                      onClick={() => handleView(item)}
                    >
                    👁️
                    </span>
                  )}
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

          {eventCreactionDetails.length > 0 && (
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
          )}
        </>
      </tbody>
    </table>
  </div>
</div>


<Modal
  aria-labelledby="transition-modal-title"
  aria-describedby="transition-modal-description"
  open={open}
  onClose={handleClose}
  closeAfterTransition
  slots={{ backdrop: Backdrop }}
  slotProps={{
    backdrop: {
      timeout: 500,
    },
  }}
>
  <Fade in={open}>
    <Box sx={style} className="popup_modal-delete">
      
      <div className="popup_modal-title">
        <span>
          <span className="popup_modal-title-icon"></span>
          View Bet Details
        </span>
      </div>

      <div className="popup_modal-content">

        <div className="form-group row">
          <label className="col-lg-4 col-form-label col-form-labelnew">
            Question
          </label>
          <div className="col-lg-8">
            <input
              type="text"
              className="form-control"
              value={viewData?.question || ""}
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-lg-4 col-form-label col-form-labelnew">
            User
          </label>
          <div className="col-lg-8">
            <input
              type="text"
              className="form-control"
              value={
                viewData?.user?.username ||
                viewData?.user?.firstName ||
                ""
              }
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-lg-4 col-form-label col-form-labelnew">
            Outcome
          </label>
          <div className="col-lg-8">
            <input
              type="text"
              className="form-control"
              value={viewData?.outcomeLabel || ""}
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-lg-4 col-form-label col-form-labelnew">
            Status
          </label>
          <div className="col-lg-8">
            <input
              type="text"
              className="form-control"
              value={viewData?.status || ""}
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-lg-4 col-form-label col-form-labelnew">
            Bet Amount
          </label>
          <div className="col-lg-8">
            <input
              type="text"
              className="form-control"
              value={
                viewData
                  ? `${viewData.amount} ${viewData.currency}`
                  : ""
              }
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-lg-4 col-form-label col-form-labelnew">
            Odds
          </label>
          <div className="col-lg-8">
            <input
              type="text"
              className="form-control"
              value={viewData?.odds || ""}
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-lg-4 col-form-label col-form-labelnew">
            Potential Payout
          </label>
          <div className="col-lg-8">
            <input
              type="text"
              className="form-control"
              value={viewData?.potentialPayout || ""}
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
        <label className="col-lg-4 col-form-label col-form-labelnew">
            Created At
          </label>
          <div className="col-lg-8">
            <input
              type="text"
              className="form-control"
              value={
                viewData
                  ? Moment(viewData.createdAt).format("lll")
                  : ""
              }
              disabled
            />
          </div>
        </div>

      </div>

      <div className="popup_modal-btn-wrap">
        <button
          className="popup_modal-btn-cancel"
          onClick={handleClose}
        >
          Close
        </button>
      </div>

    </Box>
  </Fade>
</Modal>


<Modal
  open={editOpen}
  onClose={() => setEditOpen(false)}
  closeAfterTransition
  slots={{ backdrop: Backdrop }}
  slotProps={{ backdrop: { timeout: 500 } }}
>
  <Fade in={editOpen}>
    <Box sx={style} className="popup_modal-delete">

      <div className="popup_modal-title">
        <span>Edit Claim</span>
      </div>

      <div className="popup_modal-content">

        <div className="form-group row">
          <label className="col-lg-4 col-form-label">Question</label>
          <div className="col-lg-8">
            <input
              className="form-control"
              value={editData?.question || ""}
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-lg-4 col-form-label">User</label>
          <div className="col-lg-8">
            <input
              className="form-control"
              value={
                editData?.user?.username ||
                editData?.user?.firstName ||
                ""
              }
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-lg-4 col-form-label">
            Outcome <span style={{ color: "red" }}>*</span>
          </label>
          <div className="col-lg-8">
            <Select
              value={editOutcome}
              options={editData?.outcomes?.map((o, i) => ({
                label: o,
                value: o,
                price: editData.outcomePrices[i]
              }))}
              styles={customStyles}
              onChange={(opt) => {
                setEditOutcome(opt);
                setEditPrice(opt.price);
              }}
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-lg-4 col-form-label">Outcome Price</label>
          <div className="col-lg-8">
            <input
              className="form-control"
              value={editPrice}
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-lg-4 col-form-label">Bet Amount</label>
          <div className="col-lg-8">
            <input
              className="form-control"
              value={`${editData?.amount} ${editData?.currency}`}
              disabled
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-lg-4 col-form-label">Created At</label>
          <div className="col-lg-8">
            <input
              className="form-control"
              value={Moment(editData?.createdAt).format("lll")}
              disabled
            />
          </div>
        </div>

      </div>

      <div className="popup_modal-btn-wrap">
        <button
          className="popup_modal-btn-cancel"
          onClick={() => setEditOpen(false)}
        >
          Cancel
        </button>

       <button
  className="popup_modal-btn-confirm"
  onClick={handleManualClaimUpdate}
  disabled={!editOutcome || buttonLoading}
>
  {buttonLoading ? (
    'Loading...'
  ) : (
    "Update Claim"
  )}
</button>

      </div>

    </Box>
  </Fade>
</Modal>

                                </div>
                            </div>
                            {/* )} */}
                        </div>
                    </>
                </div>
            </div>
            {/* )} */}
        </div>
    )
}

export default Resolution