import React, { useEffect } from "react";
import useState from "react-usestateref";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import Select from "react-select";
import ReactPaginate from "react-paginate";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
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
    backgroundColor: "#000",
    padding: "4px",
    color: "#fff",
    boxShadow: "none",
    outline: "none",
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
  menu: (styles) => ({
    ...styles,
  }),
};

function Dashboard() {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currencylist, setcurrencylist, currencylistref] = useState([]);
  const [activecurreny, setActivecurreny] = useState([]);
  const [activecurrenywhole, setActivecurrenywhole] = useState([]);
  const [selectedCurrencyDetails, setSelectedCurrencyDetails] = useState({
    name: "",
    image: "",
  });

  const [validationnErr, setvalidationnErr] = useState({});
  const [buttonLoader, setButtonLoader] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [loader, setLoader] = useState(true);
  const [imageName, setimageName] = useState("");
  const [nextpage, setnextpage] = useState(false);
  const [siteLoader, setSiteLoader] = useState(false);
  const [tradepair, settradepair] = useState({
    currency: "",
    description: "",
    badge: "",
    currentTrend: "",
    status: "",
  });
  const [open, setOpen] = useState(false);
  const [deleteid, setDeleteid] = useState(null);
  const [botOpen, setBotOpen] = useState(false);
  const [itemUnderid, setitemUnderid, itemUnderidref] = useState("");

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 9;
  useEffect(() => {
    getUserDetails(currentPage);
  }, [currentPage, filterKeyword]);

  const getUserDetails = async (page = 1) => {
    const data = {
      apiUrl: apiService.research_itemview,
      payload: { page, limit: 5, keyword: filterKeyword },
    };
    const response = await postMethod(data);
    if (response.status) {
      setTotalPages(response.totalPages);
      setFilteredUsers(response.data);
    } else {
      setFilteredUsers([]);
    }
  };

  const getCurrency = async () => {
    setSiteLoader(true);
    const data = { apiUrl: apiService.getcurrency };
    const resp = await postMethod(data);
    setSiteLoader(false);

    if (resp.status === true) {
      const formatted = resp.data.map((item) => ({
        value: item.currencySymbol,
        label: item.currencySymbol,
      }));

      setActivecurreny(formatted);
      setActivecurrenywhole(resp.data);
    }
  };

  useEffect(() => {
    getcurrencylist();
    getCurrency();
  }, [0]);

  const getcurrencylist = async () => {
    try {
      setLoader(true);

      const data = {
        apiUrl: apiService.tradecurrency,
      };

      const response = await getMethod(data);
      setLoader(false);

      if (response.status) {
        const formattedData = Object.values(response.data).map((item) => {
          const [id, label] = item.split("_");
          return { id, label };
        });

        currencylistref.current = formattedData;

        setcurrencylist(formattedData);
      } else {
        setcurrencylist({});
      }
    } catch (error) {}
  };

  const deletecurrency = async (data) => {
    console.log(data, "data");

    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.deleteresearch,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    setLoader(false);

    if (response.status == true) {
      toast.success(response.Message);
      getUserDetails(currentPage);
      setDeleteid(null);
      setOpen(false);
    } else {
      toast.error(response.Message);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (value.startsWith(" ")) return;
    setFilterKeyword(value);
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };
  const sentback = async () => {
    setnextpage(false);
    settradepair({});
  };

  const validateForm = (values) => {
    const errors = {};

    if (!values.currency) {
      errors.currency = "Currency is required";
    }

    if (!values.description) {
      errors.description = "Description is required";
    }

    if (!values.badge) {
      errors.badge = "Badge is required";
    }

    if (!values.currentTrend) {
      errors.currentTrend = "Current Trend is required";
    }

    if (
      values.status === undefined ||
      values.status === "" ||
      values.status === null
    ) {
      errors.status = "Status is required";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const cleanedValue = value.replace(/^\s+/, "");

    const updatedFormData = { ...tradepair, [name]: cleanedValue };
    settradepair(updatedFormData);

    const fieldError = validateForm(updatedFormData)[name];

    setvalidationnErr((prev) => ({
      ...prev,
      [name]: fieldError || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm(tradepair);
    if (Object.keys(errors).length > 0) {
      setvalidationnErr(errors);
      return;
    }

    setvalidationnErr({});

    const payload = {
      currencyimg: selectedCurrencyDetails?.image || "",
      currency: tradepair.currency?.value || "",
      currencyName: selectedCurrencyDetails?.name || "",
      description: tradepair.description || "",
      badge: tradepair.badge || "",
      currentTrend: tradepair.currentTrend || "",
      status: tradepair.status || "",
    };

    if (tradepair._id) {
      payload.id = tradepair._id;
    }

    const datas = {
      apiUrl: tradepair._id
        ? apiService.updateResearch
        : apiService.addResearch,
      payload: payload,
    };

    setButtonLoader(true);
    try {
      const response = await postMethod(datas);
      setButtonLoader(false);

      if (response.status == true) {
        toast.success(response.message || response.Message);
        getUserDetails(currentPage);
        setnextpage(false);
        settradepair({});
      } else {
        toast.error(response.message || response.Message);
      }
    } catch (err) {
      setButtonLoader(false);
      toast.error("Something went wrong!");
    }
  };

  const handleOpen = (id) => {
    setDeleteid(id);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const getResearchItemOne = (item) => {
    setnextpage(true);
    const selectedCurrency =
      activecurreny?.find((c) => c.value === item.currency) || null;

    settradepair({
      ...item,
      currency: selectedCurrency,
    });

    setSelectedCurrencyDetails({
      name: item.currencyName,
      image: item.currencyimg,
    });
  };

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
                    <span className="dash-head">
                      {" "}
                      {nextpage == false
                        ? "Research Management"
                        : "Add / Edit Research"}{" "}
                    </span>
                    <div className="usr_mng_rgt">
                      {nextpage == false ? (
                        <>
                          <div className="filter_container">
                            <input
                              className="filter_input"
                              placeholder="Search currency"
                              value={filterKeyword}
                              onChange={handleFilterChange}
                            />
                            <i className="fa-solid fa-magnifying-glass"></i>
                          </div>
                          <button
                            onClick={() => setnextpage(true)}
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
                  </div>
                  {nextpage == false ? (
                    <div className="my-5 trans-table">
                      <div className="table-responsive">
                        <table className="w_100">
                          <thead className="trans-head">
                            <tr>
                              <th>S.No</th>
                              <th>Currency</th>
                              <th>Currency Name</th>
                              <th>Description</th>
                              <th>Badge</th>
                              <th>Current Trend</th>
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
                              {filteredUsers?.length > 0 ? (
                                filteredUsers?.map((item, i) => (
                                  <tr key={item._id}>
                                    <td>
                                      <span className="plus_14_ff">
                                        {i + 1}
                                      </span>
                                    </td>

                                    <td>
                                      <span className="plus_14_ff">
                                        {item.currency}
                                      </span>
                                    </td>

                                    <td>
                                      <span className="plus_14_ff">
                                        {item.currencyName}
                                      </span>
                                    </td>

                                    <td>
                                      <span className="plus_14_ff txntype_maxwidth txntype_maxwidth_research">
                                        {item.description}
                                      </span>
                                    </td>

                                    <td>
                                      <span className="plus_14_ff">
                                        {item.badge}
                                      </span>
                                    </td>

                                    <td>
                                      <span className="plus_14_ff">
                                        {item.currentTrend}
                                      </span>
                                    </td>

                                    <td>
                                      <span
                                        className="plus_14_ff"
                                        style={{
                                          color:
                                            item.status === 1 ? "green" : "red",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {item.status === 1
                                          ? "Active"
                                          : "Inactive"}
                                      </span>
                                    </td>

                                    <td>
                                      <span className="plus_14_ff ed-icon-fz">
                                        <i
                                          className="fa-regular fa-pen-to-square cursor-pointer"
                                          onClick={() =>
                                            getResearchItemOne(item)
                                          }
                                        ></i>
                                      </span>
                                    </td>

                                    <td>
                                      <span className="plus_14_ff ed-icon-fz">
                                        <i
                                          className="fa-regular fa-trash-can text-danger cursor-pointer"
                                          onClick={() => handleOpen(item._id)}
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
                                                deletecurrency(deleteid)
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
                              {filteredUsers.length > 0 && (
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
                                        forcePage={currentPage - 1}
                                        containerClassName="pagination pagination-md justify-content-center"
                                        pageClassName="page-item"
                                        pageLinkClassName="page-link"
                                        previousClassName="page-item"
                                        previousLinkClassName="page-link"
                                        nextClassName="page-item"
                                        nextLinkClassName="page-link"
                                        breakClassName="page-item"
                                        breakLinkClassName="page-link"
                                        activeClassName="active"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          )}
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="trans-table my-5">
                      <div className=" currencyinput">
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Currency
                          </label>
                          <div className="col-lg-6">
                            <Select
                              name="currency"
                              options={activecurreny || []}
                              styles={customStyles}
                              value={tradepair.currency || null}
                              onChange={(option) => {
                                settradepair((prev) => ({
                                  ...prev,
                                  currency: option,
                                }));

                                setvalidationnErr((prev) => ({
                                  ...prev,
                                  currency: "",
                                }));

                                const selectedCurrency =
                                  activecurrenywhole.find(
                                    (c) => c.currencySymbol === option.value
                                  );

                                if (selectedCurrency) {
                                  setSelectedCurrencyDetails({
                                    name: selectedCurrency.currencyName,
                                    image: selectedCurrency.Currency_image,
                                  });
                                }
                              }}
                              onBlur={() => {
                                if (!tradepair.currency) {
                                  setvalidationnErr((prev) => ({
                                    ...prev,
                                    currency: "Currency is required",
                                  }));
                                }
                              }}
                              placeholder="Select Currency"
                              classNamePrefix="react-select"
                              isLoading={siteLoader}
                            />

                            <div className="help-block">
                              {validationnErr.currency && (
                                <div className="error">
                                  {validationnErr.currency}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row mt-4">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Description
                          </label>
                          <div className="col-lg-6">
                            <textarea
                              name="description"
                              value={tradepair.description || ""}
                              onChange={handleChange}
                              placeholder="Enter description"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.description && (
                                <div className="error">
                                  {validationnErr.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row mt-4">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Badge
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              name="badge"
                              value={tradepair.badge || ""}
                              onChange={handleChange}
                              placeholder="Enter Badge (e.g. Core Investment, Long Term Buy, Utility & Growth)"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.badge && (
                                <div className="error">
                                  {validationnErr.badge}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Current Trend */}
                        <div className="form-group row mt-4">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Current Trend
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              name="currentTrend"
                              value={tradepair.currentTrend || ""}
                              onChange={handleChange}
                              placeholder="e.g. +2.35% ↑ or -1.25% ↓"
                              className="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.currentTrend && (
                                <div className="error">
                                  {validationnErr.currentTrend}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row mt-4">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Status
                          </label>
                          <div className="col-lg-6">
                            <div className="radio">
                              <label>
                                <input
                                  type="radio"
                                  name="status"
                                  value="1"
                                  onChange={handleChange}
                                  checked={tradepair.status == "1"}
                                />{" "}
                                Active
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name="status"
                                  value="0"
                                  onChange={handleChange}
                                  checked={tradepair.status == "0"}
                                />{" "}
                                Inactive
                              </label>
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

                        {/* Submit */}
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
export default Dashboard;
