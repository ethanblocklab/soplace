import { GraphQLClient } from "graphql-request";

// Define the GraphQL endpoint from environment or use default
const GRAPHQL_ENDPOINT =
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
    "https://api.thegraph.com/subgraphs/name/your-subgraph-name";

// Create a GraphQL client instance
export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT);

// Helper function to execute GraphQL queries
export async function executeQuery<T>(
    query: string,
    variables?: any
): Promise<T> {
    try {
        return await graphqlClient.request<T>(query, variables);
    } catch (error) {
        console.error("GraphQL query error:", error);
        throw error;
    }
}

