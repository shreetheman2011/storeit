"use client";

import {
  deleteFile,
  generateUrl,
  renameFile,
  updateFilePermissions,
} from "@/action/file.action";
import { paragraphVariants } from "@/components/custom/p";
import { KebabMenuIcon } from "@/components/icons/kebab";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IFile } from "@/lib/database/schema/file.model";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { cn, dynamicDownload, parseError } from "@/lib/utils";
import {
  RiDeleteBin7Fill,
  RiFileEditFill,
  RiFolderDownloadFill,
  RiFolderSharedFill,
  RiLoader3Fill,
  RiShareFill,
} from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { usePathname } from "next/navigation";

interface Action {
  name: string;
  icon: ReactNode;
  permissions: "file:read" | "file:update" | "file:delete";
}

const actions: Action[] = [
  {
    name: "Rename",
    icon: <RiFileEditFill />,
    permissions: "file:update",
  },
  {
    name: "Share",
    icon: <RiFolderSharedFill />,
    permissions: "file:read",
  },
  {
    name: "Download",
    icon: <RiFolderDownloadFill />,
    permissions: "file:read",
  },
  {
    name: "Delete",
    icon: <RiDeleteBin7Fill />,
    permissions: "file:delete",
  },
];
const FileMenu = ({
  file,
  isLinkInProgress,
  setIsLinkInProgress,
}: {
  file: IFile;
  isLinkInProgress: boolean;
  setIsLinkInProgress: Dispatch<SetStateAction<boolean>>;
}) => {
  const pathName = usePathname();
  const queryClient = useQueryClient();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const isShared = pathName.split("/")[2] === "shared";

  const { sharedWith } = file;

  const mutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["files", data.category],
        (oldData: { files: IFile[] }) => {
          const deletedFileId = data.fileId;

          const updatedFiles = oldData.files.filter(
            (file) => file._id !== deletedFileId
          );
          const updatedData = { ...oldData, files: updatedFiles };
          return updatedData;
        }
      );

      toast("File Deleted", { description: file.name });
    },
    onError: (error) => {
      const err = parseError(error);
      toast("Error deleting file", {
        description: `${err}`,
      });
    },
  });

  return (
    <>
      <DropdownMenu>
        {!mutation.isPending && !isLinkInProgress ? (
          <DropdownMenuTrigger>
            <KebabMenuIcon className="hover:bg-accent rounded-md p-2" />
          </DropdownMenuTrigger>
        ) : (
          <RiLoader3Fill className="animate-spin " />
        )}
        <DropdownMenuContent className="px-2">
          <DropdownMenuLabel
            className={cn(
              paragraphVariants({
                size: "medium",
                weight: "bold",
              })
            )}
          >
            File Action
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actions.map((action, i) => (
            <DropdownMenuItem
              key={i}
              className="flex items-center justify-start gap-2 px-3 py-4"
              onClick={async () => {
                if (action.name === "Delete") {
                  if (
                    isShared &&
                    !sharedWith[0].permissions.includes("file:delete")
                  ) {
                    toast("Access Denied", {
                      description:
                        "You do not have permission to delete this file. Contact file owner for access.",
                    });
                    return;
                  }
                  if (
                    window.confirm("Are you sure you want to delete this file?")
                  ) {
                    mutation.mutateAsync(file);
                  }
                }
                if (action.name === "Share") {
                  if (isShared) {
                    toast("Access Denied", {
                      description:
                        "You do not have permission for this action. Only file owners may share this file.",
                    });
                    return;
                  }

                  setIsShareDialogOpen(true);
                }
                if (action.name === "Rename") {
                  if (
                    isShared &&
                    !sharedWith[0].permissions.includes("file:update")
                  ) {
                    toast("Access Denied", {
                      description:
                        "You do not have permission to rename this file. Contact file owner for access.",
                    });
                    return;
                  }
                  setIsRenameDialogOpen(true);
                }

                if (action.name === "Download") {
                  if (
                    isShared &&
                    !sharedWith[0].permissions.includes("file:read")
                  ) {
                    toast("Access Denied", {
                      description:
                        "You do not have permission to downlooad this file. Contact file owner for access.",
                    });
                    return;
                  }
                  setIsLinkInProgress(true);
                  const { data, status } = await generateUrl(file.cid);
                  if (status !== 201) {
                    toast(`${data}`, {
                      description: data as string,
                    });

                    setIsLinkInProgress(false);
                    return;
                  }
                  setIsLinkInProgress(false);
                  dynamicDownload(data as string, file.name);
                }
              }}
            >
              {action.icon}

              <span
                className={cn(
                  paragraphVariants({ size: "small", weight: "medium" })
                )}
              >
                {action.name}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ShareFileForm
        isShareDialogOpen={isShareDialogOpen}
        setIsShareDialogOpen={setIsShareDialogOpen}
        file={file}
      />

      <RenameFileForm
        file={file}
        isRenameDialogOpen={isRenameDialogOpen}
        setIsRenameDialogOpen={setIsRenameDialogOpen}
      />
    </>
  );
};

const permissions = [
  {
    id: "file:read",
    label: "Read",
  },
  {
    id: "file:update",
    label: "Update",
  },
  {
    id: "file:delete",
    label: "Delete",
  },
] as const;

const permissionFormSchema = z.object({
  email: z.string().email(),
  permissions: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    }),
});

export type TShareFileForm = z.infer<typeof permissionFormSchema>;

export const ShareFileForm = ({
  file,
  isShareDialogOpen,
  setIsShareDialogOpen,
}: {
  file: IFile;
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<TShareFileForm>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      email: "",
      permissions: ["file:read"],
    },
  });

  async function onSubmit(values: TShareFileForm) {
    setIsLoading(true);
    console.log("File PinataId being sent:", file.pinataId);

    const res = await updateFilePermissions(file, values);

    toast(res.message, {
      description: res.description,
    });

    setIsLoading(false);
    setIsShareDialogOpen(false);
  }
  return (
    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
      <DialogContent>
        <DialogHeader className="hidden">
          <DialogTitle>title</DialogTitle>
          <DialogDescription>description</DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (that the user signed up with)</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-start gap-3 border rounded-2xl px-3 py-2">
                        <RiShareFill />
                        <Input
                          className={cn("input")}
                          placeholder="Email Here..."
                          {...field}
                          type="email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Permission */}
              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">
                        Select Permission
                        <span style={{ fontSize: 8 }}>
                          (if you would like to remove all permissions, text
                          HELPSTOREIT to +19253419183)
                        </span>
                      </FormLabel>
                    </div>
                    {permissions.map((permission) => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={permission.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          permission.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== permission.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {permission.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={isLoading} type="submit" variant="lift">
                {!isLoading ? (
                  "Share"
                ) : (
                  <RiLoader3Fill className="animate-spin" />
                )}
              </Button>
              <p style={{ fontSize: 11, lineHeight: 1.5, textAlign: "center" }}>
                The user will be able to access this file from their
                &quot;shared with me&quot; page on their StoreIT dashboard
              </p>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const renameFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type TRenameFileForm = z.infer<typeof renameFormSchema>;

export const RenameFileForm = ({
  file,
  isRenameDialogOpen,
  setIsRenameDialogOpen,
}: {
  file: IFile;
  isRenameDialogOpen: boolean;
  setIsRenameDialogOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: renameFile,
    onSuccess: (newData) => {
      queryClient.setQueryData(
        ["files", file.category],
        (oldData: { files: IFile[] }) => {
          const oldFiles = oldData?.files || [];
          const newFile = newData.file;

          const withNewFiles = oldFiles.map((oldFile) =>
            oldFile._id === newFile?._id ? newFile : oldFile
          );

          const updatedData = {
            ...oldData,
            files: withNewFiles,
          };

          return updatedData;
        }
      );

      toast("Success", {
        description: file.name,
      });
    },
    onSettled: () => {
      setIsLoading(false);
      setIsRenameDialogOpen(false);
    },
    onError: (e) => {
      toast(e.name, {
        description: e.message,
      });
    },
  });

  const form = useForm<TRenameFileForm>({
    resolver: zodResolver(renameFormSchema),
    defaultValues: {
      name: file.name || "",
    },
  });

  async function onSubmit(values: TRenameFileForm) {
    setIsLoading(true);

    const originalExtension = file.name.split(".").pop() || "";
    const newName =
      values.name + (originalExtension ? `.${originalExtension}` : "");
    mutation.mutateAsync({ values: { name: newName }, file });
  }
  return (
    <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
      <DialogContent>
        <DialogHeader className="hidden">
          <DialogTitle>title</DialogTitle>
          <DialogDescription>description</DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Email */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Name</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-start gap-3 border rounded-2xl px-3 py-2">
                        <RiFileEditFill />
                        <Input
                          className={cn("input")}
                          placeholder="New Name Here..."
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isLoading} type="submit" variant="lift">
                {!isLoading ? (
                  "Rename"
                ) : (
                  <RiLoader3Fill className="animate-spin" />
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileMenu;
