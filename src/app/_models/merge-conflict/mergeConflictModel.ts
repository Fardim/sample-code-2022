export class ConflictedRecordDetails {
    header?: HeaderDetails
    hierarchy?: HierarchyMergeDetails[]
}

export class HeaderDetails {
    fields?: FieldMergeDetails[]
    grids?: GridMergeDetails[]
}

export class FieldMergeDetails {
    fieldId: string
    fieldDesc: string
    base: FieldEntry
    cr: FieldEntry
}

export class FieldEntry {
    value: string
    isChecked: boolean
    enabled: boolean
}

export class HierarchyMergeDetails {
    hierarchyId: string
    hierarchyDesc: string
    fields: FieldMergeDetails[]
    childs: HierarchyMergeDetails[]
    grids: GridMergeDetails[]
}

export class GridMergeDetails {
    fieldDesc: string
    fieldId: string
    fields: Field[]
    conflict?: {
        changed?: GridRowDetails[]
        deleted?: GridRowDetails[]
    }
    base?: {
        newRow: GridRowDetails[]
    }
    cr?: {
        newRow: GridRowDetails[]
    }
    activeView?: 0 | 1 | 2 = 0
}

export class GridRowDetails {
    _action: {
        selectedRow?: string
        isRetain: boolean
        saveRow?: boolean
    }
    fields: FieldMergeDetails[]
}

export class Field {
    fieldId: string
    fieldDesc: string
}

export class ConflictedRecord {
    crId: string
    rec_num: string
    count?: number
    childs?: ConflictedRecord[]
}