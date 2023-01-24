module.exports = (mongoose) => {
    const Numbers = mongoose.model(
        "Number",
        mongoose.Schema({
            value: { type: Number, required: true }
        })
    );
    return Numbers;
};
