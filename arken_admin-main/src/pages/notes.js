import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import { useFormik } from "formik";
import * as Yup from "yup";
import ReactPaginate from "react-paginate";
import { postMethod } from "../core/service/common.api";
import { ScaleLoader } from "react-spinners";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import SkeletonwholeProject from "../pages/SkeletonwholeProject";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Box, Fade, Skeleton } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
// import Box from "@mui/material/Box";
import MuiModal from "@mui/material/Modal";
// import Fade from "@mui/material/Fade";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};

const AnnouncementSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  message: Yup.string().required("Message is required"),
  scheduleDateTime: Yup.date()
    .required("Scheduled Date & Time is required")
    .min(new Date(), "Scheduled time cannot be in the past"),
  expiryDateTime: Yup.date()
    .required("Expiration Date & Time is required")
    .min(
      Yup.ref("scheduleDateTime"),
      "Expiration must be after scheduled time"
    ),
});

function AnnouncementManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loader, setLoader] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  useEffect(() => {
    fetchAnnouncements(currentPage, filterKeyword);
  }, [currentPage, filterKeyword]);

  const rows = Array.from({ length: 5 }); // 4 rows
  const cols = 7;
  // useEffect(() => {
  //   fetchAnnouncements(currentPage);
  // }, [currentPage]);

  // useMemo(() => {
  //   if (!filterKeyword) {
  //     setFilteredAnnouncements(announcements);
  //   } else {
  //     const filtered = announcements.filter(
  //       (announcement) =>
  //         announcement.message
  //           .toLowerCase()
  //           .includes(filterKeyword.toLowerCase()) ||
  //         announcement.title.toLowerCase().includes(filterKeyword.toLowerCase())
  //     );
  //     setFilteredAnnouncements(filtered);
  //   }
  // }, [announcements, filterKeyword]);

  // const fetchAnnouncements = async (page = 1) => {
  //   try {
  //     setLoader(true);
  //     const datas = {
  //       apiUrl: "adminapi/getAnnouncement",
  //       payload: { page, limit: 5 },
  //     };
  //     const response = await postMethod(datas);
  //     setLoader(false);
  //     setAnnouncements(response.data);
  //     setFilteredAnnouncements(response.data);
  //     setTotalPages(response.totalPages);
  //     setCurrentPage(response.page);
  //   } catch (error) {
  //     setLoader(false);
  //     console.error(error);
  //     toast.error("Failed to fetch announcements");
  //   }
  // };

  const fetchAnnouncements = async (page = 1, keyword = "") => {
    try {
      setLoader(true);
      const datas = {
        apiUrl: "adminapi/getAnnouncement",
        payload: {
          page,
          limit: 5,
          keyword, // Send keyword to backend
        },
      };
      const response = await postMethod(datas);
      setLoader(false);
      setAnnouncements(response.data);
      setFilteredAnnouncements(response.data); // Optional if you're not doing client-side filtering anymore
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (error) {
      setLoader(false);
      console.error(error);
      toast.error("Failed to fetch announcements");
    }
  };

  const formik = useFormik({
    initialValues: {
      id: "",
      title: "",
      message: "",
      scheduleDateTime: null,
      expiryDateTime: null,
    },
    validationSchema: AnnouncementSchema,
    onSubmit: async (values) => {
      try {
        const formData = {
          title: values.title.trim(),
          message: values.message.trim(),
          scheduledDateTime: values.scheduleDateTime.toISOString(),
          expirationDateTime: values.expiryDateTime.toISOString(),
        };

        let response;

        if (isEditMode && values.id) {
          formData.id = values.id;
          const datas = {
            apiUrl: "adminapi/editAnnouncement",
            payload: formData,
          };
          response = await postMethod(datas);
        } else {
          const datas = {
            apiUrl: "adminapi/addAnnouncement",
            payload: formData,
          };
          response = await postMethod(datas);
        }

        if (response.status === true) {
          toast.success(
            response.message ||
              (isEditMode
                ? "Announcement updated successfully"
                : "Announcement added successfully")
          );
          handleClearForm();
          setIsModalOpen(false);
          fetchAnnouncements(currentPage);
        } else {
          toast.error(
            response.message ||
              (isEditMode
                ? "Failed to update announcement"
                : "Failed to create announcement")
          );
        }
      } catch (error) {
        console.error("API Error:", error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      }
    },
  });

  const handleClearForm = () => {
    formik.resetForm();
    setIsEditMode(false);
  };

  const handleCloseModal = () => {
    handleClearForm();
    setIsModalOpen(false);
  };

  const handleOpenDialog = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (value.length === 1 && value.startsWith(" ")) return;
    setFilterKeyword(value);
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    setCurrentPage(selectedPage);
  };

  const editAnnouncement = (announcement) => {
    formik.setValues({
      id: announcement._id,
      title: announcement.title,
      message: announcement.message,
      scheduleDateTime: new Date(announcement.scheduledDateTime),
      expiryDateTime: new Date(announcement.expirationDateTime),
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const confirmDelete = (announcement) => {
    setAnnouncementToDelete(announcement);
    setShowDeleteConfirm(true);
  };

  const deleteAnnouncement = async () => {
    try {
      setLoader(true);
      const datas = {
        apiUrl: "adminapi/deleteAnnouncement",
        payload: { id: announcementToDelete._id },
      };
      const response = await postMethod(datas);

      if (response.status === true) {
        toast.success(response.message || "Announcement deleted successfully");
        fetchAnnouncements(currentPage);
      } else {
        toast.error(response.message || "Failed to delete announcement");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete announcement");
    } finally {
      setLoader(false);
      setShowDeleteConfirm(false);
      setAnnouncementToDelete(null);
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
                    <span className="dash-head">Announcement Management</span>
                    <div className="usr_mng_rgt">
                      <div className="filter_container">
                        <input
                          className="filter_input"
                          placeholder="Search announcement"
                          value={filterKeyword}
                          onChange={handleFilterChange}
                        />
                        <i className="fa-solid fa-magnifying-glass"></i>
                      </div>

                      <button onClick={handleOpenDialog} className="export_btn">
                        Add
                        <i className="fa-solid fa-circle-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div className="my-5 trans-table">
                    <div className="table-responsive">
                      <table className="w_100">
                        <thead className="trans-head">
                          <tr>
                            <th>S.No</th>
                            <th>Title</th>
                            <th>Message</th>
                            <th>Scheduled Date</th>
                            <th>Expiration Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        {loader == true ? (
                          // <tr>
                          //   <td colSpan={7}>
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
                            {filteredAnnouncements.length > 0 ? (
                              filteredAnnouncements.map((item, i) => (
                                <tr key={item._id}>
                                  <td>
                                    <span className="plus_14_ff">{i + 1}</span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.title.length > 20
                                        ? item.title.slice(0, 20) + "..."
                                        : item.title}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {item.message.length > 20
                                        ? `${item.message.substring(0, 50)}...`
                                        : item.message}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {moment(item.scheduledDateTime).format(
                                        "YYYY-MM-DD HH:mm"
                                      )}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="plus_14_ff">
                                      {moment(item.expirationDateTime).format(
                                        "YYYY-MM-DD HH:mm"
                                      )}
                                    </span>
                                  </td>
                                  <td>
                                    <span
                                      className={`plus_14_ff ${
                                        item.status === 0
                                          ? "text-success"
                                          : "text-danger"
                                      }`}
                                    >
                                      {item.status === 0 ? "Active" : "Expired"}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="d-flex justify-content-center">
                                      <i
                                        className="fa-solid fa-pen-to-square text-white"
                                        title="Edit"
                                        style={{
                                          cursor: "pointer",
                                          marginRight: "1rem",
                                        }}
                                        onClick={() => editAnnouncement(item)}
                                      ></i>
                                      <i
                                        className="fa-solid fa-trash text-danger"
                                        title="Delete"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => confirmDelete(item)}
                                      ></i>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7}>
                                  <div className="empty_data my-4">
                                    <div className="plus_14_ff">
                                      No Announcements Found
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {filteredAnnouncements.length > 0 && (
                              <tr className="text-center">
                                <td colSpan="7">
                                  <div className="paginationcss">
                                    <ReactPaginate
                                      previousLabel="<"
                                      nextLabel=">"
                                      breakLabel="..."
                                      pageCount={totalPages}
                                      forcePage={currentPage - 1}
                                      marginPagesDisplayed={1}
                                      pageRangeDisplayed={2}
                                      onPageChange={handlePageClick}
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
                </div>
              </div>
            </>
            {/* )} */}
          </div>

          {/* Create/Edit Announcement Modal */}
          <Modal
            show={isModalOpen}
            onHide={handleCloseModal}
            centered
            backdrop="static"
            size="md"
            className="main_modal_poup announcement_create_head"
          >
            <div className="wlt_mng_top">
              <Modal.Title>
                <h3 className="connect_a_connect_text">
                  {isEditMode ? "Edit Announcement" : "Create Announcement"}
                </h3>
              </Modal.Title>
              <Button
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  color: "white",
                  fontSize: "20px",
                }}
                variant="close"
                onClick={handleCloseModal}
              >
                <i className="fa-solid fa-xmark"></i>
              </Button>
            </div>

            <div className="ad_mdl_body">
              <form
                onSubmit={formik.handleSubmit}
                className="announcement_form"
              >
                <div className="mb-4">
                  <label className="text-white d-block">Title</label>
                  <input
                    name="title"
                    type="text"
                    className="form-control"
                    value={formik.values.title}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || value[0] !== " ") {
                        formik.handleChange(e);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Enter announcement title"
                  />

                  {formik.errors.title && formik.touched.title && (
                    <div className="text-danger mt-2">
                      {formik.errors.title}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="text-white d-block">Message</label>
                  <textarea
                    name="message"
                    rows="3"
                    maxLength={100}
                    className="form-control"
                    value={formik.values.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || value[0] !== " ") {
                        formik.handleChange(e);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your message here..."
                  />

                  {formik.errors.message && formik.touched.message && (
                    <div className="text-danger mt-2">
                      {formik.errors.message}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="text-white d-block">
                    Scheduled Date & Time
                  </label>
                  <div className="position-relative">
                    <DatePicker
                      selected={formik.values.scheduleDateTime}
                      onChange={(date) =>
                        formik.setFieldValue("scheduleDateTime", date)
                      }
                      onBlur={formik.handleBlur}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="form-control py-2 ps-3 pe-5"
                      minDate={new Date()}
                      name="scheduleDateTime"
                      placeholderText="Select date and time"
                      wrapperClassName="w-100"
                    />

                    <i
                      className="fa-regular fa-calendar-days position-absolute text-white"
                      style={{
                        top: "50%",
                        right: "15px",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    ></i>
                  </div>
                  {formik.errors.scheduleDateTime &&
                    formik.touched.scheduleDateTime && (
                      <div className="text-danger mt-2">
                        {formik.errors.scheduleDateTime}
                      </div>
                    )}
                </div>

                <div className="mb-4">
                  <label className="text-white d-block">
                    Expiration Date & Time
                  </label>
                  <div className="position-relative">
                    <DatePicker
                      selected={formik.values.expiryDateTime}
                      onChange={(date) =>
                        formik.setFieldValue("expiryDateTime", date)
                      }
                      onBlur={formik.handleBlur}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="form-control py-2 ps-3 pe-5"
                      minDate={formik.values.scheduleDateTime || new Date()}
                      name="expiryDateTime"
                      placeholderText="Select date and time"
                      wrapperClassName="w-100"
                    />

                    <i
                      className="fa-regular fa-calendar-days position-absolute text-white"
                      style={{
                        top: "50%",
                        right: "15px",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    ></i>
                  </div>
                  {formik.errors.expiryDateTime &&
                    formik.touched.expiryDateTime && (
                      <div className="text-danger mt-2">
                        {formik.errors.expiryDateTime}
                      </div>
                    )}
                </div>

                <Modal.Footer
                  className="px-0 pt-4 pb-2"
                  style={{ border: "none", backgroundColor: "transparent" }}
                >
                  <button
                    onClick={handleCloseModal}
                    className="announcement_cancel_btn"
                  >
                    Cancel
                  </button>
                  <button
                    // variant="primary"
                    type="submit"
                    className="export_btn"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? (
                      <span>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        {isEditMode ? "Updating..." : "Creating..."}
                      </span>
                    ) : isEditMode ? (
                      "Update"
                    ) : (
                      "Create"
                    )}
                  </button>
                </Modal.Footer>
              </form>
            </div>
          </Modal>

          {/* Delete Confirmation Modal */}
          {/* <Modal
            show={showDeleteConfirm}
            onHide={() => setShowDeleteConfirm(false)}
            centered
            backdrop="static"
            className="main_modal_poup announcement_create_head"
          >
            <Modal.Header>
              <Modal.Title>
                <h3 className="connect_a_connect_text">Confirm Deletion</h3>
              </Modal.Title>
              <Button
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  color: "white",
                  fontSize: "20px",
                }}
                variant="close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </Button>
            </Modal.Header>

            <Modal.Body>
              <div className="mb-4">
                <p className="text-white">
                  Are you sure you want to delete this announcement?
                </p>
              </div>

              <Modal.Footer
                className="px-0 pt-4 pb-2"
                style={{ border: "none" }}
              >
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="me-3 px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={deleteAnnouncement}
                  className="px-4 py-2"
                  disabled={loader}
                >
                  {loader ? (
                    <span>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </Modal.Footer>
            </Modal.Body>
          </Modal> */}

          <MuiModal
            open={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
              },
            }}
          >
            <Fade in={showDeleteConfirm}>
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
                  <p>Are you sure you want to permanently delete this item?</p>
                </div>
                <div className="popup_modal-btn-wrap">
                  <button
                    className="popup_modal-btn-cancel"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="popup_modal-btn-confirm"
                    onClick={deleteAnnouncement}
                    disabled={loader}
                  >
                    {loader ? (
                      <span>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Deleting...
                      </span>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>

                {/* <MuiModal.Body>
                  <div className="mb-4">
                    <p className="text-white">
                      Are you sure you want to delete this announcement?
                    </p>
                  </div>

                  <Modal.Footer
                    className="px-0 pt-4 pb-2"
                    style={{ border: "none" }}
                  >
                    <Button variant="secondary" className="me-3 px-4 py-2">
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={deleteAnnouncement}
                      className="px-4 py-2"
                      disabled={loader}
                    >
                      {loader ? (
                        <span>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Deleting...
                        </span>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </Modal.Footer>
                </MuiModal.Body> */}
              </Box>
            </Fade>
          </MuiModal>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementManagement;
