-- Seed: Program Curriculum Data
-- Contains: 4 blocks, 12 months, 48 weeks, 144 stories (titles + plots), questions
-- Full story text to be added later

-- ============================================
-- BLOCKS (4 blocks, 3 months each)
-- ============================================
INSERT INTO program_blocks (id, title, subtitle, icon, color, goal, order_num) VALUES
(1, 'Me & My Emotions', 'EQ Foundation', '💛', 'from-amber-400 to-yellow-500', 'Teach the child to understand what''s happening inside them and not to fear their feelings.', 1),
(2, 'Me & Others', 'Socialization', '💙', 'from-blue-400 to-cyan-500', 'Teach ecological communication, boundaries, and friendship.', 2),
(3, 'Me & My Actions', 'Independence & Discipline', '💚', 'from-green-400 to-emerald-500', 'Development of Executive Functions (brain''s executive functions).', 3),
(4, 'Me — A Person', 'Leadership & Thinking', '💜', 'from-purple-400 to-violet-500', 'Forming the core of personality and preparing for school/world.', 4);

-- ============================================
-- MONTHS (12 months)
-- ============================================
INSERT INTO program_months (id, block_id, title, metaphor, story_arc, order_num) VALUES
-- Block 1: Me & My Emotions
(1, 1, 'Meeting Emotions', 'Yellow Emotion Island', 'The Hero finds the "Emotion Map" and learns to name what they feel.', 1),
(2, 1, 'Taming the Inner Dragon', 'Volcano of Emotions', 'The Hero learns to "put out the fire" inside when angry.', 2),
(3, 1, 'Defeating Fears', 'Cave of Shadows', 'The Hero turns on the "Magic Light" and sees reality.', 3),

-- Block 2: Me & Others
(4, 2, 'First Steps into the World', 'Edge of the Forest', 'The Hero takes the first step toward others and learns to say "Hi".', 4),
(5, 2, 'Sharing & Fairness', 'Berry Meadow', 'The Hero learns to share, take turns, and trade.', 5),
(6, 2, 'Teamwork', 'The Big River', 'The Hero builds a raft with friends and crosses the river together.', 6),

-- Block 3: Me & My Actions
(7, 3, 'Morning Routine', 'Captain''s Ship', 'The Hero raises the sails every morning to keep the ship moving.', 7),
(8, 3, 'Health & Hygiene', 'Fuel & Cleanliness', 'The Hero learns that super-fuel (food) and clean decks (hygiene) keep the ship running.', 8),
(9, 3, 'Order & Sleep', 'Quiet Harbor', 'The Hero tidies the ship and anchors in the harbor for rest.', 9),

-- Block 4: Me — A Person
(10, 4, 'Curiosity & Problem Solving', 'Island of Inventors', 'The Hero explores the Jungle of Questions and fixes the Ancient Mechanism.', 10),
(11, 4, 'Values & Etiquette', 'Kingdom of Noble Deeds', 'The Hero earns the Knight Title through honesty, manners, and gratitude.', 11),
(12, 4, 'Graduation & Future', 'Hero''s Coronation', 'The Hero receives the Crown after passing through the Gallery of Victories.', 12);

-- ============================================
-- WEEKS (48 weeks, 4 per month)
-- ============================================
INSERT INTO program_weeks (id, month_id, title, task, order_num) VALUES
-- Month 1: Meeting Emotions
(1, 1, 'What Are Emotions?', 'Teach child to recognize and name basic emotions: joy, sadness, anger, fear.', 1),
(2, 1, 'Joy & Sadness', 'Help child understand that all emotions are normal and temporary.', 2),
(3, 1, 'Anger & Fear', 'Show that even "negative" emotions have a purpose and can be managed.', 3),
(4, 1, 'Emotion Detective', 'Practice identifying emotions in self and others through observation.', 4),

-- Month 2: Taming the Inner Dragon
(5, 2, 'When Anger Comes', 'Recognize physical signs of anger before it explodes.', 5),
(6, 2, 'Breathing Magic', 'Learn breathing techniques to calm down (dragon breath, balloon breath).', 6),
(7, 2, 'Safe Ways to Release', 'Find healthy outlets for big emotions (punching pillow, running, drawing).', 7),
(8, 2, 'The Pause Button', 'Master the ability to stop and think before reacting.', 8),

-- Month 3: Defeating Fears
(9, 3, 'Understanding Fear', 'Learn that fear is a helper that keeps us safe, but can be wrong.', 9),
(10, 3, 'Fear of the Dark', 'Overcome nighttime fears with "magic light" technique.', 10),
(11, 3, 'Separation Anxiety', 'Build confidence that loved ones always return.', 11),
(12, 3, 'Brave Heart', 'Celebrate courage and recap all emotion skills learned.', 12),

-- Month 4: First Steps into the World
(13, 4, 'Saying Hello', 'Learn how to approach others and introduce yourself.', 13),
(14, 4, 'Sharing & Generosity', 'Understand that sharing brings more joy than keeping everything.', 14),
(15, 4, 'Conflicts & Making Up', 'Learn to resolve arguments and say "I''m sorry".', 15),
(16, 4, 'Teamwork', 'Discover the power of working together.', 16),

-- Month 5: Sharing & Fairness (Berry Meadow)
(17, 5, 'Mine, Yours, Ours', 'Understand concepts of ownership and sharing.', 17),
(18, 5, 'Taking Turns', 'Master the skill of waiting for your turn patiently.', 18),
(19, 5, 'Fair Trade', 'Learn to negotiate and exchange fairly.', 19),
(20, 5, 'Generous Heart', 'Experience the joy of giving without expecting return.', 20),

-- Month 6: Teamwork (Big River)
(21, 6, 'Stronger Together', 'Learn that some things can only be done as a team.', 21),
(22, 6, 'Different Roles', 'Understand that everyone has a unique contribution.', 22),
(23, 6, 'Communication', 'Practice listening and speaking clearly in a group.', 23),
(24, 6, 'Celebration', 'Celebrate team achievements and friendships made.', 24),

-- Month 7: Morning Routine (Captain''s Ship)
(25, 7, 'Raise the Sails', 'Build a positive morning routine: wake up, get dressed, eat.', 25),
(26, 7, 'Teeth Dragons', 'Make brushing teeth an adventure (fighting cavity monsters).', 26),
(27, 7, 'Getting Dressed', 'Learn to dress independently with fun challenges.', 27),
(28, 7, 'Morning Champion', 'Master the complete morning routine independently.', 28),

-- Month 8: Health & Hygiene
(29, 8, 'Super Fuel', 'Understand healthy eating as fuel for the body.', 29),
(30, 8, 'Germ Pirates', 'Learn importance of hand washing and hygiene.', 30),
(31, 8, 'Body Signals', 'Listen to body needs (bathroom, hunger, tiredness).', 31),
(32, 8, 'Healthy Hero', 'Combine all health habits into daily practice.', 32),

-- Month 9: Order & Sleep
(33, 9, 'Toy Homes', 'Learn to put toys away (each toy has a home).', 33),
(34, 9, 'Chaos Storm', 'Understand that mess makes life harder.', 34),
(35, 9, 'Screen Sunset', 'Learn to turn off devices before bed.', 35),
(36, 9, 'Quiet Harbor', 'Master the complete bedtime routine for good sleep.', 36),

-- Month 10: Curiosity & Problem Solving
(37, 10, 'Question Jungle', 'Develop curiosity and courage to ask "why?".', 37),
(38, 10, 'Fixing Things', 'Learn problem-solving through trial and error.', 38),
(39, 10, 'Creative Solutions', 'Use imagination to find unusual solutions.', 39),
(40, 10, 'Making Choices', 'Practice decision-making and accepting consequences.', 40),

-- Month 11: Values & Etiquette
(41, 11, 'Winning & Losing', 'Learn to win gracefully and lose with dignity.', 41),
(42, 11, 'Table Manners', 'Master eating etiquette and guest behavior.', 42),
(43, 11, 'Gratitude Garden', 'Develop habit of saying thank you and appreciating things.', 43),
(44, 11, 'Nature Guardian', 'Learn to care for environment and living things.', 44),

-- Month 12: Graduation & Future
(45, 12, 'Victory Gallery', 'Reflect on all achievements throughout the year.', 45),
(46, 12, 'Becoming a Teacher', 'Share knowledge with younger ones (teaching reinforces learning).', 46),
(47, 12, 'Future Dreams', 'Imagine the future without fear, with excitement.', 47),
(48, 12, 'Hero''s Coronation', 'Celebrate completion and receive the Hero''s Crown.', 48);

-- ============================================
-- STORIES (144 stories - first 48 shown, rest follow same pattern)
-- ============================================
INSERT INTO program_stories (id, week_id, title, plot, therapeutic_goal, methodology, why_important, day_in_week, order_num) VALUES
-- Week 1: What Are Emotions?
(1, 1, 'The Magic Emotion Map', 'The Hero finds a mysterious map that shows different islands - each island is an emotion. When Hero feels something, a dot appears on the map. Hero learns that feelings have names.', 'Emotional literacy - naming feelings', 'Emotion Labeling (Gottman)', 'Children who can name emotions can better regulate them', 1, 1),
(2, 1, 'Island of Joy', 'Hero visits the yellow sunny Island of Joy. Everything sparkles, animals dance. Hero learns to recognize when joy visits: warm chest, smile, energy.', 'Recognizing positive emotions in the body', 'Somatic Awareness', 'Helps child connect physical sensations with emotions', 3, 2),
(3, 1, 'Island of Sadness', 'Hero visits the blue rainy Island of Sadness. It''s quiet and wet. Hero learns that sadness is okay - it helps us rest and shows what we care about.', 'Normalizing negative emotions', 'Emotion Validation', 'Prevents suppression of "bad" feelings', 5, 3),

-- Week 2: Joy & Sadness
(4, 2, 'Tears are Okay', 'Hero sees a friend crying and doesn''t know what to do. Wise Owl explains that tears wash away sadness like rain cleans the air. Hero learns to sit with sad friends.', 'Comfort and empathy for sadness', 'Active Listening', 'Teaches both self-acceptance and empathy', 1, 4),
(5, 2, 'Joy Sharing', 'Hero discovers that when you share good news, joy multiplies! One smile becomes two, becomes four. But trying to keep joy only for yourself makes it shrink.', 'Social emotional sharing', 'Positive Psychology', 'Joy increases when shared with others', 3, 5),
(6, 2, 'The Emotion Weather', 'Hero learns that emotions are like weather - they come and go. A storm doesn''t last forever, and neither does sadness. You can''t control weather but can dress for it.', 'Emotional impermanence', 'Mindfulness concepts', 'Reduces fear of negative emotions', 5, 6),

-- Week 3: Anger & Fear
(7, 3, 'The Anger Volcano', 'Inside Hero is a small volcano. When someone is unfair, the volcano rumbles. If Hero ignores it, BOOM! Lava everywhere. Hero learns to notice the rumbling early.', 'Early anger recognition', 'CBT - Trigger identification', 'Prevention is easier than damage control', 1, 7),
(8, 3, 'What Fear Tells Us', 'Hero meets Fear - a small creature with big eyes. Fear says "I keep you safe! When cars are near, I yell STOP!" Hero learns fear is a friend, not enemy.', 'Reframing fear as protective', 'Psychoeducation', 'Reduces fear of fear itself', 3, 8),
(9, 3, 'The Feelings Check-In', 'Hero creates a daily ritual: "How am I feeling right now?" They spin a wheel of emotions each morning and learn to pause and notice.', 'Emotional awareness practice', 'Mindfulness Check-in', 'Builds habit of emotional awareness', 5, 9),

-- Week 4: Emotion Detective
(10, 4, 'Reading Faces', 'Hero gets detective magnifying glass that reveals emotions on faces. Raised eyebrows = surprise. Down mouth = sad. Hero practices guessing what friends feel.', 'Facial emotion recognition', 'Social cognition training', 'Foundation for empathy', 1, 10),
(11, 4, 'Body Clues', 'The detective glass shows body clues too! Clenched fists = angry. Bouncing = excited. Hero learns to read the whole person, not just words.', 'Non-verbal emotion recognition', 'Body language awareness', 'Most communication is non-verbal', 3, 11),
(12, 4, 'The Emotion Band', 'Hero forms a band with friends. Each plays an instrument of a different emotion. Together they make music. Sometimes sad and happy play together - that''s okay!', 'Emotional complexity and coexistence', 'Emotion integration', 'Multiple emotions can exist simultaneously', 5, 12),

-- Week 5: When Anger Comes
(13, 5, 'The Little Dragon Inside', 'Hero discovers a tiny dragon lives in their chest. Usually it sleeps. But when something''s unfair - it wakes up! Dragon isn''t bad, but needs training.', 'Externalizing anger as manageable', 'Narrative therapy', 'Makes anger less scary and more controllable', 1, 13),
(14, 5, 'Warning Signs', 'Dragon gives warning signs before breathing fire: hot ears, tight fists, fast heart. Hero makes a list of THEIR warning signs to catch dragon early.', 'Physiological awareness of anger', 'CBT body scanning', 'Early intervention prevents explosions', 3, 14),
(15, 5, 'Dragon''s Needs', 'Hero asks Dragon: "What do you need?" Dragon says: "I need things to be FAIR!" Hero learns anger often comes from unmet needs - now they can use words.', 'Understanding anger''s message', 'Needs-based approach (NVC)', 'Anger is information, not just disruption', 5, 15),

-- Week 6: Breathing Magic
(16, 6, 'Dragon Breath', 'Hero learns special breathing: breathe in through nose (smelling flowers), breathe out through mouth (blowing birthday candles). This calms the dragon.', 'Diaphragmatic breathing', 'Relaxation techniques', 'Activates parasympathetic nervous system', 1, 16),
(17, 6, 'Balloon Belly', 'Hero imagines a balloon in their belly. Breathe in - balloon inflates. Breathe out - balloon deflates. 5 balloon breaths make dragon sleepy.', 'Breath visualization', 'Child-friendly meditation', 'Visual aid for proper breathing technique', 3, 17),
(18, 6, 'The Calm Jar', 'Hero shakes a jar with glitter (angry thoughts). Watching glitter settle teaches that if you wait and breathe, thoughts settle too. Angry mind becomes clear.', 'Visual calming tool', 'Mindfulness object', 'Concrete representation of settling emotions', 5, 18),

-- Week 7: Safe Ways to Release
(19, 7, 'The Punching Cloud', 'Hero finds a magic cloud pillow. When angry, punch the cloud! Jump on it! Cloud absorbs all anger and turns it into rain that waters flowers.', 'Physical release of anger', 'Safe aggression outlet', 'Physical movement releases stress hormones', 1, 19),
(20, 7, 'Angry Art', 'Hero learns to draw their anger - scribble with red crayon, tear paper, squish playdough. The anger goes INTO the art and OUT of the body.', 'Art as emotional expression', 'Art therapy basics', 'Creative expression as coping mechanism', 3, 20),
(21, 7, 'The Roar Room', 'Hero discovers a special room where you can roar like a lion! Let out all the noise! But only in this room (bathroom, pillow). Then walk out calm.', 'Vocalization of anger', 'Primal release technique', 'Sound can release emotional tension', 5, 21),

-- Week 8: The Pause Button
(22, 8, 'Stop, Breathe, Think', 'Hero gets a magic button on their hand. When dragon wakes up: 1) Press button (STOP), 2) Breathe 3 times, 3) Think: "What do I really need?"', 'Self-regulation sequence', 'CBT - Stop-Think-Act', 'Creates space between trigger and reaction', 1, 22),
(23, 8, 'The Turtle Technique', 'Hero meets Wise Turtle who hides in shell when angry. Not to hide forever - just to calm down and think. Then come out with a plan, not a scream.', 'Withdrawal and return strategy', 'Time-out reconceptualized', 'Strategic retreat vs. reactive explosion', 3, 23),
(24, 8, 'Dragon Master', 'Hero is now a Dragon Master! Dragon still wakes up sometimes, but Hero knows all the tricks. They make a poster of ALL their calming tools.', 'Skill consolidation', 'Mastery celebration', 'Reinforces learned skills with pride', 5, 24),

-- Week 9: Understanding Fear
(25, 9, 'Fear the Helper', 'Fear explains its job: "I make you look both ways before crossing! I stop you from touching hot stove!" Hero thanks Fear for protection.', 'Fear as adaptive response', 'Evolutionary psychology for kids', 'Reduces shame about being afraid', 1, 25),
(26, 9, 'False Alarms', 'Sometimes Fear makes mistakes - sees a shadow and yells "MONSTER!" but it''s just a coat. Hero learns to check if Fear is right before panicking.', 'Reality testing', 'CBT - Thought challenging', 'Not all fears are accurate', 3, 26),
(27, 9, 'The Brave Ladder', 'Hero builds a ladder: small brave acts at bottom, big ones at top. Start small (say hi to neighbor), climb up (try new food), reach top (sleep alone!).', 'Graduated exposure', 'Systematic desensitization', 'Courage builds through small steps', 5, 27),

-- Week 10: Fear of the Dark
(28, 10, 'The Magic Flashlight', 'Hero gets a flashlight that reveals truth. In the dark, things LOOK scary. But flashlight shows: the monster is just a pile of clothes. Reality is less scary.', 'Reality testing in darkness', 'Cognitive restructuring', 'Fear often comes from imagination, not reality', 1, 28),
(29, 10, 'Night Guardians', 'Hero discovers that stuffed animals become Night Guardians when lights go off. They patrol the room and keep everything safe. Hero is never truly alone.', 'Transitional objects', 'Object relations', 'External comfort object for security', 3, 29),
(30, 10, 'Commander of the Dark', 'Hero realizes: I can turn lights on and off. I CONTROL the darkness. It doesn''t control me. Hero practices being the boss of the light switch.', 'Sense of control', 'Self-efficacy', 'Control reduces fear', 5, 30),

-- Week 11: Separation Anxiety
(31, 11, 'The Invisible Thread', 'Mom and Hero have an invisible thread between hearts. Even when apart, they''re connected. Hero can touch their heart and "send a hug" through the thread.', 'Maintaining connection during separation', 'Attachment theory', 'Object permanence of love', 1, 31),
(32, 11, 'Mom Always Returns', 'Hero watches: Mom leaves for store... and comes back! Mom leaves for work... and comes back! Every time! It''s a rule of the universe: Mom always returns.', 'Predictability of reunion', 'Building trust through pattern', 'Experience proves reliability', 3, 32),
(33, 11, 'The Waiting Game', 'Hero learns to fill waiting time with fun: count red things, draw what you''ll tell mom, help the teacher. Busy waiting goes faster than sad waiting.', 'Coping during separation', 'Distraction techniques', 'Active coping beats passive suffering', 5, 33),

-- Week 12: Brave Heart
(34, 12, 'The Fear Shrinking Machine', 'Every time Hero faces a fear, it shrinks! First time saying hi to stranger: fear is huge. Tenth time: fear is tiny. Bravery makes fear smaller each time.', 'Exposure reduces fear', 'Habituation', 'Fear decreases with practice', 1, 34),
(35, 12, 'Collecting Courage Coins', 'Each brave act = 1 Courage Coin. Hero has been collecting all month! Count them all. Look how rich in courage Hero has become!', 'Tracking progress', 'Reward system', 'Visible progress motivates', 3, 35),
(36, 12, 'The Brave Heart Badge', 'Hero receives the Brave Heart Badge. "You now know: all emotions are okay. You can calm yourself. You can face fears." Hero is ready for the world.', 'Block 1 completion', 'Celebration and transition', 'Marks milestone with pride', 5, 36),

-- Week 13: Saying Hello (Month 4)
(37, 13, 'The Invisible Child', 'Hero stands in the playground corner, silent. Nobody notices them. Hero learns: if you don''t say "Hi", others don''t know you want to play. Voice is magic!', 'Initiation of social contact', 'Social skills training', 'Others can''t read minds - must communicate', 1, 37),
(38, 13, 'The Magic Words: Let''s Play!', 'Hero wants to play ball with Fox but just stares. Fox doesn''t understand. Hero learns the spell: "Can I play with you?" Fox happily agrees.', 'Scripted social approaches', 'Communication scripts', 'Concrete phrases reduce social anxiety', 3, 38),
(39, 13, 'Everyone is Different', 'In the forest, all animals are different: Rabbit is fast, Turtle is slow, Bear is loud. Hero wanted everyone to be the same, but realizes: different is fun!', 'Diversity acceptance', 'Social awareness', 'Prevents bullying, promotes inclusion', 5, 39),

-- Week 14: Sharing & Generosity
(40, 14, 'The Mine-Mine Monster', 'Hero finds berries and a friend approaches. Hero turns into Mine-Mine Monster, hides everything. Sits alone with berries. Full belly, empty heart. Friends left.', 'Consequences of hoarding', 'Natural consequences thinking', 'Greed leads to isolation', 1, 40),
(41, 14, 'Swing Queue', 'Everyone wants the swing! Animals push and fight. Hero invents a rule: "We ride while the song plays." Each person gets a turn. No more fights!', 'Turn-taking', 'Fair systems', 'Most common playground conflict solution', 3, 41),
(42, 14, 'Trading Treasures', 'Hero has a car, Wolf has a robot. Hero wants the robot. Instead of grabbing, Hero offers: "Trade for 5 minutes?" Wolf agrees. Both happy!', 'Negotiation', 'Conflict resolution', 'Civilized way to get what you want', 5, 42),

-- Week 15: Conflicts & Making Up
(43, 15, 'The Argument Knot', 'Hero and Bear fight over the path. A magic Knot ties them together. The more they pull, the tighter it gets. Only "Sorry" + "Let''s together" unties it.', 'Conflict resolution', 'Restorative practices', 'Aggression worsens problems', 1, 43),
(44, 15, 'I-Messages', 'Rabbit broke Hero''s tower. Hero wants to yell "You''re bad!" But Owl teaches: "Say I feel angry because my tower broke." Rabbit understands and helps rebuild.', 'I-statements vs. You-statements', 'Effective communication', 'Main tool against verbal aggression', 3, 44),
(45, 15, 'The Sorry Glue', 'Hero accidentally hurt Squirrel. Their friendship broke like a cup. Hero uses magic "Sorry Glue" to fix it. Crack remains (memory) but cup works again.', 'Apology and repair', 'Relationship repair', '"Sorry" isn''t losing, it''s fixing what matters', 5, 45),

-- Week 16: Teamwork
(46, 16, 'The Unmovable Rock', 'Hero needs to move huge rock to find treasure. Can''t do it alone. Bear can''t either. Even mice come. Together: "One, two, heave!" Rock moves.', 'Synergy', 'Collaborative problem solving', 'Together we achieve more', 1, 46),
(47, 16, 'The Animal Orchestra', 'Animals found instruments. Each plays alone - terrible noise! Hero becomes conductor: "Now you, now you." Together = beautiful music.', 'Coordination and roles', 'Social coordination', 'Listening to each other creates harmony', 3, 47),
(48, 16, 'Friendship Festival', 'Hero throws a party. Can''t do everything alone. Rabbit brings carrots, Fox decorates, Bear brings honey. Small contributions = big celebration.', 'Shared responsibility', 'Positive interdependence', 'Everyone is important', 5, 48);

-- Continue with remaining stories (49-144)...
-- Following the same pattern from the methodology document

-- Week 17-48 stories would continue here following the same format
-- For brevity, I'll add a few key ones and the rest can be added incrementally

-- Week 17: Raise the Sails (Morning Routine)
INSERT INTO program_stories (id, week_id, title, plot, therapeutic_goal, methodology, why_important, day_in_week, order_num) VALUES
(49, 17, 'The Lazy Blanket', 'Morning horn sounds but Hero can''t get up. Lazy Blanket whispers "Sleep more, don''t get up." Ship starts spinning in circles. Hero counts "1-2-3 launch!" and throws off blanket.', 'Quick wake-up skill', 'Behavioral activation', 'Morning starts with a victory or defeat', 1, 49),
(50, 17, 'Dragons in the Cave (Toothbrush)', 'Hero learns invisible Cavity Monsters build houses in mouth. Toothbrush is magic sword. Hero fights for exactly 2 minutes (sand timer) to save pearl-teeth.', 'Tooth brushing motivation', 'Reframing boring task', 'Makes hygiene heroic', 3, 50),
(51, 17, 'Superhero Costume (Getting Dressed)', 'Hero needs to dress but clothes are scattered. Hero plays "Fire Alarm" - must put on uniform in 1 minute to save friends. Race against time!', 'Independent dressing', 'Gamification with timer', 'Getting ready for kindergarten shouldn''t take an hour', 5, 51);

-- Week 48: Hero's Coronation (Final week)
INSERT INTO program_stories (id, week_id, title, plot, therapeutic_goal, methodology, why_important, day_in_week, order_num) VALUES
(142, 48, 'All Friends Gather', 'On the main square, ALL characters from the year gather: Turtle, Lion, Bear, Grandma. Each thanks Hero for something. Hero sees how many friends they made.', 'Social integration', 'Social support network', 'Child feels loved and significant', 1, 142),
(143, 48, 'The Endless Book', 'Wise Man gives Hero a book with all year''s stories. But last pages are empty. "Because from now on, YOU write your own story. You''re the Author of your life."', 'Life agency', 'Narrative therapy - authoring', 'From passive listener to active creator', 3, 143),
(144, 48, 'The Hero''s Crown', 'Ceremonial moment. Mom and Dad bring out the Crown - made not of gold, but of Kindness, Wisdom, Courage, and Love. They crown the Hero. Fireworks! Hugs!', 'Initiation and blessing', 'Rite of passage', 'Final unconditional love and growth recognition', 5, 144);

-- ============================================
-- QUESTIONS (sample - 3-4 per story)
-- ============================================
-- Story 1: The Magic Emotion Map
INSERT INTO program_questions (story_id, question_type, question_text, hint, order_num) VALUES
(1, 'understanding', 'What did the Hero find?', 'A special map that shows feelings', 1),
(1, 'practice', 'Can you name an emotion you felt today?', NULL, 2),
(1, 'ritual', 'Let''s make our own emotion map! What colors would you use for happy? Sad?', NULL, 3);

-- Story 2: Island of Joy
INSERT INTO program_questions (story_id, question_type, question_text, hint, order_num) VALUES
(2, 'understanding', 'What does the Island of Joy look like?', 'Sunny, sparkly, animals dancing', 1),
(2, 'feeling', 'Where do YOU feel joy in your body?', 'Warm chest? Smile? Bouncy legs?', 2),
(2, 'practice', 'Show me your happiest dance!', NULL, 3);

-- Story 3: Island of Sadness
INSERT INTO program_questions (story_id, question_type, question_text, hint, order_num) VALUES
(3, 'understanding', 'Is it okay to feel sad sometimes?', 'Yes! Sadness helps us rest', 1),
(3, 'rule', 'What does sadness tell us?', 'That something matters to us', 2),
(3, 'practice', 'If your friend is sad, what can you do?', 'Sit with them, hug, listen', 3);

-- Story 13: The Little Dragon Inside
INSERT INTO program_questions (story_id, question_type, question_text, hint, order_num) VALUES
(13, 'understanding', 'Who lives inside the Hero?', 'A little dragon', 1),
(13, 'feeling', 'When does YOUR dragon wake up?', NULL, 2),
(13, 'rule', 'Is the dragon bad?', 'No, it just needs training!', 3),
(13, 'practice', 'Let''s give your dragon a name. What would you call it?', NULL, 4);

-- Story 144: The Hero's Crown
INSERT INTO program_questions (story_id, question_type, question_text, hint, order_num) VALUES
(144, 'understanding', 'What is the Crown made of?', 'Kindness, Wisdom, Courage, Love', 1),
(144, 'feeling', 'How does it feel to complete the whole journey?', NULL, 2),
(144, 'conclusion', 'What was your favorite story this year?', NULL, 3),
(144, 'ritual', 'Let''s have a real celebration! What treat should we have?', NULL, 4);

-- ============================================
-- CARTOONS (sample - 1 per week)
-- ============================================
INSERT INTO program_cartoons (week_id, title, storyline_connection, scenes, outcome) VALUES
(4, 'Emotion Compass', 'First month complete - Hero has the Emotion Map',
'[{"scene": 1, "description": "Hero stands confused with swirling colors around them"},{"scene": 2, "description": "Hero pulls out the Emotion Map, it glows"},{"scene": 3, "description": "Colors organize into islands on the map"},{"scene": 4, "description": "Hero smiles, knowing where each feeling belongs"},{"scene": 5, "description": "Hero walks toward Joy Island, waving goodbye"}]',
'Hero can now navigate the world of emotions'),

(8, 'Taming the Dragon', 'Dragon training complete',
'[{"scene": 1, "description": "Dragon breathes fire, Hero scared"},{"scene": 2, "description": "Hero remembers breathing technique, counts 1-2-3"},{"scene": 3, "description": "Hero breathes slowly, dragon mimics"},{"scene": 4, "description": "Dragon shrinks and purrs like a kitten"},{"scene": 5, "description": "Hero pets the calm dragon, both smile"}]',
'Hero is now a Dragon Master'),

(12, 'Brave Heart Badge', 'Block 1 complete - Emotions mastered',
'[{"scene": 1, "description": "Hero walks through a corridor of all the emotions they met"},{"scene": 2, "description": "Each emotion waves and thanks Hero"},{"scene": 3, "description": "At the end, a glowing badge appears"},{"scene": 4, "description": "Hero pins the Brave Heart Badge to their chest"},{"scene": 5, "description": "Hero glows with confidence, ready for new adventures"}]',
'Block 1 complete - Hero understands emotions'),

(48, 'Grand Coronation', 'Year complete - Hero''s journey finished',
'[{"scene": 1, "description": "Huge throne room with red carpet, all characters clapping"},{"scene": 2, "description": "Hero walks down the carpet, looking taller and more confident"},{"scene": 3, "description": "Mom and Dad place glowing crown on Hero head"},{"scene": 4, "description": "Fireworks explode, confetti falls"},{"scene": 5, "description": "Hero winks at camera: See you in new adventures!"}]',
'The Hero has completed their journey and is ready for the world');
