import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";

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

interface ItemPlacedResponse {
    itemPlaceds: ItemPlaced[];
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
            const itemPlaceds = (data || []).map((item) => ({
                id: `${item.x}-${item.y}`, // Create a unique id
                itemId: item.item_id,
                player: item.player,
                x: item.x,
                y: item.y,
            }));

            return { itemPlaceds };
        },
        refetchInterval: 2000, // Refetch every 5 seconds
        refetchOnWindowFocus: true,
    });
}

