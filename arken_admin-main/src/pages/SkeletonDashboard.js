

const SkeletonDashboard = () => {
  const rows = Array.from({ length: 4 }); // 4 rows
  const cols = 6;
  return (
    <>
      <div className="skeleton_wrap">
        <div className="skeleton_sidebar">
          {/* <Skeleton variant="text" width="100%" className="skl_logo" /> */}

          <div className="skeleton_sidebar_links">
            <div className="skl_sidebar_flx">
              <div className="rounded-full bg-[#b8b8b833] animate-pulse skl_icon"></div>
              <div className="bg-[#b8b8b833] animate-pulse w-full skl_links"></div>
            </div>
            <div className="skl_sidebar_flx">
              <div className="rounded-full bg-[#b8b8b833] animate-pulse skl_icon"></div>
              <div className="bg-[#b8b8b833] animate-pulse w-full skl_links"></div>
            </div>
            <div className="skl_sidebar_flx">
              <div className="rounded-full bg-[#b8b8b833] animate-pulse skl_icon"></div>
              <div className="bg-[#b8b8b833] animate-pulse w-full skl_links"></div>
            </div>
            <div className="skl_sidebar_flx">
              <div className="rounded-full bg-[#b8b8b833] animate-pulse skl_icon"></div>
              <div className="bg-[#b8b8b833] animate-pulse w-full skl_links"></div>
            </div>
            <div className="skl_sidebar_flx">
              <div className="rounded-full bg-[#b8b8b833] animate-pulse skl_icon"></div>
              <div className="bg-[#b8b8b833] animate-pulse w-full skl_links"></div>
            </div>
            <div className="skl_sidebar_flx">
              <div className="rounded-full bg-[#b8b8b833] animate-pulse skl_icon"></div>
              <div className="bg-[#b8b8b833] animate-pulse w-full skl_links"></div>
            </div>
            <div className="skl_sidebar_flx">
              <div className="rounded-full bg-[#b8b8b833] animate-pulse skl_icon"></div>
              <div className="bg-[#b8b8b833] animate-pulse w-full skl_links"></div>
            </div>
            <div className="skl_sidebar_flx">
              <div className="rounded-full bg-[#b8b8b833] animate-pulse skl_icon"></div>
              <div className="bg-[#b8b8b833] animate-pulse w-full skl_links"></div>
            </div>
            <div className="skl_sidebar_flx">
              <div className="rounded-full bg-[#b8b8b833] animate-pulse skl_icon"></div>
              <div className="bg-[#b8b8b833] animate-pulse w-full skl_links"></div>
            </div>
            <div className="skl_sidebar_flx">
              <div className="rounded-full bg-[#b8b8b833] animate-pulse skl_icon"></div>
              <div className="bg-[#b8b8b833] animate-pulse w-full skl_links"></div>
            </div>
            <div className="skl_sidebar_flx">
              <div className="rounded-full bg-[#b8b8b833] animate-pulse skl_icon"></div>
              <div className="bg-[#b8b8b833] animate-pulse w-full skl_links"></div>
            </div>
          </div>
        </div>
        {/* <div className="skeleton_right w-100">
          <div className="skeleton_right_top">
            <Skeleton variant="circular" className="skl_dsh_user_icon" />
          </div>

          <div className="skeleton_right_body">
            <Skeleton variant="text" className="skl_dsh_title" />

            <div className="skeleton_rgt_box_wrap">
              <Skeleton variant="text" className="skl_dsh_box" />
              <Skeleton variant="text" className="skl_dsh_box" />
              <Skeleton variant="text" className="skl_dsh_box" />
            </div>
            <div className="skeleton_rgt_box_wrap skl_box_wrap_two">
              <Skeleton variant="text" className="skl_dsh_box" />
              <Skeleton variant="text" className="skl_dsh_box" />
              <Skeleton variant="text" className="skl_dsh_box" />
            </div>

            <Skeleton variant="text" className="skl_dsh_title_two" />

            <div className="skl_tble_outer">
              <div className="table-responsive trans-table skl_tble">
                <table className="w_100">
                  <thead className="trans-head">
                    <tr>
                      <th>
                        <Skeleton
                          variant="rounded"
                          height={22}
                          sx={{
                            bgcolor: "#b8b8b833",
                            borderRadius: "6px",
                          }}
                        />
                      </th>
                      <th>
                        <Skeleton
                          variant="rounded"
                          height={22}
                          sx={{
                            bgcolor: "#b8b8b833",
                            borderRadius: "6px",
                          }}
                        />
                      </th>
                      <th>
                        <Skeleton
                          variant="rounded"
                          height={22}
                          sx={{
                            bgcolor: "#b8b8b833",
                            borderRadius: "6px",
                          }}
                        />
                      </th>
                      <th>
                        <Skeleton
                          variant="rounded"
                          height={22}
                          sx={{
                            bgcolor: "#b8b8b833",
                            borderRadius: "6px",
                          }}
                        />
                      </th>
                      <th>
                        <Skeleton
                          variant="rounded"
                          height={22}
                          sx={{
                            bgcolor: "#b8b8b833",
                            borderRadius: "6px",
                          }}
                        />
                      </th>
                      <th>
                        <Skeleton
                          variant="rounded"
                          height={22}
                          sx={{
                            bgcolor: "#b8b8b833",
                            borderRadius: "6px",
                          }}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {Array.from({ length: cols }).map((_, colIndex) => (
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
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default SkeletonDashboard;
