const LostPetPost = require('../models/LostPetPost');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');
const { getLostPetAlertTemplate } = require('../utils/emailTemplates');

// @desc    Create a lost pet post and notify nearby users
// @route   POST /api/lost-pets
// @access  Private
exports.createLostPetPost = async (req, res) => {
    try {
        console.log('LOST PET POST REQUEST:', JSON.stringify(req.body, null, 2));
        req.body.user = req.user.id;

        // Ensure city, district, ward objects are present
        if (!req.body.city || !req.body.district) {
            return res.status(400).json({
                success: false,
                message: 'Please provide city and district information'
            });
        }

        const post = await LostPetPost.create(req.body);

        // Find users to notify: ONLY in the same District
        const usersToAlert = await User.find({
            'district.code': post.district.code,
            _id: { $ne: req.user.id } // Exclude the poster
        });

        // Send email notifications in background (don't block the response)
        // Note: In production, consider using a job queue like Bull/Redis
        usersToAlert.forEach(user => {
            if (user.email) {
                sendEmail({
                    email: user.email,
                    subject: `🚨 [KHẨN CẤP] Bé ${post.petName} bị lạc gần khu vực của bạn!`,
                    html: getLostPetAlertTemplate(post)
                }).catch(err => console.error(`Failed to send email to ${user.email}:`, err));
            }
        });

        res.status(201).json({
            success: true,
            data: post,
            alertedCount: usersToAlert.length
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all active lost pet posts
// @route   GET /api/lost-pets
// @access  Public
exports.getLostPetPosts = async (req, res) => {
    try {
        const posts = await LostPetPost.find({ status: { $ne: 'resolved' } })
            .sort({ createdAt: -1 })
            .populate('user', 'name phone email avatar');
        
        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update lost pet post (mark as found/resolved)
// @route   PUT /api/lost-pets/:id
// @access  Private
exports.updateLostPetStatus = async (req, res) => {
    try {
        let post = await LostPetPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Only owner or admin can update
        if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this post' });
        }

        post = await LostPetPost.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete lost pet post
// @route   DELETE /api/lost-pets/:id
// @access  Private
exports.deleteLostPetPost = async (req, res) => {
    try {
        const post = await LostPetPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await post.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Post removed'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
