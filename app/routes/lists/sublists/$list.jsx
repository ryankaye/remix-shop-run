import { useLoaderData, useTransition, useSubmit } from "@remix-run/react";
import { Form, Link } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { addSubList, updateListSubLists, getAllUserData } from "~/utils/db.server";
import { Nav } from "~/components/nav";
import { useRef, useEffect } from "react";
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

  if (transaction === "addSublist") {
    const addSublistResult = await addSubList(data);
    return json({ status: "Successfully added" });
  }

  if (transaction === "updateSublist") {
    const updateSublistsResult = await updateListSubLists(data);
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
  const submit = useSubmit();
  const handleChange = (event) => submit(event.currentTarget);

  if (currentList === -1) return <ListNotFound lists={lists} />;

  const list = lists[currentList];

  return (
    <>
      <Nav lists={lists} />
      <main>
        <div key={list?.id}>
          <div className="flex flex-col md:flex-row gap-5 mb-10 md:items-center">
            <h2>{list?.name} sublists</h2>

            <Link to={list.id ? "/lists/" + list.id : ""} className=" flex gap-3 items-center bg-cyan-900 p-2 px-4 mt-6 md:mt-0 w-full md:w-auto text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to list
            </Link>
          </div>

          <AddSubListForm listId={list?.id} transition={transition} />

          <Form method="POST" className=" mb-7 mt-10 flex flex-col gap-4" onChange={handleChange}>
            <input type="hidden" name="listId" defaultValue={list?.id} />
            <input type="hidden" name="transaction" defaultValue="updateSublist" />
            <input type="hidden" name="noOfItems" defaultValue={list.subLists?.length} />

            {list.subLists?.map((sublist, index) => {
              return (
                <div key={sublist.id} className="border-cyan-700">
                  <EditSubListForm sublist={sublist} listId={list?.id} transition={transition} index={index} />
                </div>
              );
            })}
          </Form>
        </div>
      </main>
    </>
  );
}

/*
  Component Edit SubList Form 
*/
function EditSubListForm({ sublist, listId, transition, index }) {
  const orderRef = useRef();
  const handleClick = (e, order, act) => (orderRef.current.value = order + act);

  const renderName = (n) => n + "|" + index;
  return (
    <div className="flex bg-slate-700">
      <input type="hidden" name={renderName("id")} defaultValue={sublist.id} />
      <input type="hidden" ref={orderRef} name={renderName("order")} defaultValue={sublist.order} className="text-slate-700" />
      <input type="hidden" name={renderName("hiddenorder")} defaultValue={sublist.order} />

      <input type="text" name={renderName("name")} defaultValue={sublist.name ? sublist.name : ""} className="bg-slate-700 text-cyan-400  border-none text-xl grow p-2 w-2/3 " />

      <button onClick={(e) => handleClick(e, sublist.order, -1)} className="px-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18" />
        </svg>
      </button>
      <button onClick={(e) => handleClick(e, sublist.order, 1)} className="px-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25L12 21m0 0l-3.75-3.75M12 21V3" />
        </svg>
      </button>
    </div>
  );
}

/*
  Component Add Sub List Form
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
    <div className="my-2 mb-6   border-none">
      <Form method="post" ref={form} className="flex flex-col md:flex-row gap-3 items-center  py-2 ">
        <input type="hidden" name="listId" defaultValue={listId} />
        <input type="hidden" name="order" defaultValue="0" />
        <input type="hidden" name="transaction" defaultValue="addSublist" />

        <input type="text" name="name" placeholder="Enter title for new sublist" className="bg-slate-600 text-white p-2  w-full grow border-none " />
        <button className="p-2 flex items-center justify-center grow  w-full md:w-1/12 bg-cyan-600 rounded-none" defaultValue="save" type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </Form>
    </div>
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
