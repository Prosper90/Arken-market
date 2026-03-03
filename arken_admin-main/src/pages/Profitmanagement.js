import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Sidebar_2 from "./Nav_bar";
import ReactPaginate from "react-paginate";
import Moment from "moment";
import { getMethod, postMethod } from "../core/service/common.api";
import useState from "react-usestateref";
import apiService from "../core/service/detail";

function Dashboard() {
    const [Usersdata, setUsersdata, Usersdataref] = useState([]);
    const [filterKeyword, setFilterKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const pageSize = 5; // Define how many items per page

    useEffect(() => {
        getUserDetails(0);
    }, []);

    const getUserDetails = async (page) => {
        var datas = {
            apiUrl: apiService.getprofit,
            payload: {
                currentPage: page + 1, // ReactPaginate uses 0-based index, so we add 1
                pageSize: pageSize,
            },
        };
        var response = await postMethod(datas);
        if (response.status) {
            setUsersdata(response.value);
            setPageCount(response.pages);
        } else {
            setUsersdata([]);
        }
    };

    const handleFilterChange = (e) => {
        setFilterKeyword(e.target.value);
    };

    const filteredUsers = Usersdata.filter((user) =>
        user.type.toLowerCase().includes(filterKeyword.toLowerCase())
    );

    const handlePageClick = (event) => {
        const selectedPage = event.selected;
        setCurrentPage(selectedPage);
        getUserDetails(selectedPage);

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
                                    <span className="dash-head">Profit Management</span>
                                    <div>
                                        <input className="filters" placeholder="Filter"
                                            value={filterKeyword}
                                            onChange={handleFilterChange} />
                                    </div>
                                </div>
                                <div className="table-responsive my-5 trans-table">
                                    <table className="w_100">
                                        <thead className="trans-head">
                                            <tr>
                                                <th>S.No</th>
                                                <th>Username</th>
                                                <th>Currency</th>
                                                <th>Profit Amount</th>
                                                <th>Profit Type</th>
                                                <th>Date</th>
                                            </tr>
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
                                                                {item.username}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="plus_14_ff">{item.currency}</span>
                                                        </td>
                                                        <td>
                                                            <span className="plus_14_ff">
                                                                {item.profit_amount}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <label className="plus_14_ff">
                                                                {item.type}
                                                            </label>
                                                        </td>
                                                        <td>
                                                            <span className="plus_14_ff">
                                                                {Moment(item.date).format("lll")}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6}>
                                                        <div className="empty_data my-4">
                                                            <div className="plus_14_ff">No Records Found</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    {filteredUsers.length > 0 ? (
                                    <div className="paginationcss">
                                        <ReactPaginate
                                            previousLabel={"<"}
                                            nextLabel={">"}
                                            breakLabel={"..."}
                                            pageCount={pageCount}
                                            marginPagesDisplayed={2}
                                            pageRangeDisplayed={5}
                                            onPageChange={handlePageClick}
                                            containerClassName={"pagination pagination-md justify-content-center"}
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
                                    ) : ("")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
