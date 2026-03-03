import React, { useEffect } from "react";
import useState from "react-usestateref";
import { toast } from "react-toastify";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import Sidebar_2 from "./Nav_bar";
import { ScaleLoader } from "react-spinners";
import Sidebar from "./Sidebar";
import ReactPaginate from "react-paginate";

function Stakemanage() {
  const [formData, setFormData, formDataref] = useState({
    Planamount: "",
    Plandescription: "",
    Planmonths: "",
    Tokenprice: "",
    Rewardpercentage: "",
    Monthreward: "",
    Dailyreward: "",
    Totalreward: "",
  });

  const [buttonLoader, setButtonLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [add, setAdd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    console.log(Object.keys(errors).length);
    if (Object.keys(errors).length > 0) {
      setvalidationnErr(errors);
      console.log("------=======--");
      return;
    }
    setvalidationnErr({});
    var datas = {
      apiUrl: apiService.stakeAdd,
      payload: formData,
    };
    setButtonLoader(true);
    var response = await postMethod(datas);
    setButtonLoader(false);
    if (response.status) {
      toast.success(response.Message);
      setAdd(false);
      getstakeDetails();
      setFormData((prevData) => ({
        ...prevData,
        Monthreward: "",
        Dailyreward: "",
        Totalreward: "",
        Planamount: "",
        Plandescription: "",
        Planmonths: "",
        Tokenprice: "",
        Rewardpercentage: "",
      }));
    } else {
      toast.error(response.Message);
    }
  };

  const [errors, setErrors] = useState({});
  const [validationnErr, setvalidationnErr] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    console.log(e.target.name);
    if (e.target.name == "Rewardpercentage") {
      var getrewardpermoth =
        (formDataref.current.Planamount * e.target.value) / 100;
      var getrewardDaily = getrewardpermoth / 30;
      var getrewardtotal = getrewardpermoth * formDataref.current.Planmonths;
      setFormData((prevData) => ({
        ...prevData,
        Monthreward: getrewardpermoth,
        Totalreward: getrewardtotal,
        Dailyreward: getrewardDaily,
      }));
    }
    const errors = validateForm(formDataref.current);
    setvalidationnErr(errors);
  };

  const validateForm = (formData) => {
    const newErrors = {};

    if (!formData.Planamount) {
      newErrors.Planamount = "Plan amount is required";
    } else if (!formData.Plandescription) {
      newErrors.Plandescription = "Plan description is required";
    } else if (!formData.Planmonths) {
      newErrors.Planmonths = "Plan months is required";
    } else if (!formData.Tokenprice) {
      newErrors.Tokenprice = "Token price is required";
    }
    setErrors(newErrors);
    return newErrors;
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };
  const [filterKeyword, setFilterKeyword] = useState("");

  const handleFilterChange = (e) => {
    setFilterKeyword(e.target.value);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [stakeData, setstakeData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [editStatus, setEditStatus] = useState(false);

  const [formData2, setFormData2, formData2ref] = useState({
    planAmount: "",
    planDescription: "",
    Tokenprice: "",
    planCategoryData: [
      {
        id: 1,
        categoryMonth: "",
        planCategoryTxt: "",
        minStake: "",
        perMonth: "",
        total: "",
      },
    ],
  });

  useEffect(() => {
    getstakeDetails(currentPage);
  }, [currentPage, filterKeyword]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };

  const getstakeDetails = async (page = 1) => {
    const data = {
      apiUrl: apiService.getStake,
      payload: { page, limit: 5, keyword: filterKeyword }, // Include the keyword here
    };
    const response = await postMethod(data);
    if (response.status) {
      console.log(response.data);
      setstakeData(response.data);
      setTotalPages(response.totalPages);
    } else {
      setstakeData([]);
    }
  };

  const editStakedata = (data) => {
    try {
      setAdd(true);
      setEditStatus(true);
      setFormData2({
        ...formData2ref.current,
        planAmount: data.planAmount,
        planDescription: data.planDescription,
        Tokenprice: data.Tokenprice,
        planCategoryData: data.planCategoryData,
        _id: data._id,
      });
      console.log(formData2ref.current, "formData2ref.current");
    } catch (err) {
      console.log(err, "wrrr");
    }
  };

  const stakeUpdate = async (e) => {
    e.preventDefault();
    setEditStatus(false);
    if (validate()) {
      var datas = {
        apiUrl: apiService.stakeUpdate,
        payload: formData2ref.current,
      };
      setButtonLoader(true);
      var response = await postMethod(datas);
      setButtonLoader(false);
      if (response.status) {
        toast.success(response.Message);
        setAdd(false);
        getstakeDetails();
        setFormData2((prevData) => ({
          ...prevData,
          planAmount: "",
          planDescription: "",
          Tokenprice: "",
          planCategoryData: [],
        }));
      } else {
        toast.error(response.Message);
      }
    }
  };

  const deleteStakedata = async (data) => {
    var obj = {
      _id: data,
    };
    var datas = {
      apiUrl: apiService.deleteStake,
      payload: obj,
    };
    setLoader(true);
    var response = await postMethod(datas);
    setLoader(false);
    console.log(response, "=-=-=-=response=-=-=");

    if (response.status) {
      toast.success(response.Message);
      getstakeDetails();
      setFormData2((prevData) => ({
        ...prevData,
        planAmount: "",
        planDescription: "",
        Tokenprice: "",
        planCategoryData: [],
      }));
    } else {
      toast.error(response.Message);
      setFormData2((prevData) => ({
        ...prevData,
        planAmount: "",
        planDescription: "",
        Tokenprice: "",
        planCategoryData: [],
      }));
    }
  };

  // Handle Input Change for Top-Level Fields
  const handleInputChange = (e) => {
    console.log(e, "0000");
    const { name, value } = e.target;
    setFormData2({ ...formData2ref.current, [name]: value });
    if (e.target.name == "planAmount") {
      setFormData2((prevData) => ({
        ...prevData,
        planCategoryData: [],
      }));
    }
    validate();
  };

  // Handle Input Change for Plan Categories
  const handleCategoryChange = (index, e) => {
    const { name, value } = e.target;

    // Create a shallow copy of planCategoryData
    const updatedCategories = [...formData2.planCategoryData];
    const updatedCategory = { ...updatedCategories[index], [name]: value };

    // If Rewardpercentage is changed, calculate Monthreward and Totalreward
    if (name === "Planmonths") {
      updatedCategory.Monthreward = "";
      updatedCategory.Totalreward = "";
      updatedCategory.Rewardpercentage = "";
      updatedCategory.Dailyreward = "";
    }
    if (name === "Rewardpercentage") {
      const planAmount = parseFloat(formData2.planAmount) || 0;
      const planMonths = parseFloat(updatedCategory.Planmonths) || 0;
      const rewardPercentage = parseFloat(value) || 0;
      updatedCategory.Monthreward = (planAmount * rewardPercentage) / 100;
      updatedCategory.Totalreward = updatedCategory.Monthreward * planMonths;
      updatedCategory.Dailyreward = updatedCategory.Monthreward / 30;
    }
    // Update the category in the array
    updatedCategories[index] = updatedCategory;

    // Update the formData2 state
    setFormData2({ ...formData2, planCategoryData: updatedCategories });
    validate();
  };

  const validate = () => {
    const newErrors = {};

    // Validate Plan Amount
    if (!formData2ref.current.planAmount) {
      newErrors.planAmount = "Plan amount is required.";
    } else if (isNaN(Number(formData2ref.current.planAmount))) {
      newErrors.planAmount = "Plan amount must be a valid number.";
    }

    // Validate Plan Description
    if (!formData2ref.current.planDescription) {
      newErrors.planDescription = "Plan description is required.";
    } else if (formData2ref.current.planDescription.length < 10) {
      newErrors.planDescription =
        "Plan description must be at least 10 characters.";
    }
    if (!formData2ref.current.Tokenprice) {
      newErrors.Tokenprice = "Token Price is required.";
    }
    // Validate Plan Categories
    formData2ref.current.planCategoryData.forEach((category, index) => {
      console.log("---");
      if (!category.Planmonths) {
        newErrors[`Planmonths_${index}`] = "Plan month is required.";
      }
      if (!category.Rewardpercentage) {
        newErrors[`Rewardpercentage_${index}`] =
          "Reward percentage text is required.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add a New Plan Category
  const addCategory = () => {
    const newCategory = {
      id: formData2ref.current.planCategoryData.length + 1,
      Planmonths: "",
      Rewardpercentage: "",
      Monthreward: "",
      Dailyreward: "",
      Totalreward: "",
    };
    setFormData2({
      ...formData2ref.current,
      planCategoryData: [...formData2ref.current.planCategoryData, newCategory],
    });
  };

  // Delete a Plan Category
  const deleteCategory = (index) => {
    const updatedCategories = formData2ref.current.planCategoryData.filter(
      (_, i) => i !== index
    );
    setFormData2({
      ...formData2ref.current,
      planCategoryData: updatedCategories,
    });
  };

  // Submit the Form
  const handleSubmit2 = async (e) => {
    console.log("Form data is valid:", formData2ref.current);
    if (validate()) {
      var datas = {
        apiUrl: apiService.stakeAdd,
        payload: formData2ref.current,
      };
      setButtonLoader(true);
      var response = await postMethod(datas);
      setButtonLoader(false);
      if (response.status) {
        toast.success(response.Message);
        setAdd(false);
        getstakeDetails();
        setFormData2((prevData) => ({
          ...prevData,
          planAmount: "",
          planDescription: "",
          Tokenprice: "",
          planCategoryData: [],
        }));
      } else {
        toast.error(response.Message);
        console.error("Form validation failed:", errors);
      }
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
                    <span className="dash-head">Staking Settings</span>
                    <div className="top_filter">
                      <input
                        className="filters"
                        placeholder="Enter plan amount to filter"
                        value={filterKeyword}
                        onChange={handleFilterChange}
                      />
                      <i
                        className="fa-solid fa-circle-plus adds cursor-pointer"
                        onClick={() => setAdd(true)}
                      ></i>
                    </div>
                  </div>
                  {add == false ? (
                    <div className="table-responsive my-5 trans-table">
                      <table className="w_100">
                        <thead className="trans-head">
                          <tr>
                            <th>S.No</th>
                            <th>Plan amount </th>
                            {/* <th>Plan months </th> */}
                            <th>Token price </th>
                            {/* <th>Reward percentage </th> */}
                            {/* <th>Month reward </th>
                            <th>Total reward </th> */}
                            <th>Action </th>
                            <th>Delete </th>
                          </tr>
                        </thead>
                        <tbody>
                          {stakeData?.length > 0 ? (
                            stakeData?.map((item, i) => (
                              <tr>
                                <td>
                                  <span className="plus_14_ff">{i + 1}</span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {item.planAmount} GPK
                                  </span>
                                </td>
                                {/* <td>
                                  <span className="plus_14_ff">
                                    {item.Planmonths} Months
                                  </span>
                                </td> */}
                                <td>
                                  <span className="plus_14_ff">
                                    {item.Tokenprice}
                                  </span>
                                </td>
                                {/* <td>
                                  <span className="plus_14_ff">
                                    {item.Rewardpercentage} %
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {item.Monthreward} GPK
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {item.Totalreward} GPK
                                  </span>
                                </td> */}
                                <td>
                                  <i
                                    className="fa-regular fa-pen-to-square cursor-pointer text-white"
                                    onClick={() => editStakedata(item)}
                                  ></i>
                                </td>
                                <td>
                                  <i
                                    className="fa-regular fa-trash-can text-danger cursor-pointer"
                                    onClick={() => deleteStakedata(item._id)}
                                  ></i>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={10}>
                                <div className="empty_data my-4">
                                  <div className="plus_14_ff">
                                    No Records Found
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                          {stakeData?.length > 0 ? (
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
                  ) : (
                    <div className="currencyinput mt-5">
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Plan amount
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            id="numberInput"
                            minLength={0}
                            name="planAmount"
                            value={formData2ref.current.planAmount}
                            placeholder="Plan amount"
                            onChange={handleInputChange}
                            className="form-control"
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(
                                /[^0-9.]/g,
                                ""
                              ); // Allow numbers and dot
                            }}
                          />
                          <div className="help-block">
                            {errors.planAmount && (
                              <div className="error">{errors.planAmount}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Plan description
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="planDescription"
                            value={formData2ref.current.planDescription}
                            placeholder="Plan Description"
                            onChange={handleInputChange}
                            className="form-control"
                          />
                          <div className="help-block">
                            {errors.planDescription && (
                              <div className="error">
                                {errors.planDescription}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Token Price
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            name="Tokenprice"
                            value={formData2ref.current.Tokenprice}
                            placeholder="Token Price"
                            onChange={handleInputChange}
                            className="form-control"
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(
                                /[^0-9.]/g,
                                ""
                              ); // Allow numbers and dot
                            }}
                            id="numberInput"
                          />
                          <div className="help-block">
                            {errors.Tokenprice && (
                              <div className="error">{errors.Tokenprice}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="form-group row delete_iconchange m-0 mb-2">
                        <button type="button" onClick={addCategory}>
                          Add Plan Category
                        </button>
                      </div>
                      {formData2ref?.current?.planCategoryData?.map(
                        (category, index) => (
                          <div
                            key={index}
                            style={{
                              border: "1px solid #ddd",
                              padding: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Plan Months
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="text"
                                  name="Planmonths"
                                  onInput={(e) => {
                                    e.target.value = e.target.value.replace(
                                      /[^0-9.]/g,
                                      ""
                                    ); // Allow numbers and dot
                                  }}
                                  id="numberInput"
                                  value={category.Planmonths}
                                  placeholder="Plan Months"
                                  onChange={(e) =>
                                    handleCategoryChange(index, e)
                                  }
                                  className="form-control"
                                />
                                <div className="help-block">
                                  {errors[`Planmonths_${index}`] && (
                                    <div className="error">
                                      {errors[`Planmonths_${index}`]}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Reward percentage %
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="text"
                                  name="Rewardpercentage"
                                  onInput={(e) => {
                                    e.target.value = e.target.value.replace(
                                      /[^0-9.]/g,
                                      ""
                                    ); // Allow numbers and dot
                                  }}
                                  id="numberInput"
                                  value={category.Rewardpercentage}
                                  placeholder="Reward percentage"
                                  onChange={(e) =>
                                    handleCategoryChange(index, e)
                                  }
                                  className="form-control"
                                />
                                <div className="help-block">
                                  {errors[`Rewardpercentage_${index}`] && (
                                    <div className="error">
                                      {errors[`Rewardpercentage_${index}`]}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Month Reward (GPK)
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="text"
                                  name="Monthreward"
                                  value={category.Monthreward}
                                  placeholder="Month reward"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Daily Reward (GPK)
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="text"
                                  name="Dailyreward"
                                  value={parseFloat(
                                    category.Dailyreward
                                  ).toFixed(2)}
                                  placeholder="Month reward"
                                  className="form-control"
                                />
                              </div>
                            </div>

                            <div className="form-group row">
                              <label className="col-lg-6 col-form-label form-control-label">
                                Total Reward (GPK)
                              </label>
                              <div className="col-lg-6">
                                <input
                                  type="text"
                                  name="Totalreward"
                                  value={category.Totalreward}
                                  placeholder="Total Reward"
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="form-group row delete_iconchange">
                              <button
                                type="button"
                                onClick={() => deleteCategory(index)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )
                      )}

                      {/* <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Plan months
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            id="numberInput"
                            minLength={0}
                            name="Planmonths"
                            value={formDataref.current.Planmonths}
                            placeholder="plan months"
                            onChange={handleChange}
                            className="form-control"
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(
                                  /[^0-9.]/g,
                                  ""
                                ); // Allow numbers and dot
                                if  (e.target.value.length > 4) {
                                     e.preventDefault();
                                     e.target.value = e.target.value.slice(0, 4); // Trim to 4 characters}
                              }}}
                          />
                          <div className="help-block">
                            {validationnErr.Planmonths && (
                              <div className="error">
                                {validationnErr.Planmonths}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Token price
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            id="numberInput"
                            name="Tokenprice"
                            value={formDataref.current.Tokenprice}
                            placeholder="Token price"
                            className="form-control"
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(
                                  /[^0-9.]/g,
                                  ""
                                ); // Allow numbers and dot
                                if  (e.target.value.length > 4) {
                                    e.preventDefault();
                                    e.target.value = e.target.value.slice(0, 4); // Trim to 4 characters}
                             }
                              }}
                            onChange={handleChange}
                          />
                          <div className="help-block">
                            {validationnErr.Tokenprice && (
                              <div className="error">
                                {validationnErr.Tokenprice}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Reward percentage %
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            id="numberInput"
                            value={formDataref.current.Rewardpercentage}
                            name="Rewardpercentage"
                            onChange={handleChange}
                            placeholder="Reward percentage"
                            onInput={(e) => {
                                e.target.value = e.target.value.replace(
                                  /[^0-9.]/g,
                                  ""
                                ); 
                                if  (e.target.value.length > 4) {
                                    e.preventDefault();
                                    e.target.value = e.target.value.slice(0, 4); // Trim to 4 characters}
                             }
                              }}
                            className="form-control"
                            required
                          />
                          <div className="help-block">
                            {validationnErr.Rewardpercentage && (
                              <div className="error">
                                {validationnErr.Rewardpercentage}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Month reward
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            id="numberInput"
                            name="Monthreward"
                            value={formDataref.current.Monthreward}
                            placeholder="Month reward"
                            className="form-control"
                            disabled
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <label className="col-lg-6 col-form-label form-control-label">
                          Total reward
                        </label>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            id="numberInput"
                            name="Totalreward"
                            value={formDataref.current.Totalreward}
                            placeholder="Total reward"
                            className="form-control"
                            disabled
                          />
                        </div>
                      </div> */}

                      <div className="form-group row justify-content-center">
                        <div className="col-lg-4">
                          {buttonLoader == false ? (
                            editStatus == true ? (
                              <button
                                type="submit"
                                className="d-block w_100"
                                onClick={stakeUpdate}
                              >
                                Edit
                              </button>
                            ) : (
                              <button
                                type="submit"
                                className="d-block w_100"
                                onClick={handleSubmit2}
                              >
                                Submit
                              </button>
                            )
                          ) : (
                            <button type="submit" className="d-block w_100">
                              Loading ...
                            </button>
                          )}
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
export default Stakemanage;
