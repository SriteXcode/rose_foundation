const BlogPost = require('../models/BlogPost');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to create slug from title
const createSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start/end
};

// Get all published posts (Public - with pagination, search, and tag filter)
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 6, search, tag } = req.query;
    const query = { status: 'published' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { volunteerName: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    const posts = await BlogPost.find(query)
      .populate('volunteerId', 'name image designation role volunteerCode fundraiserCode upiId directPaymentQrImage totalRaised fundraiserGoal')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content'); // Exclude heavy content for list view

    const count = await BlogPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalPosts: count
    });
  } catch (error) {
    console.error('getAllPosts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Get single post by slug (Public for published; Author/Admin can preview pending/draft)
exports.getPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug })
      .populate('volunteerId', 'name image designation role volunteerCode fundraiserCode upiId directPaymentQrImage totalRaised fundraiserGoal');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // If published, anyone can view
    if (post.status === 'published') {
      return res.json(post);
    }

    // For non-published posts, check if caller is Admin or Author (Preview Mode)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        if (decoded.role === 'admin' || (post.authorId && post.authorId.toString() === decoded.id.toString())) {
          return res.json({ ...post.toObject(), isPreview: true });
        }
      } catch (jwtErr) {
        // Token invalid, fall through to 404
      }
    }

    return res.status(404).json({ error: 'Post not found or pending admin approval' });
  } catch (error) {
    console.error('getPostBySlug error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Create post (Admin = Published directly; Volunteer/Fundraiser = Pending Admin Approval)
exports.createPost = async (req, res) => {
  try {
    const { title, summary, content, coverImage, tags, status, volunteerId, showDonationCard } = req.body;

    if (!title || !summary || !content || !coverImage) {
      return res.status(400).json({ error: 'Title, summary, cover image, and article content are required.' });
    }

    const isAdmin = req.user && req.user.role === 'admin';
    let authorName = 'Admin';
    let authorId = req.user ? req.user.id : null;
    let authorRole = 'admin';
    let linkedVolunteer = null;
    let finalStatus = 'published';

    if (isAdmin) {
      finalStatus = status === 'draft' ? 'draft' : 'published';
      if (volunteerId) {
        linkedVolunteer = await Volunteer.findById(volunteerId);
      }
    } else {
      // Find volunteer associated with current user
      const currentUser = await User.findById(req.user.id);
      linkedVolunteer = await Volunteer.findOne({
        $or: [
          { userId: req.user.id },
          { email: currentUser?.email }
        ]
      });

      if (!linkedVolunteer) {
        return res.status(403).json({ error: 'You must have an approved volunteer or fundraiser profile to submit articles.' });
      }

      authorName = linkedVolunteer.name;
      authorRole = linkedVolunteer.isFundraiser ? 'fundraiser' : 'volunteer';
      // Volunteer articles require admin approval unless saved as draft
      finalStatus = status === 'draft' ? 'draft' : 'pending';
    }

    // Generate unique slug
    let slug = createSlug(title);
    let counter = 1;
    while (await BlogPost.findOne({ slug })) {
      slug = `${createSlug(title)}-${counter}`;
      counter++;
    }

    const postData = {
      title: title.trim(),
      slug,
      summary: summary.trim(),
      content,
      coverImage,
      author: authorName,
      authorId,
      authorRole,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      status: finalStatus,
      showDonationCard: showDonationCard !== false
    };

    if (linkedVolunteer) {
      postData.volunteerId = linkedVolunteer._id;
      postData.volunteerCode = linkedVolunteer.fundraiserCode || linkedVolunteer.volunteerCode;
      postData.volunteerName = linkedVolunteer.name;
      postData.volunteerImage = linkedVolunteer.image;
      postData.volunteerUpiId = linkedVolunteer.upiId || '';
    }

    const newPost = new BlogPost(postData);
    await newPost.save();

    const successMessage = finalStatus === 'pending'
      ? 'Article submitted successfully! It will be visible on the blog once approved by an administrator.'
      : finalStatus === 'draft'
        ? 'Article saved as draft.'
        : 'Article published successfully!';

    res.status(201).json({ message: successMessage, post: newPost });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
};

// Update post (Admin = Can update anything & approve; Volunteer = Can update own post -> becomes pending again)
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, coverImage, tags, status, showDonationCard } = req.body;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = post.authorId && post.authorId.toString() === req.user.id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'You are not authorized to edit this article.' });
    }

    if (title) post.title = title.trim();
    if (summary) post.summary = summary.trim();
    if (content) post.content = content;
    if (coverImage) post.coverImage = coverImage;
    if (showDonationCard !== undefined) post.showDonationCard = showDonationCard;

    if (tags !== undefined) {
      post.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }

    if (isAdmin) {
      if (status) post.status = status;
    } else {
      // If volunteer edits, keep draft or re-submit as pending
      post.status = status === 'draft' ? 'draft' : 'pending';
    }

    post.updatedAt = Date.now();
    await post.save();

    const msg = !isAdmin && post.status === 'pending'
      ? 'Article updated and resubmitted for admin approval.'
      : 'Article updated successfully.';

    res.json({ message: msg, post });
  } catch (error) {
    console.error('Update Post Error:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
};

// Delete post (Admin or Author)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = post.authorId && post.authorId.toString() === req.user.id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'You are not authorized to delete this article.' });
    }

    await BlogPost.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete Post Error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Admin 1-Click Approve Post
exports.approvePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndUpdate(
      id,
      { status: 'published', updatedAt: Date.now() },
      { new: true }
    ).populate('volunteerId', 'name volunteerCode fundraiserCode image');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Article approved and published live!', post });
  } catch (error) {
    console.error('Approve Post Error:', error);
    res.status(500).json({ error: 'Failed to approve post' });
  }
};

// Admin 1-Click Reject Post
exports.rejectPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndUpdate(
      id,
      { status: 'rejected', updatedAt: Date.now() },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Article marked as rejected.', post });
  } catch (error) {
    console.error('Reject Post Error:', error);
    res.status(500).json({ error: 'Failed to reject post' });
  }
};

// Get current logged-in volunteer's own posts (all statuses: pending, published, draft, rejected)
exports.getMyPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const volunteer = await Volunteer.findOne({
      $or: [
        { userId: req.user.id },
        { email: currentUser?.email }
      ]
    });

    const matchConditions = [{ authorId: req.user.id }];
    if (volunteer) {
      matchConditions.push({ volunteerId: volunteer._id });
      if (volunteer.volunteerCode) matchConditions.push({ volunteerCode: volunteer.volunteerCode });
      if (volunteer.fundraiserCode) matchConditions.push({ volunteerCode: volunteer.fundraiserCode });
    }

    const posts = await BlogPost.find({ $or: matchConditions })
      .populate('volunteerId', 'name image volunteerCode fundraiserCode')
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    console.error('getMyPosts Error:', error);
    res.status(500).json({ error: 'Failed to load your articles' });
  }
};

// Admin: Get all posts with status filter and counts
exports.adminGetAllPosts = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { volunteerName: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await BlogPost.find(query)
      .populate('volunteerId', 'name image volunteerCode fundraiserCode')
      .sort({ createdAt: -1 });

    const total = await BlogPost.countDocuments();
    const pending = await BlogPost.countDocuments({ status: 'pending' });
    const published = await BlogPost.countDocuments({ status: 'published' });
    const draft = await BlogPost.countDocuments({ status: 'draft' });
    const rejected = await BlogPost.countDocuments({ status: 'rejected' });

    res.json({
      posts,
      counts: { total, pending, published, draft, rejected }
    });
  } catch (error) {
    console.error('adminGetAllPosts Error:', error);
    res.status(500).json({ error: 'Failed to fetch admin articles' });
  }
};
