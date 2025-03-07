import mongoose from "mongoose";
import { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,//one who is subscribing
        ref: "User",
        required: true,
    },
    channel:{
        type: Schema.Types.ObjectId,//one who is being subscribed to
        ref: "User",
    }
},{
    timestamps: true
});

export default mongoose.model("subscriptionSchema", subscriptionSchema);