const PUZZLES_DATA = {
  "meta": {
    "title": "Classic Logic & Story Puzzles",
    "description": "Frequently asked brain-teaser / lateral-thinking interview questions (heaven-hell gate guards and similar), with answers and explanations. Useful for quant/analyst/tech interviews."
  },
  "puzzles": [
    {
      "id": "LP-1",
      "title": "Heaven and Hell Gate Guards",
      "question": "You are at a fork with two doors — one leads to heaven, one to hell. Two guards stand there: one always tells the truth, the other always lies (you don't know which is which). You can ask only one question to one guard to find the door to heaven. What do you ask?",
      "answer": "Ask either guard: 'What would the OTHER guard say is the door to heaven?' Then take the opposite door of what they answer.",
      "explanation": "If you ask the truth-teller, he truthfully reports the liar's (false) answer, pointing to hell. If you ask the liar, he lies about the truth-teller's (true) answer, also pointing to hell. Either way, the answer given always points to the hell door, so you pick the other one.",
      "category": "Truth-teller/liar logic"
    },
    {
      "id": "LP-2",
      "title": "Two Doors, One Guard Variant",
      "question": "Same setup, but there's only one guard and you don't know if he always lies or always tells the truth. What single question guarantees finding the heaven door?",
      "answer": "Ask: 'If I asked you whether this door leads to heaven, would you say yes?' Take the door where the answer is 'yes'.",
      "explanation": "This is a self-referential question that cancels out lying: a truth-teller answers honestly, and a liar's double negation also produces the true answer. This trick works because the liar lies about what he would lie about, resulting in the truth.",
      "category": "Truth-teller/liar logic"
    },
    {
      "id": "LP-3",
      "title": "100 Prisoners and Light Bulb",
      "question": "100 prisoners are in solitary cells. There's a common room with a light bulb (initially off) that has no external cue. Each day, the warden picks one random prisoner to visit the room, and that prisoner can toggle the switch or do nothing. At any point, any prisoner can declare 'we have all visited the room at least once' — if correct, all go free; if wrong, all are executed. They can meet once before this begins to agree on a strategy. What strategy guarantees success?",
      "answer": "Designate one prisoner as the 'counter'. Every other prisoner turns the light ON the first time (and only the first time) they see it OFF. The counter turns the light OFF each time he sees it ON, and counts. When the counter's count reaches 99, he declares that all have visited.",
      "explanation": "Since only the counter turns the light off, and every other prisoner contributes at most one 'on' toggle, the counter's tally of 'off' toggles exactly equals the number of distinct prisoners who have visited and toggled the light — guaranteeing accuracy once it reaches 99 (plus the counter himself makes 100).",
      "category": "Strategy/logic puzzle"
    },
    {
      "id": "LP-4",
      "title": "Wolf, Goat, and Cabbage River Crossing",
      "question": "A farmer needs to cross a river with a wolf, a goat, and a cabbage. The boat only holds the farmer plus one item. Left unsupervised, the wolf eats the goat, and the goat eats the cabbage. How does he get everyone across safely?",
      "answer": "Take the goat across first, return alone, take the wolf across, bring the goat back, take the cabbage across, return alone, take the goat across.",
      "explanation": "The key insight is that the goat is the 'problem' item (it's the only one that both eats something and is eaten), so it must be shuttled back and forth to avoid ever leaving the wolf with the goat or the goat with the cabbage.",
      "category": "River crossing"
    },
    {
      "id": "LP-5",
      "title": "Two Egg Drop Problem",
      "question": "You have 2 identical eggs and access to a 100-floor building. You want to find the highest floor from which an egg won't break when dropped, using the minimum number of worst-case drops. What's the strategy and minimum number of drops?",
      "answer": "14 drops in the worst case, using decreasing intervals: drop the first egg at floor 14, then 27, then 39, then 50 (intervals decreasing by 1 each time: 14,13,12,...).",
      "explanation": "This minimizes worst-case drops by balancing the trade-off: each failed first-egg drop leaves fewer floors to check linearly with the second egg. The sum 14+13+12+...+1 = 105 ≥ 100 confirms 14 is sufficient, and it can be shown 13 is not enough.",
      "category": "Optimization puzzle"
    },
    {
      "id": "LP-6",
      "title": "Monty Hall Problem",
      "question": "On a game show, there are 3 doors: one has a car, two have goats. You pick a door. The host, who knows what's behind each door, opens a different door revealing a goat, then asks if you want to switch your choice. Should you switch?",
      "answer": "Yes, switching doubles your odds of winning — from 1/3 (stay) to 2/3 (switch).",
      "explanation": "Initially, there's a 1/3 chance you picked the car and 2/3 chance the car is behind one of the other two doors. The host's action of revealing a goat doesn't change your original 1/3 probability, but it concentrates the remaining 2/3 probability onto the single unopened door, making switching favorable.",
      "category": "Probability puzzle"
    },
    {
      "id": "LP-7",
      "title": "Weighing 8 Balls, One Odd",
      "question": "You have 8 identical-looking balls; one is heavier than the rest. Using a balance scale, what is the minimum number of weighings to find the heavier ball?",
      "answer": "2 weighings.",
      "explanation": "Divide into 3 groups of 3,3,2. Weigh the two groups of 3 against each other: if balanced, the heavier ball is in the group of 2 — weigh those two directly. If unbalanced, take the heavier group of 3, weigh two of them against each other to find the odd one (or infer it if balanced)."
    },
    {
      "id": "LP-8",
      "title": "Bridge Crossing at Night",
      "question": "Four people need to cross a bridge at night with one flashlight; only 2 can cross at a time and must walk at the slower person's pace. Their crossing times are 1, 2, 5, and 10 minutes. What is the minimum total time to get everyone across?",
      "answer": "17 minutes.",
      "explanation": "Strategy: 1&2 cross (2 min), 1 returns (1 min), 5&10 cross (10 min), 2 returns (2 min), 1&2 cross again (2 min). Total = 2+1+10+2+2=17 minutes. Sending the two fastest back and forth to shuttle the flashlight minimizes the impact of the two slowest people crossing together only once.",
      "category": "Optimization puzzle"
    },
    {
      "id": "LP-9",
      "title": "Poisoned Wine Bottles",
      "question": "You have 1000 bottles of wine, one of which is poisoned. The poison shows symptoms only after 24 hours, and even a tiny sip is fatal. You have 10 test rats and 24 hours to identify the poisoned bottle. How do you do it?",
      "answer": "Number the bottles 0 to 999 in binary (10 bits are enough since 2^10=1024>1000). For each rat, have it drink from every bottle whose binary number has a 1 in that rat's assigned bit position. After 24 hours, the pattern of which rats died gives the binary number of the poisoned bottle.",
      "explanation": "Each bottle corresponds to a unique 10-bit binary number, and each rat represents one bit. The combination of dead/alive rats after 24 hours directly decodes to the binary ID of the poisoned bottle — this is essentially a form of binary encoding/information theory.",
      "category": "Information theory puzzle"
    },
    {
      "id": "LP-10",
      "title": "Ant on a Triangle",
      "question": "Three ants sit at the three corners of a triangle. Each ant randomly picks a direction (clockwise or counterclockwise along the edges) and starts walking. What is the probability that no two ants collide?",
      "answer": "1/4 (25%).",
      "explanation": "Collision is avoided only if all three ants move in the same direction — either all clockwise or all counterclockwise. Each ant independently picks a direction with probability 1/2, so P(all same direction) = 2 * (1/2)^3 = 2/8 = 1/4.",
      "category": "Probability puzzle"
    },
    {
      "id": "LP-11",
      "title": "Camel and Bananas",
      "question": "A camel has 3000 bananas and must cross a 1000 km desert. It can carry at most 1000 bananas at a time and eats 1 banana per km traveled (in either direction). What is the maximum number of bananas that can be transported to the other side?",
      "answer": "533 bananas (using an optimal multi-trip strategy in three phases as the pile decreases).",
      "explanation": "With 3000 bananas needing 5 trips-worth of movement across the first segment (since 3000/1000=3 loads, needing 2*3-1=5 crossings of that segment), the camel eats 5 bananas per km for the first ~200 km until the pile reduces to 2000 (needing only 3 crossings, 3 bananas/km) for the next ~333 km until 1000 remain, then it's a straight 1000 km final trip. This staged consumption reduces total banana loss to approximately 2467, leaving about 533 bananas at the destination.",
      "category": "Optimization puzzle"
    },
    {
      "id": "LP-12",
      "title": "Two Ropes, Uneven Burn Rate, Measure 45 Minutes",
      "question": "You have two ropes, each of which takes exactly 60 minutes to burn completely, but they burn unevenly (not at a constant rate along their length). How do you measure exactly 45 minutes?",
      "answer": "Light rope A at both ends and rope B at one end simultaneously. Rope A will burn out in 30 minutes. At that moment, light the other end of rope B too. Rope B (already burning 30 min from one end) will now finish in an additional 15 minutes, for a total of 45 minutes.",
      "explanation": "Lighting a rope at both ends halves its burn time regardless of uneven burn rate, since the two flames consume the entire rope's material between them in half the single-end time. Combining a 30-minute marker with a 'double the remaining half' trick on the second rope yields 45 minutes exactly.",
      "category": "Timing puzzle"
    }
  ]
};