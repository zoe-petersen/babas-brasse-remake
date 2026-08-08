-- Bring the editorial taxonomy and creative-team content in line with the
-- approved magazine brief. Existing article relationships are preserved.

do $$
declare
  source_id uuid;
  target_id uuid;
begin
  select id into source_id from public.categories where slug = 'reviews';
  select id into target_id from public.categories where slug = 'articles';

  if source_id is not null and target_id is not null and source_id <> target_id then
    update public.articles set category_id = target_id where category_id = source_id;
    delete from public.categories where id = source_id;
  elsif source_id is not null then
    update public.categories
    set name = 'Articles',
        slug = 'articles',
        description = 'Features, reported stories, and long-form cultural writing.'
    where id = source_id;
  end if;

  select id into source_id from public.categories where slug = 'artwork';
  select id into target_id from public.categories where slug = 'art';

  if source_id is not null and target_id is not null and source_id <> target_id then
    update public.articles set category_id = target_id where category_id = source_id;
    delete from public.categories where id = source_id;
  elsif source_id is not null then
    update public.categories
    set name = 'Art',
        slug = 'art',
        description = 'Visual art, artists, exhibitions, and creative practice.'
    where id = source_id;
  end if;
end
$$;

insert into public.categories (name, slug, description, sort_order) values
  ('Literature', 'literature', 'Books, poetry, and the written word.', 1),
  ('Opinion', 'opinion', 'Personal essays, arguments, reflections, and first-person cultural commentary.', 2),
  ('Interviews', 'interviews', 'Conversations with artists and cultural voices.', 3),
  ('Short Stories', 'short-stories', 'Original fiction and literary experiments.', 4),
  ('Theatre', 'theatre', 'Stages, performances, and rehearsal rooms.', 5),
  ('Fashion', 'fashion', 'Style, identity, and the people shaping both.', 6),
  ('Music', 'music', 'Sound, scenes, and artists worth hearing.', 7),
  ('Art', 'art', 'Visual art, artists, exhibitions, and creative practice.', 8),
  ('Articles', 'articles', 'Features, reported stories, and long-form cultural writing.', 9)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- The original seed used placeholder team members for these two rows. Reuse
-- those records so existing foreign keys remain intact on upgraded projects.
update public.contributors
set name = 'Mia-Lee Winter',
    slug = 'mia-lee-winter'
where slug = 'naledi-maseko'
  and not exists (select 1 from public.contributors where slug = 'mia-lee-winter');

update public.contributors
set name = 'Brick Mbekwa',
    slug = 'brick-mbekwa'
where slug = 'ayesha-daniels'
  and not exists (select 1 from public.contributors where slug = 'brick-mbekwa');

insert into public.contributors (
  name,
  slug,
  role_title,
  bio,
  image_url,
  facebook_url,
  instagram_url,
  tiktok_url,
  linkedin_url,
  twitter_url,
  email,
  is_team,
  sort_order
) values
  (
    'Zubayr Charles',
    'zubayr-charles',
    'Creative Director and Editor-in-Chief',
    $bio$Zubayr Charles isn’t your average Creative Director and Editor-in-Chief. By putting his UCT Master’s in Creative Writing degree to good use, he has built traction as a local theatre maker with hit productions such as The Battered Housewives’ Club, Please, don’t call me moffie, and this bra’s a psycho. As a multi-disciplinary writer and creative being, he is a published author of the novel, Haram, and the poetry collection, the sad boy’s starter pack and other poems. Beyond the page and stage, Zubayr can be found chillin’ at Saunders Rocks, writing poetry, redditing true crime series, or jamming hard to his Indie Rock, SA House, or Yaadt music playlists.$bio$,
    '/media/team/creative-director-editor-in-chief.png',
    null,
    null,
    null,
    null,
    null,
    'creativedirector@babasandbrasse.com',
    true,
    1
  ),
  (
    'Mia-Lee Winter',
    'mia-lee-winter',
    'Junior Editor',
    $bio$Mia Winter is our resident editor-in-training. Raised between the mountains and the coast of the Western Cape, she brings sharp instinct and serious heart to everything she writes, reads and edits. After spending a year abroad, Mia returned to Cape Town with a widened worldview and a fascination with the many ways people turn lived experience into language, art, and meaning. As part of UCT’s class of 2027, majoring in English Literature and Linguistics, she is building towards a career in teaching, guided by her core belief in learning for life. Impressively, she plays one of her six instruments, composing music, collecting awards, reading, writing her own, or finding new ways to advocate for human, animal, and world rights.$bio$,
    '/media/team/managing-editor-writer.png',
    null,
    null,
    null,
    null,
    null,
    'submissions@babasandbrasse.com',
    true,
    2
  ),
  (
    'Zoë Petersen',
    'zoe-petersen',
    'Software Developer',
    $bio$Zoë Petersen is our software developer and tech enthusiast. Born and bred in Bonteheuwel, she is driven by curiosity, creativity, and a determination to turn her dreams into reality. Passionate about using storytelling and the sharing of our lived experiences here in South Africa, she believes in creating digital spaces that uplift communities and amplify voices that deserve to be heard. Goal-driven and always eager to learn, Zoë is the kind of person who will never stop asking “why?” before accepting “what.” When she’s not building websites or exploring new technologies, you’ll find her dancing to TikTok trends, chasing her next big idea, and finding inspiration in the stories that connect us all.$bio$,
    '/media/team/software-developer.png',
    'https://www.facebook.com/share/17cux1uZkm/',
    'https://www.instagram.com/zoe_tyler_petersen/',
    'https://www.tiktok.com/@zoe.petersen23',
    'https://www.linkedin.com/in/zoe-tyler-petersen',
    null,
    'zoetylerhendricks@gmail.com',
    true,
    3
  ),
  (
    'Brick Mbekwa',
    'brick-mbekwa',
    'Graphics Designer',
    $bio$Brick Mbekwa is a freelance photographer and self-taught graphic designer who lives life in full technicolor. Raised in Johannesburg, Brick draws from the richness of multiculturalism to create visuals rooted in community and lived experience. Currently a third-year UCT student, when he's not behind the lens (or a desk), they are out with friends, drinking copious amounts of matcha, or deep in an anime binge. (He/She/They)$bio$,
    '/media/team/visual-artist-photographer.png',
    null,
    'https://www.instagram.com/im.brickalicious/',
    null,
    null,
    null,
    'brickmbekwa@gmail.com',
    true,
    4
  )
on conflict (slug) do update set
  name = excluded.name,
  role_title = excluded.role_title,
  bio = excluded.bio,
  image_url = excluded.image_url,
  facebook_url = excluded.facebook_url,
  instagram_url = excluded.instagram_url,
  tiktok_url = excluded.tiktok_url,
  linkedin_url = excluded.linkedin_url,
  twitter_url = excluded.twitter_url,
  email = excluded.email,
  is_team = excluded.is_team,
  sort_order = excluded.sort_order;
