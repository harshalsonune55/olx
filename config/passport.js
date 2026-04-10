const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function (passport) {


  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) return done(null, false, { message: 'Incorrect username' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return done(null, false, { message: 'Incorrect password' });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );


  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("PROFILE:", profile); // 🔥 DEBUG
  
      const email = profile.emails?.[0]?.value || "";
  
      let user = await User.findOne({
        $or: [{ googleId: profile.id }, { email }]
      });
  
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          username: profile.displayName || "User",
          email,
          avatar: profile.photos?.[0]?.value || ""
        });
      }
  
      return done(null, user);
  
    } catch (err) {
      console.error("GOOGLE ERROR:", err); // 🔥 IMPORTANT
      return done(err, null);
    }
  }));


  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};