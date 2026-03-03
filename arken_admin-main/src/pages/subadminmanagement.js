import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import ReactPaginate from "react-paginate";
import Select from "react-select";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";

import { toast } from "react-toastify";
import Moment from "moment";
import { getMethod, postMethod } from "../core/service/common.api";
import useState from "react-usestateref";
import apiService from "../core/service/detail";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
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
const customStyles = {
  control: (styles) => ({
    ...styles,
    // backgroundColor: "#f9f9f9",
    // border: "1px solid #ccc",
    // padding: "4px",
    backgroundColor: "#0b0808ff",
    //   border: `1px solid ${theme === "dark" ? "#2b3139" : "#ccc"}`,
    padding: "4px",
    color: "#000",
    //   border: "none",
    boxShadow: "none", // Removes the box-shadow
    outline: "none", // Removes any outline
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
  }),
};

const CategoryOptions = [
  { value: "Dashboard", label: "Dashboard" },
  { value: "notes", label: "Announcements" },
  { value: "Usermanagement", label: "User Management" },
  { value: "kycmanagement", label: "KYC Management" },
  { value: "walletmanagement", label: "Wallet Management" },
  { value: "cryptoDeposit", label: "Crypto Deposit" },
  { value: "cryptoWithdraw", label: "Crypto Withdraw" },
  { value: "fiatWithdraw", label: "Fiat Withdraw" },
  { value: "userTrade", label: "User Trade" },
  { value: "FaqMangement", label: "FAQ Management" },
  { value: "Cmsmangement", label: "CMS Management" },
  { value: "profitmanagement", label: "Profit Management" },
  { value: "currencymangement", label: "Currency Management" },
  { value: "tradePairmangement", label: "Trade Pair Management" },
  { value: "supportCatagorymanagement", label: "Support Category Management" },

  { value: "supportmangement", label: "Support Management" },
  { value: "siteSetting", label: "Site Setting" },
];

function CmsManagement() {
  const [add, setadd] = useState(false);
  const [editorData, setEditorData] = useState("");
  const [Usersdata, setUsersdata, Usersdataref] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [subAdminData, setsubAdminData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [validationnErr, setvalidationnErr] = useState({});

  const [admindata, setadmindata, admindataref] = useState({
    email: "",
    Permissions: [],
    status: "", // 0 for Deactive, 1 for Active
  });

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 5;
  const handleNetworkChange = (selectedOptions) => {
    const values = selectedOptions.map((opt) => opt.value);
    setadmindata((prev) => ({ ...prev, Permissions: values }));
    const errors = validateForm(admindata);
    setvalidationnErr(errors);
  };

  useEffect(() => {
    getUserDetails(currentPage);
  }, [currentPage, filterKeyword]);

  const getUserDetails = async (page = 1, limit = 5) => {
    setLoader(true);

    const data = {
      apiUrl: apiService.subadmin_list,
      payload: { page, limit, keyword: filterKeyword },
    };

    const response = await postMethod(data);
    setLoader(false);

    if (response.status) {
      setsubAdminData(response.data);
      setTotalPages(response.totalPages); // Update the total pages for pagination
    } else {
      setsubAdminData([]);
    }
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    setCurrentPage(selectedPage);
    // getUserDetails(selectedPage); // Fetch data for the selected page
  };

  const handleFilterChange = (e) => {
    setFilterKeyword(e.target.value);
  };

  // const subAdminData = Usersdata.filter((user) =>
  //   user.heading.toLowerCase().includes(filterKeyword.toLowerCase())
  // );

  const getEditDetails = async (data) => {
    console.log(data);
    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.get_oneAdmin,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    // console.log(response, "=-=-=-=response=-=-=");
    setLoader(false);
    if (response.status) {
      const exchangeData = {
        id: response.data._id || "",
        email: response.data.email || "",
        status: response.data.status || "",
        Permissions: response.data.Permissions || "",
      };
      setadmindata(exchangeData);
      setadd(true);
    } else {
      setadmindata({});
    }
  };

  const deleteDetail = async (data) => {
    console.log(data, "dd");
    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.deletesubadmindetail,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    setLoader(false);
    if (response.status) {
      toast.success(response.Message);
      getUserDetails();
      handleClose();
    } else {
      toast.error(response.Message);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const formData = { ...admindata, [name]: value };
    setadmindata(formData);
    const errors = validateForm(formData);
    setvalidationnErr(errors);
  };

  const formSubmit = async (e) => {
    try {
      console.log(admindata, "admindata");
      e.preventDefault();
      const errors = validateForm(admindata);
      if (Object.keys(errors).length > 0) {
        setvalidationnErr(errors);
        return;
      }
      setvalidationnErr({});
      var data = {
        apiUrl: apiService.subadmin_update,
        payload: admindata,
      };
      setButtonLoader(true);
      var resp = await postMethod(data);
      setButtonLoader(false);
      if (resp.status) {
        toast.success(resp.Message);
        setadd(false);
        getUserDetails();
        setadmindata((prev) => ({
          ...prev,
          Permissions: [],
          status: "",
          email: "",
          id: "",
        }));
      } else {
        toast.error(resp.Message);
        setadd(false);
        getUserDetails();
      }
    } catch (error) {}
  };

  const sentback = async (data) => {
    setadd(false);
    setadmindata({ email: "", Permissions: [], status: "" });
    setvalidationnErr({});
  };

  const validateForm = (values) => {
    const errors = {};

    // Common validations
    if (!values.email) {
      errors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9.]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(values.email)
    ) {
      errors.email = "Invalid email address!";
    }

    if (!values.Permissions.length > 0) {
      errors.Permissions = "Permission is required";
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

  const [open, setOpen] = useState(false);
  const [deleteid, setdeleteid, deleteidref] = useState("");

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
                    <span className="dash-head">Subadmin Management</span>
                    <div className="usr_mng_rgt">
                      {add == false ? (
                        <>
                          {/* <div className="top_filter">
                              </div> */}

                          {/* <input
                            className="filters"
                            placeholder="Enter Name to filter"
                            value={filterKeyword}
                            onChange={handleFilterChange}
                          /> */}
                          <button
                            onClick={() => setadd(true)}
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
                            <th>S.No</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Action</th>
                            <th>Delete</th>
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
                              {subAdminData?.length > 0 ? (
                                subAdminData.map((item, i) => (
                                  <tr key={item._id}>
                                    <td>
                                      <span className="plus_14_ff">
                                        {i + 1}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.email}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.status == "1" ? (
                                          <span className="plus_14_ff text-success">
                                            Active
                                          </span>
                                        ) : (
                                          <span className="plus_14_ff text-danger">
                                            Deactive
                                          </span>
                                        )}
                                      </span>
                                    </td>
                                    <td>
                                      <label className="plus_14_ff ed-icon-fz">
                                        <i
                                          class="fa-regular fa-pen-to-square cursor-pointer"
                                          onClick={() =>
                                            getEditDetails(item._id)
                                          }
                                        ></i>
                                      </label>
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
                                                deleteDetail(
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
                                  <td colSpan={6}>
                                    <div className="empty_data my-4">
                                      <div className="plus_14_ff">
                                        No Records Found
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              {subAdminData?.length > 0 ? (
                                <tr className="text-center">
                                  <td colSpan="6">
                                    <div className="paginationcss">
                                      <ReactPaginate
                                        previousLabel={"<"}
                                        nextLabel={">"}
                                        breakLabel={"**"}
                                        pageCount={totalPages}
                                        forcePage={currentPage - 1}
                                        marginPagesDisplayed={1}
                                        pageRangeDisplayed={0}
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
                          )}
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="row justify-content-center mt-5">
                      <div className="currencyinput  col-lg-9">
                        <div class="form-group row">
                          <label class=" col-lg-6 col-form-label form-control-label">
                            Email
                          </label>
                          <div class=" col-lg-6">
                            <input
                              class="form-control"
                              type="email"
                              onChange={handleChange}
                              name="email"
                              value={admindata.email}
                              placeholder="Enter a Mail"
                            />
                            <div className="help-block">
                              {validationnErr.email && (
                                <div className="error">
                                  {validationnErr.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Permission
                          </label>
                          <div className="col-lg-6">
                            <Select
                              options={CategoryOptions}
                              isMulti
                              value={CategoryOptions.filter((opt) =>
                                admindata?.Permissions?.includes(opt.value)
                              )}
                              styles={customStyles}
                              placeholder="Select Category"
                              onChange={handleNetworkChange}
                              className="withdraw-dropdown-menu"
                            />
                            <div className="help-block">
                              {validationnErr.Permissions && (
                                <div className="error">
                                  {validationnErr.Permissions}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div class="form-group row">
                          <label class=" col-lg-6 col-form-label form-control-label">
                            Status
                          </label>
                          <div className="col-lg-6">
                            <div className="radio">
                              <div>
                                <input
                                  type="radio"
                                  name="status"
                                  value="1"
                                  onChange={handleChange}
                                  checked={admindata.status == "1"}
                                />{" "}
                                Active
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name="status"
                                  value="0"
                                  onChange={handleChange}
                                  checked={admindata.status == "0"}
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
                        <div class="form-group row justify-content-center">
                          <div class=" col-lg-4">
                            {buttonLoader == false ? (
                              <button
                                type="submit"
                                className="d-block w_100"
                                onClick={formSubmit}
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
                    </div>
                  )}
                </div>
              </div>
            </>
            {/* )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CmsManagement;
