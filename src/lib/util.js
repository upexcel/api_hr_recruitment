export default function(err) {
    if (typeof err === "string") {
        return {
            message: err,
            error: 1
        };
    } else if (err.message || err.error) {
        return {
            message: err.message || err.error,
        };
    }
    return err;
}