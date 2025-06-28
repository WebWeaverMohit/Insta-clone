require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./routes/users");
const Post = require("./routes/posts");
const Comment = require("./routes/comment");

const { faker } = require("@faker-js/faker");
// use @faker-js/faker if using latest

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");
}

function getRandomPicsumUrl() {
  const id = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${id}/600/600`;
}

async function seedDB() {
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});

  const users = [];

  // Create 10–15 users
  for (let i = 0; i < Math.floor(Math.random() * 6) + 10; i++) {
    const user = new User({
      username: faker.internet.username(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      dob: faker.date.past(30).toISOString().split("T")[0],
      bio: faker.lorem.sentence(),
      picture: getRandomPicsumUrl(),
    });

    user.setPassword("password123"); // set dummy password
    await user.save();
    users.push(user);
  }

  const allPosts = [];

  // Create posts for each user
  for (const user of users) {
    const numberOfPosts = Math.floor(Math.random() * 8) + 3;

    for (let i = 0; i < numberOfPosts; i++) {
      const post = new Post({
        user: user._id,
        caption: faker.lorem.sentence(),
        picture: getRandomPicsumUrl(),
      });

      // Random likes from users
      const shuffled = users.filter(
        (u) => u._id.toString() !== user._id.toString()
      );
      const randomLikes = shuffled
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * shuffled.length));
      post.likes = randomLikes.map((u) => u._id);

      // Add random comments
      const numComments = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < numComments; j++) {
        const commentUser = users[Math.floor(Math.random() * users.length)];
        const comment = new Comment({
          text: faker.lorem.sentence(),
          user: commentUser._id,
        });
        await comment.save();
        post.comments.push(comment._id);
      }

      await post.save();
      user.posts.push(post._id);
      await user.save();

      allPosts.push(post);
    }
  }

  // Make followers/followings
  for (const user of users) {
    const others = users.filter(
      (u) => u._id.toString() !== user._id.toString()
    );
    const randomFollows = others
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * others.length));

    for (const followee of randomFollows) {
      if (!user.followings.includes(followee._id)) {
        user.followings.push(followee._id);
      }
      if (!followee.followers.includes(user._id)) {
        followee.followers.push(user._id);
      }
      await followee.save();
    }
    await user.save();
  }

  console.log(`✅ Seeded ${users.length} users and ${allPosts.length} posts`);
  process.exit();
}

connectDB()
  .then(seedDB)
  .catch((err) => {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  });
