import { useQuery } from "@tanstack/react-query";
import { executeQuery } from "@/config/graphql";

// Types for the GraphQL response
interface ItemPlaced {
    id: string;
    itemId: number;
    player: string;
    x: number;
    y: number;
}

interface ItemPlacedResponse {
    itemPlaceds: ItemPlaced[];
}

// GraphQL query to fetch all placed items
const ITEMS_PLACED_QUERY = `
  query FetchItemsPlaced {
    itemPlaceds {
      id
      itemId
      player
      x
      y
    }
  }
`;

/**
 * Hook to fetch all placed items from the subgraph
 */
export function useItemsPlaced() {
    return useQuery<ItemPlacedResponse>({
        queryKey: ["itemsPlaced"],
        queryFn: async () => {
            return executeQuery<ItemPlacedResponse>(ITEMS_PLACED_QUERY);
        },
        refetchInterval: 30000, // Refetch every 30 seconds
        refetchOnWindowFocus: true,
        staleTime: 10000,
    });
}

