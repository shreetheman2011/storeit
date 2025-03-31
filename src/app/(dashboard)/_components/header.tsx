"use client";

import SidebarTrigger from "@/components/custom/sidebar-trigger";
import DashboardBreadcrumb from "./breadcrumb";
import UploadButton from "./upload-button";
import HeaderProfile from "./header-profile";

const DashboardHeader = () => {
  return (
    <header className="flex items-center justify-between py-5">
      <div className="flex items-center gap-4 justify-start flex-1">
        <SidebarTrigger />
        <DashboardBreadcrumb />
      </div>
      <div className="flex flex-1 justify-center w-full">
        <span style={{ fontSize: 9, maxLines: 1 }}>
          Requests that include uploading files over the size of{" "}
          <span style={{ fontWeight: "bold" }}>7gb</span> are currently
          encountering errors due to storage capacity. If you get this error,
          please text{" "}
          <span className="font-bold">
            HELPSTOREIT to +19253419183. Thanks, the StoreIt team.
          </span>
        </span>
      </div>

      <div className="w-full flex-1 h-fit flex items-center gap-4 justify-end">
        <UploadButton />
        <HeaderProfile />
      </div>
    </header>
  );
};

export default DashboardHeader;
