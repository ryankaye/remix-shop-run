import { Link, Form, useActionData } from "@remix-run/react";
import { signUpUser } from "~/utils/session.server";

export let action = async ({ request }) => signUpUser(request);

export default function CreateAccount() {
  const actionData = useActionData();

  return (
    <>
      <main id="app">
        <Form method="post" className="mx-auto my-10 md:w-1/2 flex flex-col gap-5">
          <h2 className="py-2 border-b border-slate-400">Create an account</h2>

          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="text" className="p-2 text-slate-800" />

          <label htmlFor="password">Password:</label>
          <input id="password" name="password" type="password" className="p-2 text-slate-800" />

          <label htmlFor="password">Invite code:</label>
          <input id="invite" name="password" type="text" className="p-2 text-slate-800" />

          <div className="mt-5 text-center">
            <button className="w-2/3 border p-2">Create account</button>
          </div>

          {actionData?.error && <div>{actionData?.error?.message} </div>}
          <p className="text-center">
            <Link to="/login" replace={true}>
              Login
            </Link>
          </p>
        </Form>
      </main>
    </>
  );
}
