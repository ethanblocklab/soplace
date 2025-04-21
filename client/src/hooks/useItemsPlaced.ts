import { useQuery } from "@tanstack/react-query";
import { executeQuery } from "@/config/graphql";
import { getItemDimensions } from "@/data/itemMetadata";

// Types for the GraphQL response
interface ItemPlaced {
    id: string;
    itemId: number;
    player: string;
    x: number;
    y: number;
}

// Extended interface with dimensions
export interface EnhancedItemPlaced extends ItemPlaced {
    width: number;
    height: number;
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
 * and enhance them with dimension data from metadata
 */
export function useItemsPlaced() {
    return useQuery<{ itemPlaceds: EnhancedItemPlaced[] }>({
        queryKey: ["itemsPlaced"],
        queryFn: async () => {
            const response = await executeQuery<ItemPlacedResponse>(
                ITEMS_PLACED_QUERY
            );

            // Enhance items with dimensions from metadata
            const enhancedItems = response.itemPlaceds.map((item) => {
                const dimensions = getItemDimensions(item.itemId);
                return {
                    ...item,
                    width: dimensions.width,
                    height: dimensions.height,
                };
            });

            return { itemPlaceds: enhancedItems };
        },
        refetchInterval: 5000, // Refetch every 5 seconds
        refetchOnWindowFocus: true,
    });
}

