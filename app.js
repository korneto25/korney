// DOM Elements
const createPostForm = document.getElementById('createPostForm');
const postsContainer = document.getElementById('postsContainer');

// Constants
const API_URL = 'https://dummyjson.com/posts';

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const seconds = Math.floor((now - timestamp) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (let [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }
    return 'Just now';
}

// Fetch all posts
async function fetchPosts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        displayPosts(data.posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        postsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                Failed to load posts. Please try again later.
            </div>
        `;
    }
}

// Create a new post
async function createPost(postData) {
    try {
        const response = await fetch(`${API_URL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating post:', error);
        throw new Error('Failed to create post');
    }
}

// Display posts in the UI
function displayPosts(posts) {
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Create a post element
function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post-card';

    const tags = Array.isArray(post.tags) 
        ? post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')
        : '';

    const timestamp = new Date(Date.now() - Math.random() * 1000000000);
    const timeAgo = getTimeAgo(timestamp);

    article.innerHTML = `
        <div class="post-header">
            <div class="post-user">
                <img src="https://picsum.photos/32/32?random=${post.id}" alt="User" class="user-avatar">
                <div class="user-info">
                    <span class="user-name">User ${post.userId}</span>
                    <span class="post-time">${timeAgo}</span>
                </div>
            </div>
            <button class="post-menu">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-body">${post.body}</p>
        <div class="post-tags">${tags}</div>
        <div class="post-stats">
            <span class="likes">
                <i class="fas fa-thumbs-up"></i> ${formatNumber(post.reactions?.likes || 0)}
            </span>
            <span class="comments">
                <i class="fas fa-comment"></i> ${formatNumber(Math.floor(Math.random() * 100))}
            </span>
            <span class="shares">
                <i class="fas fa-share"></i> ${formatNumber(Math.floor(Math.random() * 50))}
            </span>
        </div>
        <div class="post-actions">
            <button class="action-btn like-btn">
                <i class="far fa-thumbs-up"></i> Like
            </button>
            <button class="action-btn comment-btn">
                <i class="far fa-comment"></i> Comment
            </button>
            <button class="action-btn share-btn">
                <i class="far fa-share-square"></i> Share
            </button>
        </div>
    `;

    // Add click event listeners for the action buttons
    const likeBtn = article.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => {
        likeBtn.classList.toggle('active');
        const icon = likeBtn.querySelector('i');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
        icon.classList.toggle('text-blue');
    });

    return article;
}

// Handle form submission
createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('postTitle');
    const bodyInput = document.getElementById('postBody');
    const tagsInput = document.getElementById('postTags');

    const postData = {
        title: titleInput.value,
        body: bodyInput.value,
        tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag),
        userId: Math.floor(Math.random() * 100) + 1,
        reactions: {
            likes: 0,
            dislikes: 0
        },
        views: 0
    };

    try {
        const newPost = await createPost(postData);
        
        // Add the new post to the UI
        const postElement = createPostElement(newPost);
        postsContainer.insertBefore(postElement, postsContainer.firstChild);

        // Clear the form
        titleInput.value = '';
        bodyInput.value = '';
        tagsInput.value = '';

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Post created successfully!
        `;
        createPostForm.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);
    } catch (error) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            Failed to create post. Please try again.
        `;
        createPostForm.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 3000);
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
}); 