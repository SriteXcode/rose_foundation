import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import toast from 'react-hot-toast';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageUpload from '../components/ImageUpload';
import VolunteerDonationCard from '../components/VolunteerDonationCard';
import DOMPurify from 'dompurify';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Eye, 
  Columns2, 
  Maximize2, 
  Minimize2, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Heart, 
  ShieldCheck, 
  Calendar, 
  X, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Maximize, 
  Monitor, 
  Smartphone,
  Layers,
  Edit3,
  LayoutGrid,
  AlignJustify,
  Type,
  SlidersHorizontal,
  Trash2,
  Check
} from 'lucide-react';

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23e4e4e7"/><path fill="%23a1a1aa" d="M64 28a22 22 0 1 0 0 44 22 22 0 0 0 0-44zM32 98c0-17.7 14.3-30 32-30s32 12.3 32 30v6H32v-6z"/></svg>`;

// Register custom formats with Quill to preserve custom width, style, classes, and figures
if (Quill) {
  try {
    const BlockEmbed = Quill.import('blots/block/embed') || Quill.import('blots/block');
    const BaseImage = Quill.import('formats/image');

    // 1. Enhanced Image Blot that supports width, height, style, class, data-width, data-placement
    if (BaseImage) {
      class CustomImageBlot extends BaseImage {
        static formats(domNode) {
          const formats = super.formats ? super.formats(domNode) : {};
          ['style', 'class', 'width', 'height', 'data-width', 'data-placement'].forEach((attr) => {
            if (domNode.hasAttribute(attr)) {
              formats[attr] = domNode.getAttribute(attr);
            }
          });
          return formats;
        }

        format(name, value) {
          if (['style', 'class', 'width', 'height', 'data-width', 'data-placement'].includes(name)) {
            if (value) {
              this.domNode.setAttribute(name, value);
            } else {
              this.domNode.removeAttribute(name);
            }
          } else {
            super.format(name, value);
          }
        }
      }
      Quill.register('formats/image', CustomImageBlot, true);
    }

    // 2. Custom Figure BlockEmbed that preserves the entire figure, image, sizing, flow, and styled caption
    if (BlockEmbed) {
      class FigureBlot extends BlockEmbed {
        static blotName = 'figure';
        static tagName = 'FIGURE';
        static className = 'story-img';

        static create(value) {
          const node = super.create(value);
          const data = typeof value === 'object' && value !== null ? value : { url: String(value || '') };
          const url = data.url || '';
          const alt = data.alt || data.caption || 'Field Story Photo';
          const caption = data.caption || '';
          const placement = data.placement || 'center';
          const width = Math.min(Math.max(Number(data.width) || 100, 15), 100);

          node.setAttribute('data-width', String(width));
          node.setAttribute('data-placement', placement);

          let placementClass = 'story-img story-img-center mx-auto my-6 block text-center clear-both';
          let figureStyle = `width: ${width}%; max-width: 100%; text-align: center;`;
          if (placement === 'left') {
            placementClass = 'story-img story-img-left float-left mr-6 mb-4 clear-left text-center';
          } else if (placement === 'right') {
            placementClass = 'story-img story-img-right float-right ml-6 mb-4 clear-right text-center';
          } else if (placement === 'banner') {
            placementClass = 'story-img story-img-banner w-full my-6 block clear-both text-center';
            figureStyle = 'width: 100%; max-width: 100%; text-align: center;';
          }

          node.className = placementClass;
          node.setAttribute('style', figureStyle);

          const captionHtml = caption && caption.trim()
            ? `<figcaption class="story-img-caption text-xs text-zinc-500 dark:text-zinc-400 text-center italic mt-2.5 font-medium py-1 px-3 leading-relaxed" style="display: block; width: fit-content; max-width: 90%; margin: 0.625rem auto 0 auto; text-align: center; font-style: italic; font-size: 0.8125rem; line-height: 1.45; color: #52525b; padding: 0.35rem 0.85rem; border-bottom: 1px solid #e4e4e7; border-radius: 0.5rem; background: rgba(244,244,245,0.6);">${caption.trim()}</figcaption>`
            : '';

          node.innerHTML = `
            <img src="${url}" alt="${alt}" class="rounded-2xl w-full h-auto object-cover shadow-sm border border-gray-200 dark:border-zinc-800 block mx-auto" style="width: 100%; height: auto; display: block;" />
            ${captionHtml}
          `;

          return node;
        }

        static value(domNode) {
          const img = domNode.querySelector('img');
          const figcaption = domNode.querySelector('figcaption');
          return {
            url: img ? img.getAttribute('src') : '',
            alt: img ? img.getAttribute('alt') : '',
            caption: figcaption ? figcaption.textContent : '',
            width: domNode.getAttribute('data-width') || 100,
            placement: domNode.getAttribute('data-placement') || 'center'
          };
        }

        static formats(domNode) {
          return {
            width: domNode.getAttribute('data-width') || domNode.style.width,
            placement: domNode.getAttribute('data-placement')
          };
        }

        format(name, value) {
          if (name === 'width') {
            const safeWidth = Math.min(Math.max(Number(value) || 100, 15), 100);
            this.domNode.setAttribute('data-width', String(safeWidth));
            this.domNode.style.width = `${safeWidth}%`;
          } else if (name === 'placement') {
            this.domNode.setAttribute('data-placement', value);
            this.domNode.classList.remove('story-img-left', 'story-img-right', 'story-img-center', 'story-img-banner', 'float-left', 'float-right', 'mx-auto', 'w-full', 'clear-left', 'clear-right', 'clear-both');
            if (value === 'left') {
              this.domNode.classList.add('story-img-left', 'float-left', 'mr-6', 'mb-4', 'clear-left');
            } else if (value === 'right') {
              this.domNode.classList.add('story-img-right', 'float-right', 'ml-6', 'mb-4', 'clear-right');
            } else if (value === 'banner') {
              this.domNode.classList.add('story-img-banner', 'w-full', 'my-6', 'block', 'clear-both');
              this.domNode.style.width = '100%';
            } else {
              this.domNode.classList.add('story-img-center', 'mx-auto', 'my-6', 'block', 'clear-both');
            }
          } else {
            super.format(name, value);
          }
        }
      }
      Quill.register('formats/figure', FigureBlot, true);
    }
  } catch (err) {
    console.warn('Quill Blot registration warning:', err);
  }
}

const WriteFieldStoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  // Form State
  const [story, setStory] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    tags: '',
    showDonationCard: true,
    status: 'pending'
  });

  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Mode: 'split' (50/50), 'editor' (100% editor), 'enlarged' (35% editor / 65% preview), 'preview' (100% preview)
  const [viewMode, setViewMode] = useState('split');
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  // In-Content Image Insertion & Sizing State
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingTargetNode, setEditingTargetNode] = useState(null);
  const [selectedEditorImage, setSelectedEditorImage] = useState(null);
  const [insetImage, setInsetImage] = useState({
    url: '',
    placement: 'center', // 'center' | 'left' | 'right' | 'banner'
    width: 100,          // Manual width percentage (15% to 100%)
    caption: '',
    alt: ''
  });

  // Multi-Column Layout Builder State
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnConfig, setColumnConfig] = useState({
    layout: 'text-image', // 'text-image' | 'image-text' | 'text-text' | 'image-image'
    ratio: '50-50',       // '50-50' | '60-40' | '40-60' | '70-30' | '30-70'
    cardStyle: 'card',    // 'card' | 'clean'
    verticalAlign: 'center', // 'center' | 'top'
    colText: {
      heading: '',
      body: '',
      align: 'left' // 'left' | 'center' | 'right' | 'justify'
    },
    colImage: {
      url: '',
      caption: '',
      alt: ''
    },
    colText2: {
      heading: '',
      body: '',
      align: 'left'
    },
    colImage2: {
      url: '',
      caption: '',
      alt: ''
    }
  });

  const quillRef = useRef(null);

  // Fetch volunteer profile for live donation card attribution
  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        const response = await axiosInstance.get('/volunteers/my-portal');
        if (response.data?.volunteer) {
          setVolunteer(response.data.volunteer);
        }
      } catch (err) {
        console.error('Failed to load volunteer details:', err);
      }
    };
    if (user) fetchVolunteer();
  }, [user]);

  // If editing an existing article, fetch its details
  useEffect(() => {
    if (!id) return;
    const fetchExistingPost = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/blog/my-posts');
        const posts = response.data.posts || [];
        const existing = posts.find(p => p._id === id);
        if (existing) {
          setStory({
            ...existing,
            tags: Array.isArray(existing.tags) ? existing.tags.join(', ') : (existing.tags || '')
          });
          if (existing.volunteerId) {
            setVolunteer(existing.volunteerId);
          }
        } else {
          toast.error('Article not found or access denied');
          navigate('/volunteer/dashboard');
        }
      } catch (error) {
        console.error('Failed to load story for editing:', error);
        toast.error('Failed to load article');
        navigate('/volunteer/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchExistingPost();
  }, [id, navigate]);

  // Open fresh modal for inserting a new photo
  const handleOpenInsertModal = () => {
    setEditingTargetNode(null);
    setInsetImage({
      url: '',
      placement: 'center',
      width: 100,
      caption: '',
      alt: ''
    });
    setShowImageModal(true);
  };

  // Adjust placement and adapt default width intelligently
  const handlePlacementChange = (newPlacement) => {
    let newWidth = insetImage.width;
    if (newPlacement === 'banner') {
      newWidth = 100;
    } else if ((newPlacement === 'left' || newPlacement === 'right') && insetImage.width === 100) {
      newWidth = 50; // Smart default for wrap float
    }
    setInsetImage(prev => ({
      ...prev,
      placement: newPlacement,
      width: newWidth
    }));
  };

  // Custom Quill Toolbar configuration with image handler override
  const quillModules = useRef({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: () => {
          handleOpenInsertModal();
        }
      }
    }
  }).current;

  // Generate responsive HTML string for in-content photo figure with custom manual width
  const generateFigureHtml = ({ url, alt, caption, placement, width }) => {
    const safeWidth = Math.min(Math.max(Number(width) || 100, 15), 100);
    const captionHtml = caption?.trim()
      ? `<figcaption class="story-img-caption text-xs text-zinc-500 dark:text-zinc-400 text-center italic mt-2.5 font-medium py-1 px-3 leading-relaxed" style="display: block; width: fit-content; max-width: 90%; margin: 0.625rem auto 0 auto; text-align: center; font-style: italic; font-size: 0.8125rem; line-height: 1.45; color: #52525b; padding: 0.35rem 0.85rem; border-bottom: 1px solid #e4e4e7; border-radius: 0.5rem; background: rgba(244,244,245,0.6);">${caption.trim()}</figcaption>`
      : '';

    let placementClass = 'story-img story-img-center mx-auto my-6 block text-center clear-both';
    let figureStyle = `width: ${safeWidth}%; max-width: 100%; text-align: center;`;

    if (placement === 'left') {
      placementClass = 'story-img story-img-left float-left mr-6 mb-4 clear-left text-center';
    } else if (placement === 'right') {
      placementClass = 'story-img story-img-right float-right ml-6 mb-4 clear-right text-center';
    } else if (placement === 'banner') {
      placementClass = 'story-img story-img-banner w-full my-6 block clear-both text-center';
      figureStyle = 'width: 100%; max-width: 100%; text-align: center;';
    }

    return `
      <figure class="${placementClass}" style="${figureStyle}" data-width="${safeWidth}" data-placement="${placement}">
        <img src="${url}" alt="${alt || caption || 'Field Story Photo'}" class="rounded-2xl w-full h-auto object-cover shadow-sm border border-gray-200 dark:border-zinc-800 block mx-auto" style="width: 100%; height: auto; display: block;" />
        ${captionHtml}
      </figure>
      <p><br></p>
    `;
  };

  // Insert image with chosen manual width and placement into Quill editor
  const handleInsertImageToEditor = (e) => {
    e?.preventDefault();
    if (!insetImage.url) {
      toast.error('Please upload an image or provide an image URL');
      return;
    }

    const editor = quillRef.current?.getEditor();
    if (!editor) {
      toast.error('Editor not ready');
      return;
    }

    const figureHtml = generateFigureHtml(insetImage);

    // If editing existing photo node in editor
    if (editingTargetNode && editingTargetNode.parentNode) {
      const temp = document.createElement('div');
      temp.innerHTML = figureHtml.trim();
      const newElement = temp.firstElementChild;
      editingTargetNode.parentNode.replaceChild(newElement, editingTargetNode);

      // Sync Quill delta and state with editor's innerHTML
      editor.update();
      setStory(prev => ({ ...prev, content: editor.root.innerHTML }));
      setEditingTargetNode(null);
      setSelectedEditorImage(null);
      setShowImageModal(false);
      toast.success('Photo size and settings updated!');
      return;
    }

    // Otherwise insert new photo at cursor position
    const range = editor.getSelection(true);
    const index = range ? range.index : editor.getLength();

    try {
      editor.insertEmbed(index, 'figure', insetImage);
      editor.setSelection(index + 1);
    } catch (err) {
      editor.clipboard.dangerouslyPasteHTML(index, figureHtml);
      editor.setSelection(index + 2);
    }

    editor.update();
    setStory(prev => ({ ...prev, content: editor.root.innerHTML }));
    setShowImageModal(false);
    toast.success(`Photo inserted at ${insetImage.width}% width (${insetImage.placement})!`);
  };

  // Helper to extract photo attributes from DOM node (figure or bare img)
  const extractPhotoDetails = (target) => {
    if (!target) return null;
    const img = target.tagName === 'IMG' ? target : target.querySelector('img');
    if (!img) return null;

    const figure = target.closest('figure') || img.closest('figure');
    let currentWidth = 100;
    let currentPlacement = 'center';
    let currentCaption = '';
    const currentAlt = img.getAttribute('alt') || '';
    const currentUrl = img.src || '';

    if (figure) {
      const styleWidth = figure.style.width;
      if (styleWidth && styleWidth.includes('%')) {
        currentWidth = parseInt(styleWidth, 10) || 100;
      } else if (figure.getAttribute('data-width')) {
        currentWidth = parseInt(figure.getAttribute('data-width'), 10) || 100;
      }

      if (figure.classList.contains('story-img-left')) currentPlacement = 'left';
      else if (figure.classList.contains('story-img-right')) currentPlacement = 'right';
      else if (figure.classList.contains('story-img-banner')) currentPlacement = 'banner';
      else currentPlacement = 'center';

      const figcaption = figure.querySelector('figcaption');
      if (figcaption) {
        currentCaption = figcaption.textContent || '';
      }
    } else {
      const styleWidth = img.style.width;
      if (styleWidth && styleWidth.includes('%')) {
        currentWidth = parseInt(styleWidth, 10) || 100;
      }
    }

    return {
      targetNode: figure || img,
      url: currentUrl,
      width: currentWidth,
      placement: currentPlacement,
      caption: currentCaption,
      alt: currentAlt
    };
  };

  // Click handler for editor container (Single click selects image & reveals quick control bar)
  const handleEditorContainerClick = (e) => {
    const editor = quillRef.current?.getEditor();
    const img = e.target.closest('img');
    const figure = e.target.closest('figure');

    if (img || figure) {
      const details = extractPhotoDetails(img || figure);
      if (details) {
        // Highlight selected element in editor
        if (editor?.root) {
          editor.root.querySelectorAll('.selected-figure, .selected-image').forEach(el => {
            el.classList.remove('selected-figure', 'selected-image');
          });
        }
        if (details.targetNode.tagName === 'FIGURE') {
          details.targetNode.classList.add('selected-figure');
        } else {
          details.targetNode.classList.add('selected-image');
        }

        setSelectedEditorImage(details);
        return;
      }
    }

    // Deselect if clicked elsewhere in editor (and not clicking the quick control bar)
    if (!e.target.closest('.image-quick-control-bar')) {
      setSelectedEditorImage(null);
      if (editor?.root) {
        editor.root.querySelectorAll('.selected-figure, .selected-image').forEach(el => {
          el.classList.remove('selected-figure', 'selected-image');
        });
      }
    }
  };

  // Double-click handler for editor container (Double click opens the full adjust/replace modal)
  const handleEditorContainerDblClick = (e) => {
    const img = e.target.closest('img');
    const figure = e.target.closest('figure');

    if (img || figure) {
      const details = extractPhotoDetails(img || figure);
      if (details) {
        e.preventDefault();
        e.stopPropagation();
        setEditingTargetNode(details.targetNode);
        setInsetImage({
          url: details.url,
          placement: details.placement,
          width: details.width,
          caption: details.caption,
          alt: details.alt
        });
        setShowImageModal(true);
      }
    }
  };

  // Fallback listener attachment directly on Quill root once ready
  useEffect(() => {
    let cleanup = null;
    const interval = setInterval(() => {
      const editor = quillRef.current?.getEditor();
      if (editor && editor.root && !cleanup) {
        const root = editor.root;
        const nativeClick = (e) => {
          const img = e.target.closest('img');
          const figure = e.target.closest('figure');
          if (img || figure) {
            handleEditorContainerClick(e);
          }
        };
        const nativeDblClick = (e) => {
          const img = e.target.closest('img');
          const figure = e.target.closest('figure');
          if (img || figure) {
            handleEditorContainerDblClick(e);
          }
        };

        root.addEventListener('click', nativeClick);
        root.addEventListener('dblclick', nativeDblClick);
        cleanup = () => {
          root.removeEventListener('click', nativeClick);
          root.removeEventListener('dblclick', nativeDblClick);
        };
        clearInterval(interval);
      }
    }, 200);

    return () => {
      clearInterval(interval);
      if (cleanup) cleanup();
    };
  }, []);

  // Quick In-Editor Sizing: Update Width
  const updateSelectedImageWidth = (newWidth) => {
    if (!selectedEditorImage) return;
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    let target = selectedEditorImage.targetNode;
    if (!target) return;

    const safeWidth = Math.min(Math.max(Number(newWidth), 15), 100);

    if (target.tagName === 'IMG') {
      const parentFigure = target.closest('figure');
      if (parentFigure) {
        target = parentFigure;
      }
    }

    target.style.width = `${safeWidth}%`;
    target.style.maxWidth = '100%';
    target.style.textAlign = 'center';
    target.classList.add('text-center');
    target.setAttribute('data-width', String(safeWidth));
    target.setAttribute('width', `${safeWidth}%`);

    const childImg = target.tagName === 'FIGURE' ? target.querySelector('img') : target;
    if (childImg && childImg !== target) {
      childImg.style.width = '100%';
      childImg.setAttribute('width', '100%');
    }

    // Keep caption strictly styled, centered, and italic
    const cap = target.querySelector('figcaption');
    if (cap) {
      cap.style.display = 'block';
      cap.style.width = 'fit-content';
      cap.style.maxWidth = '90%';
      cap.style.marginLeft = 'auto';
      cap.style.marginRight = 'auto';
      cap.style.textAlign = 'center';
      cap.style.fontStyle = 'italic';
      cap.classList.add('text-center', 'italic');
    }

    try {
      const blot = Quill.find(target);
      if (blot && typeof blot.format === 'function') {
        blot.format('width', safeWidth);
      }
    } catch (e) {}

    editor.update();
    setSelectedEditorImage(prev => ({ ...prev, width: safeWidth, targetNode: target }));
    setStory(prev => ({ ...prev, content: editor.root.innerHTML }));
    toast.success(`Photo width set to ${safeWidth}%`);
  };

  // Quick In-Editor Sizing: Update Placement Flow
  const updateSelectedImagePlacement = (newPlacement) => {
    if (!selectedEditorImage) return;
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    let target = selectedEditorImage.targetNode;
    if (!target) return;

    if (target.tagName === 'IMG') {
      const parentFigure = target.closest('figure');
      if (parentFigure) {
        target = parentFigure;
      }
    }

    target.classList.remove(
      'story-img-left', 'story-img-right', 'story-img-center', 'story-img-banner',
      'float-left', 'float-right', 'mx-auto', 'w-full', 'clear-left', 'clear-right',
      'clear-both'
    );

    target.classList.add('text-center');
    target.style.textAlign = 'center';

    let newWidth = selectedEditorImage.width;
    if (newPlacement === 'banner') {
      newWidth = 100;
      target.classList.add('story-img-banner', 'w-full', 'my-6', 'block', 'clear-both');
      target.style.width = '100%';
    } else if (newPlacement === 'left') {
      if (newWidth === 100) newWidth = 50;
      target.classList.add('story-img-left', 'float-left', 'mr-6', 'mb-4', 'clear-left');
      target.style.width = `${newWidth}%`;
    } else if (newPlacement === 'right') {
      if (newWidth === 100) newWidth = 50;
      target.classList.add('story-img-right', 'float-right', 'ml-6', 'mb-4', 'clear-right');
      target.style.width = `${newWidth}%`;
    } else {
      target.classList.add('story-img-center', 'mx-auto', 'my-6', 'block', 'clear-both');
      target.style.width = `${newWidth}%`;
    }
    target.setAttribute('data-width', String(newWidth));
    target.setAttribute('data-placement', newPlacement);

    // Keep caption strictly styled, centered, and italic
    const cap = target.querySelector('figcaption');
    if (cap) {
      cap.style.display = 'block';
      cap.style.width = 'fit-content';
      cap.style.maxWidth = '90%';
      cap.style.marginLeft = 'auto';
      cap.style.marginRight = 'auto';
      cap.style.textAlign = 'center';
      cap.style.fontStyle = 'italic';
      cap.classList.add('text-center', 'italic');
    }

    try {
      const blot = Quill.find(target);
      if (blot && typeof blot.format === 'function') {
        blot.format('placement', newPlacement);
      }
    } catch (e) {}

    editor.update();
    setSelectedEditorImage(prev => ({ ...prev, placement: newPlacement, width: newWidth, targetNode: target }));
    setStory(prev => ({ ...prev, content: editor.root.innerHTML }));
    toast.success(`Placement set to ${newPlacement}!`);
  };

  // Quick In-Editor Sizing: Delete Image
  const deleteSelectedImage = () => {
    if (!selectedEditorImage?.targetNode) return;
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    selectedEditorImage.targetNode.remove();
    editor.update();
    setSelectedEditorImage(null);
    setStory(prev => ({ ...prev, content: editor.root.innerHTML }));
    toast.success('Photo removed from story');
  };

  // Insert Multi-Column Section into Quill editor
  const handleInsertColumnsToEditor = () => {
    const editor = quillRef.current?.getEditor();
    if (!editor) {
      toast.error('Editor not ready');
      return;
    }

    const { layout, ratio, cardStyle, verticalAlign, colText, colImage, colText2, colImage2 } = columnConfig;

    // Validate image requirements
    if ((layout === 'text-image' || layout === 'image-text') && !colImage.url) {
      toast.error('Please upload or provide an image URL for the photo column');
      return;
    }
    if (layout === 'image-image' && (!colImage.url || !colImage2.url)) {
      toast.error('Please upload or provide image URLs for both photo columns');
      return;
    }

    // Calculate grid column span ratios
    let col1Span = 'md:col-span-6';
    let col2Span = 'md:col-span-6';

    if (ratio === '60-40') {
      col1Span = 'md:col-span-7';
      col2Span = 'md:col-span-5';
    } else if (ratio === '40-60') {
      col1Span = 'md:col-span-5';
      col2Span = 'md:col-span-7';
    } else if (ratio === '70-30') {
      col1Span = 'md:col-span-8';
      col2Span = 'md:col-span-4';
    } else if (ratio === '30-70') {
      col1Span = 'md:col-span-4';
      col2Span = 'md:col-span-8';
    }

    const getTextAlignClass = (align) => {
      if (align === 'center') return 'text-center';
      if (align === 'right') return 'text-right';
      if (align === 'justify') return 'text-justify';
      return 'text-left';
    };

    const renderTextCol = (textData) => `
      <div class="space-y-2 ${getTextAlignClass(textData.align)}">
        ${textData.heading?.trim() ? `<h3 class="text-lg font-bold text-zinc-900 dark:text-white leading-snug mb-1.5">${textData.heading.trim()}</h3>` : ''}
        <p class="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">${textData.body?.trim() || 'Write description here...'}</p>
      </div>
    `;

    const renderImageCol = (imageData) => `
      <figure class="rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-zinc-800 text-center" style="text-align: center;">
        <img src="${imageData.url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800'}" alt="${imageData.alt || imageData.caption || 'Field Story photo'}" class="w-full h-auto object-cover rounded-2xl block mx-auto" style="width: 100%; height: auto; display: block;" />
        ${imageData.caption?.trim() ? `<figcaption class="story-img-caption text-[11px] text-zinc-500 dark:text-zinc-400 text-center italic mt-2 py-1 px-2 font-medium" style="display: block; width: 100%; text-align: center; font-style: italic; margin-top: 0.5rem;">${imageData.caption.trim()}</figcaption>` : ''}
      </figure>
    `;

    let col1Content = '';
    let col2Content = '';

    if (layout === 'text-image') {
      col1Content = renderTextCol(colText);
      col2Content = renderImageCol(colImage);
    } else if (layout === 'image-text') {
      col1Content = renderImageCol(colImage);
      col2Content = renderTextCol(colText);
    } else if (layout === 'text-text') {
      col1Content = renderTextCol(colText);
      col2Content = renderTextCol(colText2);
    } else if (layout === 'image-image') {
      col1Content = renderImageCol(colImage);
      col2Content = renderImageCol(colImage2);
    }

    const containerStyleClass = cardStyle === 'card'
      ? 'p-6 sm:p-7 rounded-3xl bg-gray-50/90 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 shadow-2xs'
      : 'my-6';

    const vAlignClass = verticalAlign === 'center' ? 'items-center' : 'items-start';

    const columnsHtml = `
      <div class="story-columns-container my-8 ${containerStyleClass} grid grid-cols-1 md:grid-cols-12 gap-6 ${vAlignClass}">
        <div class="${col1Span}">
          ${col1Content}
        </div>
        <div class="${col2Span}">
          ${col2Content}
        </div>
      </div>
      <p><br></p>
    `;

    const range = editor.getSelection(true);
    const index = range ? range.index : editor.getLength();
    editor.clipboard.dangerouslyPasteHTML(index, columnsHtml);
    editor.setSelection(index + 2);

    setShowColumnModal(false);
    toast.success('Column section inserted into story!');
  };

  // Submit or Save Draft
  const handleSave = async (targetStatus = 'pending') => {
    if (!story.title.trim()) {
      toast.error('Please provide a story headline');
      return;
    }
    if (!story.summary.trim()) {
      toast.error('Please enter a brief summary excerpt');
      return;
    }
    if (!story.content.trim()) {
      toast.error('Please write article content');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...story,
        status: targetStatus
      };

      if (id) {
        await axiosInstance.put(`/blog/${id}`, payload);
        toast.success(targetStatus === 'draft' ? 'Draft updated successfully!' : 'Story submitted for admin review!');
      } else {
        await axiosInstance.post('/blog', payload);
        toast.success(targetStatus === 'draft' ? 'Draft saved successfully!' : 'Story submitted for admin review!');
      }

      navigate('/volunteer/dashboard');
    } catch (error) {
      console.error('Failed to save article:', error);
      toast.error(error.response?.data?.error || 'Failed to save article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanContent = (html) => {
    if (!html) return '';
    return html
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&shy;/g, '');
  };

  // Resolve volunteer data for live preview
  const liveVolunteer = volunteer ? {
    _id: volunteer._id,
    name: volunteer.name,
    image: volunteer.image,
    volunteerCode: volunteer.fundraiserCode || volunteer.volunteerCode,
    fundraiserCode: volunteer.fundraiserCode || volunteer.volunteerCode,
    designation: volunteer.designation || 'Official Fundraiser Lead',
    role: volunteer.role || 'Volunteer',
    upiId: volunteer.upiId,
    directPaymentQrImage: volunteer.directPaymentQrImage
  } : {
    name: user?.name || 'Volunteer Author',
    volunteerCode: 'BRF-VOL-XXXXXX',
    designation: 'Campaign Field Lead'
  };

  const wordCount = story.content
    ? story.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pt-24 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-zinc-500">Loading Story Studio...</p>
        </div>
      </div>
    );
  }

  // Smoothly scroll to the live preview donation card
  const scrollToPreviewDonationCard = () => {
    const isDesktop = window.innerWidth >= 1280;
    const targetId = isDesktop ? 'preview-donation-card-desktop' : 'preview-donation-card-mobile';
    const el = document.getElementById(targetId) || document.getElementById('preview-donation-card-mobile') || document.getElementById('preview-donation-card-desktop');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-amber-400', 'rounded-3xl', 'transition-all');
      setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 1800);
    }
  };

  // Render the article live preview content
  const renderArticlePreview = () => (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm text-left">
      
      {/* Pending / Preview Badge */}
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-xl text-xs font-bold mb-6 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Real-Time Blog Preview • {story.title ? 'Live Rendering' : 'Drafting'}</span>
        </span>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20">
          Admin Approval Required
        </span>
      </div>

      {/* Meta Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <span>•</span>
        <span>By {liveVolunteer.name}</span>
        {story.tags && (
          <div className="flex flex-wrap gap-1 ml-1">
            {story.tags.split(',').map((t, idx) => {
              const cleanTag = t.trim();
              if (!cleanTag) return null;
              return (
                <span key={idx} className="bg-gray-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  #{cleanTag}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white leading-tight tracking-tight mb-6">
        {story.title || <span className="text-zinc-300 dark:text-zinc-700 italic">Your Story Headline Will Appear Here...</span>}
      </h1>

      {/* Author Banner */}
      <div className="flex items-center justify-between gap-4 bg-amber-50/70 dark:bg-zinc-950 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 mb-8 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={liveVolunteer.image || DEFAULT_AVATAR}
              alt={liveVolunteer.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-xs"
            />
            <span className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-zinc-950 p-0.5 rounded-full shadow-xs">
              <ShieldCheck className="w-3 h-3" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white truncate">
                {liveVolunteer.name}
              </h4>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Fundraiser
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {liveVolunteer.designation || 'Campaign Field Lead'}
            </p>
          </div>
        </div>

        {story.showDonationCard !== false && (
          <button
            type="button"
            onClick={scrollToPreviewDonationCard}
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs inline-flex items-center gap-1.5 hover:scale-102 active:scale-98"
          >
            <Heart className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Make a Donation</span>
          </button>
        )}
      </div>

      {/* Hero Cover Image */}
      {story.coverImage ? (
        <div className="w-full aspect-[16/9] bg-gray-100 dark:bg-zinc-800 rounded-2xl overflow-hidden mb-8 border border-gray-200/70 dark:border-zinc-800 shadow-sm">
          <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full aspect-[21/9] bg-gray-50 dark:bg-zinc-800/50 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-xs text-zinc-400 mb-8">
          <span>Hero Cover Photo (Upload in Editor)</span>
        </div>
      )}

      {/* Summary Excerpt Quote */}
      {story.summary ? (
        <div className="bg-gray-50 dark:bg-zinc-950 border-l-4 border-amber-500 p-5 mb-8 text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed rounded-r-xl italic shadow-2xs">
          "{story.summary}"
        </div>
      ) : null}

      {/* Layout for Article Body + Embedded Donation Card */}
      {(() => {
        const isSideBySide = story.showDonationCard !== false && (viewMode === 'preview' || isFullscreenPreview);
        return (
          <div className={isSideBySide ? "xl:flex xl:items-start xl:gap-10" : ""}>
            
            {/* Main Body with Formatted Float/Center Images & Fluid Width */}
            <div className={isSideBySide ? "flex-1 min-w-0" : ""}>
              <div
                className="blog-content text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed space-y-4 pb-8 clearfix"
                dangerouslySetInnerHTML={{
                  __html: cleanContent(
                    DOMPurify.sanitize(story.content || '<p class="text-zinc-400 italic">Story body is empty. Type in the editor to see live updates...</p>', {
                      ADD_TAGS: ['figure', 'figcaption', 'img', 'div', 'h3', 'h4', 'p', 'span'],
                      ADD_ATTR: ['class', 'src', 'alt', 'target', 'href', 'style', 'width', 'height', 'data-width', 'data-placement']
                    })
                  )
                }}
              />

              {/* Inline Donation Card on Phone, Medium Devices (< 1280px), and Split/Enlarged views */}
              {story.showDonationCard !== false && (
                <div id="preview-donation-card-mobile" className={isSideBySide ? "block xl:hidden mt-10 max-w-lg mx-auto w-full scroll-mt-24" : "block mt-8 max-w-lg mx-auto w-full scroll-mt-24"}>
                  <VolunteerDonationCard volunteer={liveVolunteer} previewMode={true} compact={true} />
                </div>
              )}
            </div>

            {/* Desktop Sticky Sidebar with Fixed Width (Only in Full Preview / Fullscreen on >= 1280px) */}
            {story.showDonationCard !== false ? (
              isSideBySide ? (
                <div id="preview-donation-card-desktop" className="hidden xl:block w-[380px] shrink-0 sticky top-24 scroll-mt-24">
                  <VolunteerDonationCard volunteer={liveVolunteer} previewMode={true} compact={true} />
                </div>
              ) : null
            ) : (
              <div className="mt-8 p-4 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs text-zinc-400 text-center">
                Personalized Donation Card is disabled for this article.
              </div>
            )}

          </div>
        );
      })()}

      {/* Author Bio Box */}
      <div className="mt-10 pt-6 border-t border-gray-100 dark:border-zinc-800 flex items-start gap-4">
        <img
          src={liveVolunteer.image || DEFAULT_AVATAR}
          alt={liveVolunteer.name}
          className="w-12 h-12 rounded-2xl object-cover border border-amber-400 shrink-0"
        />
        <div className="text-left">
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
            Written by {liveVolunteer.name}
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
            Authorized grassroots volunteer with Black Rose Foundation. All donations attributed to this author support ground initiatives and are 100% tax deductible under section 80G.
          </p>
        </div>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-zinc-950 pt-20 sm:pt-24 pb-16 transition-colors">
      
      {/* ======================================================== */}
      {/* 1. TOP CONTROL BAR                                       */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Back Button & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Leave story studio? Any unsaved changes will be lost.')) {
                  navigate('/volunteer/dashboard');
                }
              }}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white">
                  {id ? 'Edit Field Story' : 'Field Story Studio'}
                </h1>
                {story.status === 'published' ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Live</span>
                ) : story.status === 'pending' ? (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Pending</span>
                ) : (
                  <span className="bg-gray-100 text-zinc-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Draft</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                {wordCount} words • Write ground updates with real-time live preview & donation card
              </p>
            </div>
          </div>

          {/* Enlarge & View Mode Toggles */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            
            {/* View Mode Presets */}
            <div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl flex items-center gap-1 border border-gray-200/80 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'editor'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="Editor Focus (100% Editor)"
              >
                Editor Only
              </button>

              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'split'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="Split View (50% / 50%)"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Split 50/50</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('enlarged')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'enlarged'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="Enlarge Preview (65% Preview)"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>Enlarge Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="Full Preview (100% Article View)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Full Preview</span>
              </button>
            </div>

            {/* Fullscreen Inspector Button */}
            <button
              type="button"
              onClick={() => setIsFullscreenPreview(true)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-gray-200 dark:border-zinc-700"
              title="Inspect Fullscreen Modal"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Save Actions */}
            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold cursor-pointer transition-all border border-gray-200 dark:border-zinc-700"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handleSave('pending')}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-white text-xs font-bold cursor-pointer transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit for Review'}</span>
            </button>

          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE (EDITOR + LIVE PREVIEW)                */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Editor Pane */}
          {(viewMode === 'editor' || viewMode === 'split' || viewMode === 'enlarged') && (
            <div className={`
              ${viewMode === 'editor' ? 'col-span-12 max-w-4xl mx-auto w-full' : ''}
              ${viewMode === 'split' ? 'col-span-12 lg:col-span-6' : ''}
              ${viewMode === 'enlarged' ? 'col-span-12 lg:col-span-4' : ''}
              space-y-5 text-left
            `}>
              <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Story Headline *
                  </label>
                  <input
                    type="text"
                    value={story.title}
                    onChange={(e) => setStory({ ...story, title: e.target.value })}
                    placeholder="e.g. Delivering Winter Relief Kits to 200 Families in Shimla"
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                {/* Category Tags */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={story.tags}
                    onChange={(e) => setStory({ ...story, tags: e.target.value })}
                    placeholder="e.g. WinterDrive, Children, Relief, Education"
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Cover Image Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Hero Cover Photo
                    </label>
                    <span className="text-[11px] text-zinc-400">Featured banner image</span>
                  </div>
                  <ImageUpload
                    currentImage={story.coverImage}
                    onUpload={(url) => setStory({ ...story, coverImage: url })}
                    onRemove={() => setStory({ ...story, coverImage: '' })}
                  />
                </div>

                {/* Summary Excerpt */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Summary Excerpt * (1–2 Catchy Sentences)
                  </label>
                  <textarea
                    rows={2}
                    value={story.summary}
                    onChange={(e) => setStory({ ...story, summary: e.target.value })}
                    placeholder="A brief summary that hooks readers and appears as a bold quote in your story..."
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                {/* Rich Story Content + Easy In-Content Photo Inserter */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Story Body Content *
                    </label>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Quick Button: Insert In-Content Photo with Caption */}
                      <button
                        type="button"
                        onClick={handleOpenInsertModal}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold cursor-pointer transition-all shadow-2xs"
                        title="Insert single photo with custom size, caption, and placement"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>+ Insert Photo & Sizing</span>
                      </button>

                      {/* Quick Button: Multi-Column Builder */}
                      <button
                        type="button"
                        onClick={() => setShowColumnModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 text-xs font-bold cursor-pointer transition-all shadow-2xs"
                        title="Insert multi-column text and photo section"
                      >
                        <Columns2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>+ Multi-Column Section</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Sizing Bar for Selected Photo in Editor */}
                  {selectedEditorImage && (
                    <div className="image-quick-control-bar mb-3 p-3 bg-zinc-900 text-white dark:bg-zinc-800 border border-zinc-700 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-white">Selected Photo Sizing</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                              {selectedEditorImage.width}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            <span>Flow: <strong className="capitalize text-zinc-200 font-semibold">{selectedEditorImage.placement}</strong></span>
                            {selectedEditorImage.caption ? (
                              <span className="truncate max-w-[180px] italic text-amber-300/90 font-medium">
                                • "{selectedEditorImage.caption}"
                              </span>
                            ) : (
                              <span className="text-zinc-500 italic">• (No caption)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Width Presets */}
                      <div className="flex items-center gap-1 bg-zinc-950/70 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-700/60">
                        <span className="text-[10px] text-zinc-400 px-1 font-bold">Width:</span>
                        {[
                          { label: '25%', val: 25 },
                          { label: '33%', val: 33 },
                          { label: '50%', val: 50 },
                          { label: '75%', val: 75 },
                          { label: '100%', val: 100 }
                        ].map(preset => (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => updateSelectedImageWidth(preset.val)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              selectedEditorImage.width === preset.val
                                ? 'bg-amber-500 text-zinc-950 shadow-xs font-extrabold'
                                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                            }`}
                            title={`Set width to ${preset.val}%`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* Flow Alignment */}
                      <div className="flex items-center gap-1 bg-zinc-950/70 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-700/60">
                        <span className="text-[10px] text-zinc-400 px-1 font-bold">Flow:</span>
                        {[
                          { id: 'left', icon: AlignLeft, title: 'Float Left (Text wraps right)' },
                          { id: 'center', icon: AlignCenter, title: 'Center (Block)' },
                          { id: 'right', icon: AlignRight, title: 'Float Right (Text wraps left)' },
                          { id: 'banner', icon: Maximize, title: 'Wide Banner (100% full width)' }
                        ].map(flow => {
                          const Icon = flow.icon;
                          return (
                            <button
                              key={flow.id}
                              type="button"
                              onClick={() => updateSelectedImagePlacement(flow.id)}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                selectedEditorImage.placement === flow.id
                                  ? 'bg-amber-500 text-zinc-950 shadow-xs'
                                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                              }`}
                              title={flow.title}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>

                      {/* Actions: Fine-tune Slider Modal or Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTargetNode(selectedEditorImage.targetNode);
                            setInsetImage({
                              url: selectedEditorImage.url,
                              placement: selectedEditorImage.placement,
                              width: selectedEditorImage.width,
                              caption: selectedEditorImage.caption,
                              alt: selectedEditorImage.alt
                            });
                            setShowImageModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                          title="Open detailed size slider, manual input, caption editor, or replace photo"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Adjust & Replace</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this photo from the story?')) {
                              deleteSelectedImage();
                            }
                          }}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl cursor-pointer transition-colors"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedEditorImage(null)}
                          className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer"
                          title="Done"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div 
                    className="rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-700"
                    onClick={handleEditorContainerClick}
                    onDoubleClick={handleEditorContainerDblClick}
                  >
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={story.content}
                      onChange={(content) => setStory({ ...story, content })}
                      modules={quillModules}
                      useSemanticHTML={false}
                      placeholder="Write your inspiring on-the-ground volunteer journey..."
                      className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white min-h-[320px]"
                    />
                  </div>
                </div>

                {/* Donation Card Toggle */}
                <div className="pt-3 border-t border-gray-100 dark:border-zinc-800">
                  <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={story.showDonationCard !== false}
                      onChange={(e) => setStory({ ...story, showDonationCard: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-zinc-900 dark:text-white block">
                        Embed my Personalized Donation Card
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-400 block mt-0.5 leading-relaxed">
                        Embeds your live Razorpay donation widget with 80G tax benefits and preset amounts in this story. Readers can contribute directly to your campaign ledger.
                      </span>
                    </div>
                  </label>
                </div>

              </div>
            </div>
          )}

          {/* Right Column: Live Preview Pane */}
          {(viewMode === 'preview' || viewMode === 'split' || viewMode === 'enlarged') && (
            <div className={`
              ${viewMode === 'preview' ? 'col-span-12 max-w-5xl mx-auto w-full' : ''}
              ${viewMode === 'split' ? 'col-span-12 lg:col-span-6' : ''}
              ${viewMode === 'enlarged' ? 'col-span-12 lg:col-span-8' : ''}
              space-y-4
            `}>
              {/* Preview Header Strip */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Interactive Live Preview
                  </span>
                </div>

                {/* Device Switcher */}
                <div className="flex items-center gap-1 bg-gray-200 dark:bg-zinc-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs' : 'text-zinc-400'
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      previewDevice === 'mobile' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs' : 'text-zinc-400'
                    }`}
                    title="Mobile View"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Preview Canvas Container */}
              <div className={previewDevice === 'mobile' ? "max-w-sm mx-auto shadow-2xl rounded-3xl overflow-hidden border-4 border-zinc-800" : ""}>
                {renderArticlePreview()}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. IN-CONTENT IMAGE PLACEMENT MODAL                       */}
      {/* ======================================================== */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto text-left space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                    {editingTargetNode ? 'Adjust Photo Size & Placement' : 'Insert Photo into Story'}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {editingTargetNode
                      ? 'Fine-tune the size, text flow alignment, and caption for this photo.'
                      : 'Upload an image and adjust its manual dimensions, text flow, and caption.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Upload Photo (Cloudinary)
                </label>
                <ImageUpload
                  currentImage={insetImage.url}
                  onUpload={(url) => setInsetImage({ ...insetImage, url })}
                  onRemove={() => setInsetImage({ ...insetImage, url: '' })}
                />
              </div>

              {/* Or Direct URL */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Or Paste Image URL
                </label>
                <input
                  type="url"
                  value={insetImage.url}
                  onChange={(e) => setInsetImage({ ...insetImage, url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Placement Selector (Visual Cards) */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  1. Select Photo Placement & Text Flow
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  
                  {/* Card 1: Center Block */}
                  <button
                    type="button"
                    onClick={() => handlePlacementChange('center')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                      insetImage.placement === 'center'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <AlignCenter className="w-5 h-5 mb-1 text-amber-500" />
                    <span className="text-[11px] font-bold block">Center</span>
                    <span className="text-[9px] text-zinc-400">Centered Block</span>
                  </button>

                  {/* Card 2: Left Float */}
                  <button
                    type="button"
                    onClick={() => handlePlacementChange('left')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                      insetImage.placement === 'left'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <AlignLeft className="w-5 h-5 mb-1 text-amber-500" />
                    <span className="text-[11px] font-bold block">Left Float</span>
                    <span className="text-[9px] text-zinc-400">Wrap Text Right</span>
                  </button>

                  {/* Card 3: Right Float */}
                  <button
                    type="button"
                    onClick={() => handlePlacementChange('right')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                      insetImage.placement === 'right'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <AlignRight className="w-5 h-5 mb-1 text-amber-500" />
                    <span className="text-[11px] font-bold block">Right Float</span>
                    <span className="text-[9px] text-zinc-400">Wrap Text Left</span>
                  </button>

                  {/* Card 4: Full Banner */}
                  <button
                    type="button"
                    onClick={() => handlePlacementChange('banner')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                      insetImage.placement === 'banner'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs'
                        : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Maximize className="w-5 h-5 mb-1 text-amber-500" />
                    <span className="text-[11px] font-bold block">Wide Banner</span>
                    <span className="text-[9px] text-zinc-400">100% Edge-to-Edge</span>
                  </button>

                </div>
              </div>

              {/* Manual Image Sizing Adjustment */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                    <span>2. Adjust Image Size / Width</span>
                  </label>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                    {insetImage.width}% width
                  </span>
                </div>

                {/* Quick Width Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                  {[
                    { label: 'Small (25%)', val: 25, desc: 'Compact thumbnail' },
                    { label: 'Third (33%)', val: 33, desc: '1/3 width' },
                    { label: 'Half (50%)', val: 50, desc: 'Balanced half-page' },
                    { label: 'Large (75%)', val: 75, desc: 'Focus feature' },
                    { label: 'Full (100%)', val: 100, desc: 'Full width' }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setInsetImage({ ...insetImage, width: preset.val })}
                      className={`px-2.5 py-2 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                        insetImage.width === preset.val
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 shadow-xs'
                          : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="block text-xs">{preset.label}</span>
                    </button>
                  ))}
                </div>

                {/* Interactive Slider + Numeric Stepper */}
                <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-gray-200 dark:border-zinc-700/60 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-zinc-400 shrink-0">15%</span>
                    <input
                      type="range"
                      min="15"
                      max="100"
                      step="1"
                      value={insetImage.width}
                      onChange={(e) => setInsetImage({ ...insetImage, width: Number(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none"
                    />
                    <span className="text-[11px] font-bold text-zinc-400 shrink-0">100%</span>
                    
                    {/* Stepper buttons and number input */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setInsetImage({ ...insetImage, width: Math.max(15, insetImage.width - 5) })}
                        className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-gray-300"
                        title="Decrease by 5%"
                      >
                        -5%
                      </button>
                      <input
                        type="number"
                        min="15"
                        max="100"
                        value={insetImage.width}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(15, Number(e.target.value) || 15));
                          setInsetImage({ ...insetImage, width: val });
                        }}
                        className="w-14 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-1.5 py-1 text-xs text-center font-mono font-bold text-zinc-900 dark:text-white"
                      />
                      <span className="text-xs text-zinc-500 font-bold">%</span>
                      <button
                        type="button"
                        onClick={() => setInsetImage({ ...insetImage, width: Math.min(100, insetImage.width + 5) })}
                        className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-gray-300"
                        title="Increase by 5%"
                      >
                        +5%
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 px-1">
                    <span>Drag slider or type exact percentage</span>
                    <span>{insetImage.placement === 'banner' ? 'Wide banner fills 100%' : 'Resizes fluidly across all devices'}</span>
                  </div>
                </div>
              </div>

              {/* Caption and Alt Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>3. Photo Caption (Shown below photo)</span>
                  </label>
                  <input
                    type="text"
                    value={insetImage.caption}
                    onChange={(e) => setInsetImage({ ...insetImage, caption: e.target.value })}
                    placeholder="e.g. Relief supplies distributed to local families"
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Appears centered in italics under the photo.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Alt Text (Accessibility & SEO)</span>
                  </label>
                  <input
                    type="text"
                    value={insetImage.alt}
                    onChange={(e) => setInsetImage({ ...insetImage, alt: e.target.value })}
                    placeholder="e.g. Volunteer handing grocery kits"
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Screen-reader description for visual accessibility.
                  </p>
                </div>
              </div>

              {/* Live Interactive In-Modal Mockup Preview */}
              {insetImage.url && (
                <div className="p-4 bg-gray-50/90 dark:bg-zinc-800/60 rounded-2xl border border-gray-200 dark:border-zinc-700/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-500" />
                      <span>Live Size & Layout Mockup</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Width: {insetImage.width}% • Flow: {insetImage.placement}
                    </span>
                  </div>

                  {/* Simulated story article container */}
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700 overflow-hidden clearfix text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {insetImage.placement === 'banner' ? (
                      <div>
                        <figure className="w-full mb-3 text-center">
                          <img
                            src={insetImage.url}
                            alt={insetImage.caption || 'Preview'}
                            className="w-full h-44 object-cover rounded-xl border border-gray-200 dark:border-zinc-700 block shadow-xs"
                          />
                          {insetImage.caption ? (
                            <figcaption className="text-xs text-zinc-600 dark:text-zinc-300 text-center italic mt-2 font-medium px-3 py-1 bg-zinc-100/90 dark:bg-zinc-800/90 rounded-lg w-fit max-w-[90%] mx-auto border-b border-zinc-200 dark:border-zinc-700">
                              {insetImage.caption}
                            </figcaption>
                          ) : (
                            <figcaption className="text-[10px] text-zinc-400 text-center italic mt-1">
                              (Add a caption above to see it displayed here)
                            </figcaption>
                          )}
                        </figure>
                        <p className="text-zinc-500">
                          Story narrative content follows beneath the edge-to-edge photo banner across the full width of the article...
                        </p>
                      </div>
                    ) : insetImage.placement === 'left' ? (
                      <div className="clearfix">
                        <figure
                          style={{ width: `${insetImage.width}%` }}
                          className="float-left mr-4 mb-3 max-w-full text-center"
                        >
                          <img
                            src={insetImage.url}
                            alt={insetImage.caption || 'Preview'}
                            className="w-full h-auto max-h-48 object-cover rounded-xl border border-gray-200 dark:border-zinc-700 block shadow-xs"
                          />
                          {insetImage.caption && (
                            <figcaption className="text-xs text-zinc-600 dark:text-zinc-300 text-center italic mt-2 font-medium px-3 py-1 bg-zinc-100/90 dark:bg-zinc-800/90 rounded-lg w-fit max-w-[90%] mx-auto border-b border-zinc-200 dark:border-zinc-700 leading-tight">
                              {insetImage.caption}
                            </figcaption>
                          )}
                        </figure>
                        <p>
                          This simulated paragraph shows how your article narrative will wrap right around the photo at <strong className="text-zinc-900 dark:text-white">{insetImage.width}%</strong> width. The text automatically flows down beside the image and smoothly expands across the full line once it clears the image height.
                        </p>
                        <p className="mt-2 text-zinc-400">
                          Volunteers and field coordinators use left-floated photographs to accompany case studies and milestone updates with high editorial polish.
                        </p>
                      </div>
                    ) : insetImage.placement === 'right' ? (
                      <div className="clearfix">
                        <figure
                          style={{ width: `${insetImage.width}%` }}
                          className="float-right ml-4 mb-3 max-w-full text-center"
                        >
                          <img
                            src={insetImage.url}
                            alt={insetImage.caption || 'Preview'}
                            className="w-full h-auto max-h-48 object-cover rounded-xl border border-gray-200 dark:border-zinc-700 block shadow-xs"
                          />
                          {insetImage.caption && (
                            <figcaption className="text-xs text-zinc-600 dark:text-zinc-300 text-center italic mt-2 font-medium px-3 py-1 bg-zinc-100/90 dark:bg-zinc-800/90 rounded-lg w-fit max-w-[90%] mx-auto border-b border-zinc-200 dark:border-zinc-700 leading-tight">
                              {insetImage.caption}
                            </figcaption>
                          )}
                        </figure>
                        <p>
                          This simulated paragraph shows how your article narrative wraps left around the photo at <strong className="text-zinc-900 dark:text-white">{insetImage.width}%</strong> width. Readers can naturally follow the narrative while glancing at the visual proof on the right.
                        </p>
                        <p className="mt-2 text-zinc-400">
                          Once the narrative passes the photo height, subsequent paragraphs automatically expand to the full width of the article container.
                        </p>
                      </div>
                    ) : (
                      // Center
                      <div className="text-center">
                        <figure
                          style={{ width: `${insetImage.width}%` }}
                          className="mx-auto mb-3 max-w-full text-center"
                        >
                          <img
                            src={insetImage.url}
                            alt={insetImage.caption || 'Preview'}
                            className="w-full h-auto max-h-56 object-cover rounded-xl border border-gray-200 dark:border-zinc-700 block mx-auto shadow-xs"
                          />
                          {insetImage.caption ? (
                            <figcaption className="text-xs text-zinc-600 dark:text-zinc-300 text-center italic mt-2 font-medium px-3 py-1 bg-zinc-100/90 dark:bg-zinc-800/90 rounded-lg w-fit max-w-[90%] mx-auto border-b border-zinc-200 dark:border-zinc-700">
                              {insetImage.caption}
                            </figcaption>
                          ) : (
                            <figcaption className="text-[10px] text-zinc-400 text-center italic mt-1">
                              (Add a caption above to see it displayed here)
                            </figcaption>
                          )}
                        </figure>
                        <p className="text-left text-zinc-500">
                          The centered photo occupies <strong className="text-zinc-900 dark:text-white">{insetImage.width}%</strong> of the container with clean margins on each side. Paragraphs appear before and after the block with distinct vertical separation.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsertImageToEditor}
                  disabled={!insetImage.url}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {editingTargetNode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Update Photo & Sizing</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Insert Photo ({insetImage.width}%)</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MULTI-COLUMN SECTION BUILDER MODAL                    */}
      {/* ======================================================== */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 w-full max-w-3xl shadow-2xl max-h-[92vh] overflow-y-auto text-left space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                  <Columns2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white">
                    Multi-Column Section Builder
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Pair text and field photos side-by-side with custom widths, alignment, and captions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowColumnModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Layout Arrangement */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                1. Choose Column Layout
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                
                {/* Option 1: Text + Photo */}
                <button
                  type="button"
                  onClick={() => setColumnConfig({ ...columnConfig, layout: 'text-image' })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    columnConfig.layout === 'text-image'
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs'
                      : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2 text-indigo-500">
                    <Type className="w-4 h-4" />
                    <span className="text-[10px]">+</span>
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold block">Text + Photo</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5 leading-tight">Story left, photo right</span>
                </button>

                {/* Option 2: Photo + Text */}
                <button
                  type="button"
                  onClick={() => setColumnConfig({ ...columnConfig, layout: 'image-text' })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    columnConfig.layout === 'image-text'
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs'
                      : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2 text-indigo-500">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-[10px]">+</span>
                    <Type className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold block">Photo + Text</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5 leading-tight">Photo left, story right</span>
                </button>

                {/* Option 3: Two Text Columns */}
                <button
                  type="button"
                  onClick={() => setColumnConfig({ ...columnConfig, layout: 'text-text' })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    columnConfig.layout === 'text-text'
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs'
                      : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2 text-indigo-500">
                    <Type className="w-4 h-4" />
                    <span className="text-[10px]">+</span>
                    <Type className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold block">Two Text Columns</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5 leading-tight">Compare or dual story</span>
                </button>

                {/* Option 4: Dual Photos */}
                <button
                  type="button"
                  onClick={() => setColumnConfig({ ...columnConfig, layout: 'image-image' })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    columnConfig.layout === 'image-image'
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs'
                      : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2 text-indigo-500">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-[10px]">+</span>
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold block">Dual Photos</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5 leading-tight">Side-by-side gallery</span>
                </button>

              </div>
            </div>

            {/* Step 2: Column Width Ratios */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                2. Column Width Ratio (Desktop)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: '50-50', label: '50% : 50% (Equal Split)' },
                  { id: '60-40', label: '60% : 40% (Left Favored)' },
                  { id: '40-60', label: '40% : 60% (Right Favored)' },
                  { id: '70-30', label: '70% : 30% (Wide Left)' },
                  { id: '30-70', label: '30% : 70% (Wide Right)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setColumnConfig({ ...columnConfig, ratio: item.id })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      columnConfig.ratio === item.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-gray-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Style & Vertical Alignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card Container Style */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Section Background & Frame
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setColumnConfig({ ...columnConfig, cardStyle: 'card' })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      columnConfig.cardStyle === 'card'
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-gray-200 dark:border-zinc-800 text-zinc-500'
                    }`}
                  >
                    Card Highlight Box
                  </button>
                  <button
                    type="button"
                    onClick={() => setColumnConfig({ ...columnConfig, cardStyle: 'clean' })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      columnConfig.cardStyle === 'clean'
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-gray-200 dark:border-zinc-800 text-zinc-500'
                    }`}
                  >
                    Clean Seamless Flow
                  </button>
                </div>
              </div>

              {/* Vertical Alignment */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Vertical Alignment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setColumnConfig({ ...columnConfig, verticalAlign: 'center' })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      columnConfig.verticalAlign === 'center'
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-gray-200 dark:border-zinc-800 text-zinc-500'
                    }`}
                  >
                    Center Aligned
                  </button>
                  <button
                    type="button"
                    onClick={() => setColumnConfig({ ...columnConfig, verticalAlign: 'top' })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      columnConfig.verticalAlign === 'top'
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-gray-200 dark:border-zinc-800 text-zinc-500'
                    }`}
                  >
                    Top Aligned
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4: Column Content Editors */}
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                3. Column Contents & Captions
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Column 1 Editor */}
                <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 space-y-3">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                    Left Column ({columnConfig.layout === 'image-text' || columnConfig.layout === 'image-image' ? 'Photo' : 'Text'})
                  </span>

                  {columnConfig.layout === 'image-text' || columnConfig.layout === 'image-image' ? (
                    // Column 1 is Photo
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Upload Photo (Cloudinary)
                        </label>
                        <ImageUpload
                          currentImage={columnConfig.colImage.url}
                          onUpload={(url) => setColumnConfig({
                            ...columnConfig,
                            colImage: { ...columnConfig.colImage, url }
                          })}
                          onRemove={() => setColumnConfig({
                            ...columnConfig,
                            colImage: { ...columnConfig.colImage, url: '' }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Or Paste Image URL
                        </label>
                        <input
                          type="url"
                          value={columnConfig.colImage.url}
                          onChange={(e) => setColumnConfig({
                            ...columnConfig,
                            colImage: { ...columnConfig.colImage, url: e.target.value }
                          })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Image Caption (Under Photo)</span>
                        </label>
                        <input
                          type="text"
                          value={columnConfig.colImage.caption}
                          onChange={(e) => setColumnConfig({
                            ...columnConfig,
                            colImage: { ...columnConfig.colImage, caption: e.target.value }
                          })}
                          placeholder="e.g. Distribution center in district North"
                          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                        <span className="text-[10px] text-zinc-400">Captions appear centered in italics below the photo.</span>
                      </div>
                    </div>
                  ) : (
                    // Column 1 is Text
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Heading / Subtitle (Optional)
                        </label>
                        <input
                          type="text"
                          value={columnConfig.colText.heading}
                          onChange={(e) => setColumnConfig({
                            ...columnConfig,
                            colText: { ...columnConfig.colText, heading: e.target.value }
                          })}
                          placeholder="e.g. The Ground Reality"
                          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                            Story Description
                          </label>
                          {/* Alignment Buttons */}
                          <div className="flex items-center gap-1 bg-gray-200 dark:bg-zinc-700 p-0.5 rounded-lg">
                            {[
                              { id: 'left', icon: AlignLeft },
                              { id: 'center', icon: AlignCenter },
                              { id: 'right', icon: AlignRight },
                              { id: 'justify', icon: AlignJustify }
                            ].map((a) => {
                              const Icon = a.icon;
                              return (
                                <button
                                  key={a.id}
                                  type="button"
                                  onClick={() => setColumnConfig({
                                    ...columnConfig,
                                    colText: { ...columnConfig.colText, align: a.id }
                                  })}
                                  className={`p-1 rounded cursor-pointer ${
                                    columnConfig.colText.align === a.id
                                      ? 'bg-white dark:bg-zinc-900 text-indigo-600'
                                      : 'text-zinc-500 hover:text-zinc-900'
                                  }`}
                                  title={`Align ${a.id}`}
                                >
                                  <Icon className="w-3 h-3" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <textarea
                          rows={4}
                          value={columnConfig.colText.body}
                          onChange={(e) => setColumnConfig({
                            ...columnConfig,
                            colText: { ...columnConfig.colText, body: e.target.value }
                          })}
                          placeholder="Write the narrative description for this section..."
                          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2 Editor */}
                <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 space-y-3">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                    Right Column ({columnConfig.layout === 'text-image' || columnConfig.layout === 'image-image' ? 'Photo' : 'Text'})
                  </span>

                  {columnConfig.layout === 'text-image' || columnConfig.layout === 'image-image' ? (
                    // Column 2 is Photo
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Upload Photo (Cloudinary)
                        </label>
                        <ImageUpload
                          currentImage={columnConfig.layout === 'image-image' ? columnConfig.colImage2.url : columnConfig.colImage.url}
                          onUpload={(url) => {
                            if (columnConfig.layout === 'image-image') {
                              setColumnConfig({
                                ...columnConfig,
                                colImage2: { ...columnConfig.colImage2, url }
                              });
                            } else {
                              setColumnConfig({
                                ...columnConfig,
                                colImage: { ...columnConfig.colImage, url }
                              });
                            }
                          }}
                          onRemove={() => {
                            if (columnConfig.layout === 'image-image') {
                              setColumnConfig({
                                ...columnConfig,
                                colImage2: { ...columnConfig.colImage2, url: '' }
                              });
                            } else {
                              setColumnConfig({
                                ...columnConfig,
                                colImage: { ...columnConfig.colImage, url: '' }
                              });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Or Paste Image URL
                        </label>
                        <input
                          type="url"
                          value={columnConfig.layout === 'image-image' ? columnConfig.colImage2.url : columnConfig.colImage.url}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (columnConfig.layout === 'image-image') {
                              setColumnConfig({
                                ...columnConfig,
                                colImage2: { ...columnConfig.colImage2, url: val }
                              });
                            } else {
                              setColumnConfig({
                                ...columnConfig,
                                colImage: { ...columnConfig.colImage, url: val }
                              });
                            }
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Image Caption (Under Photo)</span>
                        </label>
                        <input
                          type="text"
                          value={columnConfig.layout === 'image-image' ? columnConfig.colImage2.caption : columnConfig.colImage.caption}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (columnConfig.layout === 'image-image') {
                              setColumnConfig({
                                ...columnConfig,
                                colImage2: { ...columnConfig.colImage2, caption: val }
                              });
                            } else {
                              setColumnConfig({
                                ...columnConfig,
                                colImage: { ...columnConfig.colImage, caption: val }
                              });
                            }
                          }}
                          placeholder="e.g. Volunteer team preparing rations"
                          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                        <span className="text-[10px] text-zinc-400">Captions appear centered in italics below the photo.</span>
                      </div>
                    </div>
                  ) : (
                    // Column 2 is Text
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Heading / Subtitle (Optional)
                        </label>
                        <input
                          type="text"
                          value={columnConfig.layout === 'text-text' ? columnConfig.colText2.heading : columnConfig.colText.heading}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (columnConfig.layout === 'text-text') {
                              setColumnConfig({
                                ...columnConfig,
                                colText2: { ...columnConfig.colText2, heading: val }
                              });
                            } else {
                              setColumnConfig({
                                ...columnConfig,
                                colText: { ...columnConfig.colText, heading: val }
                              });
                            }
                          }}
                          placeholder="e.g. Immediate Impact"
                          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                            Story Description
                          </label>
                          {/* Alignment Buttons */}
                          <div className="flex items-center gap-1 bg-gray-200 dark:bg-zinc-700 p-0.5 rounded-lg">
                            {[
                              { id: 'left', icon: AlignLeft },
                              { id: 'center', icon: AlignCenter },
                              { id: 'right', icon: AlignRight },
                              { id: 'justify', icon: AlignJustify }
                            ].map((a) => {
                              const Icon = a.icon;
                              const currentAlign = columnConfig.layout === 'text-text' ? columnConfig.colText2.align : columnConfig.colText.align;
                              return (
                                <button
                                  key={a.id}
                                  type="button"
                                  onClick={() => {
                                    if (columnConfig.layout === 'text-text') {
                                      setColumnConfig({
                                        ...columnConfig,
                                        colText2: { ...columnConfig.colText2, align: a.id }
                                      });
                                    } else {
                                      setColumnConfig({
                                        ...columnConfig,
                                        colText: { ...columnConfig.colText, align: a.id }
                                      });
                                    }
                                  }}
                                  className={`p-1 rounded cursor-pointer ${
                                    currentAlign === a.id
                                      ? 'bg-white dark:bg-zinc-900 text-indigo-600'
                                      : 'text-zinc-500 hover:text-zinc-900'
                                  }`}
                                  title={`Align ${a.id}`}
                                >
                                  <Icon className="w-3 h-3" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <textarea
                          rows={4}
                          value={columnConfig.layout === 'text-text' ? columnConfig.colText2.body : columnConfig.colText.body}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (columnConfig.layout === 'text-text') {
                              setColumnConfig({
                                ...columnConfig,
                                colText2: { ...columnConfig.colText2, body: val }
                              });
                            } else {
                              setColumnConfig({
                                ...columnConfig,
                                colText: { ...columnConfig.colText, body: val }
                              });
                            }
                          }}
                          placeholder="Write the narrative description for this section..."
                          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 5: Live In-Modal Mockup Preview */}
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                  4. Live Layout Mockup
                </span>
                <span className="text-[10px] text-zinc-400">
                  Ratio: {columnConfig.ratio} • Style: {columnConfig.cardStyle}
                </span>
              </div>

              <div className={`p-4 rounded-2xl ${
                columnConfig.cardStyle === 'card' 
                  ? 'bg-gray-50/90 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/60' 
                  : 'bg-white dark:bg-zinc-900 border border-dashed border-gray-200 dark:border-zinc-800'
              }`}>
                <div className={`grid grid-cols-1 md:grid-cols-12 gap-4 ${columnConfig.verticalAlign === 'center' ? 'items-center' : 'items-start'}`}>
                  {/* Mockup Column 1 */}
                  <div className={
                    columnConfig.ratio === '60-40' ? 'md:col-span-7' :
                    columnConfig.ratio === '40-60' ? 'md:col-span-5' :
                    columnConfig.ratio === '70-30' ? 'md:col-span-8' :
                    columnConfig.ratio === '30-70' ? 'md:col-span-4' : 'md:col-span-6'
                  }>
                    {columnConfig.layout === 'image-text' || columnConfig.layout === 'image-image' ? (
                      <figure className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800">
                        <img
                          src={columnConfig.colImage.url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600'}
                          alt="Preview"
                          className="w-full h-32 object-cover block"
                        />
                        {columnConfig.colImage.caption && (
                          <figcaption className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center italic py-1 px-2">
                            {columnConfig.colImage.caption}
                          </figcaption>
                        )}
                      </figure>
                    ) : (
                      <div className={`space-y-1 text-${columnConfig.colText.align}`}>
                        {columnConfig.colText.heading && (
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                            {columnConfig.colText.heading}
                          </h4>
                        )}
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-3">
                          {columnConfig.colText.body || 'Story narrative text will appear here with selected alignment and width...'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mockup Column 2 */}
                  <div className={
                    columnConfig.ratio === '60-40' ? 'md:col-span-5' :
                    columnConfig.ratio === '40-60' ? 'md:col-span-7' :
                    columnConfig.ratio === '70-30' ? 'md:col-span-4' :
                    columnConfig.ratio === '30-70' ? 'md:col-span-8' : 'md:col-span-6'
                  }>
                    {columnConfig.layout === 'text-image' || columnConfig.layout === 'image-image' ? (
                      <figure className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800">
                        <img
                          src={(columnConfig.layout === 'image-image' ? columnConfig.colImage2.url : columnConfig.colImage.url) || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=600'}
                          alt="Preview"
                          className="w-full h-32 object-cover block"
                        />
                        {(columnConfig.layout === 'image-image' ? columnConfig.colImage2.caption : columnConfig.colImage.caption) && (
                          <figcaption className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center italic py-1 px-2">
                            {columnConfig.layout === 'image-image' ? columnConfig.colImage2.caption : columnConfig.colImage.caption}
                          </figcaption>
                        )}
                      </figure>
                    ) : (
                      <div className={`space-y-1 text-${columnConfig.layout === 'text-text' ? columnConfig.colText2.align : columnConfig.colText.align}`}>
                        {(columnConfig.layout === 'text-text' ? columnConfig.colText2.heading : columnConfig.colText.heading) && (
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                            {columnConfig.layout === 'text-text' ? columnConfig.colText2.heading : columnConfig.colText.heading}
                          </h4>
                        )}
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-3">
                          {(columnConfig.layout === 'text-text' ? columnConfig.colText2.body : columnConfig.colText.body) || 'Right column story narrative will appear here...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowColumnModal(false)}
                className="px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertColumnsToEditor}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Insert Section into Story</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FULLSCREEN PREVIEW MODAL INSPECTOR                    */}
      {/* ======================================================== */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto relative">
            <button
              type="button"
              onClick={() => setIsFullscreenPreview(false)}
              className="fixed top-6 right-6 z-50 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-3 rounded-full shadow-2xl border border-gray-200 dark:border-zinc-700 cursor-pointer hover:scale-105 transition-transform"
              title="Close Fullscreen"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            {renderArticlePreview()}
          </div>
        </div>
      )}

    </div>
  );
};

export default WriteFieldStoryPage;
