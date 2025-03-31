"use client";

import FileCard from "@/app/(dashboard)/_components/file-card/card";
import { P } from "@/components/custom/p";
import { IFile } from "@/lib/database/schema/file.model";
import { getFiles } from "@/lib/fetch/files.fetch";
import { RiLoader3Fill } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

interface PageFilesProps {
  page: string;
}

const PageFiles = ({ page }: PageFilesProps) => {
  const { ref, inView } = useInView();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageFull, setIsPageFull] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["files", page],
    queryFn: async () => {
      const fetchedData = await getFiles({ page, currentPage: 1 });
      return fetchedData;
    },

    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: getFiles,
    onSuccess: (newData) => {
      if (currentPage === newData.totalPages) {
        setIsPageFull(true);
      }

      queryClient.setQueryData(["files", page], (oldData: any) => {
        if (!oldData) return newData; // if old data is null or undefined.
        const existingFiles = oldData.files || [];
        const newFiles = newData.files || [];

        const mergedFiles = [
          ...existingFiles,
          ...newFiles.filter(
            (newFile: IFile) =>
              !existingFiles.some(
                (existingFile: IFile) => existingFile._id === newFile._id
              )
          ),
        ];

        return {
          ...oldData,
          files: mergedFiles,
          total: newData.totalFiles,
          currentPage: newData.currentPage,
          totalPages: newData.totalPages,
        };
      });
    },
    onError(e) {
      toast(e.name, {
        description: e.message as string,
      });
    },
  });

  useEffect(() => {
    if (currentPage === data?.totalPages) {
      setIsPageFull(true);

      return;
    }
    if (inView && !isPageFull) {
      setCurrentPage((prev) => {
        const nextPage = prev + 1;

        mutation.mutateAsync({
          page,
          currentPage: nextPage,
        });

        return nextPage;
      });
    }
  }, [inView, data]);

  if (isLoading) return <RiLoader3Fill className="animate-spin mx-auto" />;

  if (error) {
    return (
      <P size={"large"} weight={"bold"}>
        Error: {error.message}
      </P>
    );
  }

  const files = data?.files as IFile[];
  if (files?.length === 0 && page !== "subscription") {
    return (
      <Image
        src={"/not-found-icon.png"}
        width={400}
        height={400}
        className="m-auto"
        alt="not-found-pic"
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6">
        {files.map((file) => (
          <FileCard file={file} key={file._id} />
        ))}
      </div>

      {!isLoading && !isPageFull && (
        <div
          ref={ref}
          className="w-full flex h-fit items-center justify-center"
        ></div>
      )}
    </>
  );
};

export default PageFiles;
