import { useLoaderData, useSubmit } from "@remix-run/react";
import { Form, Link } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";
import { getAllUserData, updateItem } from "~/utils/db.server";
import { Nav } from "~/components/nav";
import { getSession } from "~/utils/session.server";

/*
  Loader (server side) 
*/
export const loader = async ({ params, request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("access_token")) return redirect("/login");

  const data = await getAllUserData(session.get("user_id"), params.list);
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

  return json({ result: "Error" });
};

/*
  Control the renders
*/
export default function Index() {
  const { lists, currentList } = useLoaderData();
  const loadList = [lists[currentList]];

  if (currentList === -1) return <ListNotFound lists={lists} />;

  const flatten = (list, input) => {
    const willReturn = input === undefined ? [] : input;
    for (let i = 0; i < list.length; i++) {
      if (Array.isArray(list[i])) {
        flatten(list[i], willReturn);
      } else {
        willReturn.push(list[i]);
      }
    }
    return willReturn;
  };

  // Process the data
  const items = flatten(loadList[0].subLists.map((el) => el.items)).sort((a, b) => {
    let fa = a.text.toLowerCase();
    let fb = b.text.toLowerCase();

    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
    return 0;
  });

  const priorityItems = items.filter((el) => el.status === "Priority");

  return (
    <>
      <Nav lists={lists} />
      <main>
        <div className="flex flex-col md:flex-row gap-5 mb-10 md:items-center">
          <h2>{loadList[0]?.name} priorites</h2>

          <Link to={loadList[0].id ? "/lists/" + loadList[0].id : ""} className="flex gap-3 items-center bg-cyan-900 p-2 px-4 mt-6 md:mt-0 w-full md:w-auto text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to list view
          </Link>
        </div>

        {priorityItems?.map((item) => {
          return (
            <div key={item?.id}>
              <ItemForm item={item} sublists={loadList[0].subLists} />
            </div>
          );
        })}
      </main>
    </>
  );
}

/*
  Component Item Form 
*/
function ItemForm({ item, sublists }) {
  const submit = useSubmit();
  const handleChange = (event) => submit(event.currentTarget);

  const [status, setStatus] = useState(item.status);

  const getSubListName = (id) => {
    const list = sublists.filter((sublist) => sublist.id === id);
    return list.length ? list[0].name : "";
  };

  const handleCompleted = (event) => (status === "Completed" ? setStatus("Default") : setStatus("Completed"));

  const completedClasses = (status === "Completed" ? "text-cyan-400 " : "text-slate-400") + " justify-self-end px-2 ";

  return (
    <Form method="POST" key={item.id} className="form-priorites grid gap-1 mb-4 bg-slate-700 items-center relative" onChange={handleChange}>
      <input type="text" name="text" defaultValue={item.text} className="w-full  bg-slate-700 p-3 pb-1 md:p-3  border-0" />

      <div className="p-3 pt-0 md:pt-3 text-base text-slate-400 border-0 ">
        {item.url1 ? item.url1 + ", " : ""}
        {getSubListName(item?.sublistId)}
      </div>

      <button onClick={handleCompleted} className={completedClasses}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      <input type="hidden" name="url1" defaultValue={item.url1} className="w-full pt-0 md:pt-3  bg-slate-700 text-slate-400 p-3 border-0" />
      <input type="hidden" name="completed" defaultValue="" />
      <input type="hidden" name="transaction" defaultValue="updateItem" />
      <input type="hidden" name="order" defaultValue={item.order} />
      <input type="hidden" name="url2" defaultValue="" />
      <input type="hidden" name="url3" defaultValue="" />
      <input type="hidden" name="status" defaultValue={status} />
      <input type="hidden" name="id" defaultValue={item.id} />
      <input type="hidden" name="sublistId" defaultValue={item?.sublistId} />
      <input type="hidden" name="due" defaultValue={item.due ? item.due : ""} />
    </Form>
  );
}

/*
  Component List Not Found
*/
function ListNotFound({ lists }) {
  return (
    <>
      <Nav lists={lists} />
      <main>
        <p>List not found</p>
      </main>
    </>
  );
}
