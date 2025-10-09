const express = require("express");

const {
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
} = require("../../controllers/bannerControllers/bannerControllers");

const bannerRoute = express.Router();

bannerRoute.get("/", getAllBanners);
bannerRoute.post("/", createBanner);
bannerRoute.put("/:id", updateBanner);
bannerRoute.delete("/:id", deleteBanner);

module.exports = bannerRoute;