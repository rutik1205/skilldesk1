const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify your bid amount in INR (₹)'],
      min: [100, 'Bid amount must be at least ₹100'],
    },
    deliveryDays: {
      type: Number,
      required: [true, 'Please specify delivery duration in days'],
      min: [1, 'Delivery must be at least 1 day'],
      max: [365, 'Delivery duration is too long'],
    },
    proposal: {
      type: String,
      required: [true, 'Please write your proposal pitch'],
      minlength: [20, 'Proposal should be at least 20 characters'],
      maxlength: [3000, 'Proposal cannot exceed 3000 characters'],
    },
    githubPortfolio: {
      type: String,
      default: '',
      trim: true,
    },
    attachment: {
      url: { type: String, default: '' },
      name: { type: String, default: '' },
      fileId: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent same freelancer from submitting duplicate bids to the same project
bidSchema.index({ project: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);
