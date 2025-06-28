var express = require("express");
const passport = require("passport");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const commentModel = require("./comment");
const storyModel = require("./story");
const utils = require("../Utils/utils");
const upload = require("./multer");
const notificationModel = require("./noti");
const bcrypt = require("bcrypt");
const localStrategy = require("passport-local");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/resetPassword", function (req, res) {
  res.render("reset", { footer: false });
});

router.post("/reset-password", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user });

  if (!user) {
    return res.render("reset", { error: "User not found", footer: false });
  }

  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    return res.render("reset", {
      error: "New passwords do not match",
      footer: false,
    });
  }

  // Assuming your changePassword method returns a promise
  try {
    await user.changePassword(oldPassword, newPassword);
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.render("reset", { error: "Error changing password", footer: false });
  }
});

// req.login(user, function(err){
//   if(err) throw err;
//   res.redirect('profile')
// })

router.get("/message", isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("followings");
  res.render("message", { footer: true, user });
});

router.get("/saved-posts", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const savedPosts = await postModel
      .find({ _id: user.saved })
      .populate("user");

    res.render("saved", { savedPosts, user, footer: true });
    console.log(user.saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/feed", isLoggedIn, async (req, res) => {
  const username = req.session.passport.user;
  const stories = await storyModel
    .find({
      user: {
        $nin: [req.user._id],
      },
    })
    .populate("user");

  var uniq = {};
  var filtered = stories.filter(function (item) {
    if (!uniq[item.user.id]) {
      uniq[item.user.id] = " ";
      return true;
    } else return false;
  });

  if (!username)
    return res.status(401).json({ error: "User not authenticated" });

  try {
    const user = await userModel.findOne({ username }).populate("posts");
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await postModel.find().populate("user");
    res.render("feed", {
      footer: true,
      user,
      posts,
      stories: filtered,
      dater: utils.formatRelativeTime,
      pid: posts._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/feed/:postId/comments", isLoggedIn, async function (req, res) {
  try {
    const post = await postModel.findById(req.params.postId);
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    const commentData = {
      user: user._id,
      text: req.body.text,
      post: req.params.postId,
    };

    const comment = await commentModel.create(commentData);
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json({
      text: comment.text,
      author: {
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/editPost/:postId", async function (req, res) {
  const post = await postModel
    .findOne({
      _id: req.params.postId,
    })
    .populate("user");
  res.render("edit-post", { footer: false, post });
});

router.post(
  "/editcaption/:postId",
  isLoggedIn,
  async function (req, res, next) {
    const user = await userModel
      .findOne({ username: req.session.passport.user })
      .populate("posts");
    const post = await postModel.findOneAndUpdate(
      { _id: req.params.postId },
      { caption: req.body.caption },
      { new: true }
    );
    res.redirect("/profile");
  }
);

router.get("/login", async function (req, res) {
  res.render("login", { footer: false });
});

router.get("/delete/:postid", async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const deletepost = await postModel.findOneAndDelete({
    _id: req.params.postid,
  });
  res.redirect("back");
});

router.get("/save/:postid", async function (req, res) {
  let user = await userModel.findOne({ username: req.session.passport.user });
  if (user.saved.indexOf(req.params.postid) === -1) {
    user.saved.push(req.params.postid);
  } else {
    var index = user.saved.indexOf(req.params.postid);
    user.saved.splice(index, 1);
  }
  await user.save();
  res.json(user);
});

router.get("/like/:postid", async function (req, res) {
  const post = await postModel.findOne({ _id: req.params.postid });
  const user = await userModel.findOne({ username: req.session.passport.user });
  if (post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id);
  } else {
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }
  await post.save();
  res.json(post);
});

router.get("/profile", isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts")
    .populate("saved");
  res.render("profile", { footer: true, user });
});

router.get("/profile/:user", isLoggedIn, async function (req, res) {
  const userprofile = await userModel
    .findOne({ username: req.params.user })
    .populate("posts");
  const user = await userModel.findOne({ username: req.session.passport.user });
  if (user.username === req.params.user) {
    res.redirect("/profile");
  }
  res.render("userprofile", { footer: true, user, userprofile });
});

router.get("/follow/:userid", isLoggedIn, async function (req, res) {
  const followhonewala = await userModel
    .findOne({ _id: req.params.userid })
    .populate("posts");
  const followkarnewala = await userModel.findOne({
    username: req.session.passport.user,
  });
  if (followkarnewala.followings.indexOf(followhonewala._id) !== -1) {
    let index = followkarnewala.followings.indexOf(followhonewala._id);
    followkarnewala.followings.splice(index, 1);
    let index2 = followhonewala.followers.indexOf(followkarnewala._id);
    followhonewala.followers.splice(index2, 1);
  } else {
    followhonewala.followers.push(followkarnewala._id);
    followkarnewala.followings.push(followhonewala._id);
  }

  // const newNotification = new Notification({
  //   type: 'follow',
  //   userId: followkarnewala._id,
  // });

  // followhonewala.notifications.push(newNotification);
  await followhonewala.save();
  await followkarnewala.save();
  res.redirect("back");
});

router.get("/notifications", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user });
  req.user.notifications.forEach((notification) => {
    notification.isRead = true;
  });
  await req.user.save();

  const notifications = req.user.notifications;
  res.render("notifications", { notifications, user, footer: true });
});

router.get("/search", async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("search", { footer: true, user });
});

router.get("/search/:user", async function (req, res) {
  const searchTerm = `^${req.params.user}`;
  const regex = new RegExp(searchTerm);
  const users = await userModel.find({ username: { $regex: regex } });
  res.json(users);
});

router.get("/edit", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("edit", { footer: true, user });
});

router.post(
  "/upload",
  upload.single("image"),
  isLoggedIn,
  async function (req, res) {
    const user = await userModel
      .findOne({ username: req.session.passport.user })
      .populate("posts");
    user.picture = req.file.filename;
    await user.save();
    res.redirect("/edit");
  }
);

router.post("/update", isLoggedIn, async function (req, res) {
  const user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    { username: req.body.username, name: req.body.name, bio: req.body.bio },
    { new: true }
  );
  req.login(user, function (err) {
    if (err) throw err;
    res.redirect("profile");
  });
});

router.get("/upload", isLoggedIn, async function (req, res) {
  res.render("upload", { footer: false });
});

router.post(
  "/post",
  upload.single("image"),
  isLoggedIn,
  async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    if (req.body.category === "post") {
      const post = await postModel.create({
        user: user._id,
        caption: req.body.caption,
        picture: req.file.filename,
      });
      user.posts.push(post._id);
    } else if (req.body.category === "story") {
      const story = await storyModel.create({
        story: req.file.filename,
        user: user._id,
      });
      user.stories.push(story._id);
    }
    await user.save();
    res.redirect("/feed");
  }
);

router.post("/register", function (req, res) {
  var userdata = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  });

  userModel
    .register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/feed",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
