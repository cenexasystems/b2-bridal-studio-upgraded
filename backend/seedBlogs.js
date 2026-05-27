const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Blog = require('./models/Blog');

const blogs = [
  {
    title: '10 Bridal Makeup Looks Dominating 2024 Weddings',
    slug: '10-bridal-makeup-looks-dominating-2024-weddings',
    category: 'Bridal Trends',
    preview: 'From dewy skin finishes to bold jewel-toned eyes — discover which looks are defining the modern Indian bride this season.',
    content: `
## The Evolution of Bridal Beauty

The world of bridal makeup is undergoing a breathtaking transformation. Gone are the days of heavy, one-dimensional looks — today's brides are embracing individuality, artistry, and techniques that celebrate their natural beauty while making a statement.

At B2 Bridal Studio, we've had a front-row seat to this evolution, training hundreds of makeup artists who are shaping the future of bridal beauty across South India.

---

## 1. The Dewy Glass-Skin Finish

The Korean beauty influence has arrived at Indian weddings. This look prioritizes luminous, hydrated skin that appears lit from within. The key is meticulous skincare prep followed by lightweight, buildable coverage.

**Pro Tip:** Use a hyaluronic acid serum under your primer for that authentic glow.

## 2. Jewel-Toned Smokey Eyes

Move over traditional black smokey eyes — rich emeralds, deep sapphires, and warm amethysts are stealing the spotlight. These colors complement Indian skin tones beautifully and pair perfectly with heritage jewellery.

## 3. Soft Glam with Bold Lips

The "less is more" approach to eye makeup paired with a striking berry or wine lip creates an elegant, timeless look. This style photographs beautifully and lasts through hours of celebration.

## 4. The Minimalist Bride

More brides are choosing barely-there makeup that enhances rather than transforms. Think perfected skin, groomed brows, subtle lash extensions, and a nude lip. This look is all about confidence and natural beauty.

## 5. Graphic Liner Art

For the avant-garde bride, graphic liner in gold, white, or colored hues adds a modern edge. From subtle wing extensions to bold geometric shapes — this trend turns eyes into works of art.

## 6. Monochromatic Magic

Using the same color family across eyes, cheeks, and lips creates a harmonious, editorial look. Peachy-coral and rosy-mauve are the most popular monochromatic palettes for 2024.

## 7. Heavy Lash Drama

Whether it's voluminous individual lashes or dramatic strip lashes, the emphasis on eyes continues to grow. The trend is moving toward textured, wispy lashes rather than uniform, doll-like strips.

## 8. Bronzed Goddess

Sun-kissed skin with warm bronzer, golden highlights, and earthy eye shadows create a warm, inviting look perfect for outdoor and destination weddings.

## 9. Cultural Fusion

Brides are blending traditional elements (like kajal and bindis) with contemporary techniques. This beautiful fusion honors heritage while embracing modern artistry.

## 10. The Statement Blush

Blush placement is becoming more creative — from the nose bridge to the temples. Bright, visible blush in pink and peach tones adds youth and freshness to any bridal look.

---

## Master These Techniques at B2 Bridal Studio

Our professional certification courses cover all these trends and more. Join our next batch and learn from industry-leading experts who train you not just in technique, but in the art of making every bride feel extraordinary.

*Ready to begin your bridal makeup journey? [Explore our courses](/courses)*
    `,
    image: 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=1200&q=80',
    author: 'Shanmugavadivu Sabarinathan',
    readTime: '8 min read',
    tags: ['bridal makeup', 'trends', 'wedding', '2024'],
  },
  {
    title: 'How to Build a Luxury Bridal Makeup Career from Scratch',
    slug: 'build-luxury-bridal-makeup-career',
    category: 'Academy Insights',
    preview: 'Our master trainers share the exact roadmap — from certification to premium clientele — for aspiring bridal artists.',
    content: `
## Your Roadmap to a Premium Bridal Career

Building a successful career in luxury bridal makeup isn't just about mastering techniques — it's about building a brand, understanding your clientele, and continuously evolving your artistry.

At B2 Bridal Studio, we've guided hundreds of students from complete beginners to sought-after bridal artists. Here's the roadmap we recommend.

---

## Step 1: Invest in Professional Training

The difference between a hobbyist and a professional starts with structured education. Look for programs that offer:

- **Hands-on practice** with diverse skin tones and face shapes
- **Product knowledge** across luxury and professional brands
- **Business fundamentals** — pricing, contracts, and client management
- **Certification** from a recognized institution

Our comprehensive programs at B2 cover all these areas and more, with mentorship from artists who have 15+ years of industry experience.

## Step 2: Build Your Portfolio

Before your first paying client, you need stunning work to showcase. Here's how:

1. **Practice shoots** — Collaborate with local photographers and models
2. **Before & after documentation** — Show your transformative skills
3. **Social media presence** — Instagram and Pinterest are essential platforms
4. **Diverse styles** — Show versatility across traditional, contemporary, and fusion looks

## Step 3: Understand Your Market

The luxury bridal market operates differently from general beauty services:

- **Premium pricing** reflects artistry, not just time
- **Client experience** matters as much as the final look
- **Consultations** build trust and set expectations
- **Vendor relationships** with wedding planners, photographers, and venues create referral networks

## Step 4: Create Your Brand Identity

Your brand should communicate luxury, reliability, and artistry:

- Professional website with your best work
- Consistent visual identity across all platforms
- Client testimonials and reviews
- Behind-the-scenes content that shows your process

## Step 5: Deliver Exceptional Client Experiences

In luxury bridal work, the experience is the product:

- **Pre-wedding consultations** to understand the bride's vision
- **Trial sessions** to finalize the look
- **Day-of pampering** — create a calm, luxurious atmosphere
- **Post-wedding follow-up** — this generates reviews and referrals

## Step 6: Never Stop Learning

The beauty industry evolves constantly. Stay ahead by:

- Attending workshops and masterclasses
- Following international trends
- Experimenting with new products and techniques
- Teaching others — it deepens your own understanding

---

## Start Your Journey Today

B2 Bridal Studio's professional certification programs are designed to take you from beginner to bridal expert. With hands-on training, industry connections, and ongoing mentorship, we don't just teach makeup — we build careers.

*Explore our professional courses and take the first step toward your dream career.*
    `,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    author: 'B2 Academy Team',
    readTime: '10 min read',
    tags: ['career', 'bridal artist', 'education', 'professional'],
  },
  {
    title: 'The Pre-Bridal Skin Care Ritual Every Bride Should Follow',
    slug: 'pre-bridal-skincare-ritual',
    category: 'Skin Care',
    preview: 'Six weeks out, four weeks, two weeks — the complete countdown for flawless skin on your wedding day.',
    content: `
## Your Complete Pre-Bridal Skincare Timeline

Beautiful bridal makeup starts with beautiful skin. No amount of foundation can replicate the glow of genuinely healthy, well-prepared skin. Here's our expert-approved countdown to wedding-day radiance.

---

## 6 Weeks Before: The Foundation Phase

This is where the real transformation begins.

### Start a Consistent Routine
- **Double cleanse** every evening — oil cleanser followed by a gentle foaming cleanser
- **Vitamin C serum** every morning for brightening and protection
- **Retinol** 2-3 times per week (evenings only) for cell turnover
- **SPF 50** every single day — non-negotiable

### Professional Treatments
- Book a **facial analysis** with a dermatologist
- Begin a series of **mild chemical peels** if recommended
- Address any specific concerns: acne, pigmentation, or texture

## 4 Weeks Before: The Refinement Phase

Your skin should be adjusting to your routine. Now we refine.

### Upgrade Your Hydration
- Add a **hyaluronic acid serum** for deep hydration
- Use a **hydrating sheet mask** twice a week
- Increase water intake to 3+ litres daily
- Cut back on sugar and processed foods

### Body Care
Don't forget the rest of your skin:
- **Dry brush** before showers to improve circulation
- Use an **AHA body lotion** for smooth, even-toned skin
- Start **lip care** — exfoliate and apply lip masks nightly

## 2 Weeks Before: The Glow Phase

Time to lock in that bridal glow.

### Focus on Radiance
- Switch to a **brightening moisturizer**
- Add **facial oils** (rosehip or marula) for added luminosity
- Do a **LED light therapy** session if accessible
- Get your final professional facial (nothing new or aggressive)

### Avoid These
- **No new products** — allergic reactions are the last thing you need
- **No aggressive treatments** — no peels, lasers, or extractions
- **No sun exposure** without protection

## 1 Week Before: The Calm Phase

Your skin prep is done. Now it's about maintenance and relaxation.

### Gentle Care Only
- Stick to your established routine — no changes
- Focus on **hydration and sleep**
- Use a calming, fragrance-free mask
- Practice your skincare routine timing for the wedding morning

### Mental Wellness
- Stress directly impacts skin — prioritize calm
- Light exercise, meditation, or gentle yoga
- Early bedtimes and no screens before sleep

## Wedding Day Morning

- Cleanse gently with lukewarm water
- Apply your vitamin C serum
- Use a lightweight, hydrating moisturizer
- Apply SPF (yes, even on your wedding day)
- Allow 30 minutes before makeup application begins

---

## Expert Skincare Consultations at B2

Our bridal services include comprehensive pre-bridal skincare guidance. We work with each bride to create a personalized prep plan that ensures your skin is at its absolute best on your special day.

*Book a bridal consultation to begin your glow-up journey.*
    `,
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=80',
    author: 'Shanmugavadivu Sabarinathan',
    readTime: '7 min read',
    tags: ['skincare', 'bridal prep', 'beauty', 'wedding day'],
  },
  {
    title: 'Choosing the Perfect Wedding Jewellery: A Complete Guide',
    slug: 'choosing-perfect-wedding-jewellery',
    category: 'Style Guide',
    preview: 'From temple jewellery to contemporary pieces — how to match your jewellery to your bridal look for maximum impact.',
    content: `
## The Art of Bridal Jewellery Selection

Jewellery is the finishing touch that elevates a bride from beautiful to breathtaking. But with so many options — traditional temple jewellery, Kundan, polki, diamond, and contemporary designs — choosing the right pieces can feel overwhelming.

This guide will help you navigate the world of bridal jewellery with confidence and style.

---

## Understanding Your Bridal Style

Before shopping for jewellery, define your overall bridal aesthetic:

### Traditional Bride
- **Temple jewellery** with intricate gold work
- Heavy **choker sets** and long **harams**
- **Maang tikka** and traditional **jhumkas**
- Perfect with Kanchipuram silks and traditional draping

### Contemporary Bride
- **Polki** or **diamond** sets with modern design
- Layered **necklaces** instead of a single heavy piece
- Statement **ear cuffs** alongside classic studs
- Beautiful with designer sarees and fusion outfits

### Minimalist Bride
- **Single statement piece** — either necklace OR earrings, not both
- **Delicate chains** with pendant
- **Stud earrings** or small hoops
- Elegant with lighter fabrics and pastel outfits

## Matching Jewellery to Your Outfit

### Color Harmony
- **Red/Maroon outfits** → Gold jewellery, rubies, or emeralds
- **Pastel outfits** → Rose gold, pearls, or diamonds
- **White/Ivory outfits** → Polki, diamonds, or silver
- **Green outfits** → Gold with ruby or emerald accents

### Neckline Considerations
- **V-neck** → A pendant or single-strand necklace
- **Round neck** → Choker or collar necklace
- **Off-shoulder** → Statement necklace with minimal earrings
- **High neck** → Long earrings, skip the necklace

## Essential Pieces for an Indian Bride

1. **Necklace/Choker** — The centerpiece of your look
2. **Earrings** — Balance with your necklace weight
3. **Maang Tikka** — Frames the face beautifully
4. **Bangles** — Complete the arm with a mix of styles
5. **Nose Ring** — Traditional and photogenic
6. **Anklets** — Don't forget your feet!

## Practical Tips

- **Try before you finalize** — Wear your outfit to the jewellery store
- **Consider weight** — You'll wear these for hours
- **Match metals** — Don't mix gold tones
- **Photographs** — Some pieces photograph better than others; do a trial shoot
- **Insurance** — Protect your investment

---

## Jewellery Making at B2 Bridal Studio

Did you know we offer professional jewellery-making courses? Learn to create custom pieces — from traditional designs to contemporary art jewellery. Many of our graduates now run successful jewellery businesses.

*Discover our Jewellery Making courses and create something extraordinary.*
    `,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80',
    author: 'Priya Devi',
    readTime: '9 min read',
    tags: ['jewellery', 'wedding', 'style guide', 'bridal'],
  },
  {
    title: 'Behind the Scenes: A Day in Our Bridal Studio',
    slug: 'behind-the-scenes-bridal-studio',
    category: 'Studio Life',
    preview: 'Step inside B2 Bridal Studio and experience the magic, creativity, and passion that goes into every transformation.',
    content: `
## A Glimpse Into Our World

Ever wondered what happens behind the scenes at a luxury bridal studio? From the early morning preparations to the final touch of setting spray, every moment is orchestrated to create magic.

Join us for a day in the life of B2 Bridal Studio.

---

## 6:00 AM — The Studio Awakens

The day begins before sunrise. Our team arrives to prepare the studio:

- **Lighting checks** — Every bulb, ring light, and natural light source is verified
- **Station setup** — Each artist's station is arranged with precision
- **Product prep** — Foundations are matched, palettes are cleaned, brushes are sanitized
- **Ambiance** — Soft music, fresh flowers, and the perfect temperature

## 7:00 AM — The Bride Arrives

This is the moment everything leads to. Our protocol:

1. **Warm welcome** — Chai, comfortable seating, and calming conversation
2. **Consultation review** — Revisiting the agreed-upon look and any last-minute preferences
3. **Skincare prep** — Our signature pre-makeup facial routine
4. **Timeline alignment** — Coordinating with photographer, videographer, and wedding planner

## 8:00 AM — The Transformation Begins

Our lead artist begins the transformation:

### Foundation & Base
- Skin analysis under professional lighting
- Custom color matching and mixing
- Building coverage in thin, breathable layers
- Setting each layer for maximum longevity

### Eyes — The Storytellers
- Precise eyebrow shaping and filling
- Color application based on the chosen theme
- Lash application — our artist's signature finishing touch
- Liner work that defines and elevates

### Lips — The Final Statement
- Lip prep with our custom lip treatment
- Precision lining for the perfect shape
- Color application in layers for lasting power

## 10:00 AM — The Reveal

The mirror is turned, and the bride sees herself for the first time. This moment — the gasp, the tears of joy, the smile — this is why we do what we do.

## Throughout the Day

Our commitment doesn't end at the mirror:

- **Touch-up kit** — A custom kit is prepared for the bride
- **On-call artist** — Available for touch-ups during the event
- **Photo coordination** — Ensuring the look is perfect under all lighting

---

## Experience B2 for Yourself

Whether you're a bride-to-be or an aspiring artist, B2 Bridal Studio welcomes you to experience the magic firsthand. Book a consultation or visit our studio to see our team in action.

*Your beautiful story starts here.*
    `,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    author: 'B2 Bridal Studio',
    readTime: '6 min read',
    tags: ['studio life', 'behind the scenes', 'bridal', 'experience'],
  },
  {
    title: 'Fashion Design Trends 2024: What Every Designer Should Know',
    slug: 'fashion-design-trends-2024',
    category: 'Fashion',
    preview: 'From sustainable fabrics to digital fashion — the trends that are reshaping the fashion design landscape this year.',
    content: `
## The Future of Fashion Design

Fashion design is at an exciting crossroads. Technology, sustainability, and cultural heritage are converging to create a new era of creativity. Whether you're a student, an emerging designer, or an established professional, understanding these trends is essential.

---

## 1. Sustainable Fashion Is No Longer Optional

The most significant shift in fashion is the move toward sustainability:

- **Upcycled fabrics** — Transforming existing textiles into new designs
- **Natural dyes** — Returning to plant-based and mineral coloring
- **Zero-waste pattern cutting** — Designing patterns that use every inch of fabric
- **Transparent supply chains** — Consumers demand to know where and how garments are made

At B2, our fashion design courses now include dedicated modules on sustainable practices.

## 2. Digital Fashion and AI

Technology is revolutionizing how we design:

- **3D garment visualization** — Design and iterate without physical prototyping
- **AI-assisted pattern making** — Faster, more precise pattern development
- **Virtual try-on** — AR technology letting customers see how clothes fit
- **Digital-only fashion** — Garments designed exclusively for virtual avatars

## 3. The Return of Handcraft

In a world of fast fashion, handcrafted details are premium:

- **Hand embroidery** — More valued than ever as a luxury element
- **Block printing** — Traditional techniques with contemporary designs
- **Crochet and macramé** — From accessories to full garments
- **Heritage weaving** — Supporting traditional artisan communities

Our embroidery and handcraft courses at B2 teach these timeless skills.

## 4. Gender-Fluid Design

Fashion is becoming more inclusive:

- **Unisex silhouettes** that flatter all body types
- **Size-inclusive design** from the concept stage
- **Cultural sensitivity** in global design approaches
- **Adaptive fashion** for different abilities

## 5. Color Trends for 2024

- **Butter Yellow** — Soft, warm, and universally flattering
- **Rich Burgundy** — Luxurious and grounding
- **Ocean Teal** — Fresh and modern
- **Soft Lavender** — Continuing from 2023 with new applications
- **Earth Tones** — Warm browns, tans, and terracottas

## 6. Fabric Innovations

- **Bio-fabricated materials** — Leather alternatives from mushrooms and bacteria
- **Smart textiles** — Fabrics that respond to temperature or movement
- **Recycled synthetics** — Ocean plastics transformed into wearable materials
- **Heritage fabrics** — Renewed interest in traditional Indian textiles

---

## Study Fashion Design at B2

Our comprehensive fashion design programs cover everything from traditional techniques to cutting-edge trends. With hands-on projects, industry mentorship, and career guidance, we prepare you for the future of fashion.

*Explore our Fashion Design courses and start creating.*
    `,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=1200&q=80',
    author: 'Priya Devi',
    readTime: '8 min read',
    tags: ['fashion design', 'trends', '2024', 'sustainable fashion'],
  },
];

async function seedBlogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing blogs
    await Blog.deleteMany({});
    console.log('Cleared existing blogs');

    // Insert seed data
    await Blog.insertMany(blogs);
    console.log(`Seeded ${blogs.length} blogs successfully`);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error seeding blogs:', err);
    process.exit(1);
  }
}

seedBlogs();
