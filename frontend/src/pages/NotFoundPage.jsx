import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <SearchX size={32} />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
          Page Not Found
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
};

export default NotFoundPage;
