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
import CsvDownloader from "react-csv-downloader";
import { MdAddCircle } from "react-icons/md";
import Select from "react-select";
import { FiCheck } from "react-icons/fi";
import { IoAddCircleSharp } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowDown } from "react-icons/io";
import { BsPerson } from "react-icons/bs";
import { LuBrainCog, LuShieldCheck } from "react-icons/lu";
import { AiFillCheckCircle } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { postMethod } from "../../core/service/common.api";
import apiService from "../../core/service/detail";
import { FaRegCalendarAlt } from "react-icons/fa";
import axios from "axios";
import { LuLockKeyholeOpen } from "react-icons/lu";
import { env } from "../../core/service/envconfig";

const MarketCreaction = () => {
  const [loader, setLoader] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [approvalTab, setApprovalTab] = useState("all"); // "all" | "pending"
  const [approvalLoader, setApprovalLoader] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [csvData, setCsvData, csvDataref] = useState([]);
  const inputRef = useRef(null);
  const [filterKeyword, setFilterKeyword] = useState("");
const [sliderValue, setSliderValue] = useState({});
  const [formStep, setFormStep] = useState(1);
    const [imageName, setimageName] = useState("");
  const [sliderValueNo, setSliderValueNo] = useState(0)

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

  const getUserDetails = async (page = 1, tab = approvalTab) => {
    setLoader(true);

    const payload = { page, limit: 5, keyword: filterKeyword };
    if (tab !== "all") {
      payload.marketStatus = tab; // "pending" | "active" | "closed"
    }

    const data = {
      apiUrl: apiService.market_list,
      payload,
    };
    const response = await postMethod(data);
    setLoader(false);

    if (response.status) {
      setMarketData(response.data);
      setTotalPages(response.totalPages);
    } else {
      setMarketData([]);
    }
  };

  const handleApproveMarket = async (item) => {
    setApprovalLoader(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.market_update,
        payload: {
          id: item._id,
          active: true,
          marketStatus: "active",
        },
      });
      if (resp.status) {
        toast.success("Market approved and activated");
        getUserDetails(currentPage, approvalTab);
      } else {
        toast.error(resp.message || "Failed to approve");
      }
    } catch (e) {
      toast.error("Error approving market");
    } finally {
      setApprovalLoader(false);
    }
  };

  const handleRejectMarket = async (item) => {
    setApprovalLoader(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.market_update,
        payload: {
          id: item._id,
          active: false,
          marketStatus: "closed",
        },
      });
      if (resp.status) {
        toast.success("Market rejected");
        getUserDetails(currentPage, approvalTab);
      } else {
        toast.error(resp.message || "Failed to reject");
      }
    } catch (e) {
      toast.error("Error rejecting market");
    } finally {
      setApprovalLoader(false);
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
    getUserDetails(currentPage);
  };

  const download_csv = () => {
    if (csvData?.length > 0) {
      toast.success("User Details Download Successfully.");
    } else {
      toast.error("No records Found");
    }
  };

  const handleFileChange = async (val) => {
  try {
    if (!val) return;

    const fileExtension = val.name.split(".").pop().toLowerCase();
    const fileSize = val.size;
    const fileName = val.name;

    setimageName(fileName);

    if (!["png", "jpg", "jpeg"].includes(fileExtension)) {
      toast.error("File does not support. Use .png, .jpg or .jpeg");
      return;
    }

    if (fileSize > 10000000) {
      toast.error("Please upload a file smaller than 10 MB");
      return;
    }

    const data = new FormData();
    data.append("file", val);
    data.append("upload_preset", env.upload_preset);
    data.append("cloud_name", env.cloud_name);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${env.cloud_name}/auto/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const result = await response.json();

    if (!result.secure_url) {
      toast.error("Image upload failed");
      return;
    }

    const imageUrl = result.secure_url;
            setPreviewUrl(imageUrl);


    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));

    setError((prev) => {
      const updatedErrors = { ...prev };
      delete updatedErrors.image;
      return updatedErrors;
    });

  } catch (error) {
    console.error(error);
    toast.error("Please try again later");
  }
};



  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };

  const [open, setOpen] = useState(false);
 const handleOpen = () => {
  setFormData({
    question: "",
    description: "",
    tags: [],
    startDate: new Date(),
    endDate: '', 
    active: '',      
    image: "",
    oracleType: "manual",
    minimumLiquidity: "10",
    estimatedNetworkFee: "10.50",
    OracleFixedFee: "0.50",
    totalLiquidity: "11.00",
    totalDeduction: "1.00",
    options: [
      { label: "Option 1", value: "", outcomePrice: "", chancePercent: 0 },
      { label: "Option 2", value: "", outcomePrice: "", chancePercent: 0 },
    ],
    // id: "",
  });
  setOpen(true);
  setPreviewUrl('')
  setSliderValue({})
};

  const handleClose = () => setOpen(false);

  const [edit, setEdit] = useState(false);
  const [editId, seteditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    modal: false,
    item: "",
  });

  const [formData, setFormData] = useState({
    question: "",
    description: "",
    tags: [],
   startDate: new Date(),
    endDate: "",
    active: true,
    image: "",
    oracleType: "manual",
    minimumLiquidity: "10",
    estimatedNetworkFee: "10.50",
    OracleFixedFee: "0.50",
    totalLiquidity: "11.00",
    totalDeduction: "1.00",
    options: [
    { label: "Option 1", value: "", outcomePrice: "", chancePercent: 0 },
    { label: "Option 2", value: "", outcomePrice: "", chancePercent: 0 },
  ],
    id: "",
  });

  console.log(formData,'formData===')

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

    case "description":
      if (!value.trim()) err = "Description is required";
      else if (value.length < 50) err = "Minimum 50 characters required";
      else if (value.length >= 1001)
        err = "Must be less than 1000 characters required";
      break;

    case "tags":
      if (value.length < 1) err = "Tags is required";
      else if (value.length >= 18) err = "Must be less than 18 tags";
      break;

    case "options":
      if (value.length < 2) err = "At least 2 options required";
      else if (value.length > 5) err = "Maximum 5 options allowed";
      else if (value) {
        const isDuplicate = value.some(
          (item, index) => value.indexOf(item.value) !== index
        );
        if (isDuplicate) err = "Duplicate options are not allowed";

        const isBlank = value.some((item) => item.value.trim() === "");
        if (isBlank) err = "Blank options are not allowed";
      }
      break;

    case "startDate":
      if (!value) err = "Start date is required";
      else {
        const now = new Date();
        const start = value instanceof Date ? value : new Date(value);
        const end = formData.endDate
          ? (formData.endDate instanceof Date ? formData.endDate : new Date(formData.endDate))
          : null;

       
      }
      break;

    case "endDate":
      if (!value) err = "End date is required";
      else if (formData.startDate && value < formData.startDate)
        err = "End time must be later than start time";
      break;

    case "liquidity":
      if (!value) err = "Liquidity is required";
      else if (value < 0) err = "Liquidity must be greater than 0";
      else if (value == 0) err = "Liquidity must be greater than 0";
      break;

    case "resolution":
      if (!value) err = "Resolution is required";
      break;

    case "active":
      console.log("active", value);
      if (value === "" || value === null || value === undefined)
        err = "Active status is required";
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


  const handleInputChange = (e, option = true) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (option) {
      const errMsg = validate(name, value);
      setError({
        ...error,
        [name]: errMsg,
      });
    }
  };

  const handleDateChange = (name, value) => {
    const dateValue =
      value instanceof Date ? value : value ? new Date(value) : null;

    setFormData({
      ...formData,
      [name]: dateValue,
    });

    const errMsg = validate(name, dateValue);

    setError({
      ...error,
      [name]: errMsg,
    });
  };
  const [selectedTags, setSelectedTags] = useState([]);

  

 
  const handleReset = () => {
    setFormData({
      question: "",
      description: "",
      tags: "",
      startDate: "",
      endDate: "",
      active: "",
      oracleType: "manual",
      minimumLiquidity: "10",
      estimatedNetworkFee: "10.50",
      OracleFixedFee: "0.50",
      totalLiquidity: "11.00",
      totalDeduction: "1.00",
    });
    setError({});
    setSelectedTags([]);
    setFormStep(1);
  };

  const handleTagChange = (item, option = true) => {
    let updateTags;
    if (formData.tags.includes(item)) {
      updateTags = formData.tags.filter((tag) => tag !== item);
      setFormData({ ...formData, tags: updateTags });
    } else {
      updateTags = [...selectedTags, item];
      setFormData({ ...formData, tags: updateTags });
    }

    console.log("selectedTags", selectedTags.length);
    if (option) {
      if (updateTags.length < 1) {
        setError({ ...error, tags: "At least one tag is required" });
      } else {
        setError({ ...error, tags: "" });
      }
    }
  };



  const validateStep1 = (option = true) => {
  let stepErrors = {};

  // validate question
  const qErr = validate("question", formData.question);
  if (qErr) stepErrors.question = qErr;

  // validate description
  const dErr = validate("description", formData.description);
  if (dErr) stepErrors.description = dErr;

  // validate Tags
  const tErr = validate("tags", formData.tags);
  if (tErr) stepErrors.tags = tErr;

  if (!formData.image) {
    stepErrors.image = "Market logo is required";
  }

  if (option) {
    setError(stepErrors);
  }

  return option ? Object.keys(stepErrors).length === 0 : 1;
};


  function validateOption(value) {
    if (!value.trim()) return "Option is required";
    if (value.length < 2) return "Minimum 2 characters required";
    return "";
  }

  const handleOptionChange = (index, value) => {
    const updated = [...formData.options];
    updated[index].value = value;

    // validate this option only
    const err = validateOption(value);

    setError({
      ...error,
      [`option${index + 1}`]: err,
    });

    setFormData({ ...formData, options: updated });
  };
  const addOption = () => {
    const nextNumber = formData.options.length + 1;
    const update = [
      ...formData.options,
      { label: `Option ${nextNumber}`, value: "" },
    ];
    setFormData({ ...formData, options: update }); // update();
  };
  const removeOption = (index) => {
    if (formData.options.length <= 2) return; // minimum 2 options
    const updated = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: updated });
  };

  const validateStep2 = (option = true) => {
  let stepErrors = {};

  formData.options.forEach((opt, i) => {
    // existing option text validation
    const err = validateOption(opt.value);
    if (err) {
      stepErrors[`option${i + 1}`] = err;
    }

    // NEW: outcome price validation
    if (opt.outcomePrice === undefined || opt.outcomePrice === "") {
      stepErrors[`outcomePrice${i + 1}`] = "Outcome price is required";
    } else {
      const price = parseFloat(opt.outcomePrice);
      if (isNaN(price)) {
        stepErrors[`outcomePrice${i + 1}`] = "Outcome price must be a number";
      } else if (price < 0 || price > 1) {
        stepErrors[`outcomePrice${i + 1}`] =
          "Outcome price must be between 0 and 1";
      }
    }
  });

  if (option) {
    setError(stepErrors);
  }

  return option ? Object.keys(stepErrors).length === 0 : 1;
};


const handleOutcomePriceChange = (index, value) => {
  const updatedOptions = [...formData.options];
  updatedOptions[index].outcomePrice = value;

  setFormData({ ...formData, options: updatedOptions });

  const price = parseFloat(value);
  if (!isNaN(price) && price >= 0 && price <= 1) {
    setError((prev) => {
      const updatedErrors = { ...prev };
      delete updatedErrors[`outcomePrice${index + 1}`];
      return updatedErrors;
    });
  }
};



  const validateStep3 = (option = true) => {
    let stepErr = {};

    const startDateErr = validate("startDate", formData.startDate);
    if (startDateErr) stepErr.startDate = startDateErr;

    const endDateErr = validate("endDate", formData.endDate);
    if (endDateErr) stepErr.endDate = endDateErr;

    const activeErr = validate("active", formData.active);
    if (activeErr) stepErr.active = activeErr;

   

    if (option) {
      setError(stepErr);
    }

    return option ? Object.keys(stepErr).length === 0 : 1;
  };

  const validateStep4 = (option = true) => {
    let stepErrs = {};

    const liquidityErr = validate("liquidity", formData.liquidity);
    if (liquidityErr) stepErrs.liquidity = liquidityErr;

    if (option) {
      setError(stepErrs);
    }

    return option ? Object.keys(stepErrs).length === 0 : 1;
  };

  const handleResolutionSelect = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

 const handleSubmit = async (option = "add") => {
  console.log("Form Data after Submit:", formData);

  const host = env.apiHost;
  setLoading(true);

  const payload = {
    ...formData,

    active:
      formData.active === true || formData.active === "true",

    liquidity: Number(formData.liquidity),
    minimumLiquidity: Number(formData.minimumLiquidity),
    estimatedNetworkFee: Number(formData.estimatedNetworkFee),
    OracleFixedFee: Number(formData.OracleFixedFee),
    totalLiquidity: Number(formData.totalLiquidity),
    totalDeduction: Number(formData.totalDeduction),

    options: formData.options.map(opt => ({
      ...opt,
      outcomePrice: Number(opt.outcomePrice),
      chancePercent: Number(opt.chancePercent),
    })),

    startDate: formData.startDate ? new Date(formData.startDate) : null,
    endDate: formData.endDate ? new Date(formData.endDate) : null,
  };

  try {
    if (option === "add") {
      const response = await axios.post(
        host + apiService.market_create,
        payload
      );

      if (response?.data?.status) {
        toast.success(response.data.message);
        handleReset();
        getUserDetails();
        setPreviewUrl("");
        setOpen(false);
      } else {
        toast.error(response?.data?.message || "Create failed");
      }
    } else {
      const response = await axios.post(
        host + apiService.market_update,
        { ...payload, id: editId }
      );

      if (response?.data?.status) {
        toast.success(response.data.message);
        handleReset();
        getUserDetails();
        setPreviewUrl("");
        setEdit(false);
      } else {
        toast.error(response?.data?.message || "Update failed");
      }
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message);
  } finally {
    setLoading(false);
    setHadUpdate(prev => !prev);
  }
};



  const handleDelete = async (item) => {
    console.log("item", item);
    const host = env.apiHost;

    const url = item.editable ? "market/deleteMarket" : "poly/deleteMarket";

    try {
      const response = await axios.delete(host + url + "/" + item._id);
      console.log("sdfsdfsdfs", response);
      if (response && response.data.status) {
        toast.success(response.data.message);
        handleReset();
        setDeleteModal({
          modal: false,
          item: "",
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

const handleEdit = (item) => {
  console.log("item", item);
  setEdit(true);

  const formattedOptions = (item.outcomes || []).map((outcome, index) => ({
    label: `Option ${index + 1}`,
    value: outcome,
    outcomePrice: item.outcomePrices?.[index] ?? "",
    chancePercent: item.chancePercents?.[index] ?? 0, 
  }));

   const initialSliderValues = {};
  formattedOptions.forEach(opt => {
    initialSliderValues[opt.value] = opt.chancePercent;
  });
  setSliderValue(initialSliderValues); 

  setFormData({
    question: item.question,
    description: item.description,
    startDate: item.startDate,
    endDate: item.endDate,
    active: item.active,
    image: item.image,
    liquidity: item.liquidity,
    tags: item.tags,
    resolution: item.resolution,

    minimumLiquidity: item.minimumLiquidity ?? "10",
    estimatedNetworkFee: item.estimatedNetworkFee ?? "10.50",
    OracleFixedFee: item.oracleFixedFee ?? "0.50",
    totalLiquidity: item.totalLiquidity ?? "11.00",
    totalDeduction: item.totalDeduction ?? "1.00",

    options: formattedOptions, 
    editable: item.editable || false,
  });

  seteditId(item.id)

  setPreviewUrl(item.image);
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
                    <span className="dash-head">Market Creation</span>
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
                        <span>Add Market</span>
                        <MdAddCircle className="add_event_icon" />
                      </div>
                    </div>
                  </div>
                  {/* Status Filter Tabs */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 16, marginTop: 8, flexWrap: "wrap" }}>
                    {[
                      { key: "all",     label: "All Markets",   color: "#7c3aed" },
                      { key: "pending", label: "⏳ Pending",    color: "#f59e0b" },
                      { key: "active",  label: "✅ Active",     color: "#16a34a" },
                      { key: "closed",  label: "🚫 Closed",    color: "#dc2626" },
                    ].map(({ key, label, color }) => (
                      <button
                        key={key}
                        onClick={() => {
                          setApprovalTab(key);
                          setCurrentPage(1);
                          getUserDetails(1, key);
                        }}
                        style={{
                          padding: "8px 18px",
                          borderRadius: 8,
                          border: "none",
                          fontWeight: 700,
                          cursor: "pointer",
                          background: approvalTab === key ? color : "rgba(255,255,255,0.08)",
                          color: approvalTab === key ? "#fff" : "#aaa",
                          fontSize: 13,
                          transition: "background 0.15s",
                        }}
                      >
                        {label}
                      </button>
                    ))}
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
                              <th>Creator</th>
                              <th>Liquidity</th>
                              <th>Date & Time</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* {loader == true ? (
                                                        rows.map((_, rowIndex) => (
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
                                                        ))
                                                    ) : ( */}
                            <>
                              {marketData.length > 0 ? (
                                marketData.map((item, i) => (
                                  <tr key={i}>
                                    <td>
                                      <span className="plus_14_ff">{i + 1}</span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">{item.question}</span>
                                    </td>
                                    <td>
                                      <span
                                        className="plus_14_ff"
                                        style={{
                                          display: "inline-block",
                                          padding: "2px 10px",
                                          borderRadius: 20,
                                          fontSize: 11,
                                          fontWeight: 700,
                                          background: item.creatorTelegramId
                                            ? "rgba(99,102,241,0.18)"
                                            : "rgba(255,255,255,0.08)",
                                          color: item.creatorTelegramId ? "#818cf8" : "#9ca3af",
                                        }}
                                      >
                                        {item.creatorTelegramId ? "User" : "Admin"}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.liquidity ? item.liquidity.toFixed(2) : "N/A"}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {Moment(item.createdAt).format("lll")}
                                      </span>
                                    </td>
                                    <td>
                                      <span
                                        style={{
                                          display: "inline-block",
                                          padding: "3px 12px",
                                          borderRadius: 20,
                                          fontSize: 11,
                                          fontWeight: 700,
                                          textTransform: "capitalize",
                                          background:
                                            item.marketStatus === "active"   ? "rgba(22,163,74,0.18)"  :
                                            item.marketStatus === "pending"  ? "rgba(245,158,11,0.18)" :
                                            item.marketStatus === "closed"   ? "rgba(220,38,38,0.18)"  :
                                            item.marketStatus === "resolved" ? "rgba(99,102,241,0.18)" :
                                            "rgba(255,255,255,0.08)",
                                          color:
                                            item.marketStatus === "active"   ? "#4ade80" :
                                            item.marketStatus === "pending"  ? "#fbbf24" :
                                            item.marketStatus === "closed"   ? "#f87171" :
                                            item.marketStatus === "resolved" ? "#a5b4fc" :
                                            "#9ca3af",
                                        }}
                                      >
                                        {item.marketStatus || "—"}
                                      </span>
                                    </td>
                                    <td className="cmmn_action_btn">
                                      {/* Approve / Reject — for any pending user-created market */}
                                      {item.marketStatus === "pending" && item.creatorTelegramId && (
                                        <>
                                          <button
                                            className="btn btn-sm btn-success me-1"
                                            disabled={approvalLoader}
                                            onClick={() => handleApproveMarket(item)}
                                            title="Approve market"
                                          >
                                            Approve
                                          </button>
                                          <button
                                            className="btn btn-sm btn-danger me-1"
                                            disabled={approvalLoader}
                                            onClick={() => handleRejectMarket(item)}
                                            title="Reject market"
                                          >
                                            Reject
                                          </button>
                                        </>
                                      )}
                                      {/* Edit / Delete — for all markets */}
                                      <span
                                        className="plus_14_ff"
                                        onClick={() => {
                                          if (item.editable) {
                                            handleEdit(item);
                                          } else {
                                            toast.warn("Polymarket records are not editable!");
                                          }
                                        }}
                                      >
                                        <i className="fa-regular fa-pen-to-square cursor-pointer"></i>
                                      </span>
                                      <span
                                        className="plus_14_ff ed-icon-fz act_delt_icon"
                                        onClick={() => setDeleteModal({ item, modal: true })}
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
      {/* )} */}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="popup_modal-eventCrtn">
              <div className={`evnt_crct_popInsd `}>
                <span
                  className="modal_close_icon cursor-pointer"
                  onClick={() => {
                    handleReset();
                    handleClose();
                  }}
                >
                  <IoClose />
                </span>
                {formStep == 1 ? (
                  <div className="evnt_crct_popFrmWrp">
                    <div className="evnt_crct_frmTxt">
                      <h6>Create Market</h6>
                      <span> {formStep} / 5</span>
                    </div>

                    <h5 className="evnt_crct_frmtlt">
                      Define Your Market Question
                    </h5>
                    <p className="evnt_crct_frmdesp">
                      Write the main question that shapes your market and add
                      relevant tags to help users discover it easily
                    </p>

                    <form className="evnt_crct_popFrm">
                      <div className="evnt_crct_popInptwrp">
                        <label>Ask a Question</label>
                        <div className="evnt_crct_popInpt">
                          <input
                            name="question"
                            value={formData.question}
                            onChange={handleInputChange}
                            type="text"
                            placeholder="Ask any questions"
                          />
                          {/* <span >{formData.question.length  +"/ 150 Characters"}</span> */}

                          <span
                            style={{
                              color:
                                formData.question.length > 151
                                  ? "red"
                                  : "black",
                            }}
                          >
                            {formData.question.length + "/ 150 Characters"}
                          </span>
                          <div className="error-block">
                            {error.question && (
                              <div className="error-text">{error.question}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="evnt_crct_popInptwrp">
                        <label>Market Description</label>
                        <div className="evnt_crct_popInpt">
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe what this market is tracking."
                          />
                          <span
                            style={{
                              color:
                                formData.description.length > 1001
                                  ? "red"
                                  : "black",
                            }}
                          >
                            {formData.description.length + "/ 1000 Characters"}
                          </span>
                          <div className="error-block">
                            {error.description && (
                              <div className="error-text">
                                {error.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* <div className="evnt_crct_popInptwrp">
  <label>Market Logo</label>
  <div className="evnt_crct_popInpt">
    <input
      type="file"
      accept=".png,.jpg,.jpeg"
      onChange={(e) => handleFileChange(e.target.files[0])}
    />

    <div className="error-block">
      {error.image && <div className="error-text">{error.image}</div>}
    </div>
  </div>
</div> */}

  <div className="evnt_crct_popInptwrp">
      <h2 className="upload-title">Market Image</h2>
      
      <div className="upload-wrapper">
        <div className="upload-box">
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={(e) => handleFileChange(e.target.files[0])}
            className="hidden-input"
          />
          
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="preview-image"
            />
          ) : (
            <p className="upload-text">Click to upload image</p>
          )}
        </div>

        <div className="error-block">
          {error.image && <div className="error-text">{error.image}</div>}
        </div>
      </div>
    </div>

                    </form>

                    <div className="evnt_crct_popline"></div>

                    <div className="evnt_crct_poptagsWrp">
                      <h6>
                        Tags<span>(Minimum 1)</span>
                      </h6>
                      <p>
                        Choose tags to categorize your market and help others
                        discover it.
                      </p>
                      <div className="evnt_crct_poptags">
                        {tagsData.map((item, i) => {
                          return (
                            <span
                              onClick={() => handleTagChange(item)}
                              className={
                                formData.tags.includes(item) ? "tagActive" : ""
                              }
                            >
                              {formData.tags.includes(item) && (
                                <FiCheck className="evnt_crct_poptagstck" />
                              )}
                              {item}
                            </span>
                          );
                        })}
                      </div>
                      <div className="error-block">
                        {error.tags && (
                          <div className="error-text">{error.tags}</div>
                        )}
                      </div>
                    </div>

                   

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
                      <h6>Add Options</h6>
                      <span> {formStep} / 5</span>
                    </div>

                    <h5 className="evnt_crct_frmtlt">
                      Configure Market Choices
                    </h5>
                    <p className="evnt_crct_frmdesp">
                      Add the possible outcome options that users can choose
                      from when participating in your market.
                    </p>

                 <form className="evnt_crct_popFrm">
  {formData.options.map((item, index) => (
    <div className="evnt_crct_popInptwrp" key={index}>
      <label>{item.label}</label>

      {/* OPTION TEXT */}
      <div className="evnt_crct_popInpt">
        <input
          type="text"
          placeholder={item.label}
          value={item.value}
          maxLength={60}
          onChange={(e) =>
            handleOptionChange(index, e.target.value)
          }
        />
        <span>{item.value.length} / 60 Characters</span>

        {error[`option${index + 1}`] && (
          <div className="error-text">
            {error[`option${index + 1}`]}
          </div>
        )}
      </div>

      {/* OUTCOME PRICE */}
      <div className="evnt_crct_popInpt">
        <input
          type="number"
          placeholder="Outcome Price (0 - 1)"
          min="0"
          max="1"
          step="0.01"
          value={item.outcomePrice || ""}
          onChange={(e) =>
            handleOutcomePriceChange(index, e.target.value)
          }
        />

        {error[`outcomePrice${index + 1}`] && (
          <div className="error-text">
            {error[`outcomePrice${index + 1}`]}
          </div>
        )}
      </div>

      {/* optional remove button */}
      {index > 1 && (
        <button
          type="button"
          className="primary-btn"
          onClick={() => removeOption(index)}
        >
          Remove
        </button>
      )}
    </div>
  ))}
</form>


                    <div className="evnt_crct_popstp2nots">
                      <p>
                        The Unclassified outcome is a system-defined fallback
                        and cannot be edited or removed
                      </p>
                    </div>

                    <button
                      type="button"
                      className="evnt_popstp2_Addbtn"
                      onClick={addOption}
                    >
                      <span>
                        <IoAddCircleSharp />
                      </span>
                      Add More Option
                    </button>

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
                            handleFormStep(3);
                          }
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : formStep === 3 ? (
                  <div className="evnt_crct_popFrmWrp">
                    <div className="evnt_crct_frmTxt">
                      <h6>Configure Timing</h6>
                      <span> {formStep} / 5</span>
                    </div>

                    <h5 className="evnt_crct_frmtlt">
                      Configure Market Timing
                    </h5>
                    <p className="evnt_crct_frmdesp">
                      Set the start and end times for your market to control
                      when users can participate and when outcomes are
                      finalized.{" "}
                    </p>

                    <form className="evnt_crct_popFrm ">
                      <div className="custom-date-wrapper">
                        <label> Start time </label>
                        <div className="d-flex position-relative ">
                        <DatePicker
  minDate={new Date()}
  minTime={
    formData.startDate &&
    formData.startDate.toDateString() === new Date().toDateString()
      ? new Date() // only restrict if today
      : new Date(0, 0, 0, 0, 0) // midnight
  }
  maxTime={new Date(0, 0, 0, 23, 59)}
  selected={formData.startDate || new Date()} // <-- default to current date/time
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
                            <div className="error-text">{error.startDate}</div>
                          )}
                        </div>
                      </div>

                      <div className="custom-date-wrapper">
                        <label> End time </label>
                        <div className="d-flex position-relative">
                          <DatePicker
                            minDate={formData.startDate || new Date()}
                            // minTime={new Date()}
                            // maxTime={new Date(0, 0, 0, 23, 59)}
                            selected={formData.endDate}
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
                          <div className="error-text">{error.endDate}</div>
                        )}
                      </div>
                    </form>

                    <div className="evnt_crct_popline"></div>

                    <div className="evnt_crct_popFrmWrp">
                      <div className="evnt_crct_frmTxt">
                        <h6>Market Status</h6>
                        {/* <span> {formStep} / 6</span> */}
                      </div>

                      <div className="w-100 ">
                        {/* Active */}
                 <div className="w-100 d-flex flex-column gap-3">
  <label className="form-label pl-2">Active Status </label>

  <Select
    name="active"
    options={[
      { value: "true", label: "True" },
      { value: "false", label: "False" },
    ]}
    placeholder="Select"
    value={
      formData.active !== "" && formData.active !== null && formData.active !== undefined
        ? {
            value: formData.active.toString(),
            label: formData.active ? "True" : "False",
          }
        : null
    }
    onChange={(selectedOption) =>
      handleInputChange({
        target: {
          name: "active",
          value: selectedOption ? selectedOption.value === "true" : false, 
        },
      })
    }
    classNamePrefix="react-select"
  />

  <div className="help-block">
    {error.active && <div className="error-text">{error.active}</div>}
  </div>
</div>



                        {/* Close */}
                     
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
                          if (validateStep3()) {
                            console.log("hey");
                            handleFormStep(4);
                          }
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : formStep === 4 ? (
                  <div className="evnt_crct_popFrmWrp">
                    <div className="evnt_crct_frmTxt">
                      <h6>Add Liquidity</h6>
                      <span> {formStep} / 5</span>
                    </div>

                    <h5 className="evnt_crct_frmtlt">Add Market Liquidity</h5>
                    <p className="evnt_crct_frmdesp">
                      Provide initial liquidity to enable trading in your
                      market. Your deposit helps ensure smooth price discovery
                      and balanced
                    </p>

                    <form className="evnt_crct_popFrm">
                      <div className="evnt_crct_popInptwrp">
                        <label>Add Liquidity</label>
                        <div className="Add_lidty_inpWrp">
                          <div className="Add_lidty_inp">
                            <input
                              name="liquidity"
                              type="number"
                              placeholder="Add Liquidity"
                              value={formData.liquidity}
                              onChange={(e) => handleInputChange(e)}
                            />
                            <span> Balance: 14.93 </span>
                          </div>

                          {/* <button className="maxBtn">MAX</button> */}
                        </div>
                        {error.liquidity && (
                          <div className="error-text pl-2">
                            {error.liquidity}
                          </div>
                        )}
                      </div>

                      <div className="summry_collps_wrp">
                        <div
                          className="summry_collps_btn"
                          data-bs-toggle="collapse"
                          data-bs-target="#demo"
                        >
                          Summary
                          <span>
                            <IoIosArrowDown />
                          </span>
                        </div>
                        <ul id="demo" class="collapse summry_collps_cntwrp">
                          <li>
                            <span className="summry_collps_cnt">
                              Minimum Liquidity
                            </span>
                            <span className="summry_collps_value">
                              $ {formData.minimumLiquidity}
                            </span>
                          </li>
                          <li>
                            <span className="summry_collps_cnt">
                              Estimated network fee
                            </span>
                            <span className="summry_collps_value">
                              $ {formData.estimatedNetworkFee}
                            </span>
                          </li>
                          <li>
                            <span className="summry_collps_cnt">
                              Oracle Fixed fee
                            </span>
                            <span className="summry_collps_value">
                              ${formData.OracleFixedFee}
                            </span>
                          </li>
                          <li>
                            <span className="summry_collps_cnt">
                              Total Liquidity
                            </span>
                            <span className="summry_collps_value">
                              ${formData.totalLiquidity}
                            </span>
                          </li>
                          <li>
                            <span className="summry_collps_cnt">
                              Total Deduction
                            </span>
                            <span
                              className="summry_collps_value red-txt "
                              style={{
                                color: "red",
                              }}
                            >
                              $ {formData.totalDeduction}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="evnt_crct_popstp2nots">
                      <p>
                        The liquidity you add will be distributed into all
                        options according to their changes
                      </p>
                    </div>

                   <div className="evnt_slider_row">
  <h5 className="mb-0">Percentage of Chances</h5>

  {formData.options.map((option, index) => (
    <div className="evnt_slider_crd" key={index}>
      <h6 className={`evnt_slidr_${option.value.toLowerCase()}`}>
        {option.value}
      </h6>
    <div className="evnt_slider_linwrp">
  <div className="evnt_slider_lin">
    <span className="evnt_slider_linlb">1%</span>

    <input
      type="range"
      className={`evnt_slider_main${option.value} w-full accent-yellow-400`}
      min={0}
      max={100}
      step={1}
      value={sliderValue[option.value] || 0}
      onChange={(e) => {
        const val = Number(e.target.value);

        setSliderValue((prev) => ({
          ...prev,
          [option.value]: val,
        }));

        setFormData((prev) => ({
          ...prev,
          options: prev.options.map((opt) =>
            opt.value === option.value
              ? { ...opt, chancePercent: val }
              : opt
          ),
        }));
      }}
    />

    <span className="evnt_slider_linlb">100%</span>
  </div>

  <span className="evnt_slider_linvlue">
    {sliderValue[option.value] || 0}%
  </span>

  <span className="evnt_slider_lckIcn">
    <LuLockKeyholeOpen />
  </span>
</div>

    </div>
  ))}
</div>

                    </form>

                    <div className="evnt_crct_popBtnWrp">
                      <button
                        className="evnt_crct_popBackBtn"
                        onClick={() =>{
                           handleStepReduce();setSliderValue({})
                        }}
                      >
                        Back
                      </button>
                      <button
                        className="evnt_crct_popNextBtn"
                        onClick={() => {
                          if (validateStep4()) {
                            handleFormStep(5);
                          }
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : formStep === 5 ? (
                  <div className="evnt_crct_popFrmWrp">
                    <div className="evnt_crct_frmTxt">
                      <h6>Resolution</h6>
                      <span> {formStep} / 5</span>
                    </div>

                    <h5 className="evnt_crct_frmtlt">
                      Market Resolution Method
                    </h5>
                    <p className="evnt_crct_frmdesp">
                      Decide how the outcome of your market will be resolved
                      once it concludes. You can either control the resolution
                      yourslf or let our AI automatically determine the winning
                      option based on verified data sources.
                    </p>

                    <form className="evnt_crct_popFrm">
                      <div className="manul_rsl_row">
                        <div
                          className={`manul_rsl_crd ${
                            formData.oracleType === "manual" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleResolutionSelect("oracleType", "manual")
                          }
                        >
                          <div className="manul_rsl_iconWrp">
                            <BsPerson className="manul_rsl_iconfst" />
                            <AiFillCheckCircle className="manul_rsl_icontick" />
                          </div>
                          <h6>Manual Resolution</h6>
                          <p>
                            Admin decides the outcome once the event ends.
                            Ideal for trusted or community-driven markets.
                          </p>
                        </div>
                        <div
                          className={`manul_rsl_crd ${
                            formData.oracleType === "ai" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleResolutionSelect("oracleType", "ai")
                          }
                        >
                          <div className="manul_rsl_iconWrp">
                            <LuBrainCog className="manul_rsl_iconfst" />
                            <AiFillCheckCircle className="manul_rsl_icontick" />
                          </div>
                          <h6>Olympus AI</h6>
                          <p>
                            Olympus AI verifies results from multiple data
                            sources and resolves the market automatically.
                          </p>
                        </div>
                        <div
                          className={`manul_rsl_crd ${
                            formData.oracleType === "uma" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleResolutionSelect("oracleType", "uma")
                          }
                        >
                          <div className="manul_rsl_iconWrp">
                            <LuShieldCheck className="manul_rsl_iconfst" />
                            <AiFillCheckCircle className="manul_rsl_icontick" />
                          </div>
                          <h6>UMA Oracle</h6>
                          <p>
                            Decentralised on-chain resolution via UMA's
                            Optimistic Oracle. Cryptographically verifiable.
                          </p>
                        </div>
                      </div>
                    </form>

                    <div className="evnt_crct_popBtnWrp">
                      <button
                        className="evnt_crct_popBackBtn"
                        onClick={() => handleStepReduce(5)}
                      >
                        Back
                      </button>
                    <button
  className="evnt_crct_popNextBtn"
  disabled={loading}
  onClick={() => {
    handleSubmit("add");
  }}
>
  {loading ? "Submitting..." : "Submit"}
</button>

                    </div>
                  </div>
                ) : null}
              </div>
          </div>
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="popup_modal-eventCrtn">
              <div className={`evnt_crct_popInsd `}>
                <span
                  className="modal_close_icon cursor-pointer"
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
                      <h6>Create Market</h6>
                      <span> {formStep} / 5</span>
                    </div>

                    <h5 className="evnt_crct_frmtlt">
                      Define Your Market Question
                    </h5>
                    <p className="evnt_crct_frmdesp">
                      Write the main question that shapes your market and add
                      relevant tags to help users discover it easily
                    </p>

                    <form className="evnt_crct_popFrm">
                      <div className="evnt_crct_popInptwrp">
                        <label>Ask a Question</label>
                        <div className="evnt_crct_popInpt">
                          <input
                            name="question"
                            value={formData.question}
                            //   onChange={(e)=>handleInputChange(e,formData.editable)}
                            type="text"
                            placeholder="Ask any questions"
                          />
                          {/* <span >{formData.question.length  +"/ 150 Characters"}</span> */}

                          <span
                            style={{
                              color:
                                formData.question.length > 151
                                  ? "red"
                                  : "black",
                            }}
                          >
                            {formData.question.length + "/ 150 Characters"}
                          </span>
                          <div className="error-block">
                            {error.question && (
                              <div className="error-text">{error.question}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      {formData.editable && (
                        <div className="evnt_crct_popInptwrp">
                          <label>Market Description</label>
                          <div className="evnt_crct_popInpt">
                            <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              placeholder="Describe what this market is tracking."
                            />
                            <span
                              style={{
                                color:
                                  formData.description.length > 1001
                                    ? "red"
                                    : "black",
                              }}
                            >
                              {formData.description.length +
                                "/ 1000 Characters"}
                            </span>
                            <div className="error-block">
                              {error.description && (
                                <div className="error-text">
                                  {error.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

 <div className="evnt_crct_popInptwrp">
      <h2 className="upload-title">Market Image</h2>
      
      <div className="upload-wrapper">
        <div className="upload-box">
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={(e) => handleFileChange(e.target.files[0])}
            className="hidden-input"
          />
          
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="preview-image"
            />
          ) : (
            <p className="upload-text">Click to upload image</p>
          )}
        </div>

        <div className="error-block">
          {error.image && <div className="error-text">{error.image}</div>}
        </div>
      </div>
    </div>

                      
                    </form>

                    <div className="evnt_crct_popline"></div>

                    {formData.editable && (
                      <div className="evnt_crct_poptagsWrp">
                        <h6>
                          Tags<span>(Minimum 1)</span>
                        </h6>
                        <p>
                          Choose tags to categorize your market and help others
                          discover it.
                        </p>
                        <div className="evnt_crct_poptags">
                          {tagsData.map((item, i) => {
                            return (
                              <span
                                onClick={() => handleTagChange(item)}
                                className={
                                  formData.tags.includes(item)
                                    ? "tagActive"
                                    : ""
                                }
                              >
                                {formData.tags.includes(item) && (
                                  <FiCheck className="evnt_crct_poptagstck" />
                                )}
                                {item}
                              </span>
                            );
                          })}
                        </div>
                        <div className="error-block">
                          {error.tags && (
                            <div className="error-text">{error.tags}</div>
                          )}
                        </div>
                      </div>
                    )}

                   

                    <div className="evnt_crct_popBtnWrp">
                      {/* <button className="evnt_crct_popBackBtn">Back</button> */}
                      <button
                        className="evnt_crct_popNextBtn"
                        onClick={() => {
                          if (validateStep1(formData.editable)) {
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
                      <h6>Add Options</h6>
                      <span> {formStep} / 5</span>
                    </div>

                    <h5 className="evnt_crct_frmtlt">
                      Configure Market Choices
                    </h5>
                    <p className="evnt_crct_frmdesp">
                      Add the possible outcome options that users can choose
                      from when participating in your market.
                    </p>

                   <form className="evnt_crct_popFrm">
  {formData.options.map((item, index) => (
    <div className="evnt_crct_popInptwrp" key={index}>
      <label>{item.label}</label>

      <div className="evnt_crct_popInpt">
        <input
          type="text"
          placeholder={item.label}
          value={item.value}
          maxLength={60}
          onChange={(e) => handleOptionChange(index, e.target.value)}
        />
        <span>{item.value.length} / 60 Characters</span>
        {error[`option${index + 1}`] && (
          <div className="error-text">
            {error[`option${index + 1}`]}
          </div>
        )}
      </div>

      <div className="evnt_crct_popInpt">
        <input
          type="number"
          placeholder="Outcome Price (0 - 1)"
          step="0.01"
          min="0"
          max="1"
          value={item.outcomePrice || ""}
          onChange={(e) => handleOutcomePriceChange(index, e.target.value)}
        />
        {error[`outcomePrice${index + 1}`] && (
          <div className="error-text">
            {error[`outcomePrice${index + 1}`]}
          </div>
        )}
      </div>

      {index > 1 && (
        <button
          type="button"
          className="primary-btn"
          onClick={() => removeOption(index)}
        >
          Remove
        </button>
      )}
    </div>
  ))}
</form>


                    <div className="evnt_crct_popstp2nots">
                      <p>
                        The Unclassified outcome is a system-defined fallback
                        and cannot be edited or removed
                      </p>
                    </div>

                    <button
                      type="button"
                      className="evnt_popstp2_Addbtn"
                      onClick={addOption}
                    >
                      <span>
                        <IoAddCircleSharp />
                      </span>
                      Add More Option
                    </button>

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
                          if (validateStep2(formData.editable)) {
                            handleFormStep(3);
                          }
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : formStep === 3 ? (
                  <div className="evnt_crct_popFrmWrp">
                    <div className="evnt_crct_frmTxt">
                      <h6>Configure Timing</h6>
                      <span> {formStep} / 5</span>
                    </div>

                    <h5 className="evnt_crct_frmtlt">
                      Configure Market Timing
                    </h5>
                    <p className="evnt_crct_frmdesp">
                      Set the start and end times for your market to control
                      when users can participate and when outcomes are
                      finalized.{" "}
                    </p>

                    <form className="evnt_crct_popFrm ">
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
                            <div className="error-text">{error.startDate}</div>
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
                          <div className="error-text">{error.endDate}</div>
                        )}
                      </div>
                    </form>

                    <div className="evnt_crct_popline"></div>

                    <div className="evnt_crct_popFrmWrp">
                      <div className="evnt_crct_frmTxt">
                        <h6>Market Status</h6>
                        {/* <span> {formStep} / 6</span> */}
                      </div>

                 <div className="w-100 d-flex flex-column gap-3">
  <label className="form-label pl-2">Active Status </label>

  <Select
    name="active"
    options={[
      { value: "true", label: "True" },
      { value: "false", label: "False" },
    ]}
    placeholder="Select"
    value={
      formData.active !== "" && formData.active !== null && formData.active !== undefined
        ? {
            value: formData.active.toString(),
            label: formData.active ? "True" : "False",
          }
        : null
    }
    onChange={(selectedOption) =>
      handleInputChange({
        target: {
          name: "active",
          value: selectedOption ? selectedOption.value === "true" : false, // ✅ convert to boolean
        },
      })
    }
    classNamePrefix="react-select"
  />

  <div className="help-block">
    {error.active && <div className="error-text">{error.active}</div>}
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
                          if (validateStep3(formData.editable)) {
                            console.log("hey");
                            handleFormStep(4);
                          }
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : formStep === 4 ? (
                  <div className="evnt_crct_popFrmWrp">
                    <div className="evnt_crct_frmTxt">
                      <h6>Add Liquidity</h6>
                      <span> {formStep} / 5</span>
                    </div>

                    <h5 className="evnt_crct_frmtlt">Add Market Liquidity</h5>
                    <p className="evnt_crct_frmdesp">
                      Provide initial liquidity to enable trading in your
                      market. Your deposit helps ensure smooth price discovery
                      and balanced
                    </p>

                    <form className="evnt_crct_popFrm">
                      <div className="evnt_crct_popInptwrp">
                        <label>Add Liquidity</label>
                        <div className="Add_lidty_inpWrp">
                          <div className="Add_lidty_inp">
                            <input
                              name="liquidity"
                              type="number"
                              placeholder="Add Liquidity"
                              value={formData.liquidity}
                              onChange={(e) => handleInputChange(e)}
                            />
                            <span> Balance: 14.93 </span>
                          </div>

                          {/* <button className="maxBtn">MAX</button> */}
                        </div>
                        {error.liquidity && (
                          <div className="error-text pl-2">
                            {error.liquidity}
                          </div>
                        )}
                      </div>

                      <div className="summry_collps_wrp">
                        <div
                          className="summry_collps_btn"
                          data-bs-toggle="collapse"
                          data-bs-target="#demo"
                        >
                          Summary
                          <span>
                            <IoIosArrowDown />
                          </span>
                        </div>
                        <ul id="demo" class="collapse summry_collps_cntwrp">
                          <li>
                            <span className="summry_collps_cnt">
                              Minimum Liquidity
                            </span>
                            <span className="summry_collps_value">
                              $ {formData.minimumLiquidity}
                            </span>
                          </li>
                          <li>
                            <span className="summry_collps_cnt">
                              Estimated network fee
                            </span>
                            <span className="summry_collps_value">
                              $ {formData.estimatedNetworkFee}
                            </span>
                          </li>
                          <li>
                            <span className="summry_collps_cnt">
                              Oracle Fixed fee
                            </span>
                            <span className="summry_collps_value">
                              ${formData.OracleFixedFee}
                            </span>
                          </li>
                          <li>
                            <span className="summry_collps_cnt">
                              Total Liquidity
                            </span>
                            <span className="summry_collps_value">
                              ${formData.totalLiquidity}
                            </span>
                          </li>
                          <li>
                            <span className="summry_collps_cnt">
                              Total Deduction
                            </span>
                            <span
                              className="summry_collps_value red-txt "
                              style={{
                                color: "red",
                              }}
                            >
                              $ {formData.totalDeduction}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="evnt_slider_row">
  <h5 className="mb-0">Percentage of Chances</h5>

  {formData.options.map((option, index) => (
    <div className="evnt_slider_crd" key={index}>
      <h6 className={`evnt_slidr_${option.value.toLowerCase()}`}>
        {option.value}
      </h6>
    <div className="evnt_slider_linwrp">
  <div className="evnt_slider_lin">
    <span className="evnt_slider_linlb">1%</span>

    <input
      type="range"
      className={`evnt_slider_main${option.value} w-full accent-yellow-400`}
      min={0}
      max={100}
      step={1}
      value={sliderValue[option.value] || 0}
      onChange={(e) => {
        const val = Number(e.target.value);

        setSliderValue((prev) => ({
          ...prev,
          [option.value]: val,
        }));

        setFormData((prev) => ({
          ...prev,
          options: prev.options.map((opt) =>
            opt.value === option.value
              ? { ...opt, chancePercent: val }
              : opt
          ),
        }));
      }}
    />

    <span className="evnt_slider_linlb">100%</span>
  </div>

  <span className="evnt_slider_linvlue">
    {sliderValue[option.value] || 0}%
  </span>

  <span className="evnt_slider_lckIcn">
    <LuLockKeyholeOpen />
  </span>
</div>
    </div>
  ))}
</div>
                    </form>

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
                          if (validateStep4(formData.editable)) {
                            handleFormStep(5);
                          }
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : formStep === 5 ? (
                  <div className="evnt_crct_popFrmWrp">
                    <div className="evnt_crct_frmTxt">
                      <h6>Resolution</h6>
                      <span> {formStep} / 5</span>
                    </div>

                    <h5 className="evnt_crct_frmtlt">
                      Market Resolution Method
                    </h5>
                    <p className="evnt_crct_frmdesp">
                      Decide how the outcome of your market will be resolved
                      once it concludes. You can either control the resolution
                      yourslf or let our AI automatically determine the winning
                      option based on verified data sources.
                    </p>

                    <form className="evnt_crct_popFrm">
                      <div className="manul_rsl_row">
                        <div
                          className={`manul_rsl_crd ${
                            formData.oracleType === "manual" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleResolutionSelect("oracleType", "manual")
                          }
                        >
                          <div className="manul_rsl_iconWrp">
                            <BsPerson className="manul_rsl_iconfst" />
                            <AiFillCheckCircle className="manul_rsl_icontick" />
                          </div>
                          <h6>Manual Resolution</h6>
                          <p>
                            Admin decides the outcome once the event ends.
                            Ideal for trusted or community-driven markets.
                          </p>
                        </div>
                        <div
                          className={`manul_rsl_crd ${
                            formData.oracleType === "ai" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleResolutionSelect("oracleType", "ai")
                          }
                        >
                          <div className="manul_rsl_iconWrp">
                            <LuBrainCog className="manul_rsl_iconfst" />
                            <AiFillCheckCircle className="manul_rsl_icontick" />
                          </div>
                          <h6>Olympus AI</h6>
                          <p>
                            Olympus AI verifies results from multiple data
                            sources and resolves the market automatically.
                          </p>
                        </div>
                        <div
                          className={`manul_rsl_crd ${
                            formData.oracleType === "uma" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleResolutionSelect("oracleType", "uma")
                          }
                        >
                          <div className="manul_rsl_iconWrp">
                            <LuShieldCheck className="manul_rsl_iconfst" />
                            <AiFillCheckCircle className="manul_rsl_icontick" />
                          </div>
                          <h6>UMA Oracle</h6>
                          <p>
                            Decentralised on-chain resolution via UMA's
                            Optimistic Oracle. Cryptographically verifiable.
                          </p>
                        </div>
                      </div>
                    </form>

                    <div className="evnt_crct_popBtnWrp">
                      <button
                        className="evnt_crct_popBackBtn"
                        onClick={() => handleStepReduce(5)}
                      >
                        Back
                      </button>
                       <button
  className="evnt_crct_popNextBtn"
  disabled={loading}
  onClick={() => {
                          if (formData.editable) {
                            handleSubmit("edit");
                          } else {
                            setEdit(false);
                          }
                        }}
>
  {loading ? "Submitting..." : "Submit"}
</button>
                    
                    </div>
                  </div>
                ) : null}
              </div>
          </div>
        </div>
      )}

      {deleteModal.modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="popup_modal-delete">
          <div className="popup_modal-delEvntCrtn">
          <div id="modal-modal-title">
            Are You sure you want to delete ?
          </div>
          <p className="text-center">
            This will delete all the associated data with this event
          </p>

          <div className="popup_modal-delEvntCrtn-btnWrp">
            <button
              className="evnt_crct_popBackBtn"
              onClick={() => setDeleteModal({ item: "", modal: false })}
            >
              Cancel
            </button>
            <button
              className="evnt_crct_popNextBtn"
              onClick={() => handleDelete(deleteModal.item)}
            >
              Delete
            </button>
          </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketCreaction;
