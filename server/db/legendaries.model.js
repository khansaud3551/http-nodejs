module.exports = (mongoose) => {
    const Legendary = mongoose.model(
        "Legendary",
        mongoose.Schema({
            name: String,
            dataURL: String,
            description: String,
            tokenId: Number,
            owner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            price: { type: Number, default: 0 },
            lastPrice: { type: Number, default: 0 },
            auctionPeriod: { type: Number, default: 0 },
            auctionStarted: { type: Number, default: 0 },
            isSold: { type: Number, default: 0 }, // 0: not, 1: sold
            isVisible: {type: Number, default: 0 }, // 0: false, 1; true
            winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
            winnerName: String,
            bids: [
                {
                    user_id: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User"
                    },
                    username: String,
                    price: Number,
                    Time: String
                }
            ],
            likes: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }
            ]
        }, { timestamps: true }
        )
    );
    return Legendary;
}