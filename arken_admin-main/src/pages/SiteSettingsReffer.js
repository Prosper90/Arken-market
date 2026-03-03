import React, { useState, useEffect } from "react";
import moment from "moment";
import axios from 'axios';
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import { toast, ToastContainer } from "react-toastify";
import { env } from "../core/service/envconfig";
import "react-toastify/dist/ReactToastify.css";
import { getMethod, postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";

const ProfileComponent = () => {
    const [model, setModel] = useState({
        // siteLogo: '',
        // favicon: '',
        // siteName: '',
        // registerStatus: '',
        // undermaintenenceStatus: '',
        // kycStatus: '',
        essential_roi: '',
        premium_roi: '',
        copy_right_text: '',
        fb_url: '',
        youtube_url: '',
        insta_url: '',
        telegram_url: '',
        twitter_url: '',
        linkedin_url: '',
        _id: ''
    });

    const [filename, setFilename] = useState('');
    const [imagePath, setImagePath] = useState('');
    const [url, setUrl] = useState('');
    const [url1, setUrl1] = useState('');
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [fileImage, setFileImage] = useState(true);

    useEffect(() => {
        getsitedata();
    }, []);

    const getsitedata = async () => {
        try {
            var data = {
                apiUrl: apiService.get_sitedata,
            };
            var resData = await getMethod(data);

            console.log(resData, "ieiidfikjie")

            // const resData = await axios.get('adminapi/');
            if (resData.status) {
                console.log(resData, "jndncendcn")
                setModel(resData.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const update_sitesettings = async (e) => {
        e.preventDefault();
        try {
            console.log(model);
            var data = {
                apiUrl: apiService.update_settings,
                payload: model
            };
            var resData = await postMethod(data);
            // const resData = await axios.post('adminapi/update_settings', model);
            if (resData.status) {
                toast.success(resData.Message);
                setUrl(false);
                setUrl1(false);
                setFilename('');
                setFileImage(false);
                getsitedata();
            } else {
                toast.error(resData.data.Message, 'Oops!');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.', 'Oops!');
            console.log(error);
        }
    };

    const fileChangeEvent = async (e) => {
        const file = e.target.files[0];
    
        if (!file) return;
    
        try {
    
            const fileExtension = file.name.split(".").at(-1);
            const fileSize = file.size;
            const fileName = file.name;
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
              console.log("------")
            
              const data = new FormData();
              data.append("file", file);
              data.append("upload_preset", env.upload_preset);
              data.append("cloud_name", env.cloud_name);
              fetch(
                "https://api.cloudinary.com/v1_1/" + env.cloud_name + "/auto/upload",
                { method: "post", body: data }
              )
                .then((resp) => resp.json())
                .then((data) => {
                    console.log(data,"kmimik");
                    setModel({ ...model, siteLogo: data.url });
          
                })
                .catch((err) => {
                  console.log(err);
                  toast.error("Please try again later");
                });
            }
          } catch (error) {
            toast.error("Please try again later");
          }
      };
    


    return (
        <div>
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
                                    <span className="dash-head">Site Setting</span>

                                </div>

                                <div className="row justify-content-center mt-5">
                                    <div className="currencyinput  col-lg-9">
                                        {/* <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                                Site Name
                                            </label>
                                            <div class=" col-lg-6">
                                                <input
                                                    type="text"
                                                    value={model.siteName}
                                                    onChange={(e) => setModel({ ...model, siteName: e.target.value })}
                                                    name="siteName"
                                                    placeholder="Site Name"
                                                    className="form-control"
                                                    required
                                                />
                                                {!model.siteName && (
                                                    <div className="help-block">
                                                        <div style={{ color: 'red' }}>Site Name is required.</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                                Change Site Logo
                                            </label>

                                            <div class=" col-lg-6">
                                                <input
                                                    id="fileupload"
                                                    name="siteLogo"
                                                    onChange={fileChangeEvent}
                                                    type="file"
                                                    style={{
                                                        marginTop: '10px',
                                                        background: '#0f1414',
                                                        padding: '13px',
                                                        borderRadius: '6px',
                                                        border: '1rem',
                                                        width: '100%'
                                                    }}
                                                />
                                            </div>
                                            <div className="col-lg-6">

                                            </div>
                                            <div className="col-lg-6">
                                            <img src={model.siteLogo} height="30" width="80" alt="Site Logo" />

                                            </div>
                                        </div>

                                        <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                                Under Maintenance
                                            </label>
                                            <div class=" col-lg-6">
                                                <div className="radio">
                                                    <input
                                                        type="radio"
                                                        name="Radios"
                                                        value="Active"
                                                        checked={model.undermaintenenceStatus === 'Active'}
                                                        onChange={(e) => setModel({ ...model, undermaintenenceStatus: e.target.value })}
                                                    /> Active
                                                    <input
                                                        type="radio"
                                                        name="Radios"
                                                        value="DeActive"
                                                        checked={model.undermaintenenceStatus === 'DeActive'}
                                                        onChange={(e) => setModel({ ...model, undermaintenenceStatus: e.target.value })}
                                                    /> DeActive
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                                Kyc Status
                                            </label>
                                            <div class=" col-lg-6">
                                                <div className="radio">
                                                    <input
                                                        type="radio"
                                                        name="kycStatus"
                                                        value="Active"
                                                        checked={model.kycStatus === 'Active'}
                                                        onChange={(e) => setModel({ ...model, kycStatus: e.target.value })}
                                                    /> Active
                                                    <input
                                                        type="radio"
                                                        name="kycStatus"
                                                        value="DeActive"
                                                        checked={model.kycStatus === 'DeActive'}
                                                        onChange={(e) => setModel({ ...model, kycStatus: e.target.value })}
                                                    /> DeActive
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                                Copy right text
                                            </label>
                                            <div class=" col-lg-6">
                                                <input
                                                    type="text"
                                                    value={model.copy_right_text}
                                                    onChange={(e) => setModel({ ...model, copy_right_text: e.target.value })}
                                                    name="copy_right_text"
                                                    placeholder="Copy right text"
                                                    className="form-control"
                                                    required
                                                />
                                                {!model.copy_right_text && (
                                                    <div className="help-block">
                                                        <div style={{ color: 'red' }}>Copy right text is required.</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div> */}
                                        {/* <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                                Essential Package ROI
                                            </label>
                                            <div class=" col-lg-6">
                                                <input
                                                    type="text"
                                                    value={model.essential_roi}
                                                    onChange={(e) => setModel({ ...model, essential_roi: e.target.value })}
                                                    name="essential_roi"
                                                    placeholder="Essential ROI"
                                                    className="form-control"
                                                    required
                                                />
                                                {!model.essential_roi && (
                                                    <div className="help-block">
                                                        <div style={{ color: 'red' }}>Essential ROI is required.</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                                Premium Package ROI
                                            </label>
                                            <div class=" col-lg-6">
                                                <input
                                                    type="text"
                                                    value={model.premium_roi}
                                                    onChange={(e) => setModel({ ...model, premium_roi: e.target.value })}
                                                    name="premium_roi"
                                                    placeholder="Premium ROI"
                                                    className="form-control"
                                                    required
                                                />
                                                {!model.premium_roi && (
                                                    <div className="help-block">
                                                        <div style={{ color: 'red' }}>Premium ROI is required.</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div> */}
                                        <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                                Twitter Link
                                            </label>
                                            <div class=" col-lg-6">
                                                <input
                                                    type="text"
                                                    // onChange={(e) => setModel({ ...model, twitter_url: e.target.value })}
                                                    // value={model.twitter_url == undefined ? "" : ""}
                                                    name="twitter_url"
                                                    placeholder="Twitter Link"
                                                    className="form-control"
                                                    required
                                                />
                                                {/* {!model.twitter_url && (
                                                    <div className="help-block">
                                                        <div style={{ color: 'red' }}>Twitter Link is required.</div>
                                                    </div>
                                                )} */}
                                            </div>
                                        </div>

                                        <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                                Facebook Link
                                            </label>
                                            <div class=" col-lg-6">
                                                <input
                                                    type="text"
                                                    // value={model.fb_url}
                                                    // onChange={(e) => setModel({ ...model, fb_url: e.target.value })}
                                                    name="fb_url"
                                                    placeholder="Facebook Link"
                                                    className="form-control"
                                                    required
                                                />
                                                {/* {!model.fb_url && (
                                                    <div className="help-block">
                                                        <div style={{ color: 'red' }}>Facebook Link is required.</div>
                                                    </div>
                                                )} */}
                                            </div>
                                        </div>

                                        <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                                LinkedIn Link
                                            </label>
                                            <div class=" col-lg-6">
                                                <input
                                                    type="text"
                                                    // value={model.linkedin_url}
                                                    // onChange={(e) => setModel({ ...model, linkedin_url: e.target.value })}
                                                    name="linkedin_url"
                                                    placeholder="LinkedIn Link"
                                                    className="form-control"
                                                    required
                                                />
                                                {/* {!model.linkedin_url && (
                                                    <div className="help-block">
                                                        <div style={{ color: 'red' }}>LinkedIn Link is required.</div>
                                                    </div>
                                                )} */}
                                            </div>
                                        </div>


                                        <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                                Instagram Link
                                            </label>
                                            <div class=" col-lg-6">
                                                <input
                                                    type="text"
                                                    // value={model.insta_url}
                                                    // onChange={(e) => setModel({ ...model, insta_url: e.target.value })}
                                                    name="insta_url"
                                                    placeholder="Instagram Link"
                                                    className="form-control"
                                                    required
                                                />
                                                {/* {!model.insta_url && (
                                                    <div className="help-block">
                                                        <div style={{ color: 'red' }}>Instagram Link is required.</div>
                                                    </div>
                                                )} */}
                                            </div>
                                        </div>


                                        <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                            Reddit Link
                                            </label>
                                            <div class=" col-lg-6">
                                                <input
                                                    type="text"
                                                    // value={model.youtube_url}
                                                    // onChange={(e) => setModel({ ...model, youtube_url: e.target.value })}
                                                    name="reddit_url"
                                                    placeholder="Reddit Link"
                                                    className="form-control"
                                                    required
                                                />
                                                {/* {!model.youtube_url && (
                                                    <div className="help-block">
                                                        <div style={{ color: 'red' }}>Youtube Link is required.</div>
                                                    </div>
                                                )} */}
                                            </div>
                                        </div>
                                        
                                        <div class="form-group row">
                                            <label class=" col-lg-6 col-form-label form-control-label">
                                            Bitcointalk Link
                                            </label>
                                            <div class=" col-lg-6">
                                                <input
                                                    type="text"
                                                    // value={model.telegram_url}
                                                    // onChange={(e) => setModel({ ...model, telegram_url: e.target.value })}
                                                    name="bitcointalk_url"
                                                    placeholder="Bitcointalk Link"
                                                    className="form-control"
                                                    required
                                                />
                                                {/* {!model.telegram_url && (
                                                    <div className="help-block">
                                                        <div style={{ color: 'red' }}>Telegram Link is required.</div>
                                                    </div>
                                                )} */}
                                            </div>
                                        </div>

                                        <div class="form-group row justify-content-around mt-4">
                                            <div class=" col-lg-4 d-flex align-items-center">
                                                <button class="btn btn-lg btn-primary  float-left w_100" onClick={update_sitesettings}>
                                                    Submit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileComponent;
