import { json, redirect } from "@remix-run/node";
import { getContacts, createEmptyContact } from "./data";
import {
  Form,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import appStylesHref from "./app.css?url";
import { useEffect, useState } from "react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

export default function App() {
  const navigation = useNavigation();
  const { contacts, q } = useLoaderData<typeof loader>();
  // the query now needs to be kept in state
  const [query, setQuery] = useState(q || "");
  const submit = useSubmit();
  // we still have a `useEffect` to synchronize the query
  // to the component state on back/forward button clicks
  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form
              id="search-form"
              onChange={(event) => submit(event.currentTarget)}
              role="search"
            >
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
                onChange={(event) => setQuery(event.currentTarget.value)}
                value={query}
              />
              <div id="search-spinner" aria-hidden hidden={true} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      <div style={{ display: "flex" }}>
                        <Link to={`contacts/${contact.id}`}>
                          {contact.first || contact.last ? (
                            <>
                              {contact.first} {contact.last}
                            </>
                          ) : (
                            <i>No Name</i>
                          )}{" "}
                          {contact.favorite ? <span>★</span> : null}
                        </Link>
                      </div>
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div
          className={navigation.state === "loading" ? "loading" : ""}
          id="detail"
        >
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
