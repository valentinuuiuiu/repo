import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
