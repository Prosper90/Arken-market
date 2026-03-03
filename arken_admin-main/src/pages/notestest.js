// import React, { useEffect } from "react";
// import Sidebar from "./Sidebar";
// import Sidebar_2 from "./Nav_bar";
// import ReactPaginate from "react-paginate";
// import Select from "react-select";

// import { toast } from "react-toastify";
// import Moment from "moment";
// import { getMethod, postMethod } from "../core/service/common.api";
// import useState from "react-usestateref";
// import apiService from "../core/service/detail";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import { ScaleLoader } from "react-spinners";
// import Box from "@mui/material/Box";
// import Modal from "@mui/material/Modal";
// import Fade from "@mui/material/Fade";
// import Backdrop from "@mui/material/Backdrop";

// const style = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   boxShadow: 24,
// };
// const customStyles = {
//   control: (styles) => ({
//     ...styles,
//     // backgroundColor: "#f9f9f9",
//     // border: "1px solid #ccc",
//     // padding: "4px",
//     backgroundColor: "#0b0808ff",
//     //   border: `1px solid ${theme === "dark" ? "#2b3139" : "#ccc"}`,
//     padding: "4px",
//     color: "#000",
//     //   border: "none",
//     boxShadow: "none", // Removes the box-shadow
//     outline: "none", // Removes any outline
//   }),
//   option: (styles, { isFocused }) => ({
//     ...styles,
//     color: "#000",
//     backgroundColor: isFocused ? "#dfc822" : "#fff",
//     cursor: "pointer",
//   }),
//   singleValue: (styles) => ({
//     ...styles,
//     color: "#fff",
//   }),
// };

// const CategoryOptions = [
//   { value: "/register", label: "Register" },
//   { value: "/login", label: "Login" },
//   { value: "/deposit", label: "Deposit " },
//   { value: "/withdraw", label: "Withdraw" },
//   { value: "/support", label: "Support" },
//   { value: "/security", label: "Security" },
//   { value: "/kyc", label: "Identification" },
// ];
// function NotesManagement() {
//   const [add, setadd] = useState(false);
//   const [Usersdata, setUsersdata, Usersdataref] = useState([]);
//   const [filterKeyword, setFilterKeyword] = useState("");
//   const [totalPages, setTotalPages] = useState(0);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loader, setLoader] = useState(false);
//   const [buttonLoader, setButtonLoader] = useState(false);
//   const [validationnErr, setvalidationnErr] = useState({});

//   const [notesdata, setnotesdata, notesdataref] = useState({
//     notes: "",
//     category: "",
//     status: "", // 0 for Deactive, 1 for Active
//   });

//   const handleNetworkChange = (selectedOption, field) => {
//     setnotesdata({
//       ...notesdata,
//       [field]: selectedOption.value,
//     });
//   };

//   useEffect(() => {
//     getUserDetails(currentPage);
//   }, [currentPage, filterKeyword]);

//   const getUserDetails = async (page = 1, limit = 5) => {
//     const data = {
//       apiUrl: apiService.notes_list,
//       payload: { page, limit, keyword: filterKeyword },
//     };

//     const response = await postMethod(data);
//     if (response.status) {
//       setFilteredUsers(response.data);
//       // setUsersdata(response.data);
//       setTotalPages(response.totalPages); // Update the total pages for pagination
//     } else {
//       setUsersdata([]);
//     }
//   };

//   const handlePageClick = (data) => {
//     const selectedPage = data.selected + 1;
//     setCurrentPage(selectedPage);
//     // getUserDetails(selectedPage); // Fetch data for the selected page
//   };

//   const handleFilterChange = (e) => {
//     setFilterKeyword(e.target.value);
//   };

//   // const filteredUsers = Usersdata.filter((user) =>
//   //   user.heading.toLowerCase().includes(filterKeyword.toLowerCase())
//   // );

//   const getEditDetails = async (data) => {
//     var obj = {
//       _id: data,
//     };
//     var datas = {
//       apiUrl: apiService.notes_get,
//       payload: obj,
//     };
//     setLoader(true);
//     var response = await postMethod(datas);
//     // console.log(response, "=-=-=-=response=-=-=");
//     setLoader(false);
//     if (response.status) {
//       const exchangeData = {
//         notes:response.data.notes||"",
//         category:response.data.category||"",
//         status:response.data.status||"",
//         id: response.data._id || "",
//       };
//       setnotesdata(exchangeData);
//       setadd(true);
//     } else {
//       setnotesdata({});
//     }
//   };

//   const deleteDetail = async (data) => {
//     // console.log(data, "data");
//     var obj = {
//       _id: data,
//     };
//     var datas = {
//       apiUrl: apiService.deletenotesdetail,
//       payload: obj,
//     };
//     setLoader(true);
//     var response = await postMethod(datas);
//     // console.log(response, "=-=-=-=response=-=-=");
//     setLoader(false);
//     if (response.status) {
//       toast.success(response.Message);
//       getUserDetails();
//       handleClose();
//       // setAdd(true);
//     } else {
//       toast.error(response.Message);

//       // setnotesdata({});
//     }
//   };

//   const handleChange = async (e) => {
//     // e.preventDefault();
//     const { name, value } = e.target;
//     const formData = { ...notesdata, [name]: value };
//     setnotesdata(formData);
//     const errors = validateForm(formData);
//     setvalidationnErr(errors);
//   };

//   const formSubmit = async (e) => {
//     try {
//       e.preventDefault();
//       const errors = validateForm(notesdata);
//       if (Object.keys(errors).length > 0) {
//         setvalidationnErr(errors);
//         return;
//       }
//       setvalidationnErr({});
//       var data = {
//         apiUrl: apiService.notes_update,
//         payload: notesdata,
//       };
//       setButtonLoader(true);
//       var resp = await postMethod(data);
//       setButtonLoader(false);
//       if (resp.status) {
//         toast.success(resp.Message);
//         setadd(false);
//         getUserDetails();
//       } else {
//         toast.error(resp.Message);
//         setadd(false);
//         getUserDetails();
//       }
//       // } else {
//       //   console.log("Required all fields");
//       // }
//     } catch (error) {
//       // console.log(error,"=-=--catch error=-=-=-=-");
//     }
//   };

//   const sentback = async (data) => {
//     setadd(false);
//     setnotesdata({});
//   };


//   const validateForm = (values) => {
//     const errors = {};

//     // Common validations
//     if (!values.notes) {
//       errors.notes = "notes is required";
//     } else if (values.notes.length > 50) {
//       errors.notes = "Max 50 characters allowed";
//     }

//     if (!values.category) {
//       errors.category = "category is required";
//     } 
//     if (!values.category) {
//       errors.category = "Category is required";
//     }

//     if (
//       values.status == undefined ||
//       values.status == "" ||
//       values.status == null
//     ) {
//       errors.status = "Status is required";
//     }

//     return errors;
//   };
//   const [deleteid, setdeleteid, deleteidref] = useState("");

//   const [open, setOpen] = useState(false);
//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);

//   return (
//     <div>
//       {loader == true ? (
//         <div className="loadercss">
//           <ScaleLoader
//             height="80"
//             width="80"
//             color="#dfc822"
//             ariaLabel="bars-loading"
//             wrapperStyle={{}}
//             wrapperClass=""
//             visible={true}
//           />
//         </div>
//       ) : (
//         <div className="container-fluid">
//           <div className="row">
//             <div className="col-lg-2 px-0">
//               <Sidebar />
//             </div>
//             <div className="col-lg-10 px-0">
//               <div className="pos_sticky">
//                 <Sidebar_2 />
//               </div>
//               <div className="px-4 transaction_padding_top">
//                 <div className="px-2 my-4 transaction_padding_top tops">
//                   <div className="headerss">
//                     <span className="dash-head">notes Settings</span>
//                     <div>
//                       {add == false ? (
//                         <div className="top_filter">
//                           <input
//                             className="filters"
//                             placeholder="Enter Heading to filter"
//                             value={filterKeyword}
//                             onChange={handleFilterChange}
//                           />
//                           <i
//                             className="fa-solid fa-circle-plus adds cursor-pointer"
//                             onClick={() => setadd(true)}
//                           ></i>
//                         </div>
//                       ) : (
//                         <button onClick={() => sentback()}>Back</button>
//                       )}
//                     </div>
//                   </div>
//                   {add == false ? (
//                     <div class="table-responsive my-5  trans-table ">
//                       <table className="w_100">
//                         <thead className="trans-head">
//                           <th>S.No</th>
//                           <th>Notes</th>
//                           <th>Page Category</th>
//                           <th>Status</th>
//                           <th>Action</th>
//                           <th>Delete</th>
//                         </thead>

//                         <tbody>
//                           {filteredUsers.length > 0 ? (
//                             filteredUsers.map((item, i) => (
//                               <tr key={item._id}>
//                                 <td>
//                                   <span className="plus_14_ff">{i + 1}</span>
//                                 </td>
//                                 <td>
//                                   <span className="plus_14_ff">
//                                     {item.notes}
//                                   </span>
//                                 </td>
//                                 <td>
//                                   <span className="plus_14_ff">
//                                     {item.category}
//                                   </span>
//                                 </td>
//                                 <td>
//                                   <span className="plus_14_ff">
//                                     {item.status == "1" ? (
//                                       <span className="plus_14_ff text-success">
//                                         Active
//                                       </span>
//                                     ) : (
//                                       <span className="plus_14_ff text-danger">
//                                         Deactive
//                                       </span>
//                                     )}
//                                   </span>
//                                 </td>
//                                 <td>
//                                   <label className="plus_14_ff ed-icon-fz">
//                                     <i
//                                       class="fa-regular fa-pen-to-square cursor-pointer"
//                                       onClick={() => getEditDetails(item._id)}
//                                     ></i>
//                                   </label>
//                                 </td>
//                                 <td>
//                                   <span className="plus_14_ff ed-icon-fz">
//                                     <i
//                                       className="fa-regular fa-trash-can text-danger cursor-pointer"
//                                       onClick={() => {
//                                         handleOpen();
//                                         setdeleteid(item._id);
//                                       }}
//                                     ></i>
//                                   </span>
//                                 </td>

//                                 <Modal
//                                   aria-labelledby="transition-modal-title"
//                                   aria-describedby="transition-modal-description"
//                                   open={open}
//                                   onClose={handleClose}
//                                   closeAfterTransition
//                                   slots={{ backdrop: Backdrop }}
//                                   slotProps={{
//                                     backdrop: {
//                                       timeout: 500,
//                                     },
//                                   }}
//                                 >
//                                   <Fade in={open}>
//                                     <Box
//                                       sx={style}
//                                       className="popup_modal-delete"
//                                     >
//                                       <div className="popup_modal-title">
//                                         <span>
//                                           <span className="popup_modal-title-icon">
//                                             <i className="fa-solid fa-triangle-exclamation"></i>
//                                           </span>
//                                           Confirm Delete
//                                         </span>
//                                       </div>
//                                       <div className="popup_modal-content">
//                                         <p>
//                                           Are you sure you want to permanently
//                                           delete this item?
//                                         </p>
//                                       </div>
//                                       <div className="popup_modal-btn-wrap">
//                                         <button
//                                           className="popup_modal-btn-cancel"
//                                           onClick={() => handleClose()}
//                                         >
//                                           Cancel
//                                         </button>
//                                         <button
//                                           className="popup_modal-btn-confirm"
//                                           onClick={() =>
//                                             deleteDetail(deleteidref.current)
//                                           }
//                                         >
//                                           Delete
//                                         </button>
//                                       </div>
//                                     </Box>
//                                   </Fade>
//                                 </Modal>
//                               </tr>
//                             ))
//                           ) : (
//                             <tr>
//                               <td colSpan={6}>
//                                 <div className="empty_data my-4">
//                                   <div className="plus_14_ff">
//                                     No Records Found
//                                   </div>
//                                 </div>
//                               </td>
//                             </tr>
//                           )}
//                           {filteredUsers.length > 0 ? (
//                             <tr className="text-center">
//                               <td colSpan="6">
//                                 <div className="paginationcss">
//                                   <ReactPaginate
//                                     previousLabel={"<"}
//                                     nextLabel={">"}
//                                     breakLabel={"**"}
//                                     pageCount={totalPages}
//                                     forcePage={currentPage - 1}
//                                     marginPagesDisplayed={1}
//                                     pageRangeDisplayed={0}
//                                     onPageChange={handlePageClick}
//                                     containerClassName={
//                                       "pagination pagination-md justify-content-center "
//                                     }
//                                     pageClassName={"page-item"}
//                                     pageLinkClassName={"page-link"}
//                                     previousClassName={"page-item"}
//                                     previousLinkClassName={"page-link"}
//                                     nextClassName={"page-item"}
//                                     nextLinkClassName={"page-link"}
//                                     breakClassName={"page-item"}
//                                     breakLinkClassName={"page-link"}
//                                     activeClassName={"active"}
//                                   />
//                                 </div>
//                               </td>
//                             </tr>
//                           ) : (
//                             ""
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="row justify-content-center mt-5">
//                       <div className="currencyinput  col-lg-9">
//                         <div class="form-group row">
//                           <label class=" col-lg-6 col-form-label form-control-label">
//                             Announcement Notes
//                           </label>
//                           <div class=" col-lg-6">
//                             <input
//                               class="form-control"
//                               type="text"
//                               onChange={handleChange}
//                               name="notes"
//                               maxLength={50}
//                               value={notesdata.notes}
//                               placeholder="enter a heading"
//                             />
//                             <div className="help-block">
//                               {validationnErr.notes && (
//                                 <div className="error">
//                                   {validationnErr.notes}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                         <div className="form-group row">
//                           <label class=" col-lg-6 col-form-label form-control-label">
//                            Announcement Page
//                           </label>
//                           <div className="col-lg-6">
//                             <Select
//                               options={CategoryOptions}
//                               value={CategoryOptions.find(
//                                 (option) => option.value === notesdata.category
//                               )} // Set the selected value
//                               styles={customStyles}
//                               placeholder="Select Category"
//                               onChange={(selectedOption) =>
//                                 handleNetworkChange(selectedOption, "category")
//                               } // Pass "category"
//                               className="withdraw-dropdown-menu"
//                             />
//                             <div className="help-block">
//                               {validationnErr.category && (
//                                 <div className="error">
//                                   {validationnErr.category}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         <div class="form-group row">
//                           <label class=" col-lg-6 col-form-label form-control-label">
//                             Status
//                           </label>
//                           <div className="col-lg-6">
//                             <div className="radio">
//                               <div>
//                                 <input
//                                   type="radio"
//                                   name="status"
//                                   id="statusActive"
//                                   value="1"
//                                   onChange={handleChange}
//                                   checked={notesdata.status == "1"}
//                                 />{" "}
//                                 <label htmlFor="statusActive" className="cursor-pointer">Active</label>
//                               </div>
//                               <div>
//                                 <input
//                                   type="radio"
//                                   name="status"
//                                   id="statusDeactive"
//                                   value="0"
//                                   onChange={handleChange}
//                                   checked={notesdata.status == "0"}
//                                 />{" "}
//                                 <label htmlFor="statusDeactive" className="cursor-pointer">Deactive</label>
//                               </div>
//                             </div>
//                             <div className="help-block">
//                               {validationnErr.status && (
//                                 <div className="error">
//                                   {validationnErr.status}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                         <div class="form-group row justify-content-center">
//                           <div class=" col-lg-4">
//                             {buttonLoader == false ? (
//                               <button
//                                 type="submit"
//                                 className="d-block w_100"
//                                 onClick={formSubmit}
//                               >
//                                 Submit
//                               </button>
//                             ) : (
//                               <button type="submit" className="d-block w_100">
//                                 Loading ...
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default NotesManagement;
