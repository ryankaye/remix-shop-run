import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { supabaseClient } from "./db.server";

const secrets = process.env.SESSION_SECRET;

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "sb:token",
    // all of these are optional
    //expires: new Date(Date.now() + 60),
    //httpOnly: true,
    //maxAge: 60,
    //path: "/",
    sameSite: "lax",
    secrets: [secrets],
    secure: true,
  },
});

/*
  SESSION HELPERS
*/

/* setUserSession() */
const setUserSession = async (request) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");

  const { data, error } = await supabaseClient.auth.signIn({ email, password });

  if (data) {
    const session = await getSession(request.headers.get("Cookie")); // get session and set access_token
    session.set("access_token", data.access_token);
    session.set("user_id", data.user.id);
    session.set("user_email", data.user.email);

    return redirect("/lists/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
  return { data, error };
};

/* destroyUserSession() */
const destroyUserSession = async (request) => {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
};

/* signUpUser() */
const signUpUser = async (request) => {
  let form = await request.formData();
  let email = form.get("email");
  let password = form.get("password");

  await supabaseClient.auth.signOut();
  const { session: data, user, error } = await supabaseClient.auth.signUp({ email, password });

  if (!error) {
    const session = await getSession(request.headers.get("Cookie"));
    session.set("access_token", data.access_token);
    session.set("user_id", user.id);
    session.set("user_email", user.email);

    return redirect("/account", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return { user, error };
};

export { getSession, commitSession, destroySession, setUserSession, destroyUserSession, signUpUser };
