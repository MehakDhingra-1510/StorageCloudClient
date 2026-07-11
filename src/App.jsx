import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import Register from "./Register";
import "./App.css";
import Login from "./Login";
import UsersPage from "./UsersPage";
import Home from "./Home";
import TrashView from "./TrashView";
import SharedWithMe from "./SharedWithMe";
import SharedByMe from "./SharedByMe";
import SharedLinkView from "./SharedLinkView";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/drive",
    element: <DirectoryView />,
  },
  {
    path: "/drive/users",
    element: <UsersPage />,
  },
  {
    path: "/drive/directory/:dirId",
    element: <DirectoryView />,
  },
  {
    path: "/drive/trash",
    element: <TrashView />,
  },
  {
    path: "/drive/shared-with-me",
    element: <SharedWithMe />,
  },
  {
    path: "/drive/shared-by-me",
    element: <SharedByMe />,
  },
  {
    // Public — no auth required, matches the CLIENT_URL/share/:token links the server generates.
    path: "/share/:token",
    element: <SharedLinkView />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
