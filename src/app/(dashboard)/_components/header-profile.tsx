"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { signOut, useSession } from "@/lib/better-auth/auth-client";
import { useRouter } from "next/navigation";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { paragraphVariants } from "@/components/custom/p";
import { RiLogoutBoxFill } from "@remixicon/react";

const HeaderProfile = () => {
  const session = useSession();
  const router = useRouter();

  const { isPending, data } = session;

  return (
    <>
      {isPending && <Skeleton className="size-10 rounded-full" />}

      <DropdownMenu>
        <DropdownMenuTrigger className="mr-5">
          {!isPending && (
            <Avatar>
              {data?.user?.image && typeof data?.user?.image === "string" ? (
                <AvatarImage src={data?.user?.image as string} />
              ) : (
                <AvatarFallback style={{ fontWeight: "600" }}>
                  {(data?.user?.name as string)?.slice(0, 1)}
                </AvatarFallback>
              )}
            </Avatar>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="px-2 mr-5">
          <DropdownMenuLabel
            className={cn(
              paragraphVariants({
                size: "medium",
                weight: "bold",
              })
            )}
          >
            Profile
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center justify-center gap-2 px-3 py-4"
            onClick={async () => {
              await signOut();

              router.push("/sign-in");
            }}
          >
            <RiLogoutBoxFill />
            <span
              className={cn(
                paragraphVariants({
                  size: "small",
                  weight: "medium",
                })
              )}
            >
              Log Out
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default HeaderProfile;
