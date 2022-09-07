export const getReadableDate = (timestamp) => (!timestamp ? "" : new Date(timestamp).toLocaleDateString("en-GB"));

export const getFormDate = (date) => new Date(date).toISOString().split("T")[0];

export const stripHtml = (html) => html.replace(/(<([^>]+)>)/gi, "").replace(/&.*;/gi, " ");
