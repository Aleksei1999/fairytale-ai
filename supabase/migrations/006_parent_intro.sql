-- Migration: Add parent_intro field for story introduction
-- Date: 2025-12-25
-- Description: Adds a field for parent introduction text shown before creating/listening to a story

ALTER TABLE program_stories ADD COLUMN IF NOT EXISTS parent_intro TEXT;

-- Update stories 1-12 with parent intro from the methodology document
UPDATE program_stories SET parent_intro = 'Today marks the start of our journey. Often children get scared by mood changes. It seems strange to them that just a minute ago they were happy, and now they want to cry. In this story, we introduce the metaphor of the "Magic Backpack". The Backpack is the child''s psyche (soul). The Sparks are emotions - they live in the backpack and come out one by one. Today we''ll meet two of the most frequent visitors: Joy (Yellow) and Sadness (Blue). The main goal is to show that Sadness is just as important as Joy.

**Tip before listening:** Ask your child: "What do you think is inside you when you laugh? And when you cry? Let''s find out who lives there."' WHERE id = 1;

UPDATE program_stories SET parent_intro = 'Anger is probably the most "uncomfortable" emotion for adults. We often tell children: "Don''t be angry!", "Stop yelling!", "Good boys/girls don''t behave like that". This creates a belief: "Anger is bad. If I''m angry - I''m bad." This leads to suppressing emotions (harmful to health) or explosive tantrums.

Today''s task: We change the child''s attitude toward Anger. In this story, we show that Anger (Red Spark) is not an enemy, but a Helper and Protector. It gives energy (strength) to do hard things. It helps protect yourself.

**Tip before listening:** Ask your child: "Do you ever feel hot like a teapot, with clenched fists? What do you think we need this hot power for?"' WHERE id = 2;

UPDATE program_stories SET parent_intro = 'In our culture, fear is often seen as weakness. We tell boys: "You''re a man, don''t be scared!" and girls: "There''s nothing there, stop imagining things." But Fear is the oldest safety system. Without it, children wouldn''t stop before roads or fear heights.

Today''s task: We introduce the Purple Spark (Fear). We teach the child not to be ashamed of their fear, but to listen to it as a useful signal. In the story, Fear acts not as an enemy that interferes with life, but as a Scout who warns of danger (a pit) and saves the Hero from falling.

**Tip before listening:** Ask your child: "What are you most afraid of? Darkness, dogs, or spiders? Did you know that fear is your personal guard? Let''s find out how it works."' WHERE id = 3;

UPDATE program_stories SET parent_intro = 'Today we''re helping children understand that all emotions, even "negative" ones, are temporary and natural. Just like weather changes - storms don''t last forever. This lesson helps children not panic when they feel sad, knowing it will pass.

**Tip before listening:** Ask your child: "Have you noticed that sometimes you feel like sunshine, and sometimes like rain? Both are normal! Let''s learn why."' WHERE id = 4;

UPDATE program_stories SET parent_intro = 'Sharing joy is a wonderful skill. When we share good news, happiness multiplies! One smile becomes two, then four. But when we try to keep joy only for ourselves, it actually shrinks.

**Tip before listening:** Ask your child: "When something good happens to you, who do you want to tell first? Why does it feel good to share happy news?"' WHERE id = 5;

UPDATE program_stories SET parent_intro = 'Understanding that emotions are like weather - they come and go - is a powerful insight. A storm doesn''t last forever, and neither does sadness or anger. We can''t control the weather, but we can dress appropriately for it.

**Tip before listening:** Ask your child: "Do you remember a time when you were very sad, but then felt better? Emotions are like clouds - they pass by."' WHERE id = 6;

UPDATE program_stories SET parent_intro = 'Anger management starts with early recognition. Inside every child is a small volcano. When something feels unfair, the volcano rumbles. If we ignore it, BOOM! But if we notice the rumbling early, we can prevent the explosion.

**Tip before listening:** Ask your child: "What does your body feel like when you start getting angry? Hot face? Tight tummy? Let''s learn to catch those feelings early."' WHERE id = 7;

UPDATE program_stories SET parent_intro = 'Today we reframe fear as a protective friend. Fear keeps us safe - it makes us look both ways before crossing, stops us from touching hot stoves. When children understand fear''s purpose, they stop being afraid of being afraid.

**Tip before listening:** Ask your child: "Did you know fear is actually trying to help you? It''s like having a superhero inside who yells STOP when there''s danger!"' WHERE id = 8;

UPDATE program_stories SET parent_intro = 'Building a daily emotional check-in habit is incredibly valuable. When children regularly pause to notice "How am I feeling right now?", they develop emotional intelligence that will serve them for life.

**Tip before listening:** Ask your child: "If your feelings had colors, what color would you be right now? Let''s create a daily feelings check!"' WHERE id = 9;

UPDATE program_stories SET parent_intro = 'Reading facial expressions is a fundamental social skill. Children who can recognize emotions on faces develop better empathy and social connections. This is the foundation for understanding others.

**Tip before listening:** Practice with your child: make a happy face, sad face, angry face. Ask them to guess your emotion!

' WHERE id = 10;

UPDATE program_stories SET parent_intro = 'Body language tells us so much about how others feel. Clenched fists, bouncing feet, slumped shoulders - these are all clues. When children learn to read the whole person, not just their words, they become better friends.

**Tip before listening:** Watch people at the park or on TV with the sound off. Ask your child: "What do you think that person is feeling? How can you tell?"' WHERE id = 11;

UPDATE program_stories SET parent_intro = 'This story celebrates the complexity of emotions. Multiple feelings can exist at the same time - we can feel happy AND nervous, sad AND grateful. Understanding this helps children accept their full emotional experience.

**Tip before listening:** Ask your child: "Can you ever feel two things at once? Like excited but also a little scared? That''s completely normal!"' WHERE id = 12;
