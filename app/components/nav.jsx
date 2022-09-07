import { NavLink } from "@remix-run/react";
import { useState } from "react";

/*
  Main nav 
*/
export function Nav({ lists }) {
  const [menuState, setMenuState] = useState("closed");

  const handleMenu = (event) => setMenuState(event.currentTarget.dataset.state === "" ? "closed" : "");

  return (
    <>
      <div className="bg-slate-800 p-2 md:p-4 fixed z-10 top-0 right-0 ">
        <button className="p-1 md:p-2 " onClick={handleMenu} data-state={menuState}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <nav id="nav" className="bg-slate-900 p-4 overflow-y-auto fixed z-20 top-0 bottom-0 right-0" data-state={menuState}>
        <div className="flex">
          <h2 className="flex-1">My lists</h2>
          <button className="p-2 " onClick={handleMenu} data-state={menuState}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </button>
        </div>
        <ul className="mt-3">
          <li className="py-5 border-t border-slate-500">
            <NavLink to="/lists/" onClick={handleMenu} data-state={menuState}>
              All my lists
            </NavLink>
          </li>
          {lists?.map((list) => {
            return (
              <li key={list.id} className="py-5 border-t border-slate-500">
                <NavLink to={list.id ? "/lists/" + list.id : ""} onClick={handleMenu} data-state={menuState}>
                  {list?.name}
                </NavLink>
              </li>
            );
          })}

          <li className="py-5 border-t border-slate-500">
            <NavLink to="/account/" onClick={handleMenu} data-state={menuState}>
              My account
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}
