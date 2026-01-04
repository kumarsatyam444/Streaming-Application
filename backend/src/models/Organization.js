/**
 * Organization Model
 * Represents a tenant in the multi-tenant system
 */

import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an organization name'],
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    storageQuota: {
      type: Number,
      default: 1099511627776, // 1TB in bytes
    },
    storageUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from organization name before saving
OrganizationSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    return next();
  }

  this.slug = this.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');

  next();
});

const Organization = mongoose.model('Organization', OrganizationSchema);

export default Organization;
