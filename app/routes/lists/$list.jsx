import { useLoaderData, useTransition, useActionData, useSubmit } from "@remix-run/react";
import { Form, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getAllUserData, updateItem, addItem, addSubList, updateSubList } from "~/utils/db.server";
import { Nav } from "~/components/nav";
import { useRef, useEffect, useState } from "react";
import { getSession } from "~/utils/session.server";

/*
  Loader (server side) 
*/
export const loader = async ({ params, request }) => {
  //const session = await getSession(request.headers.get("Cookie"));
  //if (!session.has("access_token")) return redirect("/login");

  const userId = "dbde91c9-41c6-4f3a-8d9d-cb177f89ef72";

  //const data = await getAllUserData(session.get("user_id"), params.list);

  const data = await getAllUserData(userId, params.list);
  return json(data);
};

/* 
  Action (server side) 
*/
export const action = async ({ request }) => {
  const data = await request.formData();
  const { transaction, ...obj } = { ...Object.fromEntries(data) };

  if (transaction === "updateItem") {
    const updateItemResult = await updateItem(data);
    return json({ status: "Successfully updated" });
  }

  if (transaction === "addItem") {
    const addItemResult = await addItem(data);
    return json({ status: "Successfully added" });
  }

  if (transaction === "addSublist") {
    const addSublistResult = await addSubList(data);
    return json({ status: "Successfully added" });
  }
  if (transaction === "updateSublist") {
    const updateSublistResult = await updateSubList(data);
    return json({ status: "Successfully updated" });
  }

  return json({ result: "Error" });
};

/*
  Control the renders
*/
export default function Index() {
  const { lists, currentList } = useLoaderData();
  const transition = useTransition();

  const loadList = [lists[currentList]];

  return (
    <>
      <Nav lists={lists} />
      <main>
        {loadList?.map((list) => {
          return (
            <div key={list?.id}>
              <div className="flex gap-5 items-center">
                <h2 className="mb-6">{list?.name}</h2>
                <Link to={list.id ? "/lists/shop/" + list.id : ""} className="flex items-center mb-5">
                  Shop view
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>

              <AddSubListForm listId={list?.id} transition={transition} />

              {list?.subLists?.map((sublist) => {
                return (
                  <div key={sublist.id}>
                    <EditSubListForm sublist={sublist} listId={list?.id} transition={transition} />

                    {sublist?.items?.map((item, index) => {
                      return (
                        <div key={item.id}>
                          <EditItemForm index={index} item={item} sublist={sublist} />
                        </div>
                      );
                    })}
                    <AddItemForm subListId={sublist.id} transition={transition} order={sublist?.items?.length} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </main>
    </>
  );
}

/*
    Component EditItemForm
*/
function EditItemForm({ index, item, sublist }) {
  const submit = useSubmit();
  const handleChange = (event) => submit(event.currentTarget);

  return (
    <Form method="post" className="flex flex-wrap md:flex-nowrap gap-y-0 md:gap-2 mb-2 py-2 relative" onChange={handleChange}>
      <input type="hidden" name="transaction" defaultValue="updateItem" />
      <input type="hidden" name="order" defaultValue={index} />
      <input type="hidden" name="url2" defaultValue="" />
      <input type="hidden" name="url3" defaultValue="" />
      <input type="hidden" name="status" defaultValue="" />
      <input type="hidden" name="id" defaultValue={item.id} />
      <input type="hidden" name="sublistId" defaultValue={sublist.id} />
      <input type="hidden" name="due" defaultValue={item.due ? item.due : ""} />

      <input type="text" name="text" defaultValue={item.text ? item.text : ""} placeholder="Item" className="bg-slate-700 text-white px-3 pt-3 pb-1 md:p-2 w-full  md:w-1/2 border-0 border-l border-cyan-500 " />
      <input type="text" name="url1" defaultValue={item.url1 ? item.url1 : ""} placeholder="Brand" className="bg-slate-700 text-slate-400  px-3 pb-3 md:p-2 grow border-0 border-l border-cyan-500 " />

      <input type="checkbox" name="completed" defaultChecked={item.completed === "on" ? "checked" : ""} className="h-5 w-5 absolute bottom-1/3 right-3" />
    </Form>
  );
}

/*
    Component AddItemForm
*/
function AddItemForm({ subListId, transition, order }) {
  const transitioning = transition.state;
  const addItemForm = useRef();

  useEffect(() => {
    if (transitioning === "loading") {
      addItemForm.current?.reset();
    }
  }, [transitioning]);

  return (
    <Form method="post" className="flex flex-wrap md:flex-nowrap gap-y-0 md:gap-2 mb-2 py-2 " ref={addItemForm}>
      <input type="hidden" name="transaction" defaultValue="addItem" />
      <input type="hidden" name="order" defaultValue={order} />
      <input type="hidden" name="url2" defaultValue="" />
      <input type="hidden" name="url3" defaultValue="" />
      <input type="hidden" name="status" defaultValue="" />
      <input type="hidden" name="sublistId" defaultValue={subListId} />
      <input type="hidden" name="due" />
      <input type="hidden" name="completed" defaultValue="off" />

      <input type="text" name="text" placeholder="Add new item" className="bg-slate-700 text-white px-3 pt-3 pb-1 md:p-2  w-full  md:w-1/2  border-0 border-l border-slate-700" />
      <input type="text" name="url1" defaultValue="" placeholder="Brand" className="bg-slate-700 text-slate-400 px-3 pb-3 md:p-2  grow  border-0 border-l border-slate-700" />

      <button className="p-2 mt-1 flex items-center justify-center  w-full md:w-1/12 bg-cyan-600 rounded-none" defaultValue="save" type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </Form>
  );
}

/*
  Component AddSubListForm
*/
function AddSubListForm({ listId, transition }) {
  const transitioning = transition.state;
  const form = useRef();

  useEffect(() => {
    if (transitioning === "loading") {
      form.current?.reset();
    }
  }, [transitioning]);

  return (
    <details className="my-2 p-3 bg-cyan-800">
      <summary className="text-lg cursor-pointer text-cyan-200">New sublist</summary>

      <Form method="post" ref={form} className="flex flex-col md:flex-row gap-3 items-center mt-2 py-2 ">
        <input type="hidden" name="listId" defaultValue={listId} />
        <input type="hidden" name="order" defaultValue="0" />
        <input type="hidden" name="transaction" defaultValue="addSublist" />

        <input type="text" name="name" placeholder="Enter a title for the sublist" className="bg-slate-700 text-white p-2  w-full grow border-none" />
        <button className="p-2 flex items-center justify-center grow  w-full md:w-1/12 bg-cyan-600 rounded-none" defaultValue="save" type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </Form>
    </details>
  );
}

/*
  Component EditSubListForm
*/
function EditSubListForm({ sublist, listId, transition }) {
  const submit = useSubmit();
  const handleChange = (event) => submit(event.currentTarget);

  return (
    <Form method="POST" className="flex items-center mt-6 mb-4" onChange={handleChange}>
      <input type="hidden" name="id" defaultValue={sublist.id} />
      <input type="hidden" name="listId" defaultValue={listId} />
      <input type="hidden" name="order" defaultValue="0" />
      <input type="hidden" name="transaction" defaultValue="updateSublist" />

      <input type="text" name="name" defaultValue={sublist.name ? sublist.name : ""} className="bg-slate-800 text-cyan-400  border-none text-xl grow" />
    </Form>
  );
}
