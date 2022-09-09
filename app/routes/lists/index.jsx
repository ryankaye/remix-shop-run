import { getSession } from "~/utils/session.server";
import { redirect, json } from "@remix-run/node";
import { useLoaderData, Form, useTransition, Link, useSubmit } from "@remix-run/react";
import { getUserLists, updateList, addList, getUserAccount, createUserAccount } from "~/utils/db.server";
import { Nav } from "~/components/nav";
import { useRef, useEffect } from "react";

/*  
  Loader (server side) 
*/
export const loader = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("access_token")) return redirect("/login");

  const account = await getUserAccount(session.get("user_id"));

  if (!account.length) {
    const newaccount = await createUserAccount(session.get("user_id"), session.get("user_email"));
  }

  const { lists } = await getUserLists(session.get("user_id"));
  return json({ user: { id: session.get("user_id"), email: session.get("user_email") }, lists: lists });
};

/* 
  Action (server side) 
*/
export const action = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("access_token")) return redirect("/login");

  const data = await request.formData();
  const action = data.has("id") ? await updateList(data, session.get("user_id")) : await addList(data, session.get("user_id"));

  return json({ status: "Successfully updated yeah" });
};

/*
	Main Renderer
*/
export default function Index() {
  const { user, lists } = useLoaderData();
  const transition = useTransition();

  return (
    <>
      <Nav lists={lists} />
      <main>
        <h2 className="mb-6">My lists</h2>

        {lists?.map((list) => {
          return (
            <div key={list?.id}>
              <EditListForm list={list} />
            </div>
          );
        })}
        <AddListForm transition={transition} />
      </main>
    </>
  );
}

/*
  Component: Edit List Form
*/
function EditListForm({ list }) {
  const submit = useSubmit();
  const doSubmit = (event) => submit(event.currentTarget);

  return (
    <Form method="POST" key={list?.id} className="flex items-center mb-6 my-2 bg-slate-700 " onChange={doSubmit}>
      <input type="hidden" name="order" defaultValue={list.order ? list.order : "0"} />
      <input type="hidden" name="id" defaultValue={list?.id} />
      <input type="text" defaultValue={list.name ? list.name : ""} name="name" placeholder="Enter a title for the sub list" className="bg-slate-700 text-white p-2 w-full border-none" />

      <div className="p-2">
        <Link to={list.id ? "/lists/shop/" + list.id : ""}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        </Link>
      </div>

      <div className="p-2">
        <Link to={list.id ? "/lists/" + list.id : ""}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </Link>
      </div>
    </Form>
  );
}

/*
  Component: Add List Form
*/
function AddListForm({ transition }) {
  const transitioning = transition.state;
  const formRef = useRef();

  useEffect(() => {
    transition.state === "idle" && formRef.current?.reset();
  }, [transitioning]);

  return (
    <Form method="POST" ref={formRef} className="flex flex-col md:flex-row gap-4 items-center mt-4 pt-6 mb-2 py-2 border-t border-slate-600">
      <input type="hidden" name="order" value="999" />
      <input type="text" name="name" placeholder="Add new list" className="bg-slate-600 text-white p-2 w-full grow border-none" />
      <button className="p-2 flex items-center justify-center w-full md:w-1/12 bg-cyan-600 rounded-none" value="save" type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </Form>
  );
}
