import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Name of the sequence (e.g. 'userId', 'productId')
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

export const getNextSequence = async (sequenceName, startAt = 1) => {
    const sequenceDocument = await Counter.findByIdAndUpdate(
        sequenceName,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    // If it's a new sequence and startAt is specified (e.g., 1000 for orders), we need to ensure it starts at the right number.
    // However, the first upsert will set it to startAt if we change logic, but the $inc always makes it 1 if it didn't exist.
    // We can handle startAt by adjusting the return value if it's the very first time.
    if (sequenceDocument.seq === 1 && startAt > 1) {
        sequenceDocument.seq = startAt;
        await sequenceDocument.save();
    }
    return sequenceDocument.seq;
};

export default Counter;
