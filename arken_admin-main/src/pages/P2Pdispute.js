import React, { useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import Moment from "moment";
import ReactPaginate from "react-paginate";
import { getMethod, postMethod } from "../core/service/common.api";
import useState from "react-usestateref";
import apiService from "../core/service/detail";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import { Link } from "react-router-dom";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { socket } from "../context/socket";

function P2Pdispute() {
  const [Nextstep, setNextstep] = useState(false);
  const [loader, setLoader] = useState(false);

  const [Usersdata, setUsersdata, Usersdataref] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [userDispute, setuserDispute, userDisputeref] = useState("");
  const [userDisputeOrder, setuserDisputeOrder, userDisputeOrderref] =
    useState("");
  const [buttonLoaderApprove, setButtonLoaderApprove] = useState(false);
  const [buttonLoaderReject, setButtonLoaderReject] = useState(false);
  const [loaderReject, setLoaderReject] = useState(false);

  const [p2pconfirmOrder, setp2pconfirmOrder, p2pconfirmOrderref] =
    useState("");

  useEffect(() => {
    getUserDetails(currentPage, filterKeyword);
  }, [currentPage, filterKeyword]);


  
    useEffect(() => {
      const token = sessionStorage.getItem("VTXToken");
      const urls = window.location.href;
      const chat = urls.split("/").pop();
      let socket_token = sessionStorage.getItem("socket_token");
      console.log(socket_token,"socket_token")
      let socketsplit = socket_token?.split(`"_`);
      socket.connect();
      socket.off("socketResponse");
      socket.on("socketResponse" + socketsplit[0], function (res) {
        console.log(res)
        if (res.Reason == "p2pchat") {
          getAdminChat();
          toast.success(res.Message);
        } 
        else  if (res.Reason == "notify") {
          getAdminChat();
          toast.success(res.Message);
        } else if (res.Reason == "ordercancel") {
          getAdminChat();
          toast.success(res.Message);
        }
      });
  
      socket.emit("socketResponse");
    }, [0]);
  
    useEffect(() => {
      return () => {
        socket.disconnect();
      };
    }, []);
   
  const [buttonActive, setButtonActive] = useState(false);
  const [buttonFreeze, setButtonFreeze] = useState(false);
  const [buyerId, setbuyerId] = useState();
  const [sellerId,setsellerId] = useState();

  const get_user = async (userId) => {
    var datas = {
      apiUrl: apiService.get_user,
      payload: { _id: userId },
    };
    var response = await postMethod(datas);
    if (response?.data.disputeStatus == 1) {
      setButtonActive(true);
    } else {
      setButtonFreeze(true);
    }
  };

  const getUserDetails = async (page = 1, keyword = "") => {
    var datas = {
      apiUrl: apiService.getP2Pdispute,
      payload: { page, limit: 5, filterKeyword: keyword },
    };
    var response = await postMethod(datas);
    if (response.status) {
      setUsersdata(response.data);
      // setTotalPages(response.data.length/5);
      // setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } else {
      setUsersdata([]);
  }
  };

  const handleFilterChange = (e) => {
    setFilterKeyword(e.target.value);
    setCurrentPage(1);
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1;
    setCurrentPage(selectedPage);
  };
const [chatData,setChatData]= useState([]);

  const getAdminChat= async ()=>{
    console.log(chatTabBtnref.current ,"chatTabBtnref.current ")
    const activeUser = chatTabBtnref.current =="buyer"?buyerId:sellerId

    var obj={
      values:userDisputeref.current,
      activeUserId:activeUser
    }
    try{
        const data = {
        apiUrl: apiService.getAdminChat,
        payload: obj,
      };
      var response = await postMethod(data);
      if (response.status) {
        setChatData(response.data);
      } 
      // else{
      //   setChatData([]);
      // }
    }catch(error){

    }
  };


  const getdisputeDetail = async (userId) => {
    try {
      const data = {
        apiUrl: apiService.getdisputedetail,
        payload: { _id: userId },
      };
      setLoader(true);
      var response = await postMethod(data);
      setLoader(false);
      if (response.status) {
        setuserDispute(response.data.disputeDetails);
        console.log(userDisputeref.current.resolveStatus,"userDisputeref.current.resolveStatus")
        get_user(response.data.disputeDetails.userId);
        setuserDisputeOrder(response.data.orderDetails);
        setp2pconfirmOrder(response.data.p2porderRecord);
        setbuyerId(response.data.buyer_id)
        setsellerId(response.data.seller_id)
        setNextstep(true); // Refresh user data after status change
        getAdminChat()
      } else {
        toast.error("Something Went Wrong. Please Try Again later");
      }
       getAdminChat()
    } catch (error) {
      toast.error("Error updating status. Please try again later.");
    }
  };
const [resolveLoader,setResolveLoader]=useState(false);
  const resolved = async (value)=>{
    var obj={
      disputeId:value,
      status:1
    }
    setResolveLoader(true);
       const data = {
        apiUrl: apiService.resolved,
        payload:obj,
      };
      const response = await postMethod(data);
      setResolveLoader(false);
      if (response.status) {
        toast.success(response.Message);
        setNextstep(false)
      }else{
        toast.error(response.Message);
      }
  }
  const activeStatus = async (value, secondvalue) => {
    try {
      const data = {
        apiUrl: apiService.changeActivedispute,
        payload: { userId1: value, userId2: secondvalue },
      };
      setButtonLoaderApprove(true);
      const response = await postMethod(data);
      setButtonLoaderApprove(false);
      if (response.status) {
        toast.success(response.message);
        setNextstep(false);
        getUserDetails(currentPage);
      } else {
        // toast.error("Something Went Wrong. Please Try Again later");
        setNextstep(false);
      }
    } catch (error) {}
  };

  const freezeStatus = async (value, secondvalue) => {
    try {
      const data = {
        apiUrl: apiService.changefreezedispute,
        payload: { userId1: value, userId2: secondvalue },
      };
      setButtonLoaderReject(true);
      const response = await postMethod(data);
      setButtonLoaderReject(false);
      if (response.status) {
        toast.success(response.message);
        setNextstep(false);
        getUserDetails(currentPage);
      } else {
        // toast.error("Something Went Wrong. Please Try Again later");
        setNextstep(false);
      }
    } catch (error) {}
  };

  const cancelOrder = async (value) => {
    try {
      const data = {
        apiUrl: apiService.cancel_p2pOrder,
        payload: { orderId: value },
      };
      setLoaderReject(true);
      const response = await postMethod(data);
      setLoaderReject(false);
      if (response.status) {
        toast.success(response.message);
        setNextstep(false);
        getUserDetails(currentPage);
      } else {
        // toast.error("Something Went Wrong. Please Try Again later");
        setNextstep(false);
      }
    } catch (error) {}
  };
const [realeseLoader,setRealeseLoader]=useState(false);

  const adminReleaseCrypto = async (value)=>{
    try{
      var obj={
      disputeId:value,
      buyerId:buyerId,
      sellerId:sellerId,
      }
    setRealeseLoader(true);
       const data = {
        apiUrl: apiService.adminReleaseCrypto,
        payload:obj,
      };
      const response = await postMethod(data);
      setRealeseLoader(false);
      if (response.status) {
        toast.success(response.Message);
        setNextstep(false)
      }else{
        toast.error(response.Message);
      }
    }catch(error){

    }
  }
  const confirmOrder = async (value) => {
    try {
      const data = {
        apiUrl: apiService.confirm_p2pOrder,
        payload: { orderId: value },
      };
      setButtonLoaderReject(true);
      const response = await postMethod(data);
      setButtonLoaderReject(false);
      if (response.status) {
        toast.success(response.message);
        setNextstep(false);
        getUserDetails(currentPage);
      } else {
        // toast.error("Something Went Wrong. Please Try Again later");
        setNextstep(false);
      }
    } catch (error) {}
  };

  // dispute details

    const initialFormValue = {
    message: "",
    file: "",
    type: "",
    orderId: "",
    p2porderId: "",
  };
 const [formValue, setFormValue, formValueref] = useState(initialFormValue);
  
  const { message, file, type, orderId, p2porderId } = formValue;
  const [chatTabBtn, setChatTabBtn,chatTabBtnref] = useState("buyer");

  const handleChatTabClick = (tab) => {
    setChatTabBtn(tab);
    getAdminChat();
    setFormValue(prev => ({
    ...prev,
    message: "",
    file: "",
    type: "",
    orderId: "",
    p2porderId: "",
}));
  };
  
  // image selection ==> chat
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitChat = async ()=>{
    console.log("-------");
    const activeUser = chatTabBtn =="buyer"?buyerId:sellerId
      formValue.orderId = userDisputeref.current.orderId;
      formValue.p2porderId = userDisputeref.current.p2p_orderId;
      formValue.type ="admin"
    console.log(activeUser,"activeUser")
console.log(formValueref.current.message);
var obj={
     activeUserId:activeUser,
     values:formValueref.current,
     diputeId:userDisputeref.current._id
}
  var data = {
          apiUrl: apiService.submitChatAdmin,
          payload: obj,
        };
      const response = await postMethod(data);
if(response.status){
    toast.success(response.message);
  getAdminChat();
}else{
  toast.error(response.message);
}
        console.log(response,"submitChatAdmin")
  }
 
  const handleChange = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    const santisedValue = value.replace(/^\s+/, "");
    let formData = { ...formValue, ...{ [name]: santisedValue } };
    setFormValue(formData);
       if (e.key === "Enter") {
            submitChat(); 
          }
  };

  
  return (
    <div>
      {loader == true ? (
        <div className="loadercss">
          <ScaleLoader
         height={50} width={5}
            color="#ffc630"
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
              {Nextstep == false ? (
                <div className="px-4 transaction_padding_top">
                  <div className="px-2 my-4 transaction_padding_top tops">
                    <div className="headerss">
                      <span className="dash-head">P2P Disputes</span>
                      <div>
                        <input
                          className="filters"
                          placeholder="Enter OrderId to filter"
                          value={filterKeyword}
                          onChange={handleFilterChange}
                        />
                      </div>
                    </div>
                    <div class="table-responsive my-5  trans-table ">
                      <table className="w_100">
                        <thead className="trans-head">
                          <tr>
                            <th>S.No</th>
                            <th>Username</th>
                            <th>OrderId</th>
                            <th>Type</th>
                            <th>Query</th>
                            <th>Details</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Usersdataref.current.length > 0 ? (
                            Usersdataref.current.map((item, i) => (
                              <tr key={item._id}>
                                <td>
                                  <span className="plus_14_ff">{i + 1}</span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {item.username}
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {item.orderId}
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {item.type}
                                  </span>
                                </td>
                                <td>
                                  <label className="plus_14_ff width_scroll">
                                    {item.query}
                                  </label>
                                </td>
                                <td>
                                  <label className="plus_14_ff">
                                    view
                                    <i
                                      class="fa-regular fa-pen-to-square ml-2 cursor-pointer"
                                      onClick={() => getdisputeDetail(item._id)}
                                    ></i>
                                  </label>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {Moment(item.createdAt).format("lll")}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7}>
                                <div className="empty_data my-4">
                                  <div className="plus_14_ff">
                                    No Records Found
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                          {Usersdataref.current.length > 0 ? (
                            <tr className="text-center">
                              <td colSpan="7">
                                <div className="paginationcss">
                                  <ReactPaginate
                                    previousLabel={"<"}
                                    nextLabel={">"}
                                    breakLabel={"..."}
                                    pageCount={totalPages}
                                    marginPagesDisplayed={2}
                                    pageRangeDisplayed={5}
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
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 transaction_padding_top">
                  <div className="px-2 my-4 transaction_padding_top tops">
                    <div className="headerss">
                      <span className="dash-head">Dispute Details</span>
                      <button onClick={() => setNextstep(false)}>Back</button>
                    </div>
                    {userDisputeref.current.resolveStatus == 1 || userDisputeref.current.resolveStatus == 2?
                     <div className="row my-5 mx-0 p2p_dispute_row">
                      <div className="col-xl-12 p2p_dis_lft_col">
                        <div className="currencyinput p2p_dis_lft">
                          <div className="form-group p2p_dis_flx">
                            <label className=" col-form-label form-control-label">
                              Dispute Email
                            </label>
                            <div className=" text-right">
                              <span className="col-form-label form-control-label">
                                {userDisputeOrderref.current.email}
                              </span>
                            </div>
                          </div>
                          <div className="form-group p2p_dis_flx">
                            <label className=" col-form-label form-control-label">
                              Dispute OrderId
                            </label>
                            <div className=" text-right">
                              <span className="col-form-label form-control-label">
                                {userDisputeOrderref.current.orderId}
                              </span>
                            </div>
                          </div>
                          <div className="form-group p2p_dis_flx">
                            <label className=" col-form-label form-control-label">
                              Dispute Date
                            </label>
                            <div className=" text-right">
                              <span className="col-form-label form-control-label">
                                {Moment(
                                  userDisputeOrderref.current.createdAt
                                ).format("lll")}
                                {/* {userDisputeOrderref.current.createdAt} */}
                              </span>
                            </div>
                          </div>
                          <div className="form-group p2p_dis_flx">
                            <label className=" col-form-label form-control-label">
                              Query
                            </label>
                            <div className=" text-right">
                              <span className="col-form-label form-control-label">
                                {userDisputeref.current.query}
                                {/* {userDisputeOrderref.current.createdAt} */}
                              </span>
                            </div>
                          </div>
                          <div className="form-group p2p_dis_flx">
                            <label className=" col-form-label form-control-label">
                              Attachment
                            </label>
                            {userDisputeref.current.attachment == "" ? (
                              <div className=" text-right">
                                <span className="col-form-label form-control-label">
                                  No Attachments
                                  {/* {userDisputeOrderref.current.createdAt} */}
                                </span>
                              </div>
                            ) : (
                              <div className="col-lg-6 text-center">
                                <img
                                  src={userDisputeref.current.attachment}
                                  className="imagebox"
                                  width="100%"
                                />
                                <Link
                                  to={userDisputeref.current.attachment}
                                  className="kycbtn"
                                  target="_blank"
                                >
                                  View
                                </Link>
                              </div>
                            )}
                          </div>
                          </div>
                          </div>
                          </div>
                    : 
                     <div className="row my-5 mx-0 p2p_dispute_row">
                      <div className="col-xl-5 p2p_dis_lft_col">
                        <div className="currencyinput p2p_dis_lft">
                          <div className="form-group p2p_dis_flx">
                            <label className=" col-form-label form-control-label">
                              Dispute Email
                            </label>
                            <div className=" text-right">
                              <span className="col-form-label form-control-label">
                                {userDisputeOrderref.current.email}
                              </span>
                            </div>
                          </div>
                          <div className="form-group p2p_dis_flx">
                            <label className=" col-form-label form-control-label">
                              Dispute OrderId
                            </label>
                            <div className=" text-right">
                              <span className="col-form-label form-control-label">
                                {userDisputeOrderref.current.orderId}
                              </span>
                            </div>
                          </div>
                          <div className="form-group p2p_dis_flx">
                            <label className=" col-form-label form-control-label">
                              Dispute Date
                            </label>
                            <div className=" text-right">
                              <span className="col-form-label form-control-label">
                                {Moment(
                                  userDisputeOrderref.current.createdAt
                                ).format("lll")}
                                {/* {userDisputeOrderref.current.createdAt} */}
                              </span>
                            </div>
                          </div>
                          <div className="form-group p2p_dis_flx">
                            <label className=" col-form-label form-control-label">
                              Query
                            </label>
                            <div className=" text-right">
                              <span className="col-form-label form-control-label">
                                {userDisputeref.current.query}
                                {/* {userDisputeOrderref.current.createdAt} */}
                              </span>
                            </div>
                          </div>
                          <div className="form-group p2p_dis_flx">
                            <label className=" col-form-label form-control-label">
                              Attachment
                            </label>
                            {userDisputeref.current.attachment == "" ? (
                              <div className=" text-right">
                                <span className="col-form-label form-control-label">
                                  No Attachments
                                  {/* {userDisputeOrderref.current.createdAt} */}
                                </span>
                              </div>
                            ) : (
                              <div className="col-lg-6 text-center">
                                <img
                                  src={userDisputeref.current.attachment}
                                  className="imagebox"
                                  width="100%"
                                />
                                <Link
                                  to={userDisputeref.current.attachment}
                                  className="kycbtn"
                                  target="_blank"
                                >
                                  View
                                </Link>
                              </div>
                            )}
                          </div>
                          <div className="dis_lft_btn_wrap">
                            <div className="">
                              {p2pconfirmOrderref.current.status == 2 || p2pconfirmOrderref.current.status == 3? "":
                              buttonFreeze == true ? (
                                buttonLoaderApprove == false ? (
                                  <button
                                    className="diabledbutton2 approve_btn"
                                    onClick={() =>
                                      activeStatus(
                                        userDisputeref.current.userId,
                                        userDisputeOrderref.current.userId
                                      )
                                    }
                                  >
                                    Activate User Account
                                  </button>
                                ) : (
                                  <button> Loading ...</button>
                                )
                              ) : (
                                <button
                                  disabled
                                  className="diabledbutton approve_btn"
                                >
                                  {" "}
                                  Activate User Account
                                </button>
                              )}
                              {/* {p2pconfirmOrderref.current.status != 0 && p2pconfirmOrderref.current.status != 3 ? (
                            buttonLoaderApprove == false ? (
                              <button
                                onClick={() =>
                                  confirmOrder(
                                    p2pconfirmOrderref.current.orderId
                                  )
                                }
                              >
                              Release Crypto
                              </button>
                            ) : (
                              <button> Loading ...</button>
                            )
                          ) : ("")} */}
                            </div>
                            <div className="">
                              {/* {buttonLoaderReject == false ? (
                              <button
                                onClick={() =>
                                  freezeStatus(
                                    userDisputeref.current.userId,
                                    userDisputeOrderref.current.userId
                                  )
                                }
                              >
                                Freeze
                              </button>
                            ) : (
                              <button> Loading ...</button>
                            )} */}
                              {p2pconfirmOrderref.current.status != 3 ? (
                                loaderReject == false ? (
                                  <button
                                    onClick={() =>
                                      cancelOrder(
                                        p2pconfirmOrderref.current.orderId
                                      )
                                    }
                                    className="dispute_rej_btn"
                                  >
                                    Cancel Order
                                  </button>
                                ) : (
                                  <button className="dispute_rej_btn">
                                    {" "}
                                    Loading ...
                                  </button>
                                )
                              ) : (
                                ""
                              )}
                            </div>
                            <div className="">
                              {p2pconfirmOrderref.current.status == 2 || p2pconfirmOrderref.current.status == 3? "":
                              buttonFreeze == true ? (
                                <button
                                  disabled
                                  className="diabledbutton dispute_rej_btn"
                                >
                                  Freeze User Accounts
                                </button>
                              ) : buttonLoaderReject == false ? (
                                <button
                                  className="diabledbutton2 dispute_rej_btn"
                                  onClick={() =>
                                    freezeStatus(
                                      userDisputeref.current.userId,
                                      userDisputeOrderref.current.userId
                                    )
                                  }
                                >
                                  Freeze User Accounts
                                </button>
                              ) : (
                                <button  className="diabledbutton dispute_rej_btn" > Loading ...</button>
                              )}
                            </div>
                              <div className="">
                              {/* {p2pconfirmOrderref.current.status == 1 ? "": */}
                                {realeseLoader == false ? (
                                  <button
                                    className="diabledbutton2 approve_btn"
                                    onClick={() =>
                                      adminReleaseCrypto(
                                          userDisputeref.current._id
                                      )
                                    }
                                  >
                                    Crypto Release
                                  </button>
                                ) : (
                                  <button> Loading ...</button>
                                )
                              }
                            </div>
                            <div className="">
                              {p2pconfirmOrderref.current.statsus != 3 ? (
                                resolveLoader == false ? (
                                  <button
                                    onClick={() =>
                                      resolved(
                                        userDisputeref.current._id
                                      )
                                    }
                                    className="dispute_rej_btn"
                                  >
                                    Resolve
                                  </button>
                                ) : (
                                  <button className="dispute_rej_btn">
                                    {" "}
                                    Loading ...
                                  </button>
                                )
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                           
                        </div>
                      </div>
                      <div className="col-xl-7 p2p_dis_rgt">
                        <div className="p2p_dis_tabs_wrap">
                          <button
                            onClick={() => handleChatTabClick("buyer")}
                            className={`p2p_dis_tab_btn ${
                              chatTabBtn === "buyer" ? "active" : ""
                            }`}
                          >
                            Chat With <span> Buyer</span>{" "}
                          </button>
                          <button
                            onClick={() => handleChatTabClick("seller")}
                            className={`ds_rgt_btn p2p_dis_tab_btn ${
                              chatTabBtn === "seller" ? "active" : ""
                            }`}
                          >
                            Chat With{" "} <span>Seller</span>{" "}
                          </button>
                        </div>
                        <div className="p2p_dis_chat">
                         
 {chatData.length>0 && chatData.map((item, i) => (
                          item.type !="admin"?
                          <div className="p2p_dis_receive_wrap">
                            <div className="p2p_dis_chat_person">
                              <img
                                src={require("../assets/chat-person.webp")}
                                alt="Chat-Icon"
                              />
                            </div>
                            <div className="dis_box_re_wrap">
                              <div className="dis_re_msg_box">
                                <span>
                                { item.user_msg}
                                </span>
                              </div>
                              <span>10:15 AM</span>
                            </div>
                          </div>
                          :
                          <div className="p2p_dis_send_wrap">
                            <div className="dis_box_send_wrap">
                              <div className="dis_send_msg_box">
                                <span>
                              {item.admin_msg}
                                </span>
                              </div>
                              <span>10:15 AM</span>
                            </div>

                            <div className="p2p_dis_chat_person">
                              <img
                                src={require("../assets/chat-person.webp")}
                                alt="Chat-Icon"
                              />
                            </div>
                          </div>))
              }
                          {/* <div className="p2p_dis_receive_wrap">
                            <div className="p2p_dis_chat_person">
                              <img
                                src={require("../images/chat-person.webp")}
                                alt="Chat-Icon"
                              />
                            </div>
                            <div className="dis_box_re_wrap">
                              <div className="dis_re_msg_box">
                                <span>
                                  Lorem ipsum dolor sit, amet consectetur
                                  adipisicing elit. Modi, odio natus? Beatae,
                                  hic magnam est quaerat facilis quam doloribus
                                  deleniti!
                                </span>
                              </div>
                              <span>10:15 AM</span>
                            </div>
                          </div>
                          <div className="p2p_dis_send_wrap">
                            <div className="dis_box_send_wrap">
                              <div className="dis_send_msg_box">
                                <span>
                                  Lorem ipsum dolor sit, amet consectetur
                                  adipisicing elit. Modi, odio natus? Beatae,
                                  hic magnam est quaerat facilis quam doloribus
                                  deleniti!
                                </span>
                              </div>
                              <span>10:15 AM</span>
                            </div>

                            <div className="p2p_dis_chat_person">
                              <img
                                src={require("../images/chat-person.webp")}
                                alt="Chat-Icon"
                              />
                            </div>
                          </div>
                          <div className="p2p_dis_receive_wrap">
                            <div className="p2p_dis_chat_person">
                              <img
                                src={require("../images/chat-person.webp")}
                                alt="Chat-Icon"
                              />
                            </div>
                            <div className="dis_box_re_wrap">
                              <div className="dis_re_msg_box">
                                <span>
                                  Lorem ipsum dolor sit, amet consectetur
                                  adipisicing elit. Modi, odio natus? Beatae,
                                  hic magnam est quaerat facilis quam doloribus
                                  deleniti!
                                </span>
                              </div>
                              <span>10:15 AM</span>
                            </div>
                          </div> */}
                        </div>

                        {/* <div className="p2p_dis_chat_btn_wrap">
                          <label
                            htmlFor="image_upload"
                            className="p2p_dis_slct_img"
                          >
                            <AddPhotoAlternateIcon />
                            <input
                              type="file"
                              id="image_upload"
                              className="img_upld_icon"
                            />
                          </label>
                          <span className="p2p_dis_chat_input">
                            <input type="text" placeholder="Your Message" />
                          </span>
                          <span className="p2p_dis_send_icon">
                            <SendIcon />
                          </span>
                        </div> */}

                        <div className="p2p_dis_chat_btn_wrap">
                          <div className="p2p_dis_slct_img_wrap">
                            {!selectedImage ? (
                              <label
                                htmlFor="image_upload"
                                className="p2p_dis_slct_img"
                              >
                                <AddPhotoAlternateIcon />
                                <input
                                  type="file"
                                  id="image_upload"
                                  className="img_upld_icon"
                                  accept="image/*"
                                  ref={fileInputRef}
                                  onChange={handleImageChange}
                                  style={{ display: "none" }}
                                />
                              </label>
                            ) : (
                              <div className="preview_img_wrap">
                                <img
                                  src={selectedImage}
                                  alt="preview"
                                  className="preview_img_icon"
                                />
                                <span
                                  className="remove_img_btn"
                                  onClick={handleRemoveImage}
                                >
                                  <CloseIcon fontSize="small" />
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="p2p_dis_chat_input">
                          <textArea
                          type="text"
                          placeholder="Start chat here"
                          name="message"
                          value={formValueref.current.message}
                          maxLength ="250"
                          onChange={handleChange}
                          className="start-input w-100"
                          // onKeyDown={(e) => {
                          //   if (e.key === "Enter") {
                          //     submitChat(); 
                          //   }
                          // }}
                           onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault(); // Prevent the default action (new line)
                                submitChat();
                              }
                            }}
                        />
                          </span>
                          <span className="p2p_dis_send_icon" onClick={submitChat}>
                            <SendIcon />
                          </span>
                        </div>
                      </div>
                    </div>
                    }
                  
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default P2Pdispute;
