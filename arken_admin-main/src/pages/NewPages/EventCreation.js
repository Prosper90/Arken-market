import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../Sidebar";
import SkeletonwholeProject from "../SkeletonwholeProject";
import Sidebar_2 from "../Nav_bar";

import ReactPaginate from "react-paginate";
import Moment from "moment";
import FromDatePicker from "../fromdatepicker";
import ToDatePicker from "../todatepicker";
import { FaFilter } from "react-icons/fa6";
import { toast } from "react-toastify";
import { MdAddCircle } from "react-icons/md";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { IoClose } from "react-icons/io5";
import { postMethod } from "../../core/service/common.api";
import apiService from "../../core/service/detail";
import { FaRegCalendarAlt } from "react-icons/fa";
import axios from "axios";
import { env } from "../../core/service/envconfig";
import { Typography } from "@mui/material";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};

const EventCreaction = () => {
  const [userdata, setuserdata, userdataref] = useState("");
  const [loader, setLoader] = useState(false);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [csvData, setCsvData, csvDataref] = useState([]);
  const inputRef = useRef(null);
  const [filterKeyword, setFilterKeyword] = useState("");

  const [formStep, setFormStep] = useState(1);


 
  const handleFormStep = (step) => {
    if (formStep < 5) {
      setFormStep(step);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepReduce = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };

  const [marketData, setMarketData] = useState([]);
  const [hadUpdate, setHadUpdate] = useState(false);

  const getUserDetails = async (page = 1) => {
    setLoader(true);

    const data = {
      apiUrl: apiService.events_list,
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
      setMarketData(response.data.docs || []);
      // setCsvData(response.data.docs || []);
      setTotalPages(response.data.totalPages); //totalPages
    } else {
      setMarketData([]);
    }
  };

  const eventCreactionDetails = [
    {
      id: 1,
      email: "testinguserdevsdev@gmail.com",
      dateTime: "2025-11-25T08:38:07.641Z",
      username: "testinguserdevsdev",
      kycStatus: 2,
      disableUser: "demo",
    },
    {
      id: 2,
      email: "rajeshwaran242@gmail.com",
      dateTime: "2025-11-25T05:34:51.573Z",
      username: "rajeshwaran242",
      kycStatus: 2,
      disableUser: "demo",
    },
    {
      id: 3,
      email: "gohosi5109@izeao.com",
      dateTime: "2025-11-24T11:01:32.594Z",
      username: "gohosi5109",
      kycStatus: 2,
      disableUser: "demo",
    },
    {
      id: 3,
      email: "rajeshwarans@beleaftechnologies.com",
      dateTime: "2025-11-21T08:55:07.356Z",
      username: "rajeshwarans",
      kycStatus: 1,
      disableUser: "demo",
    },
    {
      id: 4,
      email: "capitalexc1.4@gmail.com",
      dateTime: "2025-11-19T15:45:59.736Z",
      username: "capitalexc1.4",
      kycStatus: 0,
      disableUser: "demo",
    },
  ];

  const tagsData = [
    "crypto",
    "politics",
    "finance",
    "sports",
    "technology",
    "entertainment",
    "science",
    "business",
    "weather",
    "culture",
    "gaming",
    "legal",
    "military",
    "space",
    "health",
    "education",
    "art",
    "others",
  ];

  useEffect(() => {
    getUserDetails(currentPage);
  }, [currentPage, filterKeyword, hadUpdate]);



  const handleFilterchange = () => {
    console.log("Filter work");
    getUserDetails();
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

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [edit, setEdit] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    modal: false,
    id: "",
  });

  const handleEdit = (item) => {
    // console.log("item", item);
    setEdit(true);
    setFormData({
      id: item._id,
      question: item.question,
      startDate: item.startDate,
      endDate: item.endDate,
      active: item.active,
      closed: item.closed,
    });
  };

  const handleDelete = async (item) => {
    // console.log("item", item);
    const host = env.apiHost;

    try {
      const response = await axios.delete(
        host + apiService.events_delete + "/" + item
      );
      // console.log("sdfsdfsdfs", response);
      if (response && response.data.success) {
        toast.success(response.data.message);
        handleReset();
        setDeleteModal({
          modal: false,
          id: "",
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setHadUpdate((prev) => !prev);
    }
  };

  const [formData, setFormData] = useState({
    question: "",
    startDate: "",
    endDate: "",
    active: "",
    closed: "",
    id: "",
  });
  const [error, setError] = useState({});

  function validate(name, value) {
  let err = "";

  switch (name) {
    case "question":
      if (!value.trim()) err = "Question is required";
      else if (value.length < 10) err = "Minimum 10 characters required";
      else if (value.length >= 151)
        err = "Must be less than 150 characters required";
      break;

    case "startDate":
      if (!value) err = "Start date is required";
      else {
        const start = value instanceof Date ? value : new Date(value);
        const end = formData.endDate
          ? (formData.endDate instanceof Date
              ? formData.endDate
              : new Date(formData.endDate))
          : null;
        const now = new Date();

        if (end && start >= end) {
          err = "Start time must be earlier than end time";
        }

        else if (start.toDateString() === now.toDateString() && start < now) {
          err = "Cannot select past time for today";
        }

        else if (end && start >= end) {
          err = "Start time must be earlier than end time";
        }
      }
      break;

    case "endDate":
      if (!value) err = "End date is required";
      else if (formData.startDate && value < formData.startDate)
        err = "End time must be later than start time";
      break;

    case "active":
      console.log("active", value);
      if (value === "" || value === null || value === undefined)
        err = "Active status is required";
      break;

    case "closed":
      console.log("closed", value);
      if (value === "" || value === null || value === undefined)
        err = "Close status is required";
      break;

    case "archived":
      console.log("archived", value);
      if (value === "" || value === null || value === undefined)
        err = "Archived status is required";
      break;

    default:
      break;
  }

  return err;
}


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    console.log("Form Data after Change:", { [name]: value });

    const errMsg = validate(name, value);

    setError({
      ...error,
      [name]: errMsg,
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });

    const errMsg = validate(name, date);

    setError({
      ...error,
      [name]: errMsg,
    });
  };

  const handleReset = () => {
    setFormData({
      question: "",
      startDate: "",
      endDate: "",
      active: "",
      closed: "",
      id: "",
    });
    setError({});
    setFormStep(1);
  };

  const validateStep1 = () => {
    let stepErrors = {};

    // validate question
    const qErr = validate("question", formData.question);
    if (qErr) stepErrors.question = qErr;

    // validate start date
    const startErr = validate("startDate", formData.startDate);
    if (startErr) stepErrors.startDate = startErr;

    // validate end date
    const endErr = validate("endDate", formData.endDate);
    if (endErr) stepErrors.endDate = endErr;

    setError(stepErrors);

    return Object.keys(stepErrors).length === 0; // no errors → valid
  };

  const validateStep2 = () => {
    let stepErrors = {};

    const activeErr = validate("active", formData.active);
    if (activeErr) stepErrors.active = activeErr;

    const closedErr = validate("closed", formData.closed);
    if (closedErr) stepErrors.closed = closedErr;

    setError(stepErrors);

    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async (option = "add") => {
    console.log("Form Data after Submit:", formData);
    const host = env.apiHost;

    try {
      if (option == "add") {
        console.log("Form Data after Submit:", apiService.events_create);
        const response = await axios.post(
          host + apiService.events_create,
          formData
        );
        if (response && response.data.success) {
          toast.success(response.data.message);
          handleReset();
          setOpen(false);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.patch(
          host + apiService.events_update + "/" + formData.id,
          formData
        );
        console.log("sdfsdfsdfs", response);
        if (response && response.data.success) {
          toast.success(response.data.message);
          handleReset();
          setEdit(false);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setHadUpdate((prev) => !hadUpdate);
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

              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">Event Creation</span>
                    <div className="usr_mng_rgt">
                      <div className="filter_container">
                        <input
                          className="filter_input"
                          ref={inputRef}
                          placeholder="Search Question"
                          value={filterKeyword}
                          onChange={(e) => {
                            const value = e?.target?.value;
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

                      <div className="btn_add" onClick={() => handleOpen()}>
                        <span>Add Event</span>
                        <MdAddCircle className="add_event_icon" />
                      </div>
                    </div>
                  </div>
                  {loader == true ? (
                    <SkeletonwholeProject />
                  ) : (
                    <div className="my-5 trans-table">
                      <div className="table-responsive ">
                        <table className="w_100">
                          <thead className="trans-head">
                            <tr>
                              <th>S.No</th>
                              <th>Question</th>
                              <th>Date & Time</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            
                            <>
                              {marketData.length > 0 ? (
                                marketData.map((item, i) => (
                                  <tr key={i}>
                                    <td>
                                      <span className="plus_14_ff">
                                        {i + 1}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.question}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {Moment(item.createdAt).format("lll")}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff" style={{color : item.active ? "green" : "red"}}>
                                        {item.active ? "Active" : "Inactive"}
                                      </span>
                                    </td>

                                    <td className="cmmn_action_btn justify-content-center">
                                      <span
                                        className="plus_14_ff "
                                        onClick={() => handleEdit(item)}
                                      >
                                        <i className="fa-regular fa-pen-to-square cursor-pointer"></i>
                                      </span>
                                      <span
                                        className="plus_14_ff ed-icon-fz act_delt_icon "
                                        onClick={() =>
                                          setDeleteModal({
                                            id: item._id,
                                            modal: true,
                                          })
                                        }
                                      >
                                        <i className="fa-regular fa-trash-can text-danger cursor-pointer"></i>
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={8}>
                                    <div className="empty_data my-4">
                                      <div className="plus_14_ff">
                                        No Records Found
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}

                              {/* table pagination */}
                              {marketData.length > 0 ? (
                                <tr className="text-center">
                                  <td colSpan="9">
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
                              ) : (
                                ""
                              )}
                            </>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        </div>
      </div>

    { open &&  <Modal
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
          <Box sx={style} className="popup_modal-eventCrtn">
            <div className={`evnt_crct_popInsd `}>
              <span
                className="modal_close_icon"
                onClick={() => {
                  handleReset();
                  setOpen(false);
                }}
              >
                <IoClose />
              </span>
              {formStep == 1 ? (
                <div className="evnt_crct_popFrmWrp">
                  <div className="evnt_crct_frmTxt">
                    <h6>Create Event</h6>
                    <span> {formStep} / 2</span>
                  </div>

                  <h5 className="evnt_crct_frmtlt">
                    Define Your Event Question
                  </h5>
                  <p className="evnt_crct_frmdesp">
                    Write the main question to help users discover it easily
                  </p>

                  <form className="evnt_crct_popFrm">
                    <div className="evnt_crct_popInptwrp">
                      <label>Ask a Question</label>
                      <div className="evnt_crct_popInpt">
                        <input
                          name="question"
                          value={formData.question}
                          type="text"
                          placeholder="Ask any questions"
                          onChange={(e) => handleInputChange(e)}
                        />

                        <span
                          style={{
                            color:
                              formData.question.length > 151 ? "red" : "black",
                          }}
                        >
                          {formData.question.length + "/ 150 Characters"}
                        </span>
                        <div className="error-block">
                          {error.question && (
                            <div className="error-code">{error.question}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* </form> */}

                    <div className="evnt_crct_pop_minline"></div>

                    {/* <form className="d-flex flex-column form_contn"> */}
                    <div className="custom-date-wrapper">
                      <label> Start time </label>
                      <div className="d-flex position-relative ">
                        <DatePicker
                          selected={formData.startDate}
                          onChange={(d) => handleDateChange("startDate", d)}
                          minDate={new Date()}
                          minTime={
                            formData.startDate &&
                            formData.startDate.toDateString() ===
                              new Date().toDateString()
                              ? new Date() // only restrict if today
                              : new Date(0, 0, 0, 0, 0) // midnight
                          }
                          maxTime={new Date(0, 0, 0, 23, 59)}
                          showTimeSelect
                          timeFormat="hh:mm aa" // 12 hour
                          dateFormat="MMM dd, yyyy hh:mm aa" // display format
                          placeholderText="From Date"
                          className="custom-date-input"
                        />
                        <FaRegCalendarAlt className="custom-date-icon" />
                      </div>
                      <div className="error-block">
                        {error.startDate && (
                          <div className="error-code">{error.startDate}</div>
                        )}
                      </div>
                    </div>

                    <div className="custom-date-wrapper">
                      <label> End time </label>
                      <div className="d-flex position-relative">
                        <DatePicker
                          selected={formData.endDate}
                          minDate={formData.startDate || new Date()}
                          onChange={(d) => handleDateChange("endDate", d)}
                          showTimeSelect
                          timeFormat="hh:mm aa" // 12 hour
                          dateFormat="MMM dd, yyyy hh:mm aa" // display format
                          placeholderText="From Date"
                          className="custom-date-input"
                        />
                        <FaRegCalendarAlt className="custom-date-icon" />
                      </div>
                    </div>
                    <div className="help-block">
                      {error.endDate && (
                        <div className="error-code">{error.endDate}</div>
                      )}
                    </div>
                  </form>

                  <div className="evnt_crct_pop_minline"></div>

                  <div className="evnt_crct_popBtnWrp">
                    {/* <button className="evnt_crct_popBackBtn">Back</button> */}
                    <button
                      className="evnt_crct_popNextBtn"
                      onClick={() => {
                        if (validateStep1()) {
                          handleFormStep(2);
                        }
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : formStep === 2 ? (
                <div className="evnt_crct_popFrmWrp">
                  <div className="evnt_crct_frmTxt">
                    <h6>Configure Event</h6>
                    <span> {formStep} / 2</span>
                  </div>

                  <div className="w-100 ">
                    {/* Active */}
                    <div className="w-100 d-flex flex-column gap-3">
                      <label className="form-label pl-2">Active Status </label>
                      <select
                        className="form-select w-100 mb-2"
                        name="active"
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>

                      <div className="help-block">
                        {error.active && (
                          <div className="error-code">{error.active}</div>
                        )}
                      </div>
                    </div>

                    {/* Close */}
                    <div className="select-card d-flex flex-column gap-3">
                      <label className="form-label pl-2">Close Status </label>
                      <select
                        className="form-select mb-2"
                        name="closed"
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                      <div className="help-block">
                        {error.closed && (
                          <div className="error-code">{error.closed}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="evnt_crct_popBtnWrp">
                    <button
                      className="evnt_crct_popBackBtn"
                      onClick={() => handleStepReduce()}
                    >
                      Back
                    </button>
                    <button
                      className="evnt_crct_popNextBtn"
                      onClick={() => {
                        if (validateStep2()) {
                          handleSubmit("add");
                          setOpen(false);
                        }
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </Box>
        </Fade>
      </Modal>}

     { edit && <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={edit}
        onClose={() => {
          handleReset();
          setEdit(false);
        }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={edit}>
          <Box sx={style} className="popup_modal-eventCrtn">
            <div className={`evnt_crct_popInsd `}>
              <span
                className="modal_close_icon"
                onClick={() => {
                  handleReset();
                  setEdit(false);
                }}
              >
                <IoClose />
              </span>
              {formStep == 1 ? (
                <div className="evnt_crct_popFrmWrp">
                  <div className="evnt_crct_frmTxt">
                    <h6>Create Event</h6>
                    <span> {formStep} / 2</span>
                  </div>

                  <h5 className="evnt_crct_frmtlt">
                    Define Your Event Question
                  </h5>
                  <p className="evnt_crct_frmdesp">
                    Write the main question to help users discover it easily
                  </p>

                  <form className="evnt_crct_popFrm">
                    <div className="evnt_crct_popInptwrp">
                      <label>Ask a Question</label>
                      <div className="evnt_crct_popInpt">
                        <input
                          name="question"
                          value={formData.question}
                          type="text"
                          placeholder="Ask any questions"
                          onChange={(e) => handleInputChange(e)}
                        />

                        <span
                          style={{
                            color:
                              formData.question.length > 151 ? "red" : "black",
                          }}
                        >
                          {formData.question.length + "/ 150 Characters"}
                        </span>
                        <div className="error-block">
                          {error.question && (
                            <div className="error-code">{error.question}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* </form> */}

                    <div className="evnt_crct_pop_minline"></div>

                    {/* <form className="d-flex flex-column form_contn"> */}
                    <div className="custom-date-wrapper">
                      <label> Start time </label>
                      <div className="d-flex position-relative ">
                        <DatePicker
                          selected={new Date(formData.startDate)}
                          minDate={new Date()} // allow today and future
                            minTime={
                              formData.startDate &&
                              new Date(formData.startDate).toDateString() ===
                                new Date().toDateString()
                                ? new Date() // only restrict time if selecting today
                                : new Date(0, 0, 0, 0, 0)
                            }
                            maxTime={new Date(0, 0, 0, 23, 59)}
                          onChange={(d) => handleDateChange("startDate", d)}
                          showTimeSelect
                          timeFormat="hh:mm aa" // 12 hour
                          dateFormat="MMM dd, yyyy hh:mm aa" // display format
                          placeholderText="From Date"
                          className="custom-date-input"
                        />
                        <FaRegCalendarAlt className="custom-date-icon" />
                      </div>
                      <div className="error-block">
                        {error.startDate && (
                          <div className="error-code">{error.startDate}</div>
                        )}
                      </div>
                    </div>

                    <div className="custom-date-wrapper">
                      <label> End time </label>
                      <div className="d-flex position-relative">
                        <DatePicker
                          selected={new Date(formData.endDate)}
                          minDate={new Date(formData.startDate)}
                          onChange={(d) => handleDateChange("endDate", d)}
                          showTimeSelect
                          timeFormat="hh:mm aa" // 12 hour
                          dateFormat="MMM dd, yyyy hh:mm aa" // display format
                          placeholderText="From Date"
                          className="custom-date-input"
                        />
                        <FaRegCalendarAlt className="custom-date-icon" />
                      </div>
                    </div>
                    <div className="help-block">
                      {error.endDate && (
                        <div className="error-code">{error.endDate}</div>
                      )}
                    </div>
                  </form>

                  <div className="evnt_crct_pop_minline"></div>

                  <div className="evnt_crct_popBtnWrp">
                    {/* <button className="evnt_crct_popBackBtn">Back</button> */}
                    <button
                      className="evnt_crct_popNextBtn"
                      onClick={() => {
                        if (validateStep1()) {
                          handleFormStep(2);
                        }
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : formStep === 2 ? (
                <div className="evnt_crct_popFrmWrp">
                  <div className="evnt_crct_frmTxt">
                    <h6>Configure Event</h6>
                    <span> {formStep} / 2</span>
                  </div>

                  <div className="w-100 ">
                    {/* Active */}
                    <div className="w-100 d-flex flex-column gap-3">
                      <label className="form-label pl-2">Active Status </label>
                      <select
                        className="form-select w-100 mb-2"
                        name="active"
                        value={formData.active}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>

                      <div className="help-block">
                        {error.active && (
                          <div className="error-code">{error.active}</div>
                        )}
                      </div>
                    </div>

                    {/* Close */}
                    <div className="select-card d-flex flex-column gap-3">
                      <label className="form-label pl-2">Close Status </label>
                      <select
                        className="form-select mb-2"
                        name="closed"
                        value={formData.closed}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                      <div className="help-block">
                        {error.closed && (
                          <div className="error-code">{error.closed}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="evnt_crct_popBtnWrp">
                    <button
                      className="evnt_crct_popBackBtn"
                      onClick={() => handleStepReduce()}
                    >
                      Back
                    </button>
                    <button
                      className="evnt_crct_popNextBtn"
                      onClick={() => {
                        if (validateStep2()) {
                          handleSubmit("edit");
                          setOpen(false);
                        }
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </Box>
        </Fade>
      </Modal>}

      <Modal
        open={deleteModal.modal}
        onClose={() => setDeleteModal({ id: "", modal: false })}
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Box sx={style} className="popup_modal-delEvntCrtn">
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Are You sure you want to delete ?
          </Typography>
          <p className="text-center">
            This will delete all the associated data with this event
          </p>

          <Box className="popup_modal-delEvntCrtn-btnWrp">
            <button
              className="evnt_crct_popBackBtn"
              onClick={() => setDeleteModal({ id: "", modal: false })}
            >
              Cancel
            </button>
            <button
              className="evnt_crct_popNextBtn"
              onClick={() => handleDelete(deleteModal.id)}
            >
              Delete
            </button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default EventCreaction;
