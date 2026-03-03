import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Moment from "moment";
import Sidebar_2 from "./Nav_bar";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import { getMethod, postMethod } from "../core/service/common.api";
import useState from "react-usestateref";
import apiService from "../core/service/detail";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { json } from "body-parser";
import { ScaleLoader } from "react-spinners";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};

function EmailTemplate() {
  const [add, setadd] = useState(false);
  const [editorData, setEditorData] = useState("");
  const [Usersdata, setUsersdata, Usersdataref] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loader, setLoader] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [validationnErr, setvalidationnErr] = useState({});

  const [cmsdata, setcmsdata, cmsdataref] = useState({
    Subject: "",
    body: "",
    key: "",
    status: "", // 0 for Deactive, 1 for Active
  });

  useEffect(() => {
    getUserDetails(currentPage);
  }, [currentPage, filterKeyword]);

  const getUserDetails = async (page = 1, limit = 5) => {
    const data = {
      apiUrl: apiService.mailtemplate_list,
      payload: { page, limit, keyword: filterKeyword },
    };

    const response = await postMethod(data);
    if (response.status) {
      setFilteredUsers(response.data);
      // setUsersdata(response.data);
      setTotalPages(response.totalPages); // Update the total pages for pagination
    } else {
      setUsersdata([]);
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

  // const filteredUsers = Usersdata.filter((user) =>
  //   user.title.toLowerCase().includes(filterKeyword.toLowerCase())
  // );

  const getEditDetails = async (data) => {
    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.mailtemplate_get,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    // console.log(response, "=-=-=-=response=-=-=");
    setLoader(false);
    if (response.status) {
      setcmsdata(response.data);
      console.log(
        JSON.stringify(response.data),
        "=-=-=-response.data=--json.stringify=-=-"
      );
      setadd(true);
    } else {
      setcmsdata({});
    }
  };

  const deleteTemplate = async (data) => {
    // console.log(data, "data");

    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.deletetemplate,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    // console.log(response, "=-=-=-=response=-=-=");
    setLoader(false);
    if (response.status) {
      toast.success(response.Message);
      getUserDetails();

      // setAdd(true);
    } else {
      toast.error(response.Message);

      // setcmsdata({});
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 0 ? 1 : 0;
    // console.log(newStatus, "ijuiewhuiewhiwefhwefi");

    let formData = { ...cmsdataref.current, ...{ ["status"]: newStatus } };
    setcmsdata(formData);
  };

  const handleChange = async (e) => {
    // e.preventDefault();
    const { name, value } = e.target;
    const formData = { ...cmsdata, [name]: value };
    setcmsdata(formData);
    const errors = validateForm(formData);
    setvalidationnErr(errors);
  };

  const handleTextChangeBody = async (e) => {
    let addrressData = { ...cmsdata, body: e.target.value };
    setcmsdata(addrressData);
    const errors = validateForm(addrressData);
    setvalidationnErr(errors);
  };

  const formSubmit = async (e) => {
    try {
      e.preventDefault();
      const errors = validateForm(cmsdata);
      if (Object.keys(errors).length > 0) {
        setvalidationnErr(errors);
        return;
      }
      setvalidationnErr({});
      // console.log("Form data submitted:", cmsdata);
      // return;
      var data = {
        apiUrl: apiService.mailtemplate_update,
        payload: cmsdata,
      };
      setButtonLoader(true);
      var resp = await postMethod(data);
      setButtonLoader(false);
      if (resp.status) {
        toast.success(resp.Message);
        setadd(false);
        getUserDetails();
      } else {
        toast.error(resp.Message);
        setadd(false);
        getUserDetails();
      }
    } catch (error) {
      // console.log(error,"=-=--catch error=-=-=-=-");
    }
  };

  const sentback = async (data) => {
    setadd(false);
    setcmsdata({});
  };

  const validateForm = (values) => {
    const errors = {};

    // Common validations
    if (!values.Subject) {
      errors.Subject = "subject is required";
    } else if (values.Subject.length > 50) {
      errors.Subject = "Max 50 characters allowed";
    }

    if (!values.key) {
      errors.key = "key is required";
    } else if (values.key.length > 30) {
      errors.key = "Max 30 characters allowed";
    }

    if (
      values.status == undefined ||
      values.status == "" ||
      values.status == null
    ) {
      errors.status = "status is required";
    }

    if (!values.body) {
      errors.body = "body is required";
    }

    return errors;
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      {loader == true ? (
        <div className="loadercss">
          <ScaleLoader
           height={50} width={5}
            color="#dfc822"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      ) : (
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-2 px-0">
              <Sidebar />
            </div>
            <div className="col-lg-10 px-0">
              <div className="pos_sticky">
                <Sidebar_2 />
              </div>
              <div className="px-4 transaction_padding_top">
                <div className="px-2 my-4 transaction_padding_top tops">
                  <div className="headerss">
                    <span className="dash-head">Mail Setting</span>
                    <div>
                      {add == false ? (
                        <div className="top_filter">
                          <input
                            className="filters"
                            placeholder="Enter Subject to filter"
                            value={filterKeyword}
                            onChange={handleFilterChange}
                          />
                          <i
                            className="fa-solid fa-circle-plus adds cursor-pointer"
                            onClick={() => setadd(true)}
                          ></i>
                        </div>
                      ) : (
                        <button onClick={() => sentback()}>Back</button>
                      )}
                    </div>
                  </div>

                  {add == false ? (
                    <div class="table-responsive my-5  trans-table ">
                      <table className="w_100">
                        <thead className="trans-head">
                          <th>S.No</th>
                          <th>Subject</th>
                          <th>Date</th>
                          <th>Action</th>
                          <th>Delete</th>
                        </thead>
                        <tbody>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((item, i) => (
                              <tr key={item._id}>
                                <td>
                                  <span className="plus_14_ff">{i + 1}</span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {item.title}
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {Moment(item.date).format("lll")}
                                  </span>
                                </td>
                                <td>
                                  <label className="plus_14_ff ed-icon-fz">
                                    <i
                                      class="fa-regular fa-pen-to-square cursor-pointer"
                                      onClick={() => getEditDetails(item._id)}
                                    ></i>
                                  </label>
                                </td>
                                <td>
                                  <label className="plus_14_ff ed-icon-fz">
                                    <i
                                      className="fa-regular fa-trash-can text-danger cursor-pointer"
                                      // onClick={() => deleteTemplate(item._id)}
                                      onClick={() => handleOpen()}
                                    ></i>
                                  </label>
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
                                          Are you sure you want to permanently
                                          delete this item?
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
                                            deleteTemplate(item._id)
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
                          {filteredUsers.length > 0 ? (
                            <tr className="text-center">
                              <td colSpan="6">
                                <div className="paginationcss">
                                  <ReactPaginate
                                    previousLabel={"<"}
                                    nextLabel={">"}
                                    breakLabel={"..."}
                                    pageCount={totalPages} // Set the total number of pages
                                    marginPagesDisplayed={1}
                                    pageRangeDisplayed={2}
                                    onPageChange={handlePageClick} // Handle page change
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
                      </table>
                    </div>
                  ) : (
                    <div className="row justify-content-center mt-5">
                      <div className="currencyinput  col-lg-9">
                        <div class="form-group row">
                          <label class=" col-lg-6 col-form-label form-control-label">
                            Subject
                          </label>
                          <div class=" col-lg-6">
                            <input
                              type="text"
                              value={cmsdata.Subject}
                              onChange={handleChange}
                              name="Subject"
                              placeholder="enter a subject"
                              class="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.Subject && (
                                <div className="error">
                                  {validationnErr.Subject}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div class="form-group row">
                          <label class=" col-lg-6 col-form-label form-control-label">
                            Key
                          </label>
                          <div class=" col-lg-6">
                            <input
                              type="text"
                              value={cmsdata.key}
                              onChange={handleChange}
                              name="key"
                              placeholder="enter a key"
                              class="form-control"
                            />
                            <div className="help-block">
                              {validationnErr.key && (
                                <div className="error">
                                  {validationnErr.key}
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
                                  checked={cmsdata.status == "1"}
                                />{" "}
                                Active
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  name="status"
                                  value="0"
                                  onChange={handleChange}
                                  checked={cmsdata.status == "0"}
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
                        <div class="form-group row">
                          <label class=" col-lg-6 col-form-label form-control-label">
                            Content-Description
                          </label>
                          <div class=" col-lg-6">
                            <textarea
                              name="body"
                              value={cmsdata.body}
                              onChange={handleTextChangeBody}
                              placeholder="Enter the template content"
                              fluid
                              className="input-field fixed-textarea-temp w-100"
                            />
                            {/* <CKEditor
                            editor={ClassicEditor}
                            data={cmsdata.body}
                            onChange={(event, editor) => {
                              const data = editor.getData();
                              setcmsdata((prevState) => ({
                                ...prevState, // Keep the existing values
                                body: data, // Update the content_description
                              }));
                            }}
                            config={{
                              toolbar: [
                                "heading",
                                "|",
                                "bold",
                                "italic",
                                "underline",
                                "|",
                                "link",
                                "bulletedList",
                                "numberedList",
                                "|",
                                "blockQuote",
                                "undo",
                                "redo",
                                "source"
                              ],
                              placeholder: "Enter the content",
                            }}
                          /> */}
                            <div className="help-block">
                              {validationnErr.body && (
                                <div className="error">
                                  {validationnErr.body}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div class="form-group row"></div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailTemplate;
