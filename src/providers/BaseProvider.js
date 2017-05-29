export const throwIfNotExists = (error, body) => {
    if (!body) {
        throw new Error(error || "Failed to load item");
    }
    return body;
};

export const throwIfExists = (error, body) => {
    if (body) {
        throw new Error(error || "Item already exists");
    }
    return body;
};
