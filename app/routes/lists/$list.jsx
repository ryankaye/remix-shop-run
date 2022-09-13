import { useLoaderData, useTransition, useSubmit } from "@remix-run/react";
import { Form, Link } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { getAllUserData, updateItem, addItem, addSubList, updateSubList } from "~/utils/db.server";
import { Nav } from "~/components/nav";
import { useRef, useEffect, useState } from "react";
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

  if (currentList === -1) return <ListNotFound lists={lists} />;

  const loadList = [lists[currentList]];

  return (
    <>
      <Nav lists={lists} />
      <main>
        {loadList?.map((list) => {
          return (
            <div key={list?.id}>
              <div className="flex flex-col md:flex-row gap-5 mb-10 md:items-center">
                <h2>{list?.name}</h2>

                <Link to={list.id ? "/lists/shop/" + list.id : ""} className=" text-white flex gap-3 items-center bg-cyan-900 p-2 px-4 mt-6 md:mt-0  w-full md:w-auto">
                  <span className="grow">Shop view</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>

                <Link to={list.id ? "/lists/priorities/" + list.id : ""} className=" text-white flex gap-3 items-center bg-cyan-900 p-2 px-4 md:mt-0 w-full md:w-auto">
                  <span className="grow">Priorities view</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>

                <Link to={list.id ? "/lists/sublists/" + list.id : ""} className=" text-white flex gap-3 items-center bg-cyan-900 p-2 px-4 md:mt-0 w-full md:w-auto">
                  <span className="grow">Manage sublists</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>

              {list?.subLists?.map((sublist) => {
                return (
                  <div key={sublist.id} className="border-cyan-700">
                    <EditSubListForm sublist={sublist} listId={list?.id} transition={transition} />

                    {sublist?.items?.map((item) => {
                      return (
                        <div key={item?.id}>
                          <EditItemForm item={item} sublist={sublist} />
                        </div>
                      );
                    })}
                    <AddItemForm subListId={sublist.id} transition={transition} />
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
    Component Edit Item Form
*/
function EditItemForm({ item, sublist }) {
  const submit = useSubmit();

  const [status, setStatus] = useState(item.status);

  const handleChange = (event) => submit(event.currentTarget);

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

  const priorityClasses = (status === "Priority" ? "text-cyan-400 " : "text-slate-400") + " absolute md:static bottom-7 right-14  ";
  const completedClasses = (status === "Completed" ? "text-cyan-400 " : "text-slate-400") + " absolute md:static bottom-7 right-2 px-3 ";

  return (
    <Form method="post" className="flex gap-x-1 flex-wrap md:flex-nowrap bg-slate-700 mb-4 relative items-center" onChange={handleChange}>
      <input type="hidden" name="transaction" defaultValue="updateItem" />
      <input type="hidden" name="order" defaultValue={item.order} />
      <input type="hidden" name="url2" defaultValue="" />
      <input type="hidden" name="url3" defaultValue="" />
      <input type="hidden" name="status" defaultValue={status ? status : ""} />
      <input type="hidden" name="id" defaultValue={item.id} />
      <input type="hidden" name="sublistId" defaultValue={sublist.id} />
      <input type="hidden" name="due" defaultValue={item.due ? item.due : ""} />
      <input type="hidden" name="completed" defaultValue="" />

      <input type="text" name="text" defaultValue={item.text ? item.text : ""} placeholder="Item" className="bg-slate-700 text-white px-3 pt-3 pb-1 md:p-3 w-full  md:w-1/2 border-0  " />
      <input type="text" name="url1" defaultValue={item.url1 ? item.url1 : ""} placeholder="Shop / brand" className="bg-slate-700 text-slate-400 md:text-slate-300 px-3 pb-3 md:p-3 grow border-0  " />
      <input type="text" name="price" defaultValue={item.price ? item.price : ""} placeholder="£" className="hidden md:block bg-slate-700 text-slate-400 w-1/12 border-0 p-3 text-right" />

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
    </Form>
  );
}

/*
    Component Add Item Form
*/
function AddItemForm({ subListId, transition }) {
  const transitioning = transition.state;
  const addItemForm = useRef();

  useEffect(() => {
    if (transitioning === "loading") {
      addItemForm.current?.reset();
    }
  }, [transitioning]);

  return (
    <Form method="post" className="flex gap-x-1 flex-wrap md:flex-nowrap bg-slate-700 mb-4 relative items-center" ref={addItemForm}>
      <input type="hidden" name="transaction" defaultValue="addItem" />
      <input type="hidden" name="order" defaultValue="999" />
      <input type="hidden" name="url2" defaultValue="" />
      <input type="hidden" name="url3" defaultValue="" />
      <input type="hidden" name="status" defaultValue="Default" />
      <input type="hidden" name="sublistId" defaultValue={subListId} />
      <input type="hidden" name="due" />
      <input type="hidden" name="completed" defaultValue="" />

      <input type="text" name="text" placeholder="Add new item" className="bg-slate-700 text-white px-3 pt-3 pb-1 md:p-3 w-full  md:w-1/2 border-0 " />
      <input type="text" name="url1" defaultValue="" placeholder="Shop / brand" className="bg-slate-700 text-slate-400  px-3 pb-3 md:p-3 grow border-0" />
      <input type="text" name="price" defaultValue="" placeholder="£" className="hidden md:block bg-slate-700 text-slate-400 w-1/12 border-0 p-3 text-right" />

      <button className=" flex items-center justify-center   absolute md:static bottom-1/3 right-3  px-5" defaultValue="save" type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 bg-cyan-500 p-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </Form>
  );
}

/*
  Component Add Sub List Form

function AddSubListForm({ listId, transition }) {
  const transitioning = transition.state;

  const form = useRef();
  const details = useRef();

  useEffect(() => {
    if (transitioning === "loading") {
      form.current?.reset();
      details.current?.removeAttribute("open");
    }
  }, [transitioning]);

  return (
    <details className="my-2 mb-6 p-3 bg-cyan-800 border-none" ref={details}>
      <summary className="text-lg cursor-pointer text-cyan-200">
        <span className="inline-block ml-1">New sublist</span>
      </summary>

      <Form method="post" ref={form} className="flex flex-col md:flex-row gap-3 items-center mt-2 py-2 ">
        <input type="hidden" name="listId" defaultValue={listId} />
        <input type="hidden" name="order" defaultValue="0" />
        <input type="hidden" name="transaction" defaultValue="addSublist" />

        <input type="text" name="name" placeholder="Enter title for new sublist" className="bg-cyan-700 text-white p-2  w-full grow border-none placeholder:text-cyan-300" />
        <button className="p-2 flex items-center justify-center grow  w-full md:w-1/12 bg-cyan-600 rounded-none" defaultValue="save" type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </Form>
    </details>
  );
}
*/

/*
  Component Edit SubList Form 
*/
function EditSubListForm({ sublist, listId, transition }) {
  const submit = useSubmit();
  const handleChange = (event) => submit(event.currentTarget);

  return (
    <Form method="POST" className=" mb-7 mt-10 flex" onChange={handleChange}>
      <input type="hidden" name="id" defaultValue={sublist.id} />
      <input type="hidden" name="listId" defaultValue={listId} />

      <input type="hidden" name="transaction" defaultValue="updateSublist" />

      <input type="text" name="name" defaultValue={sublist.name ? sublist.name : ""} className="bg-slate-800 text-cyan-400  border-none text-xl grow p-2" />
      <input type="hidden" name="order" defaultValue={sublist.order} className="md:w-1/12 bg-slate-800 text-slate-400 border-none text-center" />
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
