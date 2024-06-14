const mongoose=require("mongoose");

const familyMemberSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    connections: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
  });

const userSchema = new  mongoose.Schema({
    accCreatedfor :{ type:String, required:true},
    profileImage : String,
    username : { type:String, required:true, unique:true},
    fname:{ type:String, required:true},
    lname:{ type:String, required:true},
    mobileno: {type:Number, required: true, unique:true},
    email:{ type:String, required:true, unique:true},
    password:{ type:String, required:true},
    userDescription:{ type:String, default:null},
    highesteducation:{ type:String, default:null},
    profession:{ type:String, default:null},
    city:{ type:String, default:null},
    state:{ type:String, default:null},
    country:{ type:String, default:null},
    anchestralorigin:{ type:String, default:null},
    community:{ type:String, default:null},
    nationality:{ type:String, default:null},
    familymembers:[familyMemberSchema],
    connections: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Assuming this is for referencing user objects
        relation: { type: String }
    }],
    connectionRequest:  [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Assuming this is for referencing user objects
        relation: { type: String }
    }],
    sentConnectionRequests: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Assuming this is for referencing user objects
        relation: { type: String }
    }],
    posts:[{type:mongoose.Schema.Types.ObjectId, ref:"posts"}],
    chat:[{type:mongoose.Schema.Types.ObjectId, ref:"chat"}],
    notifications:[{type:mongoose.Schema.Types.ObjectId, ref:"notofications"}],
    createdAt:{type:Date, default:Date.now}
});

const User=mongoose.model("User",userSchema);

module.exports=User;