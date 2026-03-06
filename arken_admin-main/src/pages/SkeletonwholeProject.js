import React from "react";

const SkeletonwholeProject = () => {
  return (
    <div className="container-fluid animate-pulse">
      <div className="row">
        <div className="col-xl-2 col-lg-3 d-none d-lg-block px-0">
          <div className="h-screen bg-white/5" />
        </div>
        <div className="col-xl-10 col-lg-9 col-12 px-0">
          <div className="h-14 bg-white/5 mb-4" />
          <div className="px-4 py-6">
            <div className="h-8 w-48 rounded bg-white/10 mb-6" />
            <div className="flex gap-3 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 w-32 rounded bg-white/10" />
              ))}
            </div>
            <div className="rounded-lg overflow-hidden">
              <div className="h-10 bg-white/10 mb-1" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-white/5 mb-1 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonwholeProject;
