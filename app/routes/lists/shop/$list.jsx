import { useLoaderData, useSubmit } from "@remix-run/react";
import { Form, Link } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
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

  const shops = removeDuplicates(items.map((el) => el.url1))
    .filter((el) => el !== "")
    .sort();

  return (
    <>
      <Nav lists={lists} />
      <main>
        <div className="flex gap-5 items-baseline mb-8">
          <h2>{loadList[0]?.name}</h2>
          <Link to={loadList[0].id ? "/lists/" + loadList[0].id : ""} className="flex items-center">
            List view
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
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

  return (
    <Form method="POST" key={item.id} className="flex flex-wrap md:flex-nowrap gap-y-0 md:gap-2 mb-4 bg-slate-700 items-center relative" onChange={handleChange}>
      <input type="hidden" name="transaction" defaultValue="updateItem" />
      <input type="hidden" name="order" defaultValue={item.order} />
      <input type="hidden" name="url2" defaultValue="" />
      <input type="hidden" name="url3" defaultValue="" />
      <input type="hidden" name="status" defaultValue="" />
      <input type="hidden" name="id" defaultValue={item.id} />
      <input type="hidden" name="sublistId" defaultValue={item?.sublistId} />
      <input type="hidden" name="due" defaultValue={item.due ? item.due : ""} />

      <input type="text" name="text" defaultValue={item.text} className="bg-slate-700 p-3 grow border-0" />
      <div className="w-10/12 md:w-3/12 p-3 pt-0 md:pt-3 text-base text-slate-400 border-0 ">{getSubListName(item?.sublistId)}</div>

      <input type="checkbox" name="completed" defaultChecked={item.completed === "on" ? "checked" : ""} className="h-5 w-5 absolute right-3 bottom-1/3 " />
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
