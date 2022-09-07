import { getSession } from "~/utils/session.server";
import { redirect, json } from "@remix-run/node";
import { useLoaderData, Form, useTransition, Link, useSubmit } from "@remix-run/react";
import { getUserLists, updateList, addList } from "~/utils/db.server";
import { Nav } from "~/components/nav";
import { useRef, useEffect } from "react";

/*  
  Loader (server side) 
*/
export const loader = async ({ request }) => {
  //const session = await getSession(request.headers.get("Cookie"));
  //if (!session.has("access_token")) return redirect("/login");

  const userId = "dbde91c9-41c6-4f3a-8d9d-cb177f89ef72";

  //const { lists } = await getUserLists(session.get("user_id"));
  const { lists } = await getUserLists(userId);

  return json({ user: { id: userId, email: "ryankaye@gmail.com" }, lists: lists });
  //return { user: { id: session.get("user_id"), email: session.get("user_email") }, lists: lists };
};

/* 
  Action (server side) 
*/
export const action = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("access_token")) return redirect("/login");

  const data = await request.formData();
  const action = data.has("id") ? await updateList(data, session.get("user_id")) : await addList(data, session.get("user_id"));

  return json({ status: "Successfully updated" });
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
        <h2 className="mb-4">Lists</h2>
        {lists?.map((list) => {
          return <EditListForm list={list} />;
        })}
        <AddListForm transition={transition} />
      </main>
    </>
  );
}

/*
  Component: EditListForm
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
        <Link to={list.id ? "/lists/" + list.id : ""}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
    </Form>
  );
}

/*
  Component: AddListForm
*/
function AddListForm({ transition }) {
  const transitioning = transition.state;
  const formRef = useRef();

  useEffect(() => {
    transition.state === "idle" && formRef.current?.reset();
  }, [transitioning]);

  return (
    <Form method="POST" ref={formRef} className="flex flex-col md:flex-row gap-4 items-center mt-4 pt-6 mb-2 py-2 border-t border-cyan-500">
      <input type="hidden" name="order" value="0" />
      <input type="text" name="name" placeholder="Add new list" className="bg-slate-600 text-white p-2 w-full grow border-none" />
      <button className="p-2 flex items-center justify-center w-full md:w-1/12 bg-cyan-600 rounded-none" value="save" type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </Form>
  );
}
