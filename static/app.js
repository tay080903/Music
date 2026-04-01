document.addEventListener('DOMContentLoaded', () => {
    
    const feedContainer = document.getElementById('feedContainer');
    const uploadModal = document.getElementById('uploadModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const postForm = document.getElementById('postForm');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let allPosts = [];

    // Initialize
    fetchPosts();

    // Modal Control
    openModalBtn.addEventListener('click', () => {
        uploadModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        uploadModal.classList.remove('active');
    });

    // Close on overlay click
    uploadModal.addEventListener('click', (e) => {
        if(e.target === uploadModal) {
            uploadModal.classList.remove('active');
        }
    });

    // Handle Form Submit
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newPost = {
            title: document.getElementById('title').value,
            song_name: document.getElementById('song_name').value,
            artist_name: document.getElementById('artist_name').value,
            genre: document.getElementById('genre').value,
            youtube_url: document.getElementById('youtube_url').value,
            content: document.getElementById('content').value
        };

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPost)
            });
            
            if(res.ok) {
                const post = await res.json();
                allPosts.unshift(post); // Add to top
                renderPosts(allPosts);
                uploadModal.classList.remove('active');
                postForm.reset();
            }
        } catch (error) {
            alert('업로드에 실패했습니다. 백엔드가 실행 중인지 확인하세요.');
            console.error(error);
        }
    });

    // Handle Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const genre = btn.dataset.genre;
            if(genre === 'all') {
                renderPosts(allPosts);
            } else {
                const filtered = allPosts.filter(p => p.genre === genre);
                renderPosts(filtered);
            }
        });
    });

    // Fetch API
    async function fetchPosts() {
        try {
            const res = await fetch('/api/posts');
            const data = await res.json();
            allPosts = data;
            renderPosts(allPosts);
        } catch (error) {
            feedContainer.innerHTML = '<p style="text-align:center;width:100%;">게시글을 불러오는데 실패했습니다.</p>';
            console.error(error);
        }
    }

    // Render Posts
    function renderPosts(posts) {
        if (posts.length === 0) {
            feedContainer.innerHTML = '<p style="text-align:center;width:100%;color:var(--text-secondary);">아직 등록된 추천글이 없습니다. 첫 번째 추천자가 되어보세요!</p>';
            return;
        }

        feedContainer.innerHTML = '';
        posts.forEach((post, index) => {
            const delay = index * 0.1; // Staggered animation effect
            
            // Format genre
            const genreLabels = {
                'kpop': 'K-Pop', 'indie': '인디', 'citypop': '시티팝', 
                'hiphop': '힙합', 'ballad': '발라드', 'other': '기타'
            };
            const genreDisplay = genreLabels[post.genre] || post.genre || '장르 없음';

            // SVG Like Icon
            const heartSvg = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

            // Cover Image / Play Button
            const playSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>`;
            const coverHTML = post.youtube_url 
                ? `<a href="${escapeHTML(post.youtube_url)}" target="_blank" rel="noopener noreferrer" class="cover clickable" title="유튜브에서 듣기">${playSvg}</a>`
                : `<div class="cover">${playSvg}</div>`;

            const card = document.createElement('article');
            card.className = 'post-card';
            card.style.animationDelay = `${delay}s`;
            card.innerHTML = `
                <div class="card-header">
                    <span class="badge">${genreDisplay}</span>
                    <h3 class="card-title">${escapeHTML(post.title)}</h3>
                </div>
                
                <div class="music-info">
                    ${coverHTML}
                    <div class="music-details">
                        <h4>${escapeHTML(post.song_name)}</h4>
                        <p>${escapeHTML(post.artist_name)}</p>
                    </div>
                </div>
                
                <div class="content-body">
                    <p>${escapeHTML(post.content)}</p>
                </div>
                
                <div class="card-footer">
                    <span class="author">By @${escapeHTML(post.author_name || '익명')}</span>
                    <button class="like-btn" onclick="likePost(${post.post_id}, this)">
                        ${heartSvg} 
                        <span class="like-count">${post.likes_count || 0}</span>
                    </button>
                </div>
            `;
            feedContainer.appendChild(card);
        });
    }

    // Export function for inline onclick handler
    window.likePost = async function(postId, btnElement) {
        if(btnElement.classList.contains('liked')) return; // Already liked locally

        try {
            const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
            if(res.ok) {
                const data = await res.json();
                btnElement.classList.add('liked');
                btnElement.querySelector('.like-count').textContent = data.likes_count;
            }
        } catch(error) {
            console.error('Like failed', error);
        }
    }
});

function escapeHTML(str) {
    if(!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
}
