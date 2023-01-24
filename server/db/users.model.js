module.exports = (mongoose) => {
    const User = mongoose.model(
        "User",
        mongoose.Schema({
            address: String,
            username: String,
            avatar: String,
            pernum: String,
            verified: Boolean,
            yem: { type: Number, default: 0 },
            sponsorName: String,
            sponsorAddress: String,
            password: String,
            mail: String,
            follows: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }]
        }, { timestamps: true })
    );

    return User;
}