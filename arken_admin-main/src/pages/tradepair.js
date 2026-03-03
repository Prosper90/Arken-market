import React, { useEffect, useRef } from "react";
import useState from "react-usestateref";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import * as Yup from "yup";
import ReactPaginate from "react-paginate";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";

import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
// import Modal from "@mui/joy/Modal";
import Moment from "moment";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ModalClose from "@mui/joy/ModalClose";

import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/material/Typography";
import { toast } from "react-toastify";
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

function Dashboard() {
  const inputRef = useRef(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currencylist, setcurrencylist, currencylistref] = useState([]);
  const [validationnErr, setvalidationnErr] = useState({});
  const [buttonLoader, setButtonLoader] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [loader, setLoader] = useState(true);

  const [nextpage, setnextpage] = useState(false);

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 11;
  useEffect(() => {
    getUserDetails(currentPage);
  }, [currentPage, filterKeyword]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [filteredUsers]);

  const getUserDetails = async (page = 1) => {
    setLoader(true);
    const data = {
      apiUrl: apiService.tradepair_view,
      payload: { page, limit: 5, keyword: filterKeyword }, // Include the keyword here
    };
    const response = await postMethod(data);
    // console.log(response, "=-=-=-=response=-=-=");
    setLoader(false);
    if (response.status) {
      setTotalPages(response.totalPages);
      setFilteredUsers(response.data); // No need to filter here, since we're now getting all users with the keyword
    } else {
      setFilteredUsers([]);
    }
  };
  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const changestate = currentStatus == 1 ? 0 : 1;

      const data = {
        apiUrl: apiService.changetradeStatus,
        payload: { _id: userId, status: changestate },
      };

      const response = await postMethod(data);

      if (response.status) {
        toast.success("Trade Pair Status Updated Successfully");
        // Refresh user data after status change
        getUserDetails(currentPage);
      } else {
        toast.error("Something Went Wrong. Please Try Again later");
      }
    } catch (error) {
      toast.error("Error updating status. Please try again later.");
    }
  };

  useEffect(() => {
    getcurrencylist();
  }, [0]);

  const getcurrencylist = async () => {
    try {
      const data = {
        apiUrl: apiService.tradecurrency,
      };

      const response = await getMethod(data);

      if (response.status) {
        const formattedData = Object.values(response.data).map((item) => {
          const [id, label] = item.split("_");
          return { id, label };
        });

        currencylistref.current = formattedData; // Assign formattedData to currencylistref.current

        setcurrencylist(formattedData); // If you're also using state

        // console.log(currencylistref.current, "ihnknknkn");
      } else {
        setcurrencylist({});
      }
    } catch (error) {
      // console.log("Error updating status. Please try again later.");
    }
  };

  const getTradepairOne = async (currentStatus) => {
    try {
      const data = {
        apiUrl: apiService.getTradepairOne,
        payload: { _id: currentStatus },
      };
      setLoader(true);
      const response = await postMethod(data);
      setLoader(false);
      if (response.status) {
        setnextpage(true);
        // console.log(response.data, "=-=-respons=-=-e=-");
        settradepair(response.data);
        getcurrencylist();
      } else {
        // console.log("Something Went Wrong. Please Try Again later");
      }
    } catch (error) {
      // console.log("Error updating status. Please try again later.");
    }
  };

  const deletecurrency = async (data) => {
    // console.log(data, "data");

    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.deletetradepair,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    setLoader(false);
    // console.log(response, "=-=-=-=response=-=-=");

    if (response.status) {
      toast.success(response.Message);
      getUserDetails(currentPage);

      // setAdd(true);
    } else {
      toast.error(response.Message);

      // setcmsdata({});
    }
  };

  const handleLiqiutyChange = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus == 0 ? 1 : 0;
      const data = {
        apiUrl: apiService.changeliqudityStatus,
        payload: { _id: userId, status: newStatus },
      };

      const response = await postMethod(data);

      if (response.status) {
        toast.success("Trade Pair Liquidity Status Updated Successfully");
        getUserDetails(currentPage);
        // Refresh user data after status change
      } else {
        toast.error("Something Went Wrong. Please Try Again later");
      }
    } catch (error) {
      toast.error("Error updating status. Please try again later.");
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (value.length === 1 && value.startsWith(" ")) return;
    setFilterKeyword(value);
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };
  const sentback = async () => {
    setnextpage(false);
    settradepair({});
  };

  const [tradepair, settradepair] = useState({
    marketPrice: "",
    highest_24h: "",
    lowest_24h: "",
    changes_24h: "",
    volume_24h: "",
    makerFee: "",
    takerFee: "",
    min_trade_amount: "",
    max_trade_amount: "",
    price_decimal: "",
    amount_decimal: "",
    from_symbol: "",
    to_symbol: "",
    from_symbol_id: "",
    to_symbol_id: "",
    buyspread: "",
    sellspread: "",
    liquidity_status: "",
    liquidity_available: "",
    status: "",
  });

  const validateForm = (values) => {
    const errors = {};

    if (!values.from_symbol) {
      errors.from_symbol = "From Symbol is required";
    }

    if (!values.to_symbol) {
      errors.to_symbol = "To Symbol is required";
    }

    if (
      values.status == undefined ||
      values.status == "" ||
      values.status == null
    ) {
      errors.status = " Status is required";
    }

    if (
      values.liquidity_status == undefined ||
      values.liquidity_status == "" ||
      values.liquidity_status == null
    ) {
      errors.liquidity_status = "Liquidity  Status is required";
    }

    if (!values.price_decimal) {
      errors.price_decimal = "Price Decimal is required";
    }
    if (!values.amount_decimal) {
      errors.amount_decimal = "Amount Decimal is required";
    }

    if (!values.makerFee) {
      errors.makerFee = "Maker Fee is required";
    }
    if (!values.takerFee) {
      errors.takerFee = "Taker Fee is required";
    }

    if (!values.min_trade_amount) {
      errors.min_trade_amount = "Minimum Trade Amount is required";
    }

    if (!values.max_trade_amount) {
      errors.max_trade_amount = "Maximum Trade Amount is required";
    }

    return errors;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...tradepair, [name]: value };
    settradepair(updatedFormData);
    const errors = validateForm(updatedFormData);
    setvalidationnErr(errors);
  };

  const handleSubmit = async (e) => {
    // console.log("knjkmkmkmkmk",e);
    e.preventDefault();
    const errors = validateForm(tradepair);
    if (Object.keys(errors).length > 0) {
      setvalidationnErr(errors);
      return;
    }
    setvalidationnErr({});
    // console.log("Form data submitted:", tradepair);
    var datas = {
      apiUrl: apiService.addTradePair,
      payload: tradepair,
    };
    setButtonLoader(true);
    var response = await postMethod(datas);
    setButtonLoader(false);
    // console.log(response, "=-=-=-=response=-=-=");

    if (response.status) {
      toast.success(response.Message);
      getUserDetails(currentPage);
      setnextpage(false);
      settradepair({});
    } else {
      toast.error(response.Message);
    }
    // getUserDetails();
    // setAdd(false);
    // setstakingpage(false);
    // setstakeflex(false);
    // setFormData({});
    // setStakingData({});
  };
  const handleCurrencyChange = (event, type) => {
    const selectedOption = event.target.options[event.target.selectedIndex];

    const id = selectedOption.value; // Gets the value (id) of the selected option
    const label = selectedOption.getAttribute("label"); // Gets the label of the selected option

    // console.log(`Selected ${type} ID:`, id);
    // console.log(`Selected ${type} Label:`, label);

    const updatedFormData = {
      ...tradepair,
      [`${type}_symbol`]: label,
      [`${type}_symbol_id`]: id,
    };

    settradepair(updatedFormData);
    validateForm(updatedFormData); // Pass the updated form data for validation
  };

  const [open, setOpen] = useState(false);
  const [botOpen, setBotOpen] = useState(false);
  const [itemUnderid, setitemUnderid, itemUnderidref] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleBotOpen = (item) => {
    // console.log("item _id", item._id);
    setitemUnderid(item._id);
    setFormValueSecond({
      market_making: item.market_making,
      mm_limit: item.mm_limit || "",
      mm_Quantity: item.mm_Quantity || "",
      max_Quantity: item.max_Quantity || "",
    });
    setBotOpen(true);
  };
  const handleBotClose = () => {
    setBotOpen(false);
    setValidationErrSecond({});
    setmmlimitValidate(false);
    setmmqtyValidate(false);
    setmaxqtyValidate(false);
  };

  const [formValueSecond, setFormValueSecond] = useState({
    market_making: "",
    mm_limit: "",
    mm_Quantity: "",
    max_Quantity: "",
  });
  const [validationErrSecond, setValidationErrSecond] = useState({});
  const [mmlimitValidate, setmmlimitValidate, mmlimitValidateref] =
    useState(false);
  const [mmqtyValidate, setmmqtyValidate, mmqtyValidateref] = useState(false);
  const [maxqtyValidate, setmaxqtyValidate, maxqtyValidateref] =
    useState(false);

  const popvalidate = (values) => {
    let errors = {};

    if (!values.mm_limit) {
      errors.mm_limit = "Order count is a required field!";
      setmmlimitValidate(true);
    } else if (isNaN(values.mm_limit)) {
      errors.mm_limit = "Order count must be a number!";
      setmmlimitValidate(true);
    } else {
      setmmlimitValidate(false);
    }
    if (!values.mm_Quantity) {
      errors.mm_Quantity = "Minimum quantity is a required field!";
      setmmqtyValidate(true);
    } else if (isNaN(values.mm_Quantity)) {
      errors.mm_Quantity = "Minimum quantity must be a number!";
      setmmqtyValidate(true);
    } else {
      setmmqtyValidate(false);
    }
    if (!values.max_Quantity) {
      errors.max_Quantity = "Maximum quantity is a required field!";
      setmaxqtyValidate(true);
    } else if (isNaN(values.max_Quantity)) {
      errors.max_Quantity = "Maximum quantity must be a number!";
      setmaxqtyValidate(true);
    } else {
      setmaxqtyValidate(false);
    }

    setValidationErrSecond(errors);
    return errors;
  };

  const secondSubmit = async (id) => {
    console.log("******", formValueSecond);
    const errors = popvalidate(formValueSecond);
    if (
      mmlimitValidateref.current == false &&
      mmqtyValidateref.current == false &&
      maxqtyValidateref.current == false
    ) {
      console.log("sucesss fororder count -->> ***");
      var sendObj = {
        ...formValueSecond,
        _id: itemUnderidref.current,
      };
      var datas = {
        apiUrl: apiService.mmbotStatusUpdate,
        payload: sendObj,
      };
      setSubmitLoader(true);
      var response = await postMethod(datas);
      setSubmitLoader(false);
      if (response.status) {
        toast.success(response.Message);
        handleBotClose();
        getUserDetails(currentPage);
      } else {
        toast.error(response.Message);
        handleBotClose();
        getUserDetails(currentPage);
      }
    }
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

            {loader ? (
              <SkeletonwholeProject />
            ) : (
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">
                      {" "}
                      {nextpage == false
                        ? "Trade Pair Management"
                        : "Add / Edit Trade Pair"}{" "}
                    </span>

                    <div className="usr_mng_rgt">
                      {nextpage == false ? (
                        <>
                          <div className="filter_container">
                            <input
                              className="filter_input"
                              placeholder="Search tradepair "
                              value={filterKeyword}
                              ref={inputRef}
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
                        <button
                          className="export_btn"
                          onClick={() => sentback()}
                        >
                          Back
                        </button>
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
                              <th>Trade Pair</th>
                              <th>Market Price</th>
                              <th>Min Trade amount</th>
                              <th>Maker Fee</th>
                              <th>Taker Fee</th>
                              {/* <th>Liquidity Status</th>
                            <th>Liquidity Update </th> */}
                              {/* <th>Bot Status </th> */}
                              <th>Status </th>
                              <th>Action </th>
                              <th>Delete </th>
                            </tr>
                          </thead>
                          {loader == true ? (
                            // <tr>
                            //   <td colSpan={11}>
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
                                        {item.pair}
                                      </span>
                                    </td>

                                    <td>
                                      <span className="plus_14_ff">
                                        {item.marketPrice}
                                      </span>
                                    </td>

                                    <td>
                                      <span className="plus_14_ff">
                                        {item.min_trade_amount}
                                      </span>
                                    </td>

                                    <td>
                                      <span className="plus_14_ff">
                                        {item.makerFee}
                                      </span>
                                    </td>

                                    <td>
                                      <span className="plus_14_ff">
                                        {item.takerFee}
                                      </span>
                                    </td>
                                    {/* <td>
                                  <span className="plus_14_ff">
                                    {item.liquidity_status == 1
                                      ? "Binance"
                                      : "Self"}
                                  </span>
                                </td>

                                <td>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={item.liquidity_status == 1}
                                      onChange={() =>
                                        handleLiqiutyChange(
                                          item._id,
                                          item.liquidity_status
                                        )
                                      }
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </td> */}

                                    {/* <td>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={item.market_making === "1"}
                                      onChange={() => handleBotOpen(item)}
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </td> */}

                                    <td>
                                      <label className="switch">
                                        <input
                                          type="checkbox"
                                          checked={item.status == 1}
                                          onChange={() =>
                                            handleStatusChange(
                                              item._id,
                                              item.status
                                            )
                                          }
                                        />
                                        <span className="slider round"></span>
                                      </label>
                                    </td>

                                    <td>
                                      <span className="plus_14_ff ed-icon-fz">
                                        <i
                                          className="fa-regular fa-pen-to-square cursor-pointer"
                                          onClick={() =>
                                            getTradepairOne(item._id)
                                          }
                                        ></i>
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff ed-icon-fz">
                                        <i
                                          className="fa-regular fa-trash-can text-danger cursor-pointer"
                                          // onClick={() => deletecurrency(item._id)}
                                          onClick={() => handleOpen()}
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
                                                deletecurrency(item._id)
                                              }
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        </Box>
                                      </Fade>
                                    </Modal>

                                    <Modal
                                      aria-labelledby="transition-modal-title"
                                      aria-describedby="transition-modal-description"
                                      open={botOpen}
                                      onClose={handleBotClose}
                                      closeAfterTransition
                                      slots={{ backdrop: Backdrop }}
                                      slotProps={{
                                        backdrop: {
                                          timeout: 500,
                                        },
                                      }}
                                    >
                                      <Fade in={botOpen}>
                                        <Box
                                          sx={style}
                                          className="popup_modal-delete"
                                        >
                                          <div className="popup_modal_mmb">
                                            <span>Market Making Bot</span>
                                            <i
                                              class="fa-regular fa-circle-xmark"
                                              onClick={() => handleBotClose()}
                                            ></i>
                                          </div>
                                          <div className="popup_modal_mmbin">
                                            <div className="popup_modal_mmbin_disp">
                                              <span>Status:</span>
                                              <label className="switch mt-2">
                                                <input
                                                  type="checkbox"
                                                  checked={
                                                    formValueSecond.market_making ===
                                                    "1"
                                                  }
                                                  onChange={() => {
                                                    setFormValueSecond(
                                                      (prevState) => ({
                                                        ...prevState,
                                                        market_making:
                                                          prevState.market_making ===
                                                          "1"
                                                            ? "0"
                                                            : "1",
                                                      })
                                                    );
                                                  }}
                                                />
                                                <span className="slider round"></span>
                                              </label>
                                              <span className="">
                                                {formValueSecond.market_making ===
                                                "1"
                                                  ? "Active"
                                                  : "Deactive"}
                                              </span>
                                            </div>
                                            <div className="popup_modal_mmbin_inpman">
                                              <span>Order Count:</span>
                                              <input
                                                type="number"
                                                placeholder="Enter order count"
                                                name="mm_limit"
                                                value={formValueSecond.mm_limit}
                                                onInput={(e) => {
                                                  e.target.value =
                                                    e.target.value.replace(
                                                      /[^0-9.]/g,
                                                      ""
                                                    ); // Allow numbers and dot
                                                }}
                                                onChange={(e) => {
                                                  const { value } = e.target;
                                                  const sanitizedValue =
                                                    value.replace(/\s/g, "");
                                                  if (
                                                    /^\d{0,10}$/.test(value)
                                                  ) {
                                                    setFormValueSecond(
                                                      (prev) => ({
                                                        ...prev,
                                                        mm_limit:
                                                          sanitizedValue,
                                                      })
                                                    );
                                                  }
                                                  if (!sanitizedValue) {
                                                    setValidationErrSecond(
                                                      (prev) => ({
                                                        ...prev,
                                                        mm_limit:
                                                          "Order count is a required field!",
                                                      })
                                                    );
                                                    setmmlimitValidate(true);
                                                  } else if (
                                                    isNaN(sanitizedValue)
                                                  ) {
                                                    setValidationErrSecond(
                                                      (prev) => ({
                                                        ...prev,
                                                        mm_limit:
                                                          "Order count must be a number!",
                                                      })
                                                    );
                                                    setmmlimitValidate(true);
                                                  } else {
                                                    setValidationErrSecond(
                                                      (prev) => {
                                                        const {
                                                          mm_limit,
                                                          ...rest
                                                        } = prev;
                                                        return rest;
                                                      }
                                                    );
                                                    setmmlimitValidate(false);
                                                  }
                                                }}
                                              />
                                              {validationErrSecond.mm_limit && (
                                                <p className="errorcss">
                                                  {validationErrSecond.mm_limit}
                                                </p>
                                              )}
                                            </div>
                                            <div className="popup_modal_mmb_halhinp">
                                              <div className="popup_modal_mmbin_inpman wid50_mmb_inp">
                                                <span>Min Quantity:</span>
                                                <input
                                                  type="number"
                                                  placeholder="Min Qty"
                                                  name="mm_Quantity"
                                                  onInput={(e) => {
                                                    e.target.value =
                                                      e.target.value.replace(
                                                        /[^0-9.]/g,
                                                        ""
                                                      ); // Allow numbers and dot
                                                  }}
                                                  value={
                                                    formValueSecond.mm_Quantity
                                                  }
                                                  onChange={(e) => {
                                                    const { value } = e.target;
                                                    const sanitizedValue =
                                                      value.replace(/\s/g, "");
                                                    if (
                                                      /^\d{0,10}$/.test(value)
                                                    ) {
                                                      setFormValueSecond(
                                                        (prev) => ({
                                                          ...prev,
                                                          mm_Quantity:
                                                            sanitizedValue,
                                                        })
                                                      );
                                                    }
                                                    if (!sanitizedValue) {
                                                      setValidationErrSecond(
                                                        (prev) => ({
                                                          ...prev,
                                                          mm_Quantity:
                                                            "Minimum quantity is a required field!",
                                                        })
                                                      );
                                                      setmmqtyValidate(true);
                                                    } else if (
                                                      isNaN(sanitizedValue)
                                                    ) {
                                                      setValidationErrSecond(
                                                        (prev) => ({
                                                          ...prev,
                                                          mm_Quantity:
                                                            "Minimum quantity must be a number!",
                                                        })
                                                      );
                                                      setmmqtyValidate(true);
                                                    } else {
                                                      setValidationErrSecond(
                                                        (prev) => {
                                                          const {
                                                            mm_Quantity,
                                                            ...rest
                                                          } = prev;
                                                          return rest;
                                                        }
                                                      );
                                                      setmmqtyValidate(false);
                                                    }
                                                  }}
                                                />
                                                {validationErrSecond.mm_Quantity && (
                                                  <p className="errorcss">
                                                    {
                                                      validationErrSecond.mm_Quantity
                                                    }
                                                  </p>
                                                )}
                                              </div>
                                              <div className="popup_modal_mmbin_inpman wid50_mmb_inp">
                                                <span>Max Quantity:</span>
                                                <input
                                                  type="number"
                                                  placeholder="Max Qty"
                                                  name="max_Quantity"
                                                  value={
                                                    formValueSecond.max_Quantity
                                                  }
                                                  onInput={(e) => {
                                                    e.target.value =
                                                      e.target.value.replace(
                                                        /[^0-9.]/g,
                                                        ""
                                                      ); // Allow numbers and dot
                                                  }}
                                                  onChange={(e) => {
                                                    const { value } = e.target;
                                                    const sanitizedValue =
                                                      value.replace(/\s/g, "");
                                                    if (
                                                      /^\d{0,10}$/.test(value)
                                                    ) {
                                                      setFormValueSecond(
                                                        (prev) => ({
                                                          ...prev,
                                                          max_Quantity:
                                                            sanitizedValue,
                                                        })
                                                      );
                                                    }
                                                    if (!sanitizedValue) {
                                                      setValidationErrSecond(
                                                        (prev) => ({
                                                          ...prev,
                                                          max_Quantity:
                                                            "Maximum quantity is a required field!",
                                                        })
                                                      );
                                                      setmaxqtyValidate(true);
                                                    } else if (
                                                      isNaN(sanitizedValue)
                                                    ) {
                                                      setValidationErrSecond(
                                                        (prev) => ({
                                                          ...prev,
                                                          max_Quantity:
                                                            "Maximum quantity must be a number!",
                                                        })
                                                      );
                                                      setmaxqtyValidate(true);
                                                    } else {
                                                      setValidationErrSecond(
                                                        (prev) => {
                                                          const {
                                                            max_Quantity,
                                                            ...rest
                                                          } = prev;
                                                          return rest;
                                                        }
                                                      );
                                                      setmaxqtyValidate(false);
                                                    }
                                                  }}
                                                />
                                                {validationErrSecond.max_Quantity && (
                                                  <p className="errorcss">
                                                    {
                                                      validationErrSecond.max_Quantity
                                                    }
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          <div className="popup_modal-btn-wrap mb-2">
                                            <button
                                              className="popup_modal-btn-cancel"
                                              onClick={() => handleBotClose()}
                                            >
                                              Cancel
                                            </button>
                                            {submitLoader == false ? (
                                              <button
                                                className="popup_modal-btn-subm"
                                                onClick={() =>
                                                  secondSubmit(item._id)
                                                }
                                              >
                                                Submit
                                              </button>
                                            ) : (
                                              <button className="popup_modal-btn-subm">
                                                Loading
                                              </button>
                                            )}
                                          </div>
                                        </Box>
                                      </Fade>
                                    </Modal>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={11}>
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
                                  <td colSpan="11">
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
                    <div className="my-5 trans-table">
                      <div className="currencyinput">
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            From Currency
                          </label>
                          <div className="col-lg-6">
                            <select
                              value={tradepair.from_symbol_id || ""}
                              className="inputselect"
                              onChange={(e) => handleCurrencyChange(e, "from")}
                            >
                              <option value="" className="form-control">
                                Select From Currency
                              </option>
                              {currencylistref?.current &&
                                currencylistref?.current?.map((currency) => (
                                  <option
                                    key={currency.id}
                                    value={currency.id}
                                    label={currency.label}
                                  >
                                    {currency.label}
                                  </option>
                                ))}
                            </select>

                            <div className="help-block">
                              {validationnErr.from_symbol && (
                                <div className="error">
                                  {validationnErr.from_symbol}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            To Currency
                          </label>
                          <div className="col-lg-6">
                            <select
                              value={tradepair.to_symbol_id || ""}
                              className="inputselect"
                              onChange={(e) => handleCurrencyChange(e, "to")}
                            >
                              <option value="" className="form-control">
                                Select TO Currency
                              </option>
                              {currencylistref?.current &&
                                currencylistref?.current?.map((currency) => (
                                  <option
                                    key={currency.id}
                                    value={currency.id}
                                    label={currency.label}
                                  >
                                    {currency.label}
                                  </option>
                                ))}
                            </select>

                            <div className="help-block">
                              {validationnErr.to_symbol && (
                                <div className="error">
                                  {validationnErr.to_symbol}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Market Price
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              name="marketPrice"
                              // onInput={(e) => {
                              //   e.target.value = e.target.value.replace(
                              //     /[^0-9.]/g,
                              //     ""
                              //   );
                              // }}
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              value={tradepair.marketPrice}
                              onChange={handleChange}
                              placeholder="Market Price"
                              className="form-control"
                              required
                            />
                            <div className="help-block">
                              {validationnErr.marketPrice && (
                                <div className="error">
                                  {validationnErr.marketPrice}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Min Trade Amount
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              name="min_trade_amount"
                              value={tradepair.min_trade_amount}
                              onChange={handleChange}
                              min={0}
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              placeholder="Min Trade Amount"
                              className="form-control"
                              required
                            />
                            <div className="help-block">
                              {validationnErr.min_trade_amount && (
                                <div className="error">
                                  {validationnErr.min_trade_amount}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Max Trade Amount
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              min={0}
                              name="max_trade_amount"
                              value={tradepair.max_trade_amount}
                              onChange={handleChange}
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              placeholder="Max Trade Amount"
                              className="form-control"
                              required
                            />
                            <div className="help-block">
                              {validationnErr.max_trade_amount && (
                                <div className="error">
                                  {validationnErr.max_trade_amount}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Maker Fee %
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              name="makerFee"
                              value={tradepair.makerFee}
                              // onInput={(e) => {
                              //   e.target.value = e.target.value.replace(
                              //     /[^0-9.]/g,
                              //     ""
                              //   );
                              // }}
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              onChange={handleChange}
                              placeholder="Maker Fee"
                              className="form-control"
                              required
                            />
                            <div className="help-block">
                              {validationnErr.makerFee && (
                                <div className="error">
                                  {validationnErr.makerFee}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Taker Fee %
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              name="takerFee"
                              // onInput={(e) => {
                              //   e.target.value = e.target.value.replace(
                              //     /[^0-9.]/g,
                              //     ""
                              //   );
                              // }}
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              value={tradepair.takerFee}
                              onChange={handleChange}
                              placeholder="Taker Fee"
                              className="form-control"
                              required
                            />
                            <div className="help-block">
                              {validationnErr.takerFee && (
                                <div className="error">
                                  {validationnErr.takerFee}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Price Decimal
                          </label>
                          <div className="col-lg-6">
                            <input
                              type=" number"
                              name="price_decimal"
                              value={tradepair.price_decimal}
                              onChange={handleChange}
                              onInput={(e) => {
                                e.target.value = e.target.value.replace(
                                  /[^0-9.]/g,
                                  ""
                                );
                              }}
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              placeholder="Price Decimal"
                              className="form-control"
                              required
                            />
                            <div className="help-block">
                              {validationnErr.price_decimal && (
                                <div className="error">
                                  {validationnErr.price_decimal}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Amount Decimal
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="numebr"
                              name="amount_decimal"
                              value={tradepair.amount_decimal}
                              onInput={(e) => {
                                e.target.value = e.target.value.replace(
                                  /[^0-9.]/g,
                                  ""
                                );
                              }}
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              onChange={handleChange}
                              placeholder="Amount Decimal"
                              className="form-control"
                              required
                            />
                            <div className="help-block">
                              {validationnErr.amount_decimal && (
                                <div className="error">
                                  {validationnErr.amount_decimal}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Buy Spread
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              name="buyspread"
                              value={tradepair.buyspread}
                              onChange={handleChange}
                              placeholder="Buy Spread"
                              className="form-control"
                              // onInput={(e) => {
                              //   e.target.value = e.target.value.replace(
                              //     /[^0-9.]/g,
                              //     ""
                              //   );
                              // }}
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              required
                            />
                            <div className="help-block">
                              {validationnErr.buyspread && (
                                <div className="error">
                                  {validationnErr.buyspread}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Sell Spread
                          </label>
                          <div className="col-lg-6">
                            <input
                              type="number"
                              // onInput={(e) => {
                              //   e.target.value = e.target.value.replace(
                              //     /[^0-9.]/g,
                              //     ""
                              //   );
                              // }}
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-"].includes(evt.key) &&
                                evt.preventDefault()
                              }
                              name="sellspread"
                              value={tradepair.sellspread}
                              onChange={handleChange}
                              placeholder="Sell Spread"
                              className="form-control"
                              required
                            />
                            <div className="help-block">
                              {validationnErr.sellspread && (
                                <div className="error">
                                  {validationnErr.sellspread}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Liquidity Status
                        </label>
                        <div className="col-lg-6">
                          <div className="radio">
                            <div>
                              <input
                                type="radio"
                                name="liquidity_status"
                                value="1"
                                onChange={handleChange}
                                checked={tradepair.liquidity_status == "1"}
                              />{" "}
                              Binance
                            </div>
                            <div>
                              <input
                                type="radio"
                                name="liquidity_status"
                                value="0"
                                onChange={handleChange}
                                checked={tradepair.liquidity_status == "0"}
                              />{" "}
                              Self
                            </div>
                          </div>
                          <div className="help-block">
                            {validationnErr.liquidity_status && (
                              <div className="error">
                                {validationnErr.liquidity_status}
                              </div>
                            )}
                          </div>
                        </div>
                      </div> */}
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
                                  onChange={handleChange}
                                  checked={tradepair.status == "1"}
                                />{" "}
                                Active
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name="status"
                                  value="0"
                                  onChange={handleChange}
                                  checked={tradepair.status == "0"}
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
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
