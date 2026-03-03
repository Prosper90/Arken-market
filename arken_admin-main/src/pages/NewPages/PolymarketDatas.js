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

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import { FiCheck } from "react-icons/fi";
import { IoAddCircleSharp } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowDown } from "react-icons/io";
import { BsPerson } from "react-icons/bs";
import { LuBrainCog } from "react-icons/lu";
import { AiFillCheckCircle } from "react-icons/ai";
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

const PolymarketCreaction = () => {
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

 
  const [polymarketData, setpolyMarketData] = useState([]);

 const getPolymarketList = async (page = 1) => {
  try {
    setLoader(true);

    const data = {
      apiUrl: apiService.getallpolymarkets,
      payload: { page, limit: 5 },
    };

    const response = await postMethod(data);

    setLoader(false);

    if (response.status) {
      setMarketData(response.data);      
      setTotalPages(response.totalPages);  
    } else {
      setMarketData([]);
    }

  } catch (error) {
    console.error("Error fetching polymarket list:", error);
    setLoader(false);
    setMarketData([]);
  }
};

  useEffect(() => {
    getPolymarketList(currentPage);
  }, [currentPage, filterKeyword, hadUpdate]);



  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [edit, setEdit] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    modal: false,
    item: "",
  });



  const [selectedTags, setSelectedTags] = useState([]);

  const [eventsData, setEventsData] = useState([]);

  const getEvents = async () => {
    const data = {
      apiUrl: apiService.events_list,
      payload: { page: 1, limit: 10000 },
    };
    const response = await postMethod(data);
    // console.log("response", response);
    if (response.success) {
      setEventsData(response.data.docs || []);
    } else {
      setEventsData([]);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

   



  function validateOption(value) {
    if (!value.trim()) return "Option is required";
    if (value.length < 2) return "Minimum 2 characters required";
    return "";
  }


  const handleFilterchange = () => {
    getPolymarketList(currentPage);
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
          <span className="dash-head">Polymarket Data</span>
          {/* <div className="usr_mng_rgt">
            <div className="filter_container">
              <input
                className="filter_input"
                ref={inputRef}
                placeholder="Search Question"
                value={filterKeyword}
                onChange={(e) => {
                  const value = e?.target?.value;
                  if (value.length === 1 && value.startsWith(" ")) return;
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

            <div className="btn_add" onClick={handleFilterchange}>
              <span>Filter</span>
              <FaFilter />
            </div>
          </div> */}
        </div>

        {loader ? (
          <SkeletonwholeProject />
        ) : (
          <div className="my-5 trans-table">
            <div className="table-responsive">
              <table className="w_100">
                <thead className="trans-head">
                  <tr>
                    <th>S.No</th>
                    <th>Question</th>
                    <th>Liquidity</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Order Status</th>
                    {/* <th>Action</th> */}
                  </tr>
                </thead>
                <tbody>
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
                            className="plus_14_ff"
                            style={{ color: item.active ? "green" : "red" }}
                          >
                            {item.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <span
                            className="plus_14_ff"
                            style={{ color: !item.closed ? "green" : "red" }}
                          >
                            {!item.closed ? "Accepted" : "Not Accepted"}
                          </span>
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

                  {/* Pagination */}
                  {marketData.length > 0 && (
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
                  )}
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
  
    </div>
  );
};

export default PolymarketCreaction;
