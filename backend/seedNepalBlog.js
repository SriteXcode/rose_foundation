const connectDB = require('./config/db');
const BlogPost = require('./models/BlogPost');
const Volunteer = require('./models/Volunteer');

const nepalBlogContent = `
<div class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:to-zinc-900 border-l-4 border-amber-500 p-5 rounded-r-2xl my-6 shadow-xs">
  <p class="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-amber-200 italic text-center">
    ""Stand in Pain Today. Stronger Tomorrow. ""
  </p>
</div>

<p class="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
  When disaster strikes, homes can be destroyed in moments, families can be displaced, and communities can be left facing an uncertain tomorrow.
</p>

<p class="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
  But in the face of tragedy, people come together.
</p>

<p class="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
  <strong class="font-extrabold text-zinc-900 dark:text-white">Stand With Nepal</strong> is a humanitarian awareness and relief campaign created to support communities affected by disaster and help them move from immediate relief toward recovery and rebuilding. Every Helping Hand Matters.
</p>

<p class="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
  For families facing a crisis, basic necessities can make an enormous difference.
</p>

<div class="space-y-3.5 my-6 p-5 rounded-2xl bg-gray-50/80 dark:bg-zinc-900/60 border border-gray-200/80 dark:border-zinc-800 text-left">
  <div class="flex items-start gap-3">
    <span class="text-xl shrink-0">🍱</span>
    <p class="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
      <strong class="font-bold text-zinc-900 dark:text-white">Food Help</strong> provide essential food supplies to families and communities in need.
    </p>
  </div>

  <div class="flex items-start gap-3">
    <span class="text-xl shrink-0">💧</span>
    <p class="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
      <strong class="font-bold text-zinc-900 dark:text-white">Clean Water Support</strong> access to safe drinking water and essential hygiene supplies.
    </p>
  </div>

  <div class="flex items-start gap-3">
    <span class="text-xl shrink-0">🏠</span>
    <p class="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
      <strong class="font-bold text-zinc-900 dark:text-white">Shelter Help</strong> displaced families find safe places to stay while communities recover.
    </p>
  </div>

  <div class="flex items-start gap-3">
    <span class="text-xl shrink-0">🏥</span>
    <p class="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
      <strong class="font-bold text-zinc-900 dark:text-white">Medicine Support</strong> access to essential healthcare and medical assistance.
    </p>
  </div>
</div>

<figure class="story-img story-img-center mx-auto my-8 block text-center clear-both" style="width: 100%; text-align: center;" data-width="100" data-placement="center">
  <img src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=1200" alt="Losses in Nepal" class="rounded-2xl w-full h-auto object-cover shadow-sm border border-gray-200 dark:border-zinc-800 block mx-auto" />
  <figcaption class="story-img-caption text-xs text-zinc-600 dark:text-zinc-400 text-center italic mt-2.5 font-medium py-1 px-4 leading-relaxed inline-block rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
    Losses in Nepal
  </figcaption>
</figure>

<figure class="story-img story-img-center mx-auto my-8 block text-center clear-both" style="width: 100%; text-align: center;" data-width="100" data-placement="center">
  <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200" alt="People loss their Family" class="rounded-2xl w-full h-auto object-cover shadow-sm border border-gray-200 dark:border-zinc-800 block mx-auto" />
  <figcaption class="story-img-caption text-xs text-zinc-600 dark:text-zinc-400 text-center italic mt-2.5 font-medium py-1 px-4 leading-relaxed inline-block rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
    People loss their Family
  </figcaption>
</figure>

<div class="my-8 space-y-4 text-left">
  <h2 class="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
    From Loss to Hope
  </h2>
  
  <p class="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
    A disaster may change a community's landscape, but it does not have to define its future.
  </p>

  <p class="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
    Recovery takes time. It requires resources, compassion, coordination, and people willing to stand together.
  </p>

  <p class="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
    Whether you donate, volunteer, share verified information, or simply help amplify the voices of affected communities, your contribution can help turn solidarity into meaningful action.
  </p>
</div>

<div class="my-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-xl space-y-4 text-left">
  <div class="inline-flex items-center gap-2 bg-amber-500 text-zinc-950 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
    JOIN THE CAMPAIGN
  </div>

  <h3 class="text-xl sm:text-2xl font-extrabold text-white leading-snug">
    Donate. Volunteer. Spread Awareness.
  </h3>

  <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed">
    Together, we can support families through the difficult days ahead and help communities work toward a stronger tomorrow.
  </p>

  <div class="pt-2 space-y-1">
    <p class="text-base sm:text-lg font-extrabold text-amber-400">
      Stand With Nepal.
    </p>
    <p class="text-base sm:text-lg font-extrabold text-white">
      Stand With Humanity.
    </p>
  </div>

  <div class="pt-3 border-t border-zinc-800 flex flex-wrap gap-2 text-[11px] font-mono text-zinc-400">
    <span class="hover:text-amber-400 transition-colors">#StandWithNepal</span>
    <span>•</span>
    <span class="hover:text-amber-400 transition-colors">#NepalStrong</span>
    <span>•</span>
    <span class="hover:text-amber-400 transition-colors">#HelpNepal</span>
    <span>•</span>
    <span class="hover:text-amber-400 transition-colors">#TogetherForNepal</span>
    <span>•</span>
    <span class="hover:text-amber-400 transition-colors">#NepalRelief</span>
    <span>•</span>
    <span class="hover:text-amber-400 transition-colors">#NepalResilient</span>
  </div>
</div>
`;

async function seedNepalBlog() {
  try {
    await connectDB();
    
    // Find or create volunteer Harsh Yadav
    let volunteer = await Volunteer.findOne({ name: /Harsh Yadav/i });
    if (!volunteer) {
      volunteer = await Volunteer.create({
        name: 'Harsh Yadav',
        email: 'harsh.yadav@blackrosefoundation.org.in',
        role: 'Volunteer',
        designation: 'Official Fundraiser Lead',
        isFundraiser: true,
        volunteerCode: 'BRF-VOL-HY2026',
        fundraiserCode: 'BRF-VOL-HY2026',
        status: 'approved',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
      });
    }

    const postData = {
      title: 'Bring Nepal back to Life',
      slug: 'bring-nepal-back-to-life',
      summary: 'Stand With Nepal is a humanitarian awareness and relief campaign created to support communities affected by disaster and help them move from immediate relief toward recovery and rebuilding.',
      content: nepalBlogContent.trim(),
      coverImage: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=1200',
      author: 'Piyush Yadav',
      authorRole: 'admin',
      tags: ['BEINGTOGETHER', 'HUMANITY'],
      status: 'published',
      showDonationCard: true,
      volunteerId: volunteer._id,
      volunteerCode: volunteer.volunteerCode || volunteer.fundraiserCode,
      volunteerName: volunteer.name,
      volunteerImage: volunteer.image,
      createdAt: new Date('2026-09-22T10:00:00.000Z')
    };

    const existing = await BlogPost.findOne({ slug: 'bring-nepal-back-to-life' });
    if (existing) {
      await BlogPost.findByIdAndUpdate(existing._id, postData);
      console.log('✅ Updated existing "Bring Nepal back to Life" blog post.');
    } else {
      await BlogPost.create(postData);
      console.log('✅ Created new "Bring Nepal back to Life" blog post.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Nepal blog:', err);
    process.exit(1);
  }
}

seedNepalBlog();
