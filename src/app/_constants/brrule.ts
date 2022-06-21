export const CONDITIONS = {
    common: {
        desc: 'Common Operator',
        operators: [
            'EQUAL',
            'NOT_EQUAL',
            'STARTS_WITH',
            'ENDS_WITH',
            'CONTAINS',
            'EMPTY',
            'NOT_EMPTY',
            'LENGTH',
            'LENGTH_LESS_THEN',
            'LENGTH_GREATER_THEN'
        ]
    },
    numeric: {
        desc: 'Numeric Operators',
        operators: [
            'RANGE',
            'LESS_THAN',
            'LESS_THAN_EQUAL',
            'GREATER_THAN',
            'GREATER_THAN_EQUAL',
        ]
    },
    special: {
        desc: 'Special Operators',
        operators: [
            'REGEX',
            'LOCATION'
        ]
    },

}