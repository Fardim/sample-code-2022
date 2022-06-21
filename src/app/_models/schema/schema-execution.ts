export class SchemaExecutionRequest {
    schemaId: string;
    variantId: string;
    runId: string;
    userId: string;
    platCode: string;
}

/**
 * Interface to schema execution progress
 */
export interface SchemaExecutionProgressResponse {
    schemaId: number;
    percentage: number;
    totalRules: number;
    completedRules: number;
    ruleDesc: string;
}

export class SchemaExecutionTree {
    nodeId: string;
    nodeDesc: string;
    nodeType: SchemaExecutionNodeType;
    childs: SchemaExecutionTree[];
    docCount: number
}

export enum SchemaExecutionNodeType {
    HEADER = 'HEADER',
    HEIRARCHY = 'HEIRARCHY',
    GRID = 'GRID'
}
