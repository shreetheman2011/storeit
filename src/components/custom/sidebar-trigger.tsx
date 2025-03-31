import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { RiSidebarFoldFill, RiSidebarUnfoldFill } from "@remixicon/react";

const SidebarTrigger = () => {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("size-fit scale-120 hover:bg-primary p-1 hover:text-white")}
      onClick={() => {
        toggleSidebar();
      }}
    >
      {state === "expanded" ? <RiSidebarFoldFill /> : <RiSidebarUnfoldFill />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};

export default SidebarTrigger;
