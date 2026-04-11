import { useInfiniteQuery } from "@tanstack/react-query";

export interface InfiniteScrollResponse<T> {
  result: T[];
  hasMore: boolean;
  lastId: number | null;
}

interface Identifiable {
  id: number;
}

interface InfiniteScrollOptions<T extends Identifiable> {
  queryKey: string;
  fetchFn: (params: { limit: number; lastId: number; }) => Promise<InfiniteScrollResponse<T>>;
}

export const useInfiniteScroll = <T extends Identifiable>({ queryKey, fetchFn }: InfiniteScrollOptions<T>) => {

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useInfiniteQuery({
      queryKey: [queryKey],
      queryFn: ({ pageParam = 0 }) =>
        fetchFn({
          limit: 12,
          lastId: pageParam,
        }),
      getNextPageParam: (lastPage) => {
        if (!lastPage.hasMore) return undefined;
        const lastItem = lastPage.result[lastPage.result.length - 1];
        return lastItem.id;
      },
      initialPageParam: 0,
      });
    
      const items = data?.pages.flatMap((page) => page.result) ?? [];
      
      return {
        items,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        isError,
        error,
      };
}