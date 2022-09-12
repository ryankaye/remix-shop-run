import { Form, useActionData, Link } from "@remix-run/react";
import { setUserSession } from "~/utils/session.server";

export const action = async ({ request }) => setUserSession(request);

export default function Login() {
  const actionData = useActionData();

  return (
    <>
      <main>
        <Form method="post" className="mx-auto my-10 md:w-1/2 flex flex-col gap-4">
          <h2 className="py-2 border-b border-slate-400">Sign in</h2>
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="text" className="p-2 text-slate-800" />

          <label htmlFor="password">Password:</label>
          <input id="password" name="password" type="password" className="p-2 text-slate-800" />

          <div className="my-5 text-center">
            <button className="w-2/3 border-none bg-cyan-600 p-2">Login</button>
          </div>

          <p className="text-center">
            <Link to="/signup">Create account</Link>
          </p>

          {actionData?.error && <div className="text-center">{actionData?.error?.message} </div>}
        </Form>
      </main>
    </>
  );
}
