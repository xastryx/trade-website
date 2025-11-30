# Google AdSense - Ad Placement Examples

This guide shows you how to add ads to your pages after getting your Publisher ID and Ad Slot IDs from Google AdSense.

## Current Ad Placements

Your site now has ads in these strategic locations:

1. **Homepage (`app/page.tsx`)**
   - Top banner (after hero section)
   - Bottom banner (before footer)

2. **Values Page (`components/values-content.tsx`)**
   - Horizontal banner (between search and items grid)

3. **Trading Page (`app/trading/page.tsx`)**
   - Horizontal banner (between filters and trades)

## How to Add More Ads

### 1. Import the AdBanner Component

\`\`\`tsx
import { AdBanner } from "@/components/ad-banner"
\`\`\`

### 2. Add the Ad Where You Want It

\`\`\`tsx
<AdBanner 
  dataAdSlot="YOUR_AD_SLOT_ID_HERE"
  dataAdFormat="horizontal" // or "auto" for responsive
  className="w-full max-w-[728px]"
/>
\`\`\`

## Ad Format Options

### Horizontal Banner (728x90)
Best for: Between content sections, top of page, before footer

\`\`\`tsx
<AdBanner 
  dataAdSlot="1234567890"
  dataAdFormat="horizontal"
  className="w-full max-w-[728px] mx-auto"
/>
\`\`\`

### Responsive Rectangle (300x250)
Best for: Sidebars, between content blocks

\`\`\`tsx
<AdBanner 
  dataAdSlot="2345678901"
  dataAdFormat="rectangle"
  className="w-full max-w-[300px]"
/>
\`\`\`

### Auto Responsive
Best for: Flexible placement, adapts to container

\`\`\`tsx
<AdBanner 
  dataAdSlot="3456789012"
  dataAdFormat="auto"
  dataFullWidthResponsive={true}
  className="w-full"
/>
\`\`\`

## Best Placement Locations

### Homepage
- ✅ After hero section (currently added)
- ✅ Before footer (currently added)
- After Discord CTA section
- Sidebar (if you add one)

### Values/Items Pages
- ✅ Between search and items (currently added)
- Every 10-12 items in the grid
- Sticky sidebar ad
- Bottom of page

### Trading Page
- ✅ Between filters and listings (currently added)
- Between every 5-7 trade cards
- Sidebar sticky ad
- Bottom of page

### Item Detail Pages
- After item image
- Between item stats
- Before related items
- Bottom of page

## Example: Adding Ads Between Item Cards

\`\`\`tsx
export function ItemsGrid({ items }: { items: Item[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id}>
          <ItemCard item={item} />
          
          {/* Show ad every 6 items */}
          {(index + 1) % 6 === 0 && (
            <div className="my-6">
              <AdBanner 
                dataAdSlot="YOUR_AD_SLOT_ID"
                dataAdFormat="horizontal"
                className="w-full max-w-[728px] mx-auto"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
\`\`\`

## Example: Sidebar Ad

\`\`\`tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
  {/* Main content */}
  <div>
    <YourMainContent />
  </div>
  
  {/* Sidebar with sticky ad */}
  <aside className="hidden lg:block">
    <div className="sticky top-20">
      <AdBanner 
        dataAdSlot="YOUR_AD_SLOT_ID"
        dataAdFormat="rectangle"
        className="w-full"
      />
    </div>
  </aside>
</div>
\`\`\`

## Getting Your Ad Slot IDs

After your AdSense account is approved:

1. Go to AdSense dashboard
2. Navigate to **Ads** → **By ad unit**
3. Click **"+ New ad unit"**
4. Select **Display ads**
5. Choose ad size (Responsive recommended)
6. Name your ad unit (e.g., "Homepage Top Banner")
7. Click **"Create"**
8. Copy the **Ad Slot ID** (10 digit number)

Replace the placeholder IDs in the code with your real Ad Slot IDs:
- `dataAdSlot="1234567890"` → `dataAdSlot="YOUR_REAL_AD_SLOT_ID"`

## Important Notes

- Ads only show in **production** (not during development)
- Replace all placeholder Ad Slot IDs with real ones from AdSense
- Don't add too many ads - balance content and ads
- Google recommends max 3 ads per page for best performance
- Wait 10-20 minutes after adding code for ads to appear
- Never click your own ads (violates AdSense policy)

## Testing Ads in Development

During development, you'll see placeholder boxes with "Ad Placeholder (Visible in Dev)" text. This is normal and helps you visualize ad placement without loading real ads.

## Ad Performance Tips

1. **Above the fold** - One ad at top of page gets best visibility
2. **In-content** - Ads between content perform better than sidebar
3. **Responsive** - Use responsive ad units for mobile optimization
4. **Spacing** - Add margins around ads for better visibility
5. **Don't overdo it** - Too many ads hurt user experience and revenue

## Current Placeholder Ad Slot IDs to Replace

After getting approved, replace these placeholder IDs:

| Location | Current Placeholder | Your Real Ad Slot ID |
|----------|-------------------|---------------------|
| Homepage Top | `1234567890` | _______________ |
| Homepage Bottom | `0987654321` | _______________ |
| Values Page | `1111111111` | _______________ |
| Trading Page | `1234567890` | _______________ |

Update the `dataAdSlot` prop in each component with your real Ad Slot IDs from AdSense dashboard.
