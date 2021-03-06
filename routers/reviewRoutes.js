const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const Router = express.Router({ mergeParams: true });

// POST /tours/45657364/reviews
// POST /reviews

Router.use(authController.protect);

Router.route('/')
.get(reviewController.getReviews)
.post(authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview);

Router.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
.delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = Router;