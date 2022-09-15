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

  // Helpers
  const removeDuplicates = (data) => {
    return data.filter((c, index) => {
      return data.indexOf(c) === index;
    });
  };

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
  const items = flatten(loadList[0].subLists.map((el) => el.items)).sort((b, a) => {
    let fa = a.status.toLowerCase();
    let fb = b.status.toLowerCase();

    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
    return 0;
  });

  const shops = removeDuplicates(items.map((el) => el.url1))
    .filter((el) => el !== "")
    .sort();

  return (
    <>
      <Nav lists={lists} />
      <main>
        <div className="flex flex-col md:flex-row gap-5 mb-10 md:items-center">
          <h2>{loadList[0]?.name} shops</h2>

          <Link to={loadList[0].id ? "/lists/" + loadList[0].id : ""} className="flex gap-3 items-center bg-cyan-900 p-2 px-4 mt-6 md:mt-0 w-full md:w-auto text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to list view
          </Link>
        </div>

        {shops?.map((shop, index) => {
          return (
            <details key={index} className=" border-cyan-700">
              <summary className="mb-6 mt-6 text-cyan-500 border-none text-xl cursor-pointer">
                <span className="inline-block ml-2">{shop}</span>
              </summary>

              {items?.map((item) => {
                return item.url1 === shop ? (
                  <div key={item?.id}>
                    <ItemForm item={item} sublists={loadList[0].subLists} />
                  </div>
                ) : (
                  ""
                );
              })}
            </details>
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

  const getSubListName = (id) => {
    const list = sublists.filter((sublist) => sublist.id === id);
    return list.length ? list[0].name : "";
  };

  const [status, setStatus] = useState(item.status);

  const handlePriority = (event) => {
    if (status === "Priority") {
      setStatus("Default");
    } else if (status === "Completed") {
      setStatus("Completed");
    } else {
      setStatus("Priority");
    }
  };

  const handleCompleted = (event) => (status === "Completed" ? setStatus("Default") : setStatus("Completed"));

  const completedClasses = (status === "Completed" ? "text-cyan-400 " : "text-slate-400") + " px-1 md:px-2 ";
  const priorityClasses = (status === "Priority" ? "text-cyan-400 " : "text-slate-400") + " px-1 md:px-2 ";

  return (
    <Form method="POST" key={item.id} className="form-shop grid gap-1 mb-4 bg-slate-700 items-center " onChange={handleChange}>
      <input type="text" name="text" defaultValue={item.text} className="bg-slate-700 p-3 w-full border-0" />
      <div className=" p-3 pt-0 md:pt-3 text-base text-slate-400 ">{getSubListName(item?.sublistId)}</div>

      <div className="px-2 justify-self-end ">
        <button onClick={handlePriority} className={priorityClasses}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
          </svg>
        </button>

        <button onClick={handleCompleted} className={completedClasses}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <input type="hidden" name="completed" defaultValue="" />
      <input type="hidden" name="transaction" defaultValue="updateItem" />
      <input type="hidden" name="order" defaultValue={item.order} />
      <input type="hidden" name="url2" defaultValue="" />
      <input type="hidden" name="url3" defaultValue="" />
      <input type="hidden" name="status" defaultValue="" />
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
