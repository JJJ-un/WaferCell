import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchNewsList } from '@/entities/stock/api/fetchNews';

export const useNewsQuery = () => {
  console.log("📡 [useNewsQuery 훅 호출]");
  return useInfiniteQuery({
    queryKey: ['stocks', 'news'],
    queryFn: ({ pageParam }) => fetchNewsList(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 15) return undefined;
      return allPages.length * 15 + 1;
    },
  })
};
