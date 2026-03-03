import React, { useEffect, useRef, useState } from 'react'
import Sidebar from "../Sidebar";
import SkeletonwholeProject from "../SkeletonwholeProject";
import Sidebar_2 from "../Nav_bar";
import { getMethod, postMethod } from "../../core/service/common.api";
import apiService from "../../core/service/detail";
import ReactPaginate from "react-paginate";
import Moment from "moment";
import ToDatePicker from "../todatepicker";
import { FaFilter } from "react-icons/fa6";
import { toast } from "react-toastify";
import CsvDownloader from "react-csv-downloader";
import { MdAddCircle } from "react-icons/md";
import FromDatePicker from "../fromdatepicker";
import Box from "@mui/material/Box";
import Select from "react-select";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";


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

const UsersStake = () => {


            const [userdata, setuserdata, userdataref] = useState("");
                const [loader, setLoader] = useState(false);
              const [filteredUsers, setFilteredUsers] = useState([]);
              const [editOpen, setEditOpen] = useState(false);
            const [editData, setEditData] = useState(null);
            const [editOutcome, setEditOutcome] = useState(null);
            const [editPrice, setEditPrice] = useState("");
                const [open, setOpen] = useState(false);
const [editCommission, setEditCommission] = useState("");
const [buttonLoading, setButtonLoading] = useState(false);
                    const [totalPages, setTotalPages] = useState(0);
                    const [currentPage, setCurrentPage] = useState(1);
                    const [fromDate, setFromDate] = useState("");
                    const [toDate, setToDate] = useState("");
                    const [csvData, setCsvData, csvDataref] = useState([]);
                    const inputRef = useRef(null);
                    const [filterKeyword, setFilterKeyword] = useState("");
              const [viewData, setViewData] = useState(null);
            
        
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
                setCsvData(eventCreactionDetails);
            }, []);
        
            useEffect(() => {
                inputRef.current?.focus();
            }, [eventCreactionDetails]);
        

            const handleFilterchange = () => {
    getUserDetails();
  };
    useEffect(() => {
            getUserDetails(currentPage);
          }, [currentPage]);


      const handleCommissionUpdate = async () => {
  // Validation
  if (editCommission === "" || editCommission === null) {
    return toast.error("Commission percentage is required");
  }

  if (Number(editCommission) < 0 || Number(editCommission) > 20) {
    return toast.error("Commission must be between 0% and 20%");
  }

  try {
    setButtonLoading(true);

    const payload = {
      groupId: editData.groupId,          
      commissionPercent: Number(editCommission),
    };

    const data = {
      apiUrl: apiService.updateTelegramGroupCommission, 
      payload,
    };

    const response = await postMethod(data);
    setButtonLoading(false);

    if (response.status) {
      toast.success("Commission updated successfully");
      setEditOpen(false); 
      getUserDetails(currentPage); 
    } else {
      toast.error(response.message || "Failed to update commission");
    }

  } catch (error) {
    setButtonLoading(false);
    toast.error(error.message || "Something went wrong");
  }
};



        const getUserDetails = async (page = 1) => {
            setLoader(true);
            const data = {
              apiUrl: apiService.getTelegramGroupList,
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
                                        <span className="dash-head">Commission Percentage</span>
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


                                            
                                            
                                        </div>
                                    </div>
                                   <div className="my-5 trans-table">
  <div className="table-responsive">
    <table className="w_100">
      <thead className="trans-head">
        <tr>
          <th>S.No</th>
          <th>Group ID</th>
          <th>Group Title</th>
          <th>Owner ID</th>
          <th>Commission %</th>
          <th>Betting Enabled</th>
          <th>Status</th>
          <th>Date & Time</th>
<th>Action</th>
        </tr>
      </thead>

      <tbody>
        <>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((item, i) => (
              <tr key={item._id}>
                <td>
                  <span className="plus_14_ff">{i + 1}</span>
                </td>
                <td>
                  <span className="plus_14_ff">{item.groupId}</span>
                </td>

                <td>
                  <span className="plus_14_ff">{item.groupTitle}</span>
                </td>

                <td>
                  <span className="plus_14_ff">{item.groupOwnerId}</span>
                </td>

                <td>
                  <span className="plus_14_ff">
                    {item.commissionPercent}%
                  </span>
                </td>

                <td>
                  <span className={`plus_14_ff ${item.bettingEnabled ? "text-success" : "text-danger"}`}>
                    {item.bettingEnabled ? "Enabled" : "Disabled"}
                  </span>
                </td>

                <td>
                  <span className={`plus_14_ff ${item.isActive ? "text-success" : "text-danger"}`}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td>
                  <span className="plus_14_ff">
                    {Moment(item.createdAt).format("lll")}
                  </span>
                </td>

                <td>
                    
  <i
    className="fa fa-edit cursor-pointer" style={{color:'#fff'}}
    onClick={() => {
      setEditData(item);
      setEditCommission(item.commissionPercent);
      setEditOpen(true);
    }}
  />
</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8}>
                <div className="empty_data my-4">
                  <div className="plus_14_ff">No Records Found</div>
                </div>
              </td>
            </tr>
          )}

          {/* pagination */}
          {eventCreactionDetails.length > 0 ? (
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
                    containerClassName={"pagination pagination-md justify-content-center"}
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
          ) : (
            ""
          )}
        </>
      </tbody>
    </table>
  </div>
</div>

                                </div>
                            </div>

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
        <span>Edit Group Commission</span>
      </div>

      <div className="popup_modal-content">

        {/* Group ID */}
        <div className="form-group row">
          <label className="col-lg-4 col-form-label">Group ID</label>
          <div className="col-lg-8">
            <input className="form-control" value={editData?.groupId || ""} disabled />
          </div>
        </div>

        {/* Group Title */}
        <div className="form-group row">
          <label className="col-lg-4 col-form-label">Group Title</label>
          <div className="col-lg-8">
            <input className="form-control" value={editData?.groupTitle || ""} disabled />
          </div>
        </div>

        {/* Group Owner */}
        <div className="form-group row">
          <label className="col-lg-4 col-form-label">Owner ID</label>
          <div className="col-lg-8">
            <input className="form-control" value={editData?.groupOwnerId || ""} disabled />
          </div>
        </div>

        {/* ✅ Commission (EDITABLE) */}
        <div className="form-group row">
          <label className="col-lg-4 col-form-label">
            Commission % <span style={{ color: "red" }}>*</span>
          </label>
          <div className="col-lg-8">
            <input
              type="number"
              className="form-control"
              value={editCommission}
              min={0}
              max={20}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (val >= 0 && val <= 20)) {
                  setEditCommission(val);
                }
              }}
            />
            {/* <small className="text-muted">Allowed range: 0 – 20%</small> */}
          </div>
        </div>

        {/* Betting Enabled */}
        <div className="form-group row">
          <label className="col-lg-4 col-form-label">Betting</label>
          <div className="col-lg-8">
            <input
              className="form-control"
              value={editData?.bettingEnabled ? "Enabled" : "Disabled"}
              disabled
            />
          </div>
        </div>

        {/* Created At */}
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
          onClick={handleCommissionUpdate}
        >
          {buttonLoading ? "Loading..." : "Update Commission"}
        </button>
      </div>

    </Box>
  </Fade>
</Modal>
                            {/* )} */}
                        </div>
                    </>
                </div>
            </div>
            {/* )} */}
        </div>
    )
}

export default UsersStake