const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/Instagram")

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  dob: String,
  bio: String,
  notifications: [mongoose.Schema.Types.ObjectId],
  picture: {
    type: String,
    default: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAnAMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBAwQCB//EADYQAAICAQIDBQUHAwUAAAAAAAABAgMEBREhMUESIlFhcQYTMoGhFEJSwdHh8DNysSNigpGS/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/APuIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1ZGRTj19u6xQXn1IXK9oHu1i1Lb8Vn6AT4Kfbqmba+9kSivCHA0PJvfO+3f8AvYF3BSoZuVB93ItX/Nv/ACdlGuZdf9Ts2r/ctn/2gLSCNwtYxslqMm6rH0nyfzJLcAAAAAAAAAAAAAAEdqmpww12IpTua4R6LzZ71XOWFjuS2dsuEI/mVOycrJylN9qUnu2+oHq++3Isdl03KT6voawAAAAAAASemavZjSVd8nOnz4uJGAC81WRtgp1yUoyW6aPZVtF1B4lqqsb9zN/+X4lpXIAAAAAAAAAYb2MnDrN/uNPtkns5Lsr5gVzVMt5mZOxPuLuw9DkAAAHXpuL9qylCXwRXal5rwAYen35aUopRr/HLl+5JR0OpLvXTb8UkiUilGKikklwSSMgQl+iSjFui3tv8Mlt9SKshKuyUJxcZR5p9C4HBq+IsjHdkV/q1rdea8AK4AABadBy3kYnu5veyrg93zXT+eRViR0K/3OoQW/ds3g/yAtYAAAAAAABC+082semPjPfb0X7k0QXtR8GO/N/kBAAAATfs9Fe7ul17SRCEpoN6hkTplwVi3j6roBPAAAGt+D5A1ZV0cfHnbL7sXt5sCqWJK2aXJNpHkzu293zZgAbMabryKprnGaf1NZ6r/qR/uQF6BhcjIAAAAAAIn2lr7WDGe3wTTfo+H6EsacylZGNZS/vx2ApIMyi4ycZLaSezRgAZi5RlGUW1JPdNdDBI4Wk25CU7m6q+a4d5/oB3YOrV2qMcmSrsXDtdH+hJRkpLeLTXinuR1mjY0oJQcq5L72++/qjleiXLhC6DXzQEtfl0Y8d7bIryXFv5EBqOfLMl2UuzVF92PX1Z206HFPe67deEImzJ0amcd6JOuW3J8UBAg25FFuPZ2Lo9mX0foagB0afX73Ooh4zTfy4nOTPs3juV9l7+GC2j6v8An1AsYAAAAAAAAAArftDhOu77VWu5Z8fk/wByHLzbVC6uVdke1GS2aK9HRp16go2LtY67yl4+QHrSNOW0cnIW/WEH/lkwAAAAAAAacrGryqnXYvRrmmVnKx54tzqsXLk1ya8S2HFquJ9qxm4x3thxj4vyArtcJ22Rrri3OT2S8y4YONHExoVR47c34vqcejaWsWPvrkvfSXL8K8PUlQAAAAAAAAAAAGGt1sZAGmVbXGJrOow4qXNAcwNzqXR7GPdef0A1A2qrzPSrium4GmMXLkjdCtRPfIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//Z"
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  followings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post"
    }
  ],
  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "story"
  }]
})

userSchema.plugin(plm)

module.exports = mongoose.model("user", userSchema)