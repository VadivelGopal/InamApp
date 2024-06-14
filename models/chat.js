const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    recipient:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    sender:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    content:{type: String},
    imageUrls:[String],
    videoUrls:[String],
    timestamp:{type: Date,default: Date.now},
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
