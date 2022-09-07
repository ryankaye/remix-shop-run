export const convertToUTCDate = (d) => new Date(Date.parse(d)).toISOString();

export const getSlug = (value) => value.toLowerCase().replaceAll(" ", "-");
