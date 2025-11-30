# Google AdSense Setup Guide for ROTraders.gg

## Step 1: Create Google AdSense Account

1. Go to [https://www.google.com/adsense](https://www.google.com/adsense)
2. Click **"Get Started"**
3. Sign in with your Google account
4. Enter your website URL: `https://rotraders.gg`
5. Select your country/region
6. Accept terms and conditions
7. Click **"Start using AdSense"**

## Step 2: Add Your Site to AdSense

1. In AdSense dashboard, go to **Sites** section
2. Click **"Add site"**
3. Enter `rotraders.gg`
4. Copy your AdSense Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)
   - It will look like: `ca-pub-1234567890123456`
   - Note down just the numeric part: `1234567890123456`

## Step 3: Add AdSense Code to Your Site

Your site already has AdSense integration! Just add the Publisher ID to your environment variables:

### On Your VPS:

\`\`\`bash
cd ~/trade-website

# Edit .env.local file
nano .env.local
\`\`\`

Add this line (replace with your actual Publisher ID):

\`\`\`env
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=1234567890123456
\`\`\`

Save with `Ctrl+X`, then `Y`, then `Enter`.

### Rebuild and Restart:

\`\`\`bash
npm run build
pm2 restart all
\`\`\`

## Step 4: Verify Your Site in AdSense

1. After adding the code, go back to AdSense dashboard
2. Click **"Check if code is on site"** or wait 24-48 hours
3. Google will verify your site automatically
4. You'll receive an email when verification is complete

## Step 5: Create Ad Units

Once your site is verified (usually 1-2 days):

1. In AdSense dashboard, go to **Ads** → **By ad unit**
2. Click **"+ New ad unit"**
3. Select **Display ads**
4. Name your ad units:
   - `ROTraders - Homepage Top`
   - `ROTraders - Sidebar`
   - `ROTraders - In-Content`
   - `ROTraders - Footer`
5. Choose size: **Responsive** (recommended)
6. Click **"Create"**
7. Copy the **Ad Slot ID** for each unit

## Step 6: Add Ad Slot IDs to Your Site

After creating ad units, update your pages with the ad slot IDs.

Example ad slot IDs look like: `1234567890` (10 digits)

Edit your pages to add ads (see implementation examples below).

## Step 7: Wait for Review

- Google will review your site (typically 1-7 days)
- Your site must have:
  - Original content
  - Easy navigation
  - Privacy Policy page
  - Contact information
  - At least 20-30 pages of content

## Step 8: Track Earnings

- Once approved, ads will start showing
- View earnings in AdSense dashboard
- Payments are made monthly when you reach $100 threshold

## Current Ad Placements

Your site already has ads configured in these locations:

1. **Homepage** - Top banner and sidebar
2. **Values Page** - Between item listings
3. **Trading Page** - Sidebar ads
4. **Item Details** - Below item information

## Optimal Ad Placement Tips

1. **Above the fold** - Place one ad at the top of the page
2. **In-content** - Place ads between paragraphs or listings
3. **Sidebar** - Sticky sidebar ads perform well
4. **Between items** - In your item listings every 6-8 items
5. **Footer** - One ad before the footer

## Important Notes

- Ads only show in **production mode** (not in development)
- Never click your own ads (Google will ban you)
- Don't ask users to click ads
- Maintain good content-to-ads ratio (more content than ads)
- AdSense policies are strict - read them carefully

## Troubleshooting

### Ads Not Showing?

1. Check if `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` is set correctly
2. Make sure you're in production mode
3. Verify site is approved in AdSense dashboard
4. Clear browser cache
5. Check browser console for errors

### Site Not Approved?

Common reasons:
- Insufficient content
- Duplicate content
- Missing privacy policy
- Poor navigation
- Copyright violations
- Adult content

## Privacy Policy Requirement

Google requires a privacy policy. Your site should have one at `/privacy-policy` that mentions:
- You use Google AdSense
- Cookies and data collection
- Third-party vendors
- User rights

## Expected Earnings

Earnings vary widely based on:
- Traffic volume (visitors per day)
- Niche (gaming has moderate CPM)
- Geographic location of visitors
- User engagement
- Ad placement

Typical gaming site CPM: $1-$5 per 1000 views
With 10,000 daily visitors: $10-$50/day potential

## Next Steps After Approval

1. Monitor performance in AdSense dashboard
2. Experiment with ad placements
3. A/B test different ad formats
4. Enable Auto Ads for automatic optimization
5. Consider Ad Balance to improve user experience
\`\`\`

```tsx file="" isHidden
