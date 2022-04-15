const express = require("express");
const router = express.Router();

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const cloudinary = require("cloudinary").v2;

const User = require("../Models/User");

router.post("/user/signup", async (req, res) => {
  //   res.json({ message: "Vous etes bien dans la route signup", elmts : req.fields });
  try {
    const isEmailAlredySaved = await User.findOne({
      email: req.fields.email.toLowerCase(),
    });

    const lengthUsername = req.fields.username.length;
    const lengthPassword = req.fields.password.length;

    // console.log(isEmailAlredySaved);
    // console.log(req.fields.username.length);
    // console.log(req.fields.password.length);

    if (!isEmailAlredySaved) {
      if (lengthUsername !== 0) {
        // console.log("if username length", req.fields.password.length);
        if (lengthPassword > 3) {
          //   console.log("if password name");
          const pictureToUpload = req.files.picture.path;
          const result = await cloudinary.uploader.upload(pictureToUpload);

          const salt = uid2(16);
          const hash = SHA256(req.fields.password + salt).toString(encBase64);

          const token = uid2(16);

          const newUser = new User({
            email: req.fields.email.toLowerCase(),
            account: {
              username: req.fields.username,
              avatar: { secure_url: result.secure_url },
            },
            newsletter: req.fields.newsletter,
            token: token,
            hash: hash,
            salt: salt,
          });

          newUser.save();

          res.json({
            _id: newUser._id,
            token: newUser.token,
            account: {
              username: newUser.account.username,
              avatar: { secure_url: newUser.account.avatar.secure_url },
            },
          });
        } else {
          res.status(400).json({
            error: {
              message:
                "Vous devez entrer un mot de passe d'au moins 4 caracteres",
            },
          });
        }
      } else {
        res
          .status(400)
          .json({ error: { message: "Vous devez entrer un username" } });
      }
    } else {
      res.send("Il existe déja un compte avec cette adresse mail");
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const userExists = await User.findOne({
      email: req.fields.email.toLowerCase(),
    });
    if (userExists) {
      const checkHash = SHA256(req.fields.password + userExists.salt).toString(
        encBase64
      );
      if (checkHash === userExists.hash) {
        res.json({
          _id: userExists._id,
          token: userExists.token,
          account: { username: userExists.account.username },
        });
      } else {
        res.status(400).json({
          error: {
            message: "erreur mot de passe ou email",
          },
        });
      }
    } else {
      res.status(400).json({ message: "erreur mot de passe ou email" });
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

module.exports = router;
