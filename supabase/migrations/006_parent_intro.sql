-- Migration: Add parent_intro field for story introduction
-- Date: 2025-12-25
-- Description: Adds a field for parent introduction text shown before creating/listening to a story

ALTER TABLE program_stories ADD COLUMN IF NOT EXISTS parent_intro TEXT;

-- Story 1: The Magic Backpack and First Sparks
UPDATE program_stories SET parent_intro = 'Topic: Basic Emotional Literacy (Joy and Sadness)
Method: Emotional Labeling

Dear Parents!
Today marks the start of our journey. Often children get scared by mood changes. It seems strange to them that just a minute ago they were happy, and now they want to cry.

In this story, we introduce the metaphor of the "Magic Backpack":
- The Backpack is the child''s psyche (soul)
- The Sparks are emotions - they live in the backpack and come out one by one

Today we''ll meet two of the most frequent visitors: Joy (Yellow) and Sadness (Blue). The main goal is to show that Sadness is just as important as Joy.

**Tip before listening:** Ask your child: "What do you think is inside you when you laugh? And when you cry? Let''s find out who lives there."' WHERE id = 1;

-- Story 2: The Fiery Protector
UPDATE program_stories SET parent_intro = 'Topic: Meeting Anger (Aggression as a Resource)
Method: Reframing

Dear Parents!
Anger is probably the most "uncomfortable" emotion for adults. We often tell children: "Don''t be angry!", "Stop yelling!", "Good boys/girls don''t behave like that".

This creates a belief: "Anger is bad. If I''m angry - I''m bad." This leads to suppressing emotions (harmful to health) or explosive tantrums.

Today''s task: We change the child''s attitude toward Anger. In this story, we show that Anger (Red Spark) is not an enemy, but a Helper and Protector:
- It gives energy (strength) to do hard things
- It helps protect yourself

**Tip before listening:** Ask your child: "Do you ever feel hot like a teapot, with clenched fists? What do you think we need this hot power for?"' WHERE id = 2;

-- Story 3: The Secret of the Rustling Bush
UPDATE program_stories SET parent_intro = 'Topic: Meeting Fear (Safety and Self-Preservation Instinct)
Method: Psychoeducation + Positive Reframing

Dear Parents!
In our culture, fear is often seen as weakness. We tell boys: "You''re a man, don''t be scared!" and girls: "There''s nothing there, stop imagining things."

But Fear is the oldest safety system. Without it, children wouldn''t stop before roads or fear heights.

Today''s task: We introduce the Purple Spark (Fear). We teach the child not to be ashamed of their fear, but to listen to it as a useful signal. In the story, Fear acts not as an enemy, but as a Scout who warns of danger.

**Tip before listening:** Ask your child: "What are you most afraid of? Darkness, dogs, or spiders? Did you know that fear is your personal guard? Let''s find out how it works."' WHERE id = 3;

-- Story 4: Map of My Body
UPDATE program_stories SET parent_intro = 'Topic: Somatics (Where Do Feelings Live in the Body?)
Method: Body Scan

Dear Parents!
Do you know the situation when a child plays calmly, and a second later is already fighting or screaming? It seems like the outburst happened instantly.

Actually - no. Emotion never starts immediately in the head. First it sends a signal to the Body:
- Before hitting - fists clench (Anger)
- Before crying - a "lump" in the throat (Sadness)
- Before running - stomach gets cold (Fear)

Today''s task: We''ll turn your child into a "Body Detective". In this story, the Hero learns that Anger lives in fists, and Joy lives in the chest. This critical skill helps catch warning signs before action.

**Tip before listening:** Ask your child to lie comfortably and relax. Say: "Today the story will teach us to listen to your tummy and fingers. Let''s check how they''re doing?"' WHERE id = 4;

-- Story 5: Sky Weather
UPDATE program_stories SET parent_intro = 'Topic: Emotional Weather (Everything Passes)
Method: Mindfulness + ACT (Acceptance Therapy)

Dear Parents!
Have you noticed that when a child is upset, they''re inconsolable? They think Sadness is forever.

In children''s perception of time, there''s no concept of "it will pass soon". If they feel bad now - the world has collapsed completely. This is why tantrums can be so prolonged.

Today''s task: We give the child a powerful metaphor: "You are the Sky, and emotions are the Weather."
- Rain (tears) cannot last forever
- Clouds (anger) will definitely fly away
- And the Sky (the child themselves) always stays in place - clear and blue

**Tip before listening:** If it''s cloudy or raining outside, point it out to your child: "Look, the clouds covered the sun. But the sun hasn''t gone anywhere, it''s just waiting. Let''s listen to a story about this."' WHERE id = 5;

-- Story 6: The Magic Remote
UPDATE program_stories SET parent_intro = 'Topic: Emotion Intensity (Volume Scale)
Method: Emotional Regulation + Scaling Technique

Dear Parents!
Do you know the situation when you say "Calm down!" to a child, but they can''t hear you anymore?

This happens when the emotion has reached level 10 out of 10. At this point, the "thinking" part of the brain shuts down. But emotion never turns on at ten immediately. It grows gradually: 1... 3... 5... and only then 10.

Today''s task: We give the child an imaginary "Volume Remote":
- Level 1-3: I''m just frowning
- Level 5: I''m stomping my foot
- Level 10: Volcano explosion!

**Tip before listening:** Ask your child: "How loudly can you laugh? And quietly? Today we''ll find a magic button inside you."' WHERE id = 6;

-- Story 7: Dance of the Angry Dragon
UPDATE program_stories SET parent_intro = 'Topic: Safe Release of Aggression (Sublimation)
Method: Play Therapy + Art Therapy

Dear Parents!
The biggest problem with children''s anger is prohibition. The child hears: "Don''t yell!", "Don''t hit!", "Don''t be angry!". But the energy of Anger (hormones) has already been released.

Today''s task: We show the child the "Third Way":
1. Hitting mom - not allowed
2. Keeping inside - harmful
3. Releasing steam safely - POSSIBLE

In this story, the Hero learns the "Dragon Dance" - a way to release anger through movement and sound without destroying anything around.

**Tip before listening:** Prepare a small pillow or sheet of paper. After the story, the child might want to try "roaring" into the pillow or crumpling paper.' WHERE id = 7;

-- Story 8: Lake of Tears and Warm Blanket
UPDATE program_stories SET parent_intro = 'Topic: Experiencing Sadness and Self-Soothing
Method: Self-Compassion + Emotional Release

Dear Parents!
When a child cries, our first reaction is to stop it immediately: "Don''t cry! Here, take a candy! Look, a bird flew by!". We distract the child without letting them experience the loss.

But Sadness has important work: it helps the psyche accept that something is no longer there. Tears release stress hormones.

Today''s task: We teach the child not to run from sadness, but to experience it:
1. Cry out the tears (create a "Lake")
2. Hug yourself (the "Tight Hug" technique)

**Tip before listening:** Be prepared to hug your child at the end of the story. The story will be touching but light.' WHERE id = 8;

-- Story 9: Laughter Glasses and the Shadow
UPDATE program_stories SET parent_intro = 'Topic: Working with Fears Through Play and Laughter
Method: Paradoxical Intention + Reframing

Dear Parents!
When a child says: "There''s a monster in the corner!", our logic ("There''s no one there, it''s a chair") doesn''t work. The child''s emotional brain sees the monster.

If we say "Don''t be afraid", we invalidate their feelings.

Today''s task: We won''t argue with the monster. We''ll change it!
In the story, the Hero meets a scary Shadow. But instead of running, they put on "Magic Laughter Glasses" and see this monster in a pink tutu and on roller skates.

Fear turns into fun. This teaches: "I can control my imagination. If I''m scared, I can reimagine the picture."

**Tip before listening:** Ask your child: "If a scary monster wore a tutu and danced ballet, would it be scary or funny?"' WHERE id = 9;

-- Story 10: The Mystery of the Sad Squirrel
UPDATE program_stories SET parent_intro = 'Topic: Empathy (How to Understand Others'' Feelings?)
Method: Theory of Mind

Dear Parents!
Toddlers often seem selfish. If they''re having fun, they think everyone around is having fun too. They might laugh when someone cries, simply because they don''t know how to "read" others'' state.

In this story, we teach the child to be an "Emotion Detective": look at a friend''s face and posture to understand - are they ready to play or do they need help.

**Tip before listening:** Ask: "If a bunny sits with drooping ears and isn''t hopping - is it happy or sad? Let''s find out in the story."' WHERE id = 10;

-- Story 11: The Magic Bubble and Pushy Bear
UPDATE program_stories SET parent_intro = 'Topic: Personal Boundaries and Saying "No"
Method: Assertiveness Training

Dear Parents!
Sometimes a child gets pushed on the playground and just stays silent, looking at you. Or they don''t want to kiss a distant relative but are too shy to refuse.

The child should know: "My body and my play are my territory."

Today''s task: We give the child a visual image - the "Magic Bubble". This is an invisible boundary around the body. In the story, the Hero learns to put their palm forward (the "Stop" gesture) and firmly say: "I don''t like this, step back."

This is not aggression, it''s protection. If the child learns this now, they won''t become a bullying victim in the future.

**Tip before listening:** Practice the "Stop" gesture: extend your hand forward with palm facing the person. Tell your child: "This is the Protector gesture. Let''s hear how it helped our Hero."' WHERE id = 11;

-- Story 12: The Magic Scale
UPDATE program_stories SET parent_intro = 'Topic: Conflict Resolution (Win-Win)
Method: Problem Solving + Positive Discipline

Dear Parents!
Classic picture: two children pulling one toy and screaming "MINE!". Usually we intervene as judges: "Give it to Petya, he''s smaller" or "Take turns".

But this teaches nothing - except that an adult will always decide for them. What happens when there''s no adult around? A fight.

Today''s task: We teach the child the "Magic Scale" technique:
1. Stop (no one pulls)
2. I''ll tell what I want
3. You''ll tell what you want
4. Together we''ll find what works for both

**Tip before listening:** Ask: "What would you do if both you and a friend wanted the same toy? Let''s find out a magic way."' WHERE id = 12;
