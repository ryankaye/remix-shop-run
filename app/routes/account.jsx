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

        <div className="my-10 md:w-8/12 flex flex-col gap-6 ">
          <div className="bg-slate-700 p-4">
            <h3>Personal</h3>
            <p>Email: {user?.email}</p>
            <p>Key: {user?.id}</p>
          </div>
          <Form method="post" className="mt-6">
            <button className=" w-full md:w-1/2 border-none bg-cyan-500 p-2 ">Logout</button>
          </Form>
        </div>
      </main>
    </>
  );
}
