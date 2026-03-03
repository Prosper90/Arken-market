import React, { useEffect, useState } from 'react'
import Sidebar from "../Sidebar";
import SkeletonwholeProject from "../SkeletonwholeProject";
import Sidebar_2 from "../Nav_bar";

const Settings = () => {

    const [userdata, setuserdata, userdataref] = useState("");
    const [loader, setLoader] = useState(false);


    return (
        <div>
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

                            {/* {loader == true ? (
                                <SkeletonwholeProject />
                            ) : ( */}
                                <div
                                    className="px-4 transaction_padding_top"
                                    style={{ paddingTop: "50px" }}
                                >
                                    <div className="ycho_inner mt-5 mb-md-4 mb-3">
                                        <span className="dash-head">Settings</span>
                                    </div>

                                </div>
                            {/* )} */}
                        </div>
                    </>
                </div>
            </div>
            {/* )} */}
        </div>
    )
}

export default Settings