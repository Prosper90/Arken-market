export const isEmpty = value =>
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0);

export const isImgEmpty = value =>
    value === undefined ||
    value === null ||
    (typeof value != 'object')

export const isBoolean = value => (
    (typeof value === 'boolean' && (value === true || value === false)) ||
    (typeof value === 'string' && (value === 'true' || value === 'false'))
)