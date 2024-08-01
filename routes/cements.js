const express = require('express');

const {
  getCements,
  getCement,
  createCement,
  updateCement,
  deleteCement,
  cementPhotoUpload,
} = require('../controller/cements');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getCements)
  .post(protect, authorize('admin'), createCement);

router
  .route('/:id')
  .get(getCement)
  .put(protect, authorize('admin'), updateCement)
  .delete(protect, authorize('admin'), deleteCement);

router
  .route('/:id/photo')
  .put(protect, authorize('admin'), cementPhotoUpload);

module.exports = router;
