import { useLoaderData, Form } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import { getSession, destroyUserSession } from "~/utils/session.server";
import { getUserLists } from "~/utils/db.server";

import { Nav } from "~/components/nav";

/*  
  Loader (server side) 
*/
export const loader = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  if (!session.has("access_token")) return redirect("/login");

  const { lists } = await getUserLists(session.get("user_id"));

  return json({ user: { id: session.get("user_id"), email: session.get("user_email") }, lists: lists });
};

/* 
  Action (server side) 
*/
export const action = async ({ request }) => destroyUserSession(request);

/* 
  Main Component 
*/
export default function Account() {
  const { user, lists } = useLoaderData();

  return (
    <>
      <Nav lists={lists} />
      <main>
        <h2 className="mb-6">My account</h2>
        <p className="mb-7 ">{user?.email}</p>
        <p className="mb-7 text-slate-300">{user?.id}</p>
        <Form method="post">
          <button className=" w-1/3 border p-2 ">Logout</button>
        </Form>
      </main>
    </>
  );
}
