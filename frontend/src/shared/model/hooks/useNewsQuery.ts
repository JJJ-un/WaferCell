  // 무한 스크롤을 위한 useInfiniteQuery 사용
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchNewsList } from '@/entities/stock/api/fetchNews';
  
export const useNewsQuery = () => {
  return useInfiniteQuery({
    queryKey: ['stocks', 'news'],
    queryFn: ({ pageParam }) => fetchNewsList(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
  })
};

