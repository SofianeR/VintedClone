const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const Offer = require("../Models/Offer");
const User = require("../Models/User");

const cloudinary = require("cloudinary").v2;

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    if (
      req.fields.description.length < 501 &&
      req.fields.title.length < 51 &&
      req.fields.price < 100001
    ) {
      const user = req.user;

      const newOffer = new Offer({
        product_name: req.fields.title,
        product_description: req.fields.description,
        product_price: req.fields.price,
        product_details: [
          { MARQUE: req.fields.brand },
          { TAILLE: req.fields.size },
          { ETAT: req.fields.condition },
          { COULEUR: req.fields.color },
          { EMPLACEMENT: req.fields.city },
        ],
        owner: user,
      });

      const pictureToUpload = req.files.picture.path;
      const result = await cloudinary.uploader.upload(pictureToUpload, {
        folder: `/vinted/offers/${user._id}`,
        public_id: `${req.fields.title} - ${newOffer._id}`,
      });

      newOffer.product_image = { secure_url: result.secure_url };

      await newOffer.save();
      res.json(newOffer);
    }
  } catch (error) {
    res.status(400).json({ error: { message: error.message, test: "test" } });
  }
});

// router.get("/offers", async (req, res) => {
//   try {
//     let sort = { product_price: "asc" };
//     let skip = 0;
//     let title = "";
//     let priceMax = 0;
//     let priceMin = 0;
//     // const count = await Offer.countDocuments();
//     // const listOffer = await Offer.find({
//     //   $or: [
//     //     { product_name: new RegExp(req.query.title, "i") },
//     //     {
//     //       product_price: { $gte: req.query.priceMin, $lte: req.query.priceMax },
//     //     },
//     //   ],
//     // });
//     //   .select("product_name product_description product_price")
//     //   .limit(3)
//     //   .sort(sort);
//     if (req.query.title) {
//       title = req.query.title;
//     } else {
//       title = "";
//     }
//     if (req.query.priceMax) {
//       priceMax = req.query.priceMax;
//     } else {
//       priceMax = 10000;
//     }
//     if (req.query.priceMin) {
//       priceMin = req.query.priceMin;
//     } else {
//       priceMin = 0;
//     }
//     if (req.query.sort) {
//       sort = { product_price: req.query.sort.replace("price-", "") };
//     }
//     if (req.query.page && req.query.page > 1) {
//       for (let i = 1; i < req.query.page; i++) {
//         skip += 3;
//       }
//     }

//     const filters = {
//       $and: [
//         { product_name: new RegExp(title, "i") },
//         { product_price: { $gte: priceMin, $lte: priceMax } },
//       ],
//     };

//     const listOffer = await Offer.find(filters)
//       .skip(skip)
//       .sort(sort)
//       .populate("owner", "-hash -salt -token -newsletter -email -__v");

//     const countOffers = await Offer.countDocuments(filters);
//     res.json({
//       count: countOffers,
//       skip: skip,
//       offer: listOffer,
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

router.get("/offers", async (req, res) => {
  try {
    const filter = {};
    const pagination = {};

    req.query.title
      ? (filter.product_name = new RegExp(req.query.title, "i"))
      : null;

    req.query.priceMin
      ? (filter.product_price = { $gte: req.query.priceMin })
      : null;

    req.query.limit
      ? (pagination.limit = req.query.limit)
      : (pagination.limit = 3);

    req.query.page
      ? (pagination.page = parseInt(req.query.page))
      : (pagination.page = 1);

    if (req.query.priceMax) {
      if (filter.product_price) {
        filter.product_price.$lte = req.query.priceMax;
      } else {
        filter.product_price = {
          $lte: req.query.priceMax,
        };
      }
    }

    req.query.sort
      ? (pagination.sort = req.query.sort.replace("price-", ""))
      : (pagination.sort = { product_price: "asc" });

    pagination.skip = (pagination.page - 1) * 3;

    const listOffer = await Offer.find(filter)
      // .limit(pagination.limit)
      .skip(pagination.skip)
      .sort(pagination.sort)
      .populate("owner", "-hash -salt -token -newsletter -email -__v")
      .select("product_name product_price ");

    const countOffers = await Offer.countDocuments(filter);

    res.json({
      count: countOffers,
      offer: listOffer,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offerToDisplay = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account.username email -_id",
    });
    res.json(offerToDisplay);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

module.exports = router;
