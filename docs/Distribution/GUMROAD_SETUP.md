# Setting Up Gumroad Distribution

To monetize DXVK Studio via "Paid Binaries", follow this guide to set up your Gumroad product.

## 1. Create Product
1. Log in to [Gumroad Dashboard](https://app.gumroad.com/).
2. Click **New Product**.
3. **Name**: "DXVK Studio - Windows Installer"
4. **Type**: "Digital Product" -> "Software"
5. **Price**: $5+ (or "Pay often you want" with min $5).

## 2. Product Content
1. **Description**:
   > "The professional DXVK manager for Windows.
   >
   > **Includes**:
   > - Auto-Installer (.exe)
   > - Portable Version (.zip)
   > - Priority Support via Discord
   >
   > *Note: The source code is free and open source on GitHub. Purchasing this installer supports development.*"

2. **Content (Files)**:
   - Upload the latest `DXVK Studio Setup 1.0.0.exe` from `release/` folder.
   - Upload `DXVK Studio 1.0.0.exe` (Portable).

## 3. Configure Settings
- **Thumbnail**: Use `public/icon.png`.
- **Integrations**: Add your GitHub URL in "Redirect after purchase" if desired.

## 4. Update Application
1. Copy your product URL (e.g., `https://gumroad.com/l/xyz`).
2. Update `App.tsx` and `README.md` with this URL.
