/**
 * TikSave Elite - The Definitive Local TikTok Downloader
 * 2026 Gold Revision
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Error Monitor ---
    window.onerror = function(msg, url, line) {
        alert("CRITICAL ERROR: " + msg + "\nAt line: " + line);
        return false;
    };
    // --- Configuration ---
    const API_ENDPOINT = 'https://www.tikwm.com/api/';
    const PROXIES = [
        'https://api.allorigins.win/get?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ];

    // --- DOM Elements ---
    const urlInput = document.getElementById('tiktok-url');
    const searchBtn = document.getElementById('search-btn');
    const mainSpinner = document.getElementById('main-spinner');
    const btnText = searchBtn.querySelector('.btn-content');
    const statusMsg = document.getElementById('status-display');
    const resultView = document.getElementById('result-view');
    const videoPlayer = document.getElementById('video-player');

    // Data elements
    const vAuthor = document.getElementById('v-author');
    const vDesc = document.getElementById('v-desc');
    const sViews = document.getElementById('s-views');
    const sLikes = document.getElementById('s-likes');

    // Action buttons
    const btnNoWm = document.getElementById('dl-no-wm');
    const btnHd = document.getElementById('dl-hd');
    const btnAudio = document.getElementById('dl-audio');

    // Extra buttons
    const pasteBtn = document.getElementById('paste-btn');
    const resetBtn = document.getElementById('reset-btn');

    /**
     * Paste from clipboard functionality
     */
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            urlInput.value = text;
            updateStatus('Link pasted!', '#6366f1');
        } catch (err) {
            updateStatus('Click to paste manually.', 'var(--text-muted)');
        }
    });

    /**
     * Reset app for new download
     */
    resetBtn.addEventListener('click', () => {
        resultView.style.display = 'none';
        urlInput.value = '';
        urlInput.focus();
        updateStatus('Ready for next download.');
    });

    /**
     * UNIVERSAL ELITE FETCH (Local + Cloud)
     */
    async function fetchElite(targetUrl) {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168');
        
        if (isLocal) {
            updateStatus('Connecting via Local Secure Tunnel...', 'var(--text-muted)');
            try {
                const localProxyUrl = `${window.location.origin}/proxy?url=${encodeURIComponent(targetUrl)}`;
                const response = await fetch(localProxyUrl);
                if (response.ok) {
                    const result = await response.json();
                    if (result.code === 0) return result.data;
                }
            } catch (e) {
                console.log("Local server not running, falling back to Public Cloud...");
            }
        }

        updateStatus('Connecting via Global Elite Servers...', 'var(--text-muted)');
        return new Promise((resolve, reject) => {
            const callbackName = 'jsonp_' + Math.round(100000 * Math.random());
            const script = document.createElement('script');
            const finalUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&callback=${callbackName}`;

            window[callbackName] = (data) => {
                delete window[callbackName];
                document.body.removeChild(script);
                try {
                    const result = JSON.parse(data.contents);
                    if (result && result.code === 0) resolve(result.data);
                    else reject(new Error(result.msg || 'Video link error.'));
                } catch (e) { reject(new Error('Data error.')); }
            };

            script.onerror = () => {
                document.body.removeChild(script);
                delete window[callbackName];
                alert("AD-BLOCKER DETECTED!\n\nMachan, oya RunApp.bat eka use karala na wage.\n1. RunApp.bat eka open karanna.\n2. AdBlocker eka OFF karanna.");
                reject(new Error('Proxy Blocked. Please use RunApp.bat!'));
            };

            script.src = finalUrl;
            document.body.appendChild(script);
        });
    }

    /**
     * Private Binary Streamer - Bypasses Proxy Limits
     */
    async function triggerDownload(url, filename, btn) {
        const originalContent = btn.innerHTML;
        btn.innerHTML = `Streaming...`;
        btn.classList.add('loading');

        try {
            // Use local server as a private downloader
            const localDownloadUrl = `${window.location.origin}/download?url=${encodeURIComponent(url)}`;
            
            const link = document.createElement('a');
            link.href = localDownloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            updateStatus('Download started (Local Stream)!', '#22c55e');
        } catch (err) {
            window.open(url, '_blank');
        } finally {
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.classList.remove('loading');
            }, 1000);
        }
    }

    /**
     * UI Updates
     */
    function updateStatus(msg, color = 'var(--text-muted)') {
        statusMsg.style.color = color;
        statusMsg.innerText = msg;
    }

    function showResults(data) {
        currentVideoData = data;
        
        vAuthor.innerText = `@${data.author.unique_id}`;
        vDesc.innerText = data.title || "TikTok Video";
        sViews.innerText = formatNum(data.play_count);
        sLikes.innerText = formatNum(data.digg_count);

        videoPlayer.src = `${window.location.origin}/proxy?url=${encodeURIComponent(data.play)}`;
        
        resultView.style.display = 'block';
        resultView.scrollIntoView({ behavior: 'smooth', block: 'start' });
        updateStatus('Success!', '#22c55e');
    }

    function formatNum(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n;
    }

    function sanitizeUrl(rawUrl) {
        try {
            const url = new URL(rawUrl);
            return url.origin + url.pathname;
        } catch (e) {
            return rawUrl;
        }
    }

    searchBtn.addEventListener('click', async () => {
        let url = urlInput.value.trim();
        if (!url) { updateStatus('Paste a link!', '#ef4444'); return; }
        if (!url.includes('tiktok.com')) { updateStatus('Not a TikTok link.', '#ef4444'); return; }

        url = sanitizeUrl(url);

        searchBtn.disabled = true;
        btnText.style.display = 'none';
        mainSpinner.style.display = 'block';
        updateStatus('Fetching...');

        try {
            const data = await fetchElite(`${API_ENDPOINT}?url=${encodeURIComponent(url)}`);
            showResults(data);
        } catch (err) {
            updateStatus(err.message, '#ef4444');
        } finally {
            searchBtn.disabled = false;
            btnText.style.display = 'block';
            mainSpinner.style.display = 'none';
        }
    });

    btnNoWm.onclick = () => triggerDownload(currentVideoData.play, `tiktok_no_wm.mp4`, btnNoWm);
    btnHd.onclick = () => triggerDownload(currentVideoData.hdplay || currentVideoData.play, `tiktok_hd.mp4`, btnHd);
    btnAudio.onclick = () => triggerDownload(currentVideoData.music, `tiktok_audio.mp3`, btnAudio);

    urlInput.onkeydown = (e) => { if (e.key === 'Enter') searchBtn.click(); };
});
