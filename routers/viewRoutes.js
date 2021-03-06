const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use(viewsController.alerts);

router.route('/').get(authController.isLoggedIn, viewsController.getOverview);
router.route('/tour/:slug').get(authController.isLoggedIn, viewsController.getTour);
router.route('/login').get(authController.isLoggedIn, viewsController.getLoginForm);
router.route('/me').get(authController.protect, viewsController.getAccount);
router.route('/my-tours').get(
    /* bookingController.createBookingCheckout, */
    authController.protect, viewsController.getMyTours);


router.route('/submit-user-data').post(authController.protect, viewsController.updateUserAccount);



module.exports = router;