# Hamyan Web

React SPA — همان UI اپ دسکتاپ، فقط فرانت، آمادهٔ هاست اشتراکی (مثل Namecheap).

## توسعه محلی

```bash
cd ishanch-web
npm install
npm run dev
```

API پیش‌فرض: `https://app.ishanch.com/api` (فایل `.env`).

## بیلد برای هاست

```bash
npm run build
```

محتوای پوشهٔ `dist/` را در `public_html` دامنه (مثلاً `ishanch.com`) آپلود کنید.

فایل `dist/.htaccess` برای React Router روی Apache (Namecheap) لازم است تا مسیرهایی مثل `/login` صفحهٔ ۴۰۴ ندهند.

فایل نصب ویندوز را جداگانه در `public_html/downloads/Hamyan-Setup-1.0.0.exe` بگذارید (یا آدرس `VITE_DOWNLOAD_WINDOWS_URL` را عوض کنید).

## دامنه و API

| مورد | مقدار |
|------|--------|
| وب | `https://ishanch.com` |
| API | `https://app.ishanch.com/api` |

```env
VITE_API_BASE_URL=https://app.ishanch.com/api
VITE_SITE_URL=https://ishanch.com
VITE_DOWNLOAD_WINDOWS_URL=https://ishanch.com/downloads/Hamyan-Setup-1.0.0.exe
VITE_DOWNLOAD_ANDROID_URL=https://play.google.com/store/apps/details?id=com.ishanch.app
VITE_DOWNLOAD_IOS_URL=https://apps.apple.com/app/ishanch
```

## PWA و SEO

- نصب‌پذیر به‌عنوان PWA (manifest + service worker با به‌روزرسانی خودکار)
- `robots.txt` و `sitemap.xml` در `public/`
- متا تگ‌های Open Graph / Twitter و JSON-LD از طریق `SeoHead`

مسیرهای عمومی بدون ورود: `/help`، `/exchange-rates`، `/download`
