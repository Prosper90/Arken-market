import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import useState from "react-usestateref";
import { toast } from "react-toastify";
import Sidebar_2 from "./Nav_bar";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import axios from "axios";
import ReactPaginate from "react-paginate";
import Moment from "moment";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import { env } from "../core/service/envconfig";
import { ScaleLoader } from "react-spinners";
import { BiSupport } from "react-icons/bi";
import { FaRegUserCircle } from "react-icons/fa";
import { useRef } from "react";
import { Skeleton } from "@mui/material";

import FromDatePicker from "./fromdatepicker";
import ToDatePicker from "./todatepicker";
import { FaFilter } from "react-icons/fa6";
import CsvDownloader from "react-csv-downloader";

function Support() {
  const [add, setAdd] = useState(false);
  const [validationnErr, setvalidationnErr] = useState({});
  const [buttonLoader, setButtonLoader] = useState(false);
  const [image, setImage, imageref] = useState("");
  const [imageName, setimageName] = useState("");
  const [tag, setTag, tagref] = useState("");
  const [oneData, setOneData, oneDataref] = useState("");
  const [loader, setLoader] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [csvData, setCsvData, csvDataref] = useState([]);
  const [formData, setFormData, formDataref] = useState({
    id: "",
    message: "",
    image: "",
    replay: "",
  });

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 6;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value.startsWith(" ")) return;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    const errors = validateForm(updatedFormData);
    setvalidationnErr(errors);
  };
  const [messageLoader, setmessageLoader] = useState(false);

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
    formData["_id"] = oneDataref.current._id;
    formData["tag"] = "admin";
    var datas = {
      apiUrl: apiService.support_save,
      payload: formData,
    };

    setmessageLoader(true);
    var response = await postMethod(datas);
    setmessageLoader(false);
    console.log(response, "=-=-=-=response=-=-=");
    if (response.status) {
      toast.success(response.Message);
    } else {
      toast.error(response.Message);
    }
    getEditDetails(oneDataref.current._id);
    getUserDetails(currentPage);
    // setAdd(false);
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
      apiUrl: apiService.support_list,
      payload: {
        page,
        limit: 5,
        keyword: filterKeyword,
        fromDate: fromDate,
        toDate: toDate,
      }, // Include the keyword here
    };
    const response = await postMethod(data);
    setLoader(false);
    if (response.status) {
      setSupportDatas(response.data);
      setCsvData(response.csv_data);
      setTotalPages(response.totalPages);
    } else {
    }
  };
  const handleFilterChange = (e) => {
    getUserDetails(1);
  };

  const download_csv = () => {
    console.log(csvDataref.current?.length, "csvDataref.current?.length");
    if (csvDataref.current?.length > 0) {
      toast.success("Support Details Download Successfully.");
    } else {
      toast.error("No records Found");
    }
  };

  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [oneDataref.current?.reply]);
  const [ViewStatus, setViewStatus] = useState(false);
  const [chatLoading, setchatLoading] = useState(false);

  const getEditDetails = async (data) => {
    setchatLoading(false); // show loader

    setTimeout(() => {
      setchatLoading(true); // hide loader after 2 sec
    }, 1000);
    setAdd(true);
    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.support_view,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    setLoader(false);
    if (response.status) {
      setOneData(response.data[0]);
      setSelectedTicketId(response.data[0]._id);
      setFormData({
        ...formData,
        message: response.data[0].message || "",
        replay: response.data[0].replay || "",
        image: response.data[0].image || "",
      });
    }
  };

  const validateForm = (values) => {
    const errors = {};

    // Common validations
    if (!values.replay) {
      errors.replay = "Message is required";
    }
    // if (!values.image) {
    //   errors.image = "Image is required";
    // }

    return errors;
  };

  const sentback = async (data) => {
    setAdd(false);
    setFormData({});
    setimageName("");
  };
  const [closeLoader, setcloseLoader] = useState(false);
  const handleCloseTicket = async (ticketId) => {
    setcloseLoader(true);
    // const confirmation = window.confirm(
    //   "Are you sure you want to close this ticket?"
    // );
    // if (!confirmation) return;

    const payload = { _id: ticketId, tag: "admin" };
    const response = await postMethod({
      apiUrl: apiService.ticket_close,
      payload,
    });

    if (response.status) {
      setcloseLoader(false);
      toast.success("Ticket has been closed successfully!");
      getUserDetails();
      setAdd(false);
    } else {
      setcloseLoader(false);
      toast.error(response.Message);
    }
  };
  const handleFileChange = (val) => {
    try {
      console.log(val);

      const fileExtension = val.name.split(".").at(-1);
      const fileSize = val.size;
      const fileName = val.name;
      setimageName(fileName);

      if (
        fileExtension != "png" &&
        fileExtension != "jpg" &&
        fileExtension != "jpeg"
      ) {
        toast.error(
          "File does not support. You must use .png or .jpg or .jpeg "
        );
      } else if (fileSize > 10000000) {
        toast.error("Please upload a file smaller than 1 MB");
      } else {
        const data = new FormData();
        data.append("file", val);
        data.append("upload_preset", env.upload_preset);
        data.append("cloud_name", env.cloud_name);
        fetch(
          "https://api.cloudinary.com/v1_1/" + env.cloud_name + "/auto/upload",
          { method: "post", body: data }
        )
          .then((resp) => resp.json())
          .then((data) => {
            const imageUrl = data.secure_url;

            // Update the state with the image URL
            setFormData((prevState) => ({
              ...prevState,
              image: imageUrl,
            }));

            // Validate the form with the updated form data
            validateForm({
              ...formData,
              image: imageUrl,
            });
          })
          .catch((err) => {
            console.log(err);
            toast.error("Please try again later");
          });
      }
    } catch (error) {
      console.log(error);
      toast.error("Please try again later");
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
            {/* {loader ? (
              <SkeletonwholeProject />
            ) : ( */}
            <>
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">Support</span>
                    {add == false ? (
                      <div className="support_filter">
                        <div className="filter_container">
                          <input
                            className="filter_input"
                            placeholder="Search username "
                            value={filterKeyword}
                            // ref={inputRef}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length === 1 && value.startsWith(" "))
                                return;
                              setFilterKeyword(value);
                            }}
                            // onChange={handleFilterChange}
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
                          onClick={() => handleFilterChange()}
                        >
                          <span>Filter</span>
                          <FaFilter />
                        </div>
                        <div onClick={download_csv} className="">
                          <CsvDownloader
                            text="Download"
                            className="float-right csv-filter-change export_btn"
                            filename="Withdraw Transaction Details"
                            extension=".csv"
                            disabled={!(csvDataref.current?.length > 0)}
                            datas={csvDataref.current}
                          >
                            Export{" "}
                            <i class="fa fa-download" aria-hidden="true"></i>
                          </CsvDownloader>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => sentback()}>Back</button>
                    )}
                  </div>
                  {add == false ? (
                    <div className="my-5 trans-table">
                      <div className="table-responsive">
                        <table className="w_100">
                          <thead className="trans-head">
                            <tr>
                              <th>S.No</th>
                              <th>Date & Time</th>
                              <th>Email</th>
                              <th>Category</th>
                              <th>Status</th>
                              <th>Action</th>
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
                                        {Moment(item.created_at).format("lll")}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.email}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.category}
                                      </span>
                                    </td>
                                    <td>
                                      {item.status == 0 ? (
                                        <span className="plus_14_ff text-success">
                                          Open
                                        </span>
                                      ) : (
                                        <span className="plus_14_ff text-danger red">
                                          Closed
                                        </span>
                                      )}
                                    </td>
                                    <td>
                                      <span className="plus_14_ff">
                                        {item.status == 0 ? (
                                          <i
                                            className="fa-regular fa-pen-to-square cursor-pointer"
                                            onClick={() =>
                                              getEditDetails(item._id)
                                            }
                                          ></i>
                                        ) : (
                                          <i
                                            class="fa-regular fa-eye reg_eye cursor-pointer"
                                            onClick={() => {
                                              getEditDetails(item._id);
                                              setViewStatus(true);
                                            }}
                                          ></i>
                                        )}
                                      </span>
                                    </td>
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
                                        breakLabel={"..."}
                                        pageCount={totalPages}
                                        marginPagesDisplayed={1}
                                        pageRangeDisplayed={2}
                                        onPageChange={handlePageClick}
                                        containerClassName={
                                          "pagination pagination-md justify-content-center"
                                        }
                                        forcePage={currentPage - 1}
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
                          User Mail
                        </label>
                        <div className="col-lg-6">
                          <span className="plus_14_ff">
                            {oneDataref.current.email}
                          </span>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Subject
                        </label>
                        <div className="col-lg-6">
                          <span className="plus_14_ff wordbreak">
                            {oneDataref.current.subject}
                          </span>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Category
                        </label>
                        <div className="col-lg-6">
                          <span className="plus_14_ff wordbreak">
                            {oneDataref.current.category}
                          </span>
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Chat
                        </label>
                        <div className="col-lg-6">
                          <div className="chatcard">
                            <div
                              className="support-chat-window"
                              ref={chatWindowRef}
                            >
                              {chatLoading ? (
                                <>
                                  {" "}
                                  <div className="chat-message">
                                    <div className="chat-admin">
                                      <div className="flex1  justify-content-end align-items-end">
                                        <FaRegUserCircle />
                                        <div>
                                          <div className="chat-bubble d-flex">
                                            <p className="p-0">
                                              Hello! I have a question about my{" "}
                                              {oneDataref.current.category}.
                                            </p>
                                          </div>
                                        </div>
                                        {/* <BiSupport /> */}
                                      </div>

                                      {/* Time */}
                                    </div>
                                  </div>
                                  <div className="chat-message">
                                    <div className="chat-user">
                                      <div className="flex1  justify-content-end align-items-end">
                                        {/* <FaRegUserCircle /> */}
                                        <div>
                                          <div className="chat-bubble d-flex">
                                            <p className="p-0">
                                              Hello! 👋 Welcome to CapitalEXC
                                              support. How can we help you
                                              today?
                                            </p>
                                          </div>
                                        </div>
                                        <BiSupport />
                                      </div>

                                      {/* Time */}
                                    </div>
                                  </div>
                                  {oneDataref.current?.reply?.length > 0
                                    ? oneDataref.current?.reply.map(
                                        (rep, i) => (
                                          <>
                                            <div className="chat-message">
                                              <div
                                                key={i}
                                                className={`${
                                                  rep?.tag !== "user"
                                                    ? "chat-user"
                                                    : "chat-admin"
                                                }`}
                                              >
                                                <div className="flex1  justify-content-end align-items-end">
                                                  {rep?.tag == "user" && (
                                                    <FaRegUserCircle />
                                                  )}

                                                  <div>
                                                    {rep?.message && (
                                                      <div className="chat-bubble d-flex">
                                                        <p className="p-0">
                                                          {rep?.message}
                                                        </p>
                                                      </div>
                                                    )}

                                                    <span className="chat-time">
                                                      {Moment(
                                                        rep?.posted_at
                                                      ).format("lll")}
                                                    </span>
                                                  </div>

                                                  {rep?.tag != "user" && (
                                                    <BiSupport />
                                                  )}
                                                </div>

                                                {/* Time */}
                                              </div>
                                            </div>
                                          </>
                                        )
                                      )
                                    : ""}
                                </>
                              ) : (
                                <div>
                                  <div className="chat-message">
                                    <div className="chat-admin">
                                      <div className="flex1  justify-content-end align-items-end">
                                        <div>
                                          <div className="chat-bubble d-flex">
                                            <p className="p-0">
                                              <Skeleton
                                                variant="rounded"
                                                height={37}
                                                width={150}
                                                className="mb-3 ml-7"
                                                sx={{
                                                  bgcolor: "#b8b8b833",
                                                  borderRadius: "6px",
                                                }}
                                              />
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Time */}
                                    </div>
                                  </div>
                                  <div className="chat-message">
                                    <div className="chat-user">
                                      <div className="flex1  justify-content-end align-items-end">
                                        <div>
                                          <div className="chat-bubble d-flex">
                                            <p className="p-0">
                                              <Skeleton
                                                variant="rounded"
                                                height={37}
                                                width={150}
                                                className="mb-3 ml-7"
                                                sx={{
                                                  bgcolor: "#b8b8b833",
                                                  borderRadius: "6px",
                                                }}
                                              />
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Time */}
                                    </div>
                                    <div className="chat-message">
                                      <div className="chat-admin">
                                        <div className="flex1  justify-content-end align-items-end">
                                          <div>
                                            <div className="chat-bubble d-flex">
                                              <p className="p-0">
                                                <Skeleton
                                                  variant="rounded"
                                                  height={37}
                                                  width={150}
                                                  className="mb-3 ml-7"
                                                  sx={{
                                                    bgcolor: "#b8b8b833",
                                                    borderRadius: "6px",
                                                  }}
                                                />
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Time */}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            {ViewStatus == true
                              ? ""
                              : oneDataref.current.status == 0 &&
                                (messageLoader == false ? (
                                  <div className="chat-input-container">
                                    <input
                                      type="text"
                                      name="replay"
                                      value={formData.replay}
                                      onChange={handleChange}
                                      placeholder="Type a reply..."
                                      className="chat-input"
                                      onKeyDown={(e) =>
                                        e.key === "Enter" && handleSubmit(e)
                                      }
                                    />

                                    <i
                                      class="fa-solid fa-paper-plane absolute"
                                      onClick={handleSubmit}
                                    ></i>
                                  </div>
                                ) : (
                                  <>
                                    <div className="chat-input-container">
                                      <input
                                        type="text"
                                        name="replay"
                                        placeholder="Type a reply..."
                                        className="chat-input"
                                      />
                                      <i class="fa-solid fa-paper-plane absolute"></i>
                                    </div>
                                  </>
                                ))}
                          </div>
                        </div>
                      </div>
                      {ViewStatus == true ? (
                        ""
                      ) : (
                        <div className="form-group row">
                          <label className="col-lg-6 col-form-label form-control-label">
                            Close Ticket
                          </label>
                          <div className="col-lg-6">
                            {oneDataref.current.status == 0 ? (
                              <div className="col-lg-4">
                                {closeLoader == false ? (
                                  <button
                                    type="submit"
                                    className="d-block w_100 submit-btn-change"
                                    onClick={() =>
                                      handleCloseTicket(selectedTicketId)
                                    }
                                  >
                                    Close
                                  </button>
                                ) : (
                                  <button
                                    type="submit"
                                    className="d-block w_100"
                                  >
                                    Loading ...
                                  </button>
                                )}
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      )}
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

export default Support;
