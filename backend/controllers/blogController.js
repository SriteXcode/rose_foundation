const BlogPost = require('../models/BlogPost');

// Helper to create slug from title
const createSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start/end
};

// Get all posts (Public - with pagination and search)
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 6, search, tag } = req.query;
    const query = { status: 'published' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    const posts = await BlogPost.find(query)
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
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Get single post by slug (Public)
exports.getPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Create post (Admin)
exports.createPost = async (req, res) => {
  try {
    const { title, summary, content, coverImage, tags, status } = req.body;

    if (!title || !summary || !content || !coverImage) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Generate unique slug
    let slug = createSlug(title);
    let counter = 1;
    while (await BlogPost.findOne({ slug })) {
      slug = `${createSlug(title)}-${counter}`;
      counter++;
    }

    const newPost = new BlogPost({
      title,
      slug,
      summary,
      content,
      coverImage,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      status: status || 'published'
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// Update post (Admin)
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, coverImage, tags, status } = req.body;

    // If title changes, we might want to update slug, but usually better to keep slug stable for SEO.
    // We will only update fields provided.

    const updateData = {
      title,
      summary,
      content,
      coverImage,
      status,
      updatedAt: Date.now()
    };

    if (tags) {
        updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post updated', post: updatedPost });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
};

// Delete post (Admin)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await BlogPost.findByIdAndDelete(id);
    
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
