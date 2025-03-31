import { redirect } from "next/navigation";

const RedirectRoute = async () => {
  redirect("/dashboard/documents");
};
export default RedirectRoute;
