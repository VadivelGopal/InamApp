const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer")
const cors = require("cors");
const { ObjectId } = mongoose.Types;
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const jwt = require("jsonwebtoken");

const connectionString = "mongodb+srv://gopalarthi2014:ZpAhpWClYp7Vtoiy@inamapp.sgxgwjd.mongodb.net/?retryWrites=true&w=majority&appName=InamApp";
//const dbURI = process.env.MONGODB_URI;

//mongoose.connect("mongodb://localhost:27017", {
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("connected to MongoDB")
}).catch((err) => {
  console.log(err)
});

app.listen(port, () => {
  console.log('server is running' + port);
});

const User = require("./models/users");
const Post = require("./models/posts");
const Chat = require("./models/chat");
const Notification  = require('./models/notifications');

//to register a user in the backend
app.post("/signup", async (req, res) => {
  try {
    // console.log("inside index.js/signup");
    const { accCreatedfor,
      profileImage,
      username,
      fname,
      lname,
      mobileno,
      email,
      password,
    } = req.body;
    //check email already registered

    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      console.log("This email already registered");
      return res.status(400).json({ message: "email already registered" });
    }

    const newUser = new User({
      accCreatedfor,
      profileImage,
      username,
      fname,
      lname,
      mobileno,
      email,
      password,
    });

    await newUser.save();

    res.status(202).json({ message: "Registration successfull" })

  } catch (error) {
    //  console.log("from index.js: Error creating user",error);
    res.status(500).json({ message: "from index.js: Account creation failed" })
  }
});

// Endpoint for updating user profile
app.post("/ProfileUpdate/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    //const userData  = req.body;
    // Find the user by userId
    const user = await User.findOne({ _id: userId });

    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data
    user.profileImage = req.body.profileImage || user.profileImage
    user.username = req.body.username || user.username;
    user.fname = req.body.fname || user.fname;
    user.lname = req.body.lname || user.lname;
    user.mobileno = req.body.mobileno || user.mobileno;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;
    user.userDescription = req.body.userDescription || user.userDescription;
    user.highesteducation = req.body.highesteducation || user.highesteducation;
    user.profession = req.body.profession || user.profession;
    user.city = req.body.city || user.city;
    user.state = req.body.state || user.state;
    user.country = req.body.country || user.country;
    user.anchestralorigin = req.body.anchestralorigin || user.anchestralorigin;
    user.community = req.body.community || user.community;
    user.nationality = req.body.nationality || user.nationality;
    // Update other fields similarly...

    // Save the updated user
    await user.save();

    // Send a success response
    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
};
const secretKey = generateSecretKey();

//code to login
app.post("/signin", async (req, res) => {
  try {
    //console.log("gopal")
    const { identifier, password } = req.body;

    // Check if account exists using either email or username
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email/username or password" });
    }

    // Check if password matches
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email/username or password" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

//get user profile
app.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    //console.log(userId)
    const user = await User.findById(userId);
    //      console.log(user);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.log("Error retrieving user profile:", error);
    return res.status(500).json({ message: "Error retrieving user profile" });
  }
});



//search family
app.get("/family", async (req, res) => {
  try {
    const searchTerm = req.query.term;
    // Perform search operation using the searchTerm
    const users = await User.find({ username: { $regex: searchTerm, $options: 'i' } });
    res.status(200).json(users);
  } catch (error) {
    console.log("Error searching user names:", error);
    res.status(500).json({ message: "Error searching user names" });
  }
});

//Update User description
app.put("/profile/:userId", async (req, res) => {
  try {
    //  console.log("api/index.js, update user description");
    //const userId = new mongoose.Types.ObjectId(req.params.userId);
    const userId = req.params.userId
    const { userDescription } = req.body;
    //console.log(userId,userDescription)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    await User.findByIdAndUpdate(userId, { userDescription });
    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    console.log("Error updating user Profile", error);
    res.status(500).json({ message: "Error updating user profile" });
  }
});

// upload profileImage
app.put("/profileImage/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { profileImage } = req.body;

    // Check if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // Update the user's profileImage
    const updatedUser = await User.findByIdAndUpdate(userId, { profileImage }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the updated user object in the response
    res.status(200).json({ message: "User profileImage uploaded successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user profileImage:", error);
    res.status(500).json({ message: "Error updating user profileImage" });
  }
});

//get all users profile
app.get("/users/:userId", async (req, res) => {
  try {
    //  console.log("api/index.js, all users profile") 
    const loggedInUserId = req.params.userId;

    //fetch the logged-in user's connections
    const loggedInuser = await User.findById(loggedInUserId).populate(
      "connections",
      "_id"
    );
    if (!loggedInuser) {
      return res.status(400).json({ message: "User not found" });
    }

    //get the ID's of the connected users
    const connectedUserIds = loggedInuser.connections.map(
      (connection) => connection._id
    );

    //find the users who are not connected to the logged-in user Id
    const users = await User.find({
      _id: { $ne: loggedInUserId, $nin: connectedUserIds },
    });

    res.status(200).json(users);
  } catch (error) {
    console.log("Error retrieving users", error);
    res.status(500).json({ message: "Error retrieving users" });
  }
});


//send a connection request
app.post("/connection-request", async (req, res) => {
  try {
    const { currentUserId, selectedUserId, relationship } = req.body;
    //console.log(currentUserId);
    //console.log(selectedUserId);
    //console.log(relationship);
    const user = await User.findById(selectedUserId);
    if (user.connectionRequest.includes(currentUserId)) {
      // If the request already exists, return a 409 Conflict status
      return res.status(409).json({ message: "Connection request already exists" });
    }

    await User.findByIdAndUpdate(selectedUserId, {
      $push: {
        connectionRequest: { user: currentUserId, relation: relationship }
      },
    });

    const currentUser = await User.findById(currentUserId);
    if (currentUser.sentConnectionRequests.includes(selectedUserId)) {
      // If the request already exists, return a 409 Conflict status
      return res.status(409).json({ message: "Connection request already sent" });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $push: {
        sentConnectionRequests: { user: selectedUserId, relation: relationship }
      }
    });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: "Error creating connection request" });
  }
});

//endpoint to show all the connections requests
app.get("/connection-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate({
        path: 'connectionRequest',
        select: 'user relation',
        populate: {
          path: 'user',
          select: 'fname lname profileImage', // Adjust the field names as needed
        }
      })
      .lean();

    const connectionRequests = {
      connectionRequests: user.connectionRequest.map(request => ({
        user: {
          _id: request.user._id,
          fname: request.user.fname,
          lname: request.user.lname,
          profileImage: request.user.profileImage
        },
        relation: request.relation
      }))
    };
    // console.log("Connection Requests1:", user.connectionRequest);
    // console.log("Connection Requests2:", connectionRequests);

    res.json(connectionRequests);
  } catch (error) {
    console.log("show all connection request", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoint to accept a connection request
app.post("/connection-request/accept", async (req, res) => {
  try {
    const { senderId, recepientId, relationship } = req.body;

    const sender = await User.findById(senderId._id);
    const recepient = await User.findById(recepientId);
    //console.log(relationship);

    // Check if sender or recipient is null
    if (!sender || !recepient) {
      return res.status(404).json({ message: "Sender or recipient not found" });
    }

    // Initialize connections array if it's null or undefined
    sender.connections = sender.connections || [];
    recepient.connections = recepient.connections || [];

    //sender.familymembers = sender.familymembers || [];
    // recepient.familymembers = recepient.familymembers || [];

    if (!sender.connections.includes(recepientId)) {
      sender.connections.push({ user: recepientId, relation: relationship });
      // sender.familymembers.push({ user: recepientId });
    }
    if (!recepient.connections.includes(senderId._id)) {
      recepient.connections.push({ user: senderId._id, relation: relationship });
      // recepient.familymembers.push({ user: senderId._id });
    }

    // Check if connectionRequest is undefined and initialize it as an empty array if it is
    recepient.connectionRequest = recepient.connectionRequest || [];

    //console.log("Recipient's connectionRequest before removal:", recepient.connectionRequest);
    // Remove the connection request from recipient's list
    recepient.connectionRequest = recepient.connectionRequest.filter(
      (request) => request.user._id.toString() !== senderId._id.toString()
    );

    // Remove the connection request from recipient's list
    //recepient.connectionRequest = recepient.connectionRequest.filter((request) => {
    //  console.log("Comparing request ID:", request.toString());
    //  console.log("With sender ID:", senderId._id.toString());
    //  return request.user._id.toString() !== senderId._id.toString();
    //});

    //console.log("Recipient's connectionRequest after removal:", recepient.connectionRequest);
    // Similarly, check and initialize sentConnectionRequests for sender
    sender.sentConnectionRequests = sender.sentConnectionRequests || [];

    // Remove the sent connection request from sender's list
    sender.sentConnectionRequests = sender.sentConnectionRequests.filter(
      (request) => request.user._id.toString() !== recepientId.toString()
    );

    await sender.save();
    await recepient.save();
    //console.log(senderId._id);
    //console.log(recepientId);

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoint to fetch all the connections of a user
app.get("/connections/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)


    if (!user) {
      return res.status(404).json({ message: "User is not found" });
    }
    res.status(200).json({ connections: user.connections });
  } catch (error) {
    console.log("error fetching the connections", error);
    res.status(500).json({ message: "Error fetching the connections" });
  }
});

app.put('/updateRelation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { item, value } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Find the connection in the user's connections array by ID
    const connection = user.connections.find(conn => conn._id.toString() === item._id);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    // Update the relation field of the connection
    connection.relation = value;
    // Save the updated user document
    await user.save();
    // Respond with the updated connection
    res.status(200).json(connection);
  } catch (error) {
    console.error('Error updating relation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//endpoint to create a post
app.post("/create", async (req, res) => {
  try {
    const { description, imageUrl, videoUrl, userId } = req.body;
    const newPost = new Post({
      description: description,
      imageUrl: imageUrl,
      videoUrl: videoUrl,
      user: userId,
    });
    await newPost.save();

    // Notify followers about the new post
    const user = await User.findById(userId).populate('connections');
    const followers = user.connections;
    followers.forEach(follower => {
      createNotification(follower.user, 'post', `${user.username} has posted a new update.`, newPost._id, user._id);
    });
    
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.log("error creating the post", error);
    res.status(500).json({ message: "Error creating the post" });
  }
});

const createNotification = async (userId, type, message, postId = null, senderId) => {
  try {
    const newNotification = new Notification({
      userId,
      type,
      message,
      postId,
      senderId,
    });

    await newNotification.save();
    console.log('Notification created successfully');
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

//get all notifications
app.get("/pullnotifications/:userId", async (req, res)=>{
  const { userId } = req.params;
  try {
    //console.log("gopal")
    // Find notifications for the specific user and populate necessary fields
    const notifications = await Notification.find({ userId })
      .populate('userId', 'username profileImage') // Populate user details
      .populate('postId', 'description')           // Populate post details if needed
      .populate('senderId', 'username profileImage') // Populate sender details
      .sort({ createdAt: -1 }); // Sort by createdAt field in descending order
    //console.log(notifications);
    res.status(200).json({ notifications });
  } catch (error) {
    console.log("Error fetching notifications for user ", userId, error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

//endpoint to fetch all the posts
app.get("/all", async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "fname lname profession profileImage");
    //console.log(posts)
    res.status(200).json({ posts });
  } catch (error) {
    console.log("error fetching all the posts", error);
    res.status(500).json({ message: "Error fetching all the posts" });
  }
});

// Endpoint to fetch posts of connections and user's own posts
app.get("/posts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userPosts = await Post.find({ user: userId })
      .populate("user", "fname lname profession profileImage")
      .lean()
      .exec();

    console.log(userPosts)
    return res.status(200).json({userPosts });
  } catch (error) {
    console.error('Error fetching posts in index:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

async function getPostsForUserAndConnections(userId, depth = 1) {
  const user = await User.findById(userId);
  if (!user) {
    return [];
  }

  const userPosts = await Post.find({ user: userId });
  let connectionPosts = [];
  if (depth > 0) {
    for (const connectionId of user.connections) {
      const posts = await getPostsForUserAndConnections(connectionId, depth - 1);
      connectionPosts = connectionPosts.concat(posts);
    }
  }
  return userPosts.concat(connectionPosts);
}

// Endpoint to fetch posts for a user and their connections
app.get("/connections/posts/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    //console.log(userId);
    const allPosts = await getPostsForUserAndConnections(userId);
    return res.status(200).json({ posts: allPosts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//endpoints to like a post
app.post("/like/:postId/:userId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }

    //check if the user has already liked the post
    const existingLike = post?.likes.find(
      (like) => like.user.toString() === userId
    );

    if (existingLike) {
      post.likes = post.likes.filter((like) => like.user.toString() !== userId);
    } else {
      post.likes.push({ user: userId });
    }

    await post.save();

     // Notify followers about the new post
     const user = await User.findById(userId).populate('connections');
     const followers = user.connections;
     followers.forEach(follower => {
       createNotification(follower.user, 'like', `${user.username} has liked your post.`, newPost._id, user._id);
     });

    res.status(200).json({ message: "Post like/unlike successfull", post });
  } catch (error) {
    console.log("error likeing a post", error);
    res.status(500).json({ message: "Error liking the post" });
  }
});

//endpoints to comment a post
app.post("/comments/:postId/:userId", async (req, res) => {
  try {
    const { postId, userId } = req.params;
    const { text } = req.body;
    const timestamp = new Date();

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    //console.log("Received comment:", text);

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }

    // Notify followers about the new comment
    const user = await User.findById(userId).populate('connections');
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    post.comments.push({ user: user._id, text, timestamp });
    await post.save();

    // Notify followers about the new comment
    //const user = await User.findById(userId).populate('connections');
 
    const followers = user.connections;
    followers.forEach(follower => {
      createNotification(follower.user, 'comment', `${user.username} has commented on your post.`, post._id, user._id);
    });
 

    res.status(200).json({ message: "Comment added successfully", post });
  } catch (error) {
    console.log("Error commenting on a post", error);
    res.status(500).json({ message: "Error commenting on the post" });
  }
});

// Endpoint to mark a notification as read
app.put('/ReadNotifications/:notificationId', async (req, res) => {
  const { notificationId } = req.params;
  //console.log("Received request to mark as read:", notificationId); 
  try {
    //console.log("gopal")
      const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
      if (!notification) {
          return res.status(404).send({ message: 'Notification not found' });
      }
      res.send({ notification });
  } catch (error) {
      res.status(500).send({ message: 'Error marking notification as read', error });
  }
});


// Endpoint to retrieve all comments for a specific post
app.get("/posts/:postId/comments", async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId).populate({
      path: 'comments.user',
      select: 'fname lname profileImage profession'
    });  
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    // Extract necessary information from comments and construct new array
    //const commentsWithUserInfo = post.comments
    //  .filter(comment => comment.user)  // Ensure user is not null or undefined
    //  .map(comment => ({
    const commentsWithUserInfo = post.comments.map(comment => ({
        _id: comment._id,
        text: comment.text,
        createdAt: comment.createdAt,
        user: {
          _id: comment.user._id,
          fname: comment.user.fname,
          lname: comment.user.lname,
          profileImage: comment.user.profileImage,
          profession: comment.user.profession
        }
    }));
    // Sort comments by createdAt in descending order
    commentsWithUserInfo.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    //console.log(commentsWithUserInfo)
    // Return comments with user information
    res.status(200).json({ comments: commentsWithUserInfo });
  } catch (error) {
    console.log("Error fetching comments:", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
});


app.get("/all/posts/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).lean().exec();
    if (!user) {
      return res.status(404).json({ message: "User is not found" });
    }
    let posts = [];
    // Fetch the user's own posts
    const userPosts = await Post.find({ user: userId })
      .populate("user", "fname lname profession profileImage")
      .lean()
      .exec();
    posts = posts.concat(userPosts);
    // Fetch posts of the user's connections
    if (user.connections && user.connections.length > 0) {
      const connectionIds = user.connections.map(connection => connection.user._id);
      const connectionPosts = await Post.find({ user: { $in: connectionIds } })
        .populate("user", "fname lname profession profileImage")
        .lean()
        .exec();
      //console.log(connectionIds);
      posts = posts.concat(connectionPosts);
    }
    // Sort the merged posts array by createdAt field in descending order
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching posts in index:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to send a chat message
app.post("/send-messages", async (req, res) => {
  try {
    const { senderId, recipientId, content, imageUrls, videoUrls, readBy } = req.body;

    const newMessage = new Chat({
      recipient: recipientId,
      sender: senderId,
      content: content,
      imageUrls: imageUrls || [],
      videoUrls: videoUrls || [],
      timestamp: new Date(),
      readBy: readBy || []
    });
    await newMessage.save();

      // Find the sender to include their first name in the notification
    const sender = await User.findById(senderId).select('fname profileImage');
    if (!sender) {
      return res.status(400).json({ message: "Sender not found" });
    }

    // Create notification
    await createNotification(recipientId, 'message', 
      `${sender.fname} has sent you a message.`, null, senderId);

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message Index:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/messages/:senderId/:recipientId', async (req, res) => {
  try {
    const { senderId, recipientId } = req.params;

    // Fetch sender and recipient details
    const [sender, recipient] = await Promise.all([
      User.findById(senderId).select('fname lname profession profileImage'),
      User.findById(recipientId).select('fname lname profession profileImage')
    ]);

    // Fetch messages
    const messages = await Chat.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    }).sort({ timestamp: 1 });

    await Chat.updateMany(
      { sender: senderId, recipient: recipientId, readBy: { $ne: recipientId } }, // Messages sent to the recipient and not already read by them
      { $addToSet: { readBy: recipientId } } // Add recipientId to the readBy array
    );

    // Combine sender and recipient details with each message
    const messagesWithDetails = messages.map(message => {
      const senderInfo = message.sender.toString() === senderId ? sender : recipient;
      const recipientInfo = message.recipient.toString() === recipientId ? recipient : sender;

      return {
        ...message.toObject(),
        sender: { _id: senderInfo._id, fname: senderInfo.fname, lname: senderInfo.lname, profession: senderInfo.profession, profileImage: senderInfo.profileImage },
        recipient: { _id: recipientInfo._id, fname: recipientInfo.fname, lname: recipientInfo.lname, profession: recipientInfo.profession, profileImage: recipientInfo.profileImage }
      };
    });

    res.status(200).json({ messages: messagesWithDetails });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// endpoint for searching posts
app.get('/posts', async (req, res) => {
  try {
    const { term, userId } = req.query;
    // Retrieve the authenticated user's connections
    const authUserId = userId; // Assuming you have middleware to extract the authenticated user's ID
    const authUser = await User.findById(authUserId).populate('connections', '_id');
    if (!authUser) {
      return res.status(404).json({ message: "Authenticated user not found" });
    }
    // Extract IDs of the authenticated user's connections
    const connectionIds = authUser.connections.map(connection => connection.user._id);
    //console.log(userId)
    // Search for posts where the user ID is in the connectionIds array and the description matches the term
    let posts = [];
    posts = await Post.find({
      $and: [
        {
          $or: [
            { user: { $in: [...connectionIds] } }, // Include both connectionIds and userId
            { user: userId } // Include posts created by the current user
          ]
        },
        { description: { $regex: term, $options: 'i' } } // Search term in description
      ]
    })
      .populate('user', 'fname lname profession profileImage') // Populate user details for both connectionIds and userId
      .exec();

    if (posts.length === 0) {
      return res.status(404).json({ message: "Search not found" });
    }
    res.json(posts);
  } catch (error) {
    console.error("Error searching posts of connections:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to fetch all connections of a user and their connection and so on..
app.get("/allconnections/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate('familymembers').exec();

    // Format the data as expected
    const tree = {
      id: user.id,
      fname: user.fname,
      lname: user.lname,
      connections: user.connections.map(connection => ({
        id: connection.user._id,
      }))
    };

    // Send the formatted data as the response
    res.status(200).json(tree);

  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to fetch and save family members for a user and their connections recursively
app.get("/fetchFamilyMembers/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    await fetchAndSaveFamilyMembers(userId, userId);
    res.status(200).json({ message: 'Family members fetched and saved successfully' });
  } catch (error) {
    console.error('Error fetching and saving family members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Function to recursively fetch and save family members
const fetchAndSaveFamilyMembers = async (userId, childId, processedIds = new Set()) => {
  try {
    // Avoid processing the same node multiple times
    if (processedIds.has(childId.toString())) {
      console.log(`Skipping already processed node: ${childId}`);
      return;
    }

    // Find the user by ID and populate connections
    const user = await User.findById(userId);
    const child = await User.findById(childId)
      .populate('connections.user', 'fname lname profileImage')
      .exec();

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return;
    }

    if (!child) {
      console.error(`Child with ID ${childId} not found`);
      return;
    }

    // Log family members and their IDs
    console.log('User family members:', user.familymembers.map(member => member.id.toString()));
    console.log('Current child ID:', child._id.toString());

    // Save the user into the familymembers array
    const familyMember = {
      id: child._id.toString(), // Convert to string
      fname: child.fname,
      lname: child.lname,
      connections: child.connections
        .filter(connection => connection.user)
        .map(connection => ({ id: connection.user._id.toString() })) // Convert to string
    };

    // Check if the family member already exists in the user's familymembers array
    const existingMemberIndex = user.familymembers.findIndex(member => member.id.toString() === child._id.toString());

    console.log('Existing member index:', existingMemberIndex);

    if (existingMemberIndex >= 0) {
      // If the family member exists, update the existing entry
      user.familymembers[existingMemberIndex] = familyMember;
      console.log(`Updated existing family member with ID ${child._id}`);
    } else {
      // If the family member does not exist, append the new entry
      user.familymembers.push(familyMember);
      console.log(`Added new family member with ID ${child._id}`);
    }

    // Save the updated user document
    await user.save();

    // Mark this child as processed
    processedIds.add(child._id.toString());

    // Recursively fetch and save family members of connections
    for (const connection of child.connections) {
      if (connection.user && !processedIds.has(connection.user._id.toString())) {
        await fetchAndSaveFamilyMembers(userId, connection.user._id, processedIds);
      }
    }
  } catch (error) {
    console.error('Error fetching and saving family members:', error);
  }
};

/// Endpoint to fetch all recipient details for a given senderId
app.get("/chats/:userId", async (req, res) => {
  try {
    const senderId = req.params.userId;

    // Find all chats where the sender matches the senderId
    const chats = await Chat.find({ sender: senderId })
      .populate('recipient', 'fname lname profession profileImage')
      .exec();

    // Create a map to keep track of the latest message for each recipient
    const recipientMap = new Map();

    // Iterate through the chats to populate the recipientMap
    chats.forEach(chat => {
      const recipientId = chat.recipient._id.toString();
      if (!recipientMap.has(recipientId) || chat.timestamp > recipientMap.get(recipientId).timestamp) {
        recipientMap.set(recipientId, {
          _id: recipientId,
          fname: chat.recipient.fname,
          lname: chat.recipient.lname,
          profession: chat.recipient.profession,
          profileImage: chat.recipient.profileImage,
          latestMessage: chat.content,
          timestamp: chat.timestamp
        });
      }
    });

    // Convert the recipientMap to an array and sort by the latest message timestamp
    const uniqueRecipients = Array.from(recipientMap.values()).sort((a, b) => b.timestamp - a.timestamp);
    console.log(uniqueRecipients);
    res.status(200).json(uniqueRecipients);
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Endpoint to fetch all connections of a user and their connection and so on..
app.get("/familymembersconn/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    //console.log(userId)
    const user = await User.findById(userId).populate('familymembers.id').exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    //console.log("//////user///////");
    //console.log(user);
    // Format the data as expected
    const formattedFamilyMembers = user.familymembers.map(familyMember => ({
      _id: familyMember.id._id.toString(),  // Convert ObjectId to string
      fname: familyMember.id.fname,
      lname: familyMember.id.lname,
      profession: familyMember.id.profession,
      profileImage: familyMember.id.profileImage,
      mobileno:familyMember.id.mobileno,
      city:familyMember.id.city,
      connections: familyMember.connections.map(conn => conn.id.toString())  // Convert ObjectId to string
    }));
    //console.log("////formattedFamilyMembers////")
    //console.log(formattedFamilyMembers)
    // Send the formatted data as the response
    res.status(200).json(formattedFamilyMembers);

  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to handle file uploads
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.post('/upload', (req, res) => {
  console.log('Upload request received');

  if (!req.files || Object.keys(req.files).length === 0) {
    console.log('No files uploaded');
    return res.status(400).send('No files were uploaded.');
  }

  console.log('Files found');
  const file = req.files.file;
  const uploadPath = path.join(uploadsDir, file.name);

  file.mv(uploadPath, function (err) {
    if (err) {
      console.log('Error moving file:', err);
      return res.status(500).send(err);
    }

    console.log('File uploaded successfully');
    res.json({ url: `http://10.0.2.2:3000/uploads/${file.name}` });
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//app.listen(port, () => {
//  console.log(`Server started on http://10.0.2.2:${port}`);
//});