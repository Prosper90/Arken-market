import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import useState from "react-usestateref";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";

import { toast } from "react-toastify";
import Sidebar_2 from "./Nav_bar";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { env } from "../core/service/envconfig";
import { ScaleLoader } from "react-spinners";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import { Skeleton } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};

function SupportCategory() {
  const [add, setAdd] = useState(false);
  const [validationnErr, setvalidationnErr] = useState({});
  const [buttonLoader, setButtonLoader] = useState(false);
  const [loader, setLoader] = useState(true);

  const [formData, setFormData, formDataref] = useState({
    category: "",
    status: "",
  });

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 5;
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    const errors = validateForm(updatedFormData);
    setvalidationnErr(errors);
  };

  const handleSubmit = async (e) => {
    // console.log("knjkmkmkmkmk",e);
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setvalidationnErr(errors);
      return;
    }
    setvalidationnErr({});
    console.log("Form data submitted:", formData);

    var datas = {
      apiUrl: apiService.support_category_update,
      payload: formData,
    };

    setButtonLoader(true);
    var response = await postMethod(datas);
    setButtonLoader(false);
    console.log(response, "=-=-=-=response=-=-=");

    if (response.status) {
      toast.success(response.Message);
    } else {
      toast.error(response.Message);
    }
    getUserDetails();
    setAdd(false);
    setFormData({});
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [supportDatas, setSupportDatas] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };

  useEffect(() => {
    getUserDetails(currentPage);
  }, [currentPage]);

  const getUserDetails = async (page = 1) => {
    setLoader(true);
    const data = {
      apiUrl: apiService.support_category_list,
      payload: { page, limit: 5 }, // Include the keyword here
    };
    const response = await postMethod(data);
    setLoader(false);

    if (response.status) {
      setSupportDatas(response.data);
      setTotalPages(response.totalPages);
    } else {
    }
  };

  const getEditDetails = async (data) => {
    console.log(data, "data");

    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.support_category_get,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    setLoader(false);
    if (response.status) {
      setFormData(response.data);
      setAdd(true);
      console.log(formDataref.current, "=-=-=-=response=-=-=");
    } else {
    }
  };

  const deletecurrency = async (data) => {
    console.log(data, "data");

    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.support_category_delete,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    console.log(response, "=-=-=-=response=-=-=");
    setLoader(false);
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

  const validateForm = (values) => {
    const errors = {};

    // Common validations
    if (!values.category) {
      errors.category = "Category is required";
    } else if (values.category.length > 10) {
      errors.currencySymbol = "Max 10 characters allowed";
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

  const sentback = async (data) => {
    setAdd(false);
    setFormData({});
    setvalidationnErr({});
  };
  const [deleteid, setdeleteid, deleteidref] = useState("");

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
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">Support Category</span>
                    <div className="usr_mng_rgt">
                      {add == false ? (
                        <>
                          <button
                            onClick={() => setAdd(true)}
                            className="export_btn"
                          >
                            Add
                            <i className="fa-solid fa-circle-plus"></i>
                          </button>
                        </>
                      ) : (
                        <button
                          className="export_btn"
                          onClick={() => sentback()}
                        >
                          Back
                        </button>
                      )}
                    </div>
                  </div>
                  {add == false ? (
                    <div className="my-5 trans-table">
                      <div className="table-responsive">
                        <table className="w_100">
                          <thead className="trans-head">
                            <tr>
                              <th>S.No</th>
                              <th>Category</th>
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
                              {supportDatas.length > 0 ? (
                                supportDatas.map((item, i) => (
                                  <tr key={item._id}>
                                    <td>
                                      <span className="plus_14_ff">
                                        {i + 1}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.category}
                                      </span>
                                    </td>
                                    <td>
                                      {item.status == 1 ? (
                                        <span className="plus_14_ff text-success">
                                          Active
                                        </span>
                                      ) : (
                                        <span className="plus_14_ff text-danger">
                                          Deactive
                                        </span>
                                      )}
                                    </td>
                                    <td>
                                      <span className="plus_14_ff ed-icon-fz">
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
                                          // onClick={() => deletecurrency(item._id)}
                                          onClick={() => {
                                            handleOpen();
                                            setdeleteid(item._id);
                                          }}
                                        ></i>
                                      </span>
                                    </td>

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
                                              permanently delete this item?
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

                              {supportDatas.length > 0 ? (
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
                          )}{" "}
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="currencyinput mt-5">
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Category
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="Enter a category"
                            className="form-control"
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
                                value="1"
                                checked={formData.status == "1"}
                                onChange={handleChange}
                              />{" "}
                              Active
                            </div>
                            <div>
                              <input
                                type="radio"
                                name="status"
                                value="0"
                                checked={formData.status == "0"}
                                onChange={handleChange}
                              />{" "}
                              Deactive
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
                              className="d-block w_100"
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
              </div>
            </>
            {/* // )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportCategory;
