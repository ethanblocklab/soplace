import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { getItemDimensions } from "@/data/itemMetadata";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Types to match the GraphQL response
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
    itemPlaceds: EnhancedItemPlaced[];
}

/**
 * Hook to fetch all placed items from Supabase
 * Returns data in the same format as useItemsPlaced for compatibility
 */
export function useItemsPlacedSupabase() {
    return useQuery<ItemPlacedResponse>({
        queryKey: ["itemsPlacedSupabase"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("item_placed")
                .select("*");

            if (error) {
                throw new Error(
                    `Error fetching placed items: ${error.message}`
                );
            }

            // Transform Supabase data to match GraphQL response format
            const itemPlaceds = (data || []).map((item) => {
                const dimensions = getItemDimensions(item.item_id);
                return {
                    id: `${item.x}-${item.y}`, // Create a unique id
                    itemId: item.item_id,
                    player: item.player,
                    x: item.x,
                    y: item.y,
                    width: dimensions.width,
                    height: dimensions.height,
                };
            });

            return { itemPlaceds };
        },
        refetchInterval: 2000, // Refetch every 5 seconds
        refetchOnWindowFocus: true,
    });
}

