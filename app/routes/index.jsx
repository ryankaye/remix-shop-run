import { getSession } from "~/utils/session.server";
import { redirect } from "@remix-run/node";

/*  
  Loader (server side) 
*/
export const loader = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("access_token")) return redirect("/login/");

  return redirect("/lists/");
};

/*
	Main Renderer
*/
export default function Index() {
  return <main></main>;
}
