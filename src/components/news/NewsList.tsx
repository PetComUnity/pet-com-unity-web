// components/news/NewsList.tsx

import { NewsCard } from "./NewsCard";

export function NewsList() {
  return (
    <div className="grid w-full grid-cols-1 justify-items-center gap-8 md:grid-cols-2 lg:grid-cols-3">
      <NewsCard />
      <NewsCard />
      <NewsCard />
    </div>
  );
}
