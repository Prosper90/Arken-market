import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import useState from "react-usestateref";
import { toast } from "react-toastify";
import Sidebar_2 from "./Nav_bar";
import { postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { ScaleLoader } from "react-spinners";

function Launchpad() {
  const [add, setAdd] = useState(false);
  const [stakingpage, setstakingpage] = useState(false);
  const [otcpage, setotcpage] = useState(false);
  const [stakeflex, setstakeflex] = useState(false);
  const [Currencydata, setCurrencydata] = useState([]);
  const [loader, setLoader] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [buttonLoaderStake, setButtonLoaderStake] = useState(false);
  const [showOtcModal, setShowOtcModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // to control modal visibility

  const [filterKeyword, setFilterKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [pagenumber, setpagenumber] = useState(0);

  const setpage = (value) => {
    setpagenumber(value);
    console.log(value);
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };
  useEffect(() => {
    getUserDetails(currentPage);
  }, [currentPage, filterKeyword]);

  const getUserDetails = async (page = 1) => {
    const data = {
      apiUrl: apiService.getAllLaunchTokensList,
      payload: { page, limit: 5, keyword: filterKeyword }, // Include the keyword here
    };
    const response = await postMethod(data);
    if (response.status) {
      setFilteredUsers(response.data);
      setTotalPages(response.totalPages);
    } else {
      setCurrencydata([]);
    }
  };

  const handleFilterChange = (e) => {
    setFilterKeyword(e.target.value);
    getUserDetails();
  };

  const pageback = () => {
    console.log(pagenumber, "pagenumber");
    setpagenumber(pagenumber - 1);
    console.log(pagenumber, "pagenumber");
    if (pagenumber == 1) {
      setAdd(false);
    }
  };
  const [imageName, setimageName] = useState("");

  const [choosablelaunchid, setchoosablelaunchid] = useState();
  const [approveButtonLoader, setapproveButtonLoader] = useState(false);
  const [rejectButtonLoader, setrejectButtonLoader] = useState(false);
  const [onedata, setdata] = useState("");

  const getEditDetails = async (data) => {
    console.log(data, "data");
    var obj = {
      _id: data,
    };
    setchoosablelaunchid(data);
    var datas = {
      apiUrl: apiService.viewOneToken,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    setLoader(false);
    setpage(1);
    if (response.status) {
      setAdd(true);
      setdata(response.data);
    } else {
    }
  };

  const approveToken = async () => {
    var obj = {
      _id: choosablelaunchid,
      status: 1,
    };
    var datas = {
      apiUrl: apiService.approveToken,
      payload: obj,
    };
    setapproveButtonLoader(true);
    var response = await postMethod(datas);
    setapproveButtonLoader(false);
    if (response.status) {
      toast.success(response.message);
      setAdd(false);
      getUserDetails();
    } else {
      toast.error(response.message);
    }
  };

  const [reason, setReason] = useState("");
  const [rejecttabstatus, setrejecttabstatus] = useState(false);
  const [reasonError, setreasonError] = useState(false);

  const rejecttab = async () => {
    setpagenumber(7);
  };

  const handleChange = (e) => {
    if (e.target.value == "") {
      setreasonError("Reason is required");
    } else if (e.target.value.length > 250) {
      setreasonError("Reason should not exceed 250 characters");
    } else {
      setreasonError("");
    }
    setReason(e.target.value);
  };
  const rejectToken = async () => {
    if (reason) {
      var obj = {
        _id: choosablelaunchid,
        status: 2,
        reason: reason,
      };
      var datas = {
        apiUrl: apiService.rejectToken,
        payload: obj,
      };
      setrejectButtonLoader(true);
      var response = await postMethod(datas);
      setrejectButtonLoader(false);
      if (response.status) {
        toast.success(response.message);
        setAdd(false);
        getUserDetails();
      } else {
        toast.error(response.message);
      }
    }
  };

  const deletecurrency = async (data) => {
    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.deleteToken,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    setLoader(false);
    console.log(response, "=-=-=-=response=-=-=");

    if (response.status) {
      toast.success(response.Message);
      getUserDetails();
    } else {
      toast.error(response.Message);
    }
  };

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
                    {pagenumber == 0 ? (
                      <span className="dash-head">
                        Launchpad Token Settings
                      </span>
                    ) : pagenumber == 1 ? (
                      <span className="dash-head">Project Details</span>
                    ) : pagenumber == 2 ? (
                      <span className="dash-head">Token Sale Details</span>
                    ) : pagenumber == 3 ? (
                      <span className="dash-head">Team Information</span>
                    ) : pagenumber == 4 ? (
                      <span className="dash-head">Community & Marketing</span>
                    ) : pagenumber == 5 ? (
                      <span className="dash-head">Security & Compliance</span>
                    ) : pagenumber == 6 ? (
                      <span className="dash-head">
                        Referral & Social Influence
                      </span>
                    ) : (
                      <span className="dash-head">
                        Launchpad Token Settings
                      </span>
                    )}
                    {pagenumber == 0 ? (
                      <div className="top_filter">
                        <input
                          className="filters"
                          placeholder="Enter Currencyname to filter"
                          value={filterKeyword}
                          onChange={handleFilterChange}
                        />
                      </div>
                    ) : (
                      <div className="top_filter">
                        <button
                          type="submit"
                          className="d-block w_100"
                          onClick={pageback}
                        >
                          Back
                        </button>
                      </div>
                    )}
                  </div>

                  {add == false ? (
                    <div className="table-responsive my-5 trans-table">
                      <table className="w_100">
                        <thead className="trans-head">
                          <tr>
                            <th>S.No</th>
                            <th>Token Launcher </th>
                            <th>Token Logo </th>
                            <th>Project Name</th>
                            <th>Token Symbol</th>
                            <th>Status</th>
                            <th>View</th>
                            {/* <th>Delete</th> */}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers?.length > 0 ? (
                            filteredUsers?.map((item, i) => (
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
                                    <img
                                      width="35px"
                                      src={item.TokenLogo}
                                      alt="Currency"
                                    />
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {item.projectName}
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {item.TokenSymbol}
                                  </span>
                                </td>
                                <td>
                                  {item.status == 0 ? (
                                    <span className="plus_14_ff text-warning">
                                      Un Approved
                                    </span>
                                  ) : item.status == 1 ? (
                                    <span className="plus_14_ff text-success">
                                      Approved
                                    </span>
                                  ) : item.status == 2 ? (
                                    <span className="plus_14_ff text-danger">
                                      Rejected
                                    </span>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    <i
                                      class="fa-regular fa-eye reg_eye"
                                      onClick={() => getEditDetails(item._id)}
                                    ></i>
                                  </span>
                                </td>
                                {/* <td>
                                  <span className="plus_14_ff">
                                    <i
                                      className="fa-regular fa-trash-can text-danger cursor-pointer"
                                      onClick={() => deletecurrency(item._id)}
                                    ></i>
                                  </span>
                                </td> */}
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

                          {filteredUsers?.length > 0 ? (
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
                  ) : pagenumber == 1 ? (
                    <div className="currencyinput mt-5">
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Project Name
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="projectName"
                            placeholder="Project Name"
                            className="form-control"
                            value={onedata.projectName}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Project Website
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="url"
                            name="projectWebsite"
                            placeholder="Project Website"
                            className="form-control"
                            value={onedata.projectWebsite}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Project Description
                        </label>
                        <div className="col-lg-6">
                          <textarea
                            name="projectDescription"
                            placeholder="Project Description"
                            className="form-control"
                            value={onedata.projectDescription}
                          ></textarea>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Whitepaper Link
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="url"
                            name="whitepaperLink"
                            placeholder="Whitepaper Link"
                            className="form-control"
                            value={onedata.whitepaperLink}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Blockchain Network (BSC, Ethereum, Polygon, etc.)
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="blockchainNetwork"
                            placeholder="Blockchain Network"
                            className="form-control"
                            value={onedata.blockchainNetwork}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Token Contract Address (if already deployed)
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="tokenContractAddress"
                            placeholder="Token Contract Address"
                            className="form-control"
                            value={onedata.TokenContractAddress}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Total Token Supply
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="number"
                            name="totalTokenSupply"
                            placeholder="Total Token Supply"
                            className="form-control"
                            value={onedata.TotalTokenSupply}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Token Symbol
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="tokenSymbol"
                            placeholder="Token Symbol"
                            className="form-control"
                            value={onedata.TokenSymbol}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Decimals
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="number"
                            name="decimals"
                            placeholder="Decimals"
                            className="form-control"
                            value={onedata.TokenDecimals}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Token Logo
                        </label>
                        <div className="col-lg-6">
                          <img
                            width="35px"
                            src={onedata.TokenLogo}
                            alt="Token Logo "
                          />
                        </div>
                      </div>

                      <div className="form-group row justify-content-end">
                        <div className="col-lg-4">
                          <button
                            type="submit"
                            className="d-block w_100"
                            onClick={() => setpage(2)}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : pagenumber == 2 ? (
                    <div className="currencyinput mt-5">
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Token Sale Type (Private/Public)
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="TokenSaleType"
                            placeholder="Token SaleType"
                            className="form-control"
                            value={onedata.TokenSaleType}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Soft Cap
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="number"
                            name="softCap"
                            placeholder="Soft Cap"
                            className="form-control"
                            value={onedata.SoftCap}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Hard Cap
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="number"
                            name="hardCap"
                            placeholder="Hard Cap"
                            value={onedata.HardCap}
                            className="form-control"
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Presale Start Date
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="date"
                            name="presaleStartDate"
                            className="form-control"
                            value={onedata.PresaleStart}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Presale End Date
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="date"
                            name="presaleEndDate"
                            className="form-control"
                            value={onedata.EndDate}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Listing Price
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="listingPrice"
                            placeholder="Listing Price"
                            className="form-control"
                            value={onedata.ListingPrice}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Initial Market Cap
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="initialMarketCap"
                            placeholder="Initial Market Cap"
                            className="form-control"
                            value={onedata.InitialMarketCap}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Accepted Cryptos for Sale
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="acceptedCryptos"
                            placeholder="e.g., BNB, USDT, ETH"
                            className="form-control"
                            value={onedata.AcceptedCryptosforSale}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Vesting Schedule
                        </label>
                        <div className="col-lg-6">
                          <textarea
                            name="vestingSchedule"
                            placeholder="Describe the vesting schedule, if any"
                            className="form-control"
                            value={onedata.vestingschedule}
                          ></textarea>
                        </div>
                      </div>

                      <div className="form-group row justify-content-end">
                        <div className="col-lg-4">
                          <button
                            type="submit"
                            className="d-block w_100 "
                            onClick={() => setpage(3)}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : pagenumber == 3 ? (
                    <div className="currencyinput mt-5">
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Project Owner Name
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="projectOwnerName"
                            placeholder="Project Owner Name"
                            className="form-control"
                            value={onedata.ProjectOwnerName}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Email Address
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="email"
                            name="emailAddress"
                            placeholder="Email Address"
                            className="form-control"
                            value={onedata.EmailAddress}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Telegram Username
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="telegramUsername"
                            placeholder="Telegram Username"
                            className="form-control"
                            value={onedata.TelegramUsername}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          LinkedIn Profile
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="url"
                            name="linkedInProfile"
                            placeholder="LinkedIn Profile URL"
                            className="form-control"
                            value={onedata.LinkedInProfile}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Company Name (if applicable)
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="companyName"
                            placeholder="Company Name (if applicable)"
                            className="form-control"
                            value={onedata.CompanyName}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Country of Registration
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="countryOfRegistration"
                            placeholder="Country of Registration"
                            className="form-control"
                            value={onedata.CountryofRegistration}
                          />
                        </div>
                      </div>

                      <div className="form-group row justify-content-end">
                        <div className="col-lg-4">
                          <button
                            type="submit"
                            className="d-block w_100"
                            onClick={() => setpage(4)}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : pagenumber == 4 ? (
                    <div className="currencyinput mt-5">
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Twitter (X) Link
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="url"
                            name="twitterLink"
                            placeholder="Twitter (X) Link"
                            className="form-control"
                            value={onedata.TwitterLink}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Telegram Community Link
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="url"
                            name="telegramCommunityLink"
                            placeholder="Telegram Community Link"
                            className="form-control"
                            value={onedata.TelegramCommunityLink}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Discord Server Link
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="url"
                            name="discordServerLink"
                            placeholder="Discord Server Link"
                            className="form-control"
                            value={onedata.DiscordServerLink}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          YouTube Channel (if any)
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="url"
                            name="youtubeChannel"
                            placeholder="YouTube Channel (if any)"
                            className="form-control"
                            value={onedata.YouTubeChannel}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Medium/Blog Link
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="url"
                            name="mediumBlogLink"
                            placeholder="Medium/Blog Link"
                            className="form-control"
                            value={onedata.BlogLink}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Marketing Strategy Summary
                        </label>
                        <div className="col-lg-6">
                          <textarea
                            name="marketingStrategySummary"
                            placeholder="Briefly describe the marketing strategy"
                            className="form-control"
                            value={onedata.MarketingStrategySummary}
                          ></textarea>
                        </div>
                      </div>
                      <div className="form-group row justify-content-end">
                        <div className="col-lg-4">
                          <button
                            type="submit"
                            className="d-block w_100"
                            onClick={() => setpage(5)}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : pagenumber == 5 ? (
                    <div className="currencyinput mt-5">
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          KYC Verification (Yes/No)
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="KYCVerification"
                            placeholder="KYC Verification"
                            className="form-control"
                            value={onedata.KYCVerification}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Smart Contract Audit Provider
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="smartContractAuditProvider"
                            placeholder="Smart Contract Audit Provider"
                            className="form-control"
                            value={onedata.SmartContractAuditProvider}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Audit Report (if available)
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="AuditReport"
                            placeholder="Audit report"
                            className="form-control"
                            value={onedata.AuditReport}
                          />
                        </div>
                      </div>

                      <div className="form-group row justify-content-end">
                        <div className="col-lg-4">
                          <button
                            type="submit"
                            className="d-block w_100"
                            onClick={() => setpage(6)}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : pagenumber == 6 ? (
                    <div className="currencyinput mt-5">
                      {/* <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Audit Report (if available)
                        </label>
                        <div className="col-lg-6">
                          <imag src={onedata.SmartContractAuditProvider}
                          />
                        </div>
                      </div> */}

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          KYC Verification
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="smartContractAuditProvider"
                            placeholder="Smart Contract Audit Provider"
                            className="form-control"
                            value={onedata.KYCVerification}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Smart Contract Audit Provider
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="smartContractAuditProvider"
                            placeholder="Smart Contract Audit Provider"
                            className="form-control"
                            value={onedata.SmartContractAuditProvider}
                          />
                        </div>
                      </div>
                      {onedata.status == 0 ? (
                        <div className="form-group row justify-content-center">
                          {approveButtonLoader == true ? (
                            <div className="col-lg-4">
                              <button
                                type="submit"
                                className="d-block w_100 button2"
                              >
                                Loading...
                              </button>
                            </div>
                          ) : (
                            <div className="col-lg-4">
                              <button
                                type="submit"
                                className="d-block w_100 button2"
                                onClick={approveToken}
                              >
                                Approve
                              </button>
                            </div>
                          )}

                          {rejectButtonLoader == true ? (
                            <div className="col-lg-4">
                              <button
                                type="submit"
                                className="d-block w_100 button1"
                              >
                                loading...
                              </button>
                            </div>
                          ) : (
                            <div className="col-lg-4">
                              <button
                                type="submit"
                                className="d-block w_100 button1"
                                onClick={rejecttab}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : pagenumber == 7 ? (
                    <div className="currencyinput mt-5">
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Reject Reason
                        </label>
                        <div className="col-lg-6">
                          <textarea
                            type="text"
                            name="rejectReason"
                            placeholder="Reject Reason"
                            className="form-control"
                            onChange={handleChange}
                            maxLength="250"
                          />
                          {reasonError ? (
                            <p className="text-red">{reasonError}</p>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                      <div className="form-group row justify-content-end">
                        {rejectButtonLoader == true ? (
                          <div className="col-lg-4">
                            <button
                              type="submit"
                              className="d-block w_100 button1"
                            >
                              loading...
                            </button>
                          </div>
                        ) : (
                          <div className="col-lg-4">
                            <button
                              type="submit"
                              className="d-block w_100 button1"
                              onClick={rejectToken}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    ""
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

export default Launchpad;
