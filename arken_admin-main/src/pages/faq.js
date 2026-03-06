import React, { useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import useState from "react-usestateref";

import { toast } from "react-toastify";
import Sidebar_2 from "./Nav_bar";
import Select from "react-select";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { env } from "../core/service/envconfig";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";

import Typography from "@mui/material/Typography";
import Modal from "@mui/joy/Modal";
import { ScaleLoader } from "react-spinners";

import { Bars } from "react-loader-spinner";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";


const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};
function Dashboard() {
  const inputRef = useRef(null);
  const [add, setAdd] = useState(false);
  const [stakingpage, setstakingpage] = useState(false);
  const [Exchangedata, setExchangedata] = useState([]);
  const [validationnErr, setvalidationnErr] = useState({});
  const [loader, setLoader] = useState(true);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [network, setNetwork] = useState("Deposit");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [formData, setFormData, formDataref] = useState({
    id: "",
    question: "",
    type: "",
    answer: "",
    category: "",
    status: "",
  });

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 6;
  // const customStyles = {
  //     control: (styles) => ({
  //         ...styles,
  //         backgroundColor: "#f9f9f9",
  //         border: "1px solid #ccc",
  //         padding: "4px",
  //     }),
  //     option: (styles, { isFocused }) => ({
  //         ...styles,
  //         color: "#fff",
  //         backgroundColor: isFocused ? "#292b31" : "#181a20",
  //         cursor: "pointer",
  //     }),
  //     singleValue: (styles) => ({
  //         ...styles,
  //         color: "#000",
  //     }),
  // };

  const customStyles = {
    control: (styles) => ({
      ...styles,
      // backgroundColor: "#f9f9f9",
      // border: "1px solid #ccc",
      // padding: "4px",
      backgroundColor: "#000",
      //   border: `1px solid ${theme === "dark" ? "#2b3139" : "#ccc"}`,
      padding: "4px",
      color: "#fff",
      //   border: "none",
      boxShadow: "none", // Removes the box-shadow
      outline: "none", // Removes any outline
    }),
    option: (styles, { isFocused }) => ({
      ...styles,
      color: "#fff",
      backgroundColor: isFocused ? "#444" : "#181a20",
      cursor: "pointer",
    }),
    singleValue: (styles) => ({
      ...styles,
      color: "#fff",
    }),
  };
  const validateForm = (values) => {
    const errors = {};

    // Common validations
    if (!values.question) {
      errors.question = "Question is required";
    }

    if (!values.answer) {
      errors.answer = "Answer is required";
    }
    if (!values.type) {
      errors.type = "Type is required";
    }
    if (!values.category) {
      errors.category = "Category is required";
    }
    if (
      values.status == undefined ||
      values.status == "" ||
      values.status == null
    ) {
      errors.status = "Status is required";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const sanitizedValue = value.startsWith(" ") ? value.trimStart() : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: sanitizedValue,
    }));
    const errors = validateForm(formData);
    setvalidationnErr(errors);
    console.log("Form Data after Change:", { [name]: sanitizedValue });
  };

  useEffect(() => {
    console.log("Updated Form Data:", formData);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.question ||
      !formData.answer ||
      !formData.type ||
      !formData.status ||
      !formData.category
    ) {
      validateForm(formData);
    }
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setvalidationnErr(errors);
      return;
    }
    setvalidationnErr({});
    const isUpdate = formData.id !== "";
    const payload = {
      _id: formData.id || "",
      question: formData.question,
      answer: formData.answer,
      type: formData.type,
      category: formData.category,
      status: formData.status,
    };

    const apiUrl = apiService.faq_create_update;
    const requestData = {
      apiUrl: apiUrl,
      payload: payload,
    };

    try {
      setButtonLoader(true);
      const response = await postMethod(requestData);

      setButtonLoader(false);

      if (response.status) {
        toast.success(response.Message);
        setAdd(false);
        setFormData({
          id: "",
          question: "",
          type: "",
          category: "",
          answer: "",
          status: "",
        });
        getUserDetails();
      } else {
        toast.error(response.Message);
      }
    } catch (error) {
      setButtonLoader(false);
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };
  useEffect(() => {
    getUserDetails(currentPage, filterKeyword);
  }, [currentPage, filterKeyword]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [filteredUsers]);

  const getUserDetails = async (page = 1, filterKeyword) => {
    setLoader(true);
    const data = {
      apiUrl: apiService.getFaq,
      payload: { page, limit: 5, keyword: filterKeyword },
    };
    const response = await postMethod(data);
    setLoader(false);
    if (response.status) {
      setFilteredUsers(response.data);
      setTotalPages(response.totalPages);
    } else {
      setExchangedata([]);
    }
  };

  const handleFilterChange = (e) => {
    let value = e.target.value;

    if (value.startsWith(" ")) {
      value = value.trimStart();
    }

    setFilterKeyword(value);
    getUserDetails(value);
  };

  const getEditDetails = async (id) => {
    console.log("Fetching details for ID:", id);

    const payload = { _id: id };
    const requestConfig = {
      apiUrl: apiService.faq_getFaq_One,
      payload: payload,
    };

    setLoader(true);
    try {
      const response = await postMethod(requestConfig);
      setLoader(false);

      console.log("API Response:", response);

      if (response.status) {
        const exchangeData = {
          id: response.Message._id || "",
          question: response.Message.question || "",
          answer: response.Message.answer || "",
          type: response.Message.type || "",
          category: response.Message.category || "",
          status: response.Message.status || "",
        };
        setFormData(exchangeData);

        console.log("Form Data after setFormData:", formData);

        setAdd(true);
      } else {
        console.error("Error fetching exchange details:", response.Message);
        toast.error(response.Message || "Failed to fetch exchange details");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error in getEditDetails:", error);
      toast.error("An error occurred while fetching exchange details");
    }
  };
  const [deleteid, setdeleteid, deleteidref] = useState("");

  const deletecurrency = async (data) => {
    console.log(data, "data");
    // alert("Do you want to delete this FAQ");
    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.deleteFaq,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    setLoader(false);
    console.log(response, "=-=-=-=response=-=-=");

    if (response.status) {
      toast.success(response.Message);
      getUserDetails();
      handleClose();
      // setAdd(true);
    } else {
      toast.error(response.Message);
      // setcmsdata({});
    }
  };

  const Options = [
    { value: "Deposit", label: "Deposit" },
    { value: "Withdraw", label: "Withdraw" },
    { value: "Support", label: "Support" },
    { value: "Kyc", label: "Kyc" },
    { value: "Landing", label: "Landing" },
    { value: "Partner", label: "Partner" },
    { value: "Research", label: "Research" },
  ];

  const CategoryOptions = [
    { value: "Deposit", label: "Deposit" },
    { value: "Withdraw", label: "Withdraw" },
    { value: "Support", label: "Support" },
    { value: "Landing", label: "Landing" },
    { value: "Partner", label: "Partner" },
    { value: "Research", label: "Research" },
    { value: "Kyc", label: "Kyc" },
  ];
  const handleNetworkChange = (selectedOption, field) => {
    setFormData({
      ...formData,
      [field]: selectedOption.value,
    });
  };

  const sentback = async (data) => {
    setAdd(false);
    setstakingpage(false);

    setFormData({});
  };
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
                {stakingpage == false ? (
                  <div className="px-2 my-4 transaction_padding_top tops">
                    <div className="headerss">
                      <span className="dash-head">FAQ Settings</span>
                      <div className="usr_mng_rgt">
                        {add == false ? (
                          <>
                            <div className="filter_container">
                              <input
                                className="filter_input"
                                placeholder="Search type"
                                value={filterKeyword}
                                ref={inputRef}
                                onChange={handleFilterChange}
                              />{" "}
                              <i className="fa-solid fa-magnifying-glass"></i>
                            </div>
                            <button
                              onClick={() => setAdd(true)}
                              className="export_btn"
                            >
                              Add
                              <i className="fa-solid fa-circle-plus"></i>
                            </button>
                          </>
                        ) : (
                          <button onClick={() => sentback()}>Back</button>
                        )}
                      </div>
                      {/* {add == false ? (
                        <div className="top_filter">
                          <input
                            className="filters"
                            placeholder="Enter type to filter"
                            value={filterKeyword}
                            ref={inputRef}
                            onChange={handleFilterChange}
                          />
                          <i
                            className="fa-solid fa-circle-plus adds cursor-pointer"
                            onClick={() => setAdd(true)}
                          ></i>
                        </div>
                      ) : (
                        <button onClick={() => sentback()}>Back</button>
                      )} */}
                    </div>
                    {add == false ? (
                      <div className="my-5 trans-table">
                        <div className="table-responsive">
                          <table className="w_100">
                            <thead className="trans-head">
                              <tr>
                                <th>S.No</th>
                                <th>Question</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Action</th>
                                <th>Delete</th>
                              </tr>
                            </thead>
                            {loader == true ? (
                              // <tr>
                              //   <td colSpan={9}>
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
                                                                                  <div
                                                                                    className="w-full h-[22px] bg-[#b8b8b833] rounded-[6px] animate-pulse"
                                                                                  ></div>                                        </td>
                                      )
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            ) : (
                              <tbody>
                                {filteredUsers.length > 0 ? (
                                  filteredUsers.map((item, i) => (
                                    <tr key={item._id}>
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
                                          {item.type}
                                        </span>
                                      </td>
                                      <td>
                                        {item.status == "Active" ? (
                                          <span className="plus_14_ff text-success">
                                            {item.status}
                                          </span>
                                        ) : (
                                          <span className="plus_14_ff text-danger">
                                            {item.status}
                                          </span>
                                        )}
                                      </td>
                                      <td>
                                        <span className="plus_14_ff">
                                          <i
                                            className="fa-regular fa-pen-to-square cursor-pointer"
                                            onClick={() =>
                                              getEditDetails(item._id)
                                            }
                                          ></i>
                                        </span>
                                      </td>
                                      <td>
                                        <span className="plus_14_ff ed-icon-fz">
                                          <i
                                            className="fa-regular fa-trash-can text-danger cursor-pointer"
                                            // onClick={() => deleteDetail(item._id)}
                                            onClick={() => {
                                              handleOpen();
                                              setdeleteid(item._id);
                                            }}
                                          ></i>
                                        </span>
                                      </td>
                                      {/* <td>
                                    <span className="plus_14_ff">
                                      <i
                                        className="fa-regular fa-trash-can text-danger cursor-pointer"
                                        onClick={() => deletecurrency(item._id)}
                                      ></i>
                                    </span>
                                  </td> */}

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
                                          <Box
                                            sx={style}
                                            className="popup_modal-delete"
                                          >
                                            <div className="popup_modal-title">
                                              <span>
                                                <span className="popup_modal-title-icon">
                                                  <i className="fa-solid fa-triangle-exclamation"></i>
                                                </span>
                                                Confirm Delete
                                              </span>
                                            </div>
                                            <div className="popup_modal-content">
                                              <p>
                                                Are you sure you want to
                                                permanently delete this Details?
                                              </p>
                                            </div>
                                            <div className="popup_modal-btn-wrap">
                                              <button
                                                className="popup_modal-btn-cancel"
                                                onClick={() => handleClose()}
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                className="popup_modal-btn-confirm"
                                                onClick={() =>
                                                  deletecurrency(
                                                    deleteidref.current
                                                  )
                                                }
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          </Box>
                                        </Fade>
                                      </Modal>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={9}>
                                      <div className="empty_data my-4">
                                        <div className="plus_14_ff">
                                          No Records Found
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}

                                {filteredUsers.length > 0 ? (
                                  <tr className="text-center">
                                    <td colSpan="9">
                                      <div className="paginationcss">
                                        <ReactPaginate
                                          previousLabel={"<"}
                                          nextLabel={">"}
                                          forcePage={currentPage - 1}
                                          breakLabel={"..."}
                                          pageCount={totalPages}
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
                            )}
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="currencyinput mt-5">
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Question
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              name="question"
                              value={formData.question}
                              onChange={handleChange}
                              placeholder="Question"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.question && (
                                <div className="error">
                                  {validationnErr.question}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Answer
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              name="answer"
                              value={formData.answer}
                              onChange={handleChange}
                              placeholder="Answer"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.answer && (
                                <div className="error">
                                  {validationnErr.answer}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Type
                          </label>
                          <div className="col-lg-6">
                            <div className="depo_inner_divmain">
                              <Select
                                options={Options}
                                value={Options.find(
                                  (option) => option.value === formData.type
                                )} // Set the selected value
                                styles={customStyles}
                                placeholder="Select Type"
                                onChange={(selectedOption) =>
                                  handleNetworkChange(selectedOption, "type")
                                } // Pass "type"
                                className="withdraw-dropdown-menu"
                              />
                            </div>
                            <div className="help-block">
                              {validationnErr.type && (
                                <div className="error">
                                  {validationnErr.type}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Categories
                          </label>
                          <div className="col-lg-6">
                            <Select
                              options={CategoryOptions}
                              value={CategoryOptions.find(
                                (option) => option.value === formData.category
                              )} // Set the selected value
                              styles={customStyles}
                              placeholder="Select Category"
                              onChange={(selectedOption) =>
                                handleNetworkChange(selectedOption, "category")
                              } // Pass "category"
                              className="withdraw-dropdown-menu"
                            />
                            <div className="help-block">
                              {validationnErr.category && (
                                <div className="error">
                                  {validationnErr.category}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Status
                          </label>
                          <div className="col-lg-6">
                            <div className="radio">
                              <div>
                                <input
                                  type="radio"
                                  name="status"
                                  value="Active"
                                  id="statusActive"
                                  onChange={handleChange}
                                  checked={formData.status == "Active"}
                                />{" "}
                                <label
                                  htmlFor="statusActive"
                                  className="cursor-pointer"
                                >
                                  Active
                                </label>
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name="status"
                                  value="Deactive"
                                  id="statusDeactive"
                                  onChange={handleChange}
                                  checked={formData.status == "Deactive"}
                                />{" "}
                                <label
                                  htmlFor="statusDeactive"
                                  className="cursor-pointer"
                                >
                                  Deactive
                                </label>
                              </div>
                            </div>
                            <div className="help-block">
                              {validationnErr.status && (
                                <div className="error">
                                  {validationnErr.status}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row justify-content-center">
                          <div className="col-lg-4">
                            {buttonLoader == false ? (
                              <button
                                type="submit"
                                className="d-block w_100 submit-btn-change"
                                onClick={handleSubmit}
                              >
                                Submit
                              </button>
                            ) : (
                              <button type="submit" className="d-block w_100">
                                Loading ...
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <></>
                )}

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
                          <span className="popup_modal-title-icon">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                          </span>
                          Confirm Delete
                        </span>
                      </div>
                      <div className="popup_modal-content">
                        <p>
                          Are you sure you want to permanently delete this
                          Details?
                        </p>
                      </div>
                      <div className="popup_modal-btn-wrap">
                        <button
                          className="popup_modal-btn-cancel"
                          onClick={() => handleClose()}
                        >
                          Cancel
                        </button>
                        <button
                          className="popup_modal-btn-confirm"
                          onClick={() => deletecurrency(deleteidref.current)}
                        >
                          Delete
                        </button>
                      </div>
                    </Box>
                  </Fade>
                </Modal>
              </div>
            </>
            {/* )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
