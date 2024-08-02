const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Cement = require('../models/Cements');


// @desc    Get all cements
// @route   GET /api/cements
// @access  Public
exports.getCements = asyncHandler(async (req, res, next) => {
    const cement = await Cement.find()

    res.status(200).json({ success: true, data: cement });
});


// @desc    Get single cement
// @route   GET /api/cements/:id
// @access  Public
exports.getCement = asyncHandler(async (req, res, next) => {

    const cement = await Cement.findById(req.params.id);

    if (!cement) {
        return next(
            new ErrorResponse(`Cement not found with id ${req.params.id}`, 404)
        );
    }

    res.status(200).json({ success: true, data: cement });
    
});


// @desc    Create new cement
// @route   POST /api/cement
// @access  Public
exports.createCement = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    // Only admin can add new cement
    if(req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`The user with id ${req.user.id} is not authorized to add cement`, 400)
        );
    }
    
        const cement = await Cement.create(req.body);

        res.status(201).json({
            success: true,
            data: cement
        });

});


// @desc    Update cement
// @route   PUT /api/v1/cements/:id
// @access  Public
exports.updateCement = asyncHandler(async (req, res, next) => {

        let cement = await Cement.findById(req.params.id);
    
        if (!cement) {
            return next(
                new ErrorResponse(`Cement not found with id ${req.params.id}`, 404)
            );
        }

        // Make sure user is the bootcamp owner
        if(req.user.role !== 'admin') {
            return next(
                new ErrorResponse(`User ${req.params.id} is not authorized to update this cement`, 401)
            );
        }

        cement = await Cement.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({success: true, data: cement});
    
});


// @desc    Delete cement
// @route   DELETE /api/v1/cements/:id
// @access  Public
exports.deleteCement = asyncHandler(async (req, res, next) => {
  
        const cement = await Cement.findById(req.params.id);

        if(!cement) {
            return next(
                new ErrorResponse(`Cement not found with id ${req.params.id}`, 404)
            );
        }

        // Make sure user is an admin
        if(req.user.role !== 'admin') {
            return next(
                new ErrorResponse(`User ${req.params.id} is not authorized to delete this cement`, 401)
            );
        }


        cement.remove();

        res.status(200).json({ success: true, data:{} });

});


// @desc    Upload cement photo
// @route   PUT /api/v1/cements/:id/photo
// @access  Public
exports.cementPhotoUpload = asyncHandler(async (req, res, next) => {
  
    const cement = await Cement.findById(req.params.id);

    if(!cement) {
        return next(
            new ErrorResponse(`Cement not found with id ${req.params.id}`, 404)
        );
    }

    // Make sure user is an admin
    if(req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorized to update this cement`, 401)
        );
    }

    if(!req.files) {
        return next(
            new ErrorResponse('Please upload a file', 400)
        );
    }

    const file = req.files.file;

    // Make sure the image is photo
    if(!file.mimetype.startsWith('image')) {
        return next(
            new ErrorResponse('Please upload an image file', 400)
        );
    }

    // Check filesize
    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400)
        );
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err) {
            return next(
                new ErrorResponse('Error with file upload', 500)
            );
        }

        await Cement.findByIdAndUpdate(req.params.id, {photo: file.name});

        res.status(200).json({
            success: true,
            data: file.name
        });

    });

});