import { getSession } from "~/utils/session.server";
import { redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getUserLists } from "~/utils/db.server";
import { Nav } from "~/components/nav";

/*  
  Loader (server side) 
*/
export const loader = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("access_token")) return redirect("/login/");

  return redirect("/lists/");

  //const { lists } = await getUserLists(session.get("user_id"));
  //return { user: { id: session.get("user_id"), email: session.get("user_email") }, lists: lists };
};

/*
	Main Renderer
*/
export default function Index() {
  //const { user, lists } = useLoaderData();

  return (
    <>
      <main className="ml-24"></main>
    </>
  );
}
