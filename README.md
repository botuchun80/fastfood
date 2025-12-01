FastFood frontend (docs/) — GitHub Pages uchun tayyor

Bu papka `docs/` ga joylashtirilgan statik frontend bo'lib, GitHub Pages orqali `https://<username>.github.io/fastfood/` manzilida xizmat qiladi.

Qanday qilib joylash (PowerShell):

1) Git repoga qo'shish (agar mavjud bo'lsa):

```powershell
cd D:\fastfood
git init
git add docs/*
git commit -m "Add frontend for FastFood"
# remote origin qo'shing: repozitoriyingizni o'zgartiring
git remote add origin https://github.com/botuchun80/fastfood.git
git branch -M main
git push -u origin main
```

2) GitHub sahifalarini `Settings > Pages` bo'limida `Source` ni `main branch / docs folder` qilib belgilang.

3) Web app sozlamalari:
- `app.js`-da `window.BACKEND_URL` ni o'zgartiring — backend manzilingizga moslashtiring (masalan `https://api.fastfood.example/`).

4) PWA: manifest.json va service-worker.js kiritilgan; GitHub Pages orqali xizmatga chiqarilgach brauzerda "Add to Home screen" ishlaydi.

Agar xohlasangiz, men `icons/` papkasini ham yaratib kichik PNG ikonalarni qo'shishim mumkin.
