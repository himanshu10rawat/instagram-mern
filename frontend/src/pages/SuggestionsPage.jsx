import SuggestedUsers from "../features/profile/components/SuggestedUsers";

const SuggestionsPage = () => {
  return (
    <section className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
        Suggested
      </h1>

      <SuggestedUsers limit={0} showHeader={false} />
    </section>
  );
};

export default SuggestionsPage;
