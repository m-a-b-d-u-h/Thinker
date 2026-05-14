export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  hasChart: boolean;
  hasAction: boolean;
  content: string;
  nodes: any[];
  edges: any[];
  questions?: Question[];
}

export const modules: Module[] = [
  {
    id: "1",
    slug: "stop-waiting",
    title: "Stop waiting to feel ready",
    description: "Why motivation follows action, not the other way around.",
    category: "mindset",
    hasChart: true,
    hasAction: true,
    content: `
The greatest myth of productivity is that you need to "feel like it" before you start. We often wait for a surge of motivation, a clear mind, or the "perfect moment" to begin a difficult task. 

### The Motivation Trap
Most people believe the cycle of work looks like this:
**Motivation → Action → Result**

In reality, the cycle is reversed:
**Action → Result → Motivation**

### The Physics of Starting
Think of your brain like a car in winter. The engine is cold. If you wait for the car to get warm before you start driving, you'll be sitting in the driveway forever. You have to start driving to get the engine warm.

### How to apply this:
1. **The 5-Minute Rule**: Commit to working on the task for just 5 minutes. After 5 minutes, you are free to stop. Usually, the momentum of those 5 minutes is enough to keep you going.
2. **Lower the Bar**: If you can't start, your first step is too big. Break it down until it feels "stupidly small." 
3. **Embrace the "Shitty First Draft"**: Give yourself permission to do a bad job. Perfectionism is just procrastination in a fancy suit.
    `,
    nodes: [
      { id: '1', position: { x: 250, y: 0 }, data: { label: 'Decision: Start a difficult project' }, type: 'custom' },
      { id: '2', position: { x: 50, y: 150 }, data: { label: 'Wait for motivation' }, type: 'custom' },
      { id: '3', position: { x: 450, y: 150 }, data: { label: 'Take immediate action (5 min)' }, type: 'custom' },
      { id: '4', position: { x: 50, y: 300 }, data: { label: 'Stagnation & Guilt' }, type: 'custom' },
      { id: '5', position: { x: 450, y: 300 }, data: { label: 'Clarity & Momentum' }, type: 'custom' },
      { id: '6', position: { x: 450, y: 450 }, data: { label: 'SUCCESS: Project completion' }, type: 'custom' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', label: 'Fear-based' },
      { id: 'e1-3', source: '1', target: '3', label: 'Action-based' },
      { id: 'e2-4', source: '2', target: '4' },
      { id: 'e3-5', source: '3', target: '5' },
      { id: 'e5-6', source: '5', target: '6' },
    ],
    questions: [
      {
        id: 1,
        question: "According to the module, what is the correct cycle of productivity?",
        options: [
          "Motivation → Action → Result",
          "Action → Result → Motivation",
          "Result → Action → Motivation",
          "Action → Motivation → Result"
        ],
        correctAnswer: 1,
        explanation: "The cycle is reversed: Action leads to Result, which then generates Motivation. You don't wait to feel motivated—you act first, and motivation follows."
      },
      {
        id: 2,
        question: "What is the '5-Minute Rule' from this module?",
        options: [
          "Work for exactly 5 minutes and then take a 5-minute break",
          "Commit to just 5 minutes—afterward you can stop if you want",
          "Spend 5 minutes planning before you start working",
          "Work on weekends for at least 5 minutes"
        ],
        correctAnswer: 1,
        explanation: "The 5-Minute Rule is about committing to just 5 minutes of work. Usually, the momentum from those 5 minutes is enough to keep you going."
      },
      {
        id: 3,
        question: "If you can't start a task, what does the module suggest?",
        options: [
          "Wait until you feel more prepared",
          "Break the task down until it feels 'stupidly small'",
          "Ask someone else to do it for you",
          "Read more about the topic first"
        ],
        correctAnswer: 1,
        explanation: "If you can't start, your first step is too big. Break it down until it feels 'stupidly small'—so small that it's impossible to fail."
      },
      {
        id: 4,
        question: "What is the 'Shitty First Draft' concept?",
        options: [
          "Write a rough draft and then edit heavily",
          "Give yourself permission to do a bad job",
          "Only create content when you're inspired",
          "Always aim for perfection on the first try"
        ],
        correctAnswer: 1,
        explanation: "Perfectionism is just procrastination in a fancy suit. Give yourself permission to do a bad job—the 'shitty first draft'—because starting imperfectly is better than not starting at all."
      },
      {
        id: 5,
        question: "The module compares the brain to a car in winter. What's the point?",
        options: [
          "Driving in winter is dangerous",
          "You need to warm up the car before driving",
          "You have to start driving to get the engine warm",
          "Cars break down in cold weather"
        ],
        correctAnswer: 2,
        explanation: "The engine is cold—waiting for it to get warm before you start means you'll never go. You have to start driving to generate heat. Same with action: you start to generate motivation."
      }
    ]
  },
  {
    id: "4",
    slug: "deep-work",
    title: "Deep Work Mastery",
    description: "How to focus without distraction in a noisy world.",
    category: "focus",
    hasChart: true,
    hasAction: true,
    content: `
Deep Work is the ability to focus without distraction on a cognitively demanding task. It's a superpower in our increasingly distracted world.

### The Shallow Work Trap
Most people spend their day in "shallow work"—emails, meetings, Slack messages. These activities don't create much value, but they feel productive because they're easy.

### The 4 Rules of Deep Work
1. **Work Deeply**: Build rituals and routines that minimize friction. Same time, same place, same process.
2. **Embrace Boredom**: Your ability to concentrate is like a muscle. If you never tolerate boredom (always checking your phone), that muscle atrophies.
3. **Quit Social Media**: These tools fragment your attention and reduce your capacity for depth.
4. **Drain the Shallows**: Schedule every minute of your day. Be ruthless about eliminating low-value activities.

### How to start:
- **The 90-Minute Block**: Work in 90-minute sessions with no interruptions. Not even for water or bathroom.
- **The Internet Sabbatical**: Take one day per week completely offline.
- **Bimodal Deep Work**: Dedicate chunks of time (weeks or months) to deep work only.
    `,
    nodes: [
      { id: '1', position: { x: 250, y: 0 }, data: { label: 'Shallow Work' }, type: 'custom' },
      { id: '2', position: { x: 100, y: 150 }, data: { label: 'Emails & Meetings' }, type: 'custom' },
      { id: '3', position: { x: 400, y: 150 }, data: { label: 'Deep Work' }, type: 'custom' },
      { id: '4', position: { x: 400, y: 300 }, data: { label: 'High Value Creation' }, type: 'custom' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', label: 'Easy' },
      { id: 'e1-3', source: '1', target: '3', label: 'Hard' },
      { id: 'e3-4', source: '3', target: '4' },
    ],
    questions: [
      {
        id: 1,
        question: "What is Deep Work?",
        options: [
          "Working long hours without sleep",
          "Focus without distraction on cognitively demanding tasks",
          "Doing multiple tasks at once",
          "Working in a noisy environment"
        ],
        correctAnswer: 1,
        explanation: "Deep Work is the ability to focus without distraction on a cognitively demanding task. It's increasingly rare and valuable."
      },
      {
        id: 2,
        question: "What is the 'Shallow Work Trap'?",
        options: [
          "Working in shallow water",
          "Spending your day on emails, meetings, easy tasks that feel productive",
          "Not working hard enough",
          "Working without a desk"
        ],
        correctAnswer: 1,
        explanation: "Shallow work includes emails, meetings, Slack messages—activities that don't create much value but feel productive because they're easy."
      },
      {
        id: 3,
        question: "According to the module, how should you build the Deep Work habit?",
        options: [
          "Work randomly whenever you feel like it",
          "Build rituals: same time, same place, same process",
          "Always work in different locations",
          "Never plan your deep work sessions"
        ],
        correctAnswer: 1,
        explanation: "Work Deeply: Build rituals and routines that minimize friction. Consistency is key to developing this superpower."
      }
    ]
  },
  {
    id: "5",
    slug: "pareto-principle",
    title: "The 80/20 Rule",
    description: "How to identify and amplify the vital few inputs that drive the majority of results.",
    category: "productivity",
    hasChart: true,
    hasAction: true,
    content: `
The Pareto Principle states that for many outcomes, roughly 80% of consequences come from 20% of causes.

### The Power Law
In business: 80% of revenue comes from 20% of customers.
In productivity: 80% of results come from 20% of your efforts.
In software: 80% of bugs come from 20% of the code.

### How to Apply It
1. **Identify the Vital Few**: What 20% of your activities generate 80% of your results? Double down on those.
2. **Eliminate the Trivial Many**: What 80% of activities only generate 20% of results? Cut them ruthlessly.
3. **Apply to Others**: Who are the 20% of people that bring you 80% of joy or value? Invest in those relationships.

### The Math of Leverage
Most people work linearly: 1 hour = 1 unit of output.
Pareto thinking: Find the 1 hour that generates 10 units of output.

### Warning
The 80/20 rule is not an excuse to be lazy. It's a tool to be more strategic. Don't do 20% of the work—do 100% of the work, but prioritize the vital 20% first.
    `,
    nodes: [
      { id: '1', position: { x: 250, y: 0 }, data: { label: 'All Efforts (100%)' }, type: 'custom' },
      { id: '2', position: { x: 100, y: 150 }, data: { label: 'Vital Few (20%)' }, type: 'custom' },
      { id: '3', position: { x: 400, y: 150 }, data: { label: 'Trivial Many (80%)' }, type: 'custom' },
      { id: '4', position: { x: 100, y: 300 }, data: { label: '80% of Results' }, type: 'custom' },
      { id: '5', position: { x: 400, y: 300 }, data: { label: '20% of Results' }, type: 'custom' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e2-4', source: '2', target: '4', label: '80% Results' },
      { id: 'e3-5', source: '3', target: '5', label: '20% Results' },
    ],
    questions: [
      {
        id: 1,
        question: "What is the Pareto Principle (80/20 Rule)?",
        options: [
          "Work 80% and rest 20%",
          "80% of results come from 20% of efforts",
          "Spend 80% of time on planning",
          "Do 20% of work for 80% pay"
        ],
        correctAnswer: 1,
        explanation: "The Pareto Principle states that roughly 80% of consequences come from 20% of causes. In productivity: 80% of results come from 20% of your efforts."
      },
      {
        id: 2,
        question: "How should you apply the 80/20 rule?",
        options: [
          "Work less and hope for the best",
          "Identify the vital few activities and double down on them",
          "Only do 20% of your work",
          "Ignore 80% of your customers"
        ],
        correctAnswer: 1,
        explanation: "Identify the Vital Few: What 20% of your activities generate 80% of your results? Double down on those. Eliminate the Trivial Many."
      }
    ]
  },
  {
    id: "6",
    slug: "first-principles",
    title: "First Principles Thinking",
    description: "Break complex problems into basic truths and rebuild from scratch.",
    category: "strategy",
    hasChart: true,
    hasAction: true,
    content: `
First Principles Thinking is a problem-solving approach that breaks complex problems down into basic, foundational truths (first principles) and then rebuilds from there.

### The Analogy: The Chef vs The Cook
- **The Cook**: Follows recipes. Uses what others have done. Incremental improvement.
- **The Chef**: Understands ingredients. Knows why things work. Creates new recipes.

### How to Use First Principles
1. **Identify the Problem**: What are you trying to solve?
2. **Break It Down**: What are the foundational truths? What do you know for sure?
3. **Rebuild**: How can you combine these truths in new ways?

### Example: Elon Musk and SpaceX
Everyone knew rockets were expensive ($30M+). Musk didn't accept this. He asked: "What are rockets made of?" (Aluminum, titanium, copper, carbon fiber). "What is the value of those materials?" ($2M). Result: SpaceX builds rockets for a fraction of the cost.

### The Power
Most people reason by analogy: "We can't do that because it's never been done."
First principles: "Can we do that based on the laws of physics?" If yes, figure out how.
    `,
    nodes: [
      { id: '1', position: { x: 250, y: 0 }, data: { label: 'Complex Problem' }, type: 'custom' },
      { id: '2', position: { x: 100, y: 150 }, data: { label: 'Break Down' }, type: 'custom' },
      { id: '3', position: { x: 400, y: 150 }, data: { label: 'First Principles' }, type: 'custom' },
      { id: '4', position: { x: 250, y: 300 }, data: { label: 'Rebuild Solution' }, type: 'custom' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
    ],
    questions: [
      {
        id: 1,
        question: "What is First Principles Thinking?",
        options: [
          "Following recipes and best practices",
          "Breaking problems into basic truths and rebuilding",
          "Using analogies to solve problems",
          "Thinking about principles first thing in the morning"
        ],
        correctAnswer: 1,
        explanation: "First Principles breaks complex problems into basic, foundational truths and then rebuilds from scratch. It's how innovators like Elon Musk think."
      },
      {
        id: 2,
        question: "What's the difference between The Chef and The Cook?",
        options: [
          "Chefs cook better food",
          "Chefs follow recipes, Cooks create new ones",
          "Cooks follow recipes, Chefs understand ingredients and create",
          "There is no difference"
        ],
        correctAnswer: 2,
        explanation: "The Cook follows recipes (incremental). The Chef understands ingredients and creates new recipes (first principles)."
      }
    ]
  },
  {
    id: "7",
    slug: "creative-flow",
    title: "Unlocking Creative Flow",
    description: "Enter the zone where your best work happens automatically.",
    category: "creativity",
    hasChart: true,
    hasAction: true,
    content: `
Flow is a state of complete immersion in an activity. You lose track of time. Self-consciousness disappears. Performance peaks.

### The 3 Conditions for Flow
1. **Clear Goals**: You know exactly what you're trying to achieve.
2. **Immediate Feedback**: You know instantly if you're on track.
3. **Challenge-Skill Balance**: The task is neither too easy (boredom) nor too hard (anxiety).

### The Flow Cycle
1. **Struggle**: Initial resistance. Brain is warming up.
2. **Release**: Let go of forcing it. Do something mundane.
3. **Flow**: Suddenly, you're in the zone.
4. **Consolidation**: After flow, integrate what you learned.

### How to Trigger Flow
- **Eliminate Distractions**: Phone off, notifications disabled, door closed.
- **Set Micro-Goals**: "I will write 3 paragraphs" not "I will write a book."
- **Use Rituals**: Same music, same time, same environment. Train your brain to associate these cues with flow.
- **The 20-Minute Rule**: Commit to 20 minutes. Flow usually kicks in after 10-15 minutes of focused work.
    `,
    nodes: [
      { id: '1', position: { x: 250, y: 0 }, data: { label: 'Struggle Phase' }, type: 'custom' },
      { id: '2', position: { x: 100, y: 150 }, data: { label: 'Release' }, type: 'custom' },
      { id: '3', position: { x: 400, y: 150 }, data: { label: 'Flow State' }, type: 'custom' },
      { id: '4', position: { x: 250, y: 300 }, data: { label: 'Peak Performance' }, type: 'custom' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
    ],
    questions: [
      {
        id: 1,
        question: "What are the 3 conditions for Flow?",
        options: [
          "Money, Time, Resources",
          "Clear Goals, Immediate Feedback, Challenge-Skill Balance",
          "Music, Coffee, Silence",
          "Hard Work, Luck, Talent"
        ],
        correctAnswer: 1,
        explanation: "Flow requires: 1. Clear Goals, 2. Immediate Feedback, 3. Challenge-Skill Balance (not too easy, not too hard)."
      },
      {
        id: 2,
        question: "What is the Flow Cycle?",
        options: [
          "Wake up, Work, Sleep",
          "Struggle → Release → Flow → Consolidation",
          "Plan, Execute, Review",
          "Start, Stop, Restart"
        ],
        correctAnswer: 1,
        explanation: "The Flow Cycle: 1. Struggle (initial resistance), 2. Release (let go), 3. Flow (the zone), 4. Consolidation (integration)."
      }
    ]
  },
  {
    id: "8",
    slug: "mental-models",
    title: "Mental Models 101",
    description: "Build a latticework of mental models to make better decisions.",
    category: "learning",
    hasChart: true,
    hasAction: true,
    content: `
A mental model is a framework or lens through which you view the world. It's a way of simplifying complexity.

### The Best Mental Models
1. **Occam's Razor**: The simplest explanation is usually correct.
2. **Inversion**: Solve problems backward. Instead of "How do I succeed?" ask "How do I fail?" and avoid those things.
3. **Circle of Competence**: Know what you know, and more importantly, know what you don't know.
4. **Margin of Safety**: Always leave room for error. Build buffers.
5. **Compound Interest**: Small gains, consistently applied, lead to exponential growth.

### Building Your Toolkit
Most people have 0-2 mental models. They try to solve every problem with those 2 models. 
Smart people have 10-20 models across different disciplines: physics, biology, economics, psychology.

### How to Build Mental Models
1. **Read Widely**: Don't just read in your field. Read outside it.
2. **Study History**: History doesn't repeat, but it rhymes. Patterns from the past apply to the present.
3. **Practice Inversion**: When facing a problem, first think: "How would I ensure this fails?" Then avoid those things.
    `,
    nodes: [
      { id: '1', position: { x: 250, y: 0 }, data: { label: 'Problem' }, type: 'custom' },
      { id: '2', position: { x: 100, y: 150 }, data: { label: 'Single Model' }, type: 'custom' },
      { id: '3', position: { x: 400, y: 150 }, data: { label: 'Latticework of Models' }, type: 'custom' },
      { id: '4', position: { x: 400, y: 300 }, data: { label: 'Better Decisions' }, type: 'custom' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', label: 'Limited' },
      { id: 'e1-3', source: '1', target: '3', label: 'Diverse' },
      { id: 'e3-4', source: '3', target: '4' },
    ],
    questions: [
      {
        id: 1,
        question: "What is a Mental Model?",
        options: [
          "A physical model of the brain",
          "A framework or lens to simplify complexity",
          "A type of 3D modeling software",
          "A model for acting mentally ill"
        ],
        correctAnswer: 1,
        explanation: "A mental model is a framework or lens through which you view the world. It simplifies complexity and helps you make better decisions."
      },
      {
        id: 2,
        question: "What is 'Inversion' as a mental model?",
        options: [
          "Turning things upside down",
          "Solving problems backward: 'How do I fail?' then avoid those",
          "Reversing your decisions",
          "Doing the opposite of what everyone says"
        ],
        correctAnswer: 1,
        explanation: "Inversion means solving problems backward. Instead of 'How do I succeed?' ask 'How do I fail?' and avoid those things."
      }
    ]
  },
  {
    id: "9",
    slug: "stress-management",
    title: "The Stress Reset",
    description: "Science-based techniques to manage stress and protect your mental bandwidth.",
    category: "wellbeing",
    hasChart: true,
    hasAction: true,
    content: `
Stress isn't the enemy—chronic stress is. Acute stress (short-term) can actually improve performance. But when stress becomes chronic, it damages your brain and body.

### The Physiology of Stress
When you're stressed, your body releases cortisol and adrenaline. These are useful for short-term survival (fight or flight). But chronically elevated cortisol:
- Shrinks the hippocampus (memory center)
- Weakens the immune system
- Disrupts sleep
- Impairs decision-making

### Stress Management Techniques
1. **Box Breathing**: Inhale 4 seconds, hold 4, exhale 4, hold 4. Repeat. This activates the parasympathetic nervous system (rest and digest).
2. **The 5-4-3-2-1 Grounding Technique**: Acknowledge 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.
3. **Cognitive Reframing**: Instead of "I'm stressed," say "I'm excited." Physiologically, stress and excitement are nearly identical.
4. **Nature Therapy**: 20 minutes in nature reduces cortisol levels significantly.

### The Weekly Reset
Build a weekly ritual to reset your stress levels:
- Sunday digital detox (no screens for 4 hours)
- Long walk in nature (minimum 30 minutes)
- Journaling (brain dump all worries onto paper)
- Social connection (quality time with loved ones)
    `,
    nodes: [
      { id: '1', position: { x: 250, y: 0 }, data: { label: 'Stress Trigger' }, type: 'custom' },
      { id: '2', position: { x: 100, y: 150 }, data: { label: 'Chronic Stress' }, type: 'custom' },
      { id: '3', position: { x: 400, y: 150 }, data: { label: 'Managed Stress' }, type: 'custom' },
      { id: '4', position: { x: 100, y: 300 }, data: { label: 'Health Damage' }, type: 'custom' },
      { id: '5', position: { x: 400, y: 300 }, data: { label: 'Peak Performance' }, type: 'custom' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', label: 'Ignore' },
      { id: 'e1-3', source: '1', target: '3', label: 'Manage' },
      { id: 'e2-4', source: '2', target: '4' },
      { id: 'e3-5', source: '3', target: '5' },
    ],
    questions: [
      {
        id: 1,
        question: "What is the difference between acute and chronic stress?",
        options: [
          "Acute is bad, chronic is good",
          "Acute is short-term (useful), chronic is long-term (damaging)",
          "They are the same thing",
          "Acute is physical, chronic is mental"
        ],
        correctAnswer: 1,
        explanation: "Acute stress (short-term) can improve performance. Chronic stress damages your brain and body. The key is management, not elimination."
      },
      {
        id: 2,
        question: "What is Box Breathing?",
        options: [
          "Breathing in a square room",
          "Inhale 4s, hold 4s, exhale 4s, hold 4s - activates rest & digest",
          "Breathing into a box",
          "A breathing technique for boxers"
        ],
        correctAnswer: 1,
        explanation: "Box Breathing: Inhale 4 seconds, hold 4, exhale 4, hold 4. This activates the parasympathetic nervous system (rest and digest)."
      }
    ]
  },
  {
    id: "2",
    slug: "cost-of-not-deciding",
    title: "The cost of not deciding",
    description: "Every delay is still a choice. Map out what inaction actually costs you.",
    category: "clarity",
    hasChart: true,
    hasAction: true,
    content: `
We often view "waiting" as a neutral state. We think that by not making a choice, we are keeping our options open. This is a dangerous illusion.

### Indecision is a Decision
When you refuse to choose between Option A and Option B, you are actually choosing **Option C: Stagnation.** 

### The Hidden Costs
1. **Mental Overhead**: Every undecided project takes up "RAM" in your brain. It creates a low-level background anxiety that drains your energy.
2. **Opportunity Cost**: While you are waiting to decide which career path to take, you are losing months of experience and salary in *either* path.
3. **Loss of Agency**: If you don't decide, the world will decide for you. Time will pass, markets will change, and eventually, the choice will be made by external circumstances.

### How to break the loop:
- **Set a "Hard Deadline"**: Give yourself 24 hours to gather data, and then flip a coin if you have to. A wrong decision can often be corrected; indecision just rots.
- **Fear Setting**: Write down the absolute worst thing that could happen if you make the "wrong" choice. Usually, the "cost of doing nothing" is actually higher.
    `,
    nodes: [
      { id: '1', position: { x: 400, y: 0 }, data: { label: 'CHALLENGE: Career Pivot?' }, type: 'custom' },

      // Path A: Stay (Inaction)
      { id: '2', position: { x: 100, y: 150 }, data: { label: 'ACTION: Stay in Current Role' }, type: 'custom' },
      { id: '4', position: { x: 50, y: 300 }, data: { label: '6 MONTHS: Comfort but growing boredom' }, type: 'custom' },
      { id: '6', position: { x: 50, y: 450 }, data: { label: '1 YEAR: Skill stagnation' }, type: 'custom' },
      { id: '8', position: { x: 50, y: 600 }, data: { label: '2 YEARS: Deep regret & Golden Handcuffs' }, type: 'custom' },

      // Path B: Pivot (Action)
      { id: '3', position: { x: 700, y: 150 }, data: { label: 'ACTION: Pivot Immediately' }, type: 'custom' },
      { id: '5', position: { x: 750, y: 300 }, data: { label: '6 MONTHS: High stress, steep learning' }, type: 'custom' },
      { id: '7', position: { x: 750, y: 450 }, data: { label: '1 YEAR: New network & base mastery' }, type: 'custom' },
      { id: '9', position: { x: 750, y: 600 }, data: { label: '2 YEARS: Career acceleration & Fulfillment' }, type: 'custom' },

      // Path C: Wait (Indecision)
      { id: '10', position: { x: 400, y: 200 }, data: { label: 'INDECISION: Wait for "Perfect" timing' }, type: 'custom' },
      { id: '11', position: { x: 400, y: 350 }, data: { label: '6 MONTHS: Analysis Paralysis' }, type: 'custom' },
      { id: '12', position: { x: 400, y: 500 }, data: { label: '1 YEAR: Lost $50k in potential growth' }, type: 'custom' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', label: 'Safety' },
      { id: 'e1-3', source: '1', target: '3', label: 'Growth' },
      { id: 'e1-10', source: '1', target: '10', label: 'Fear' },

      { id: 'e2-4', source: '2', target: '4' },
      { id: 'e4-6', source: '4', target: '6' },
      { id: 'e6-8', source: '6', target: '8' },

      { id: 'e3-5', source: '3', target: '5' },
      { id: 'e5-7', source: '5', target: '7' },
      { id: 'e7-9', source: '7', target: '9' },

      { id: 'e10-11', source: '10', target: '11' },
      { id: 'e11-12', source: '11', target: '12' },
    ],
    questions: [
      {
        id: 1,
        question: "According to the module, what does 'indecision' actually mean?",
        options: [
          "You are keeping your options open",
          "You are choosing Option C: Stagnation",
          "You are being wise and careful",
          "You are avoiding risk"
        ],
        correctAnswer: 1,
        explanation: "Indecision is actually a decision itself—you're choosing stagnation by refusing to choose between options."
      },
      {
        id: 2,
        question: "What is one of the 'Hidden Costs' of not deciding?",
        options: [
          "You save money by waiting",
          "Mental overhead that drains your energy",
          "You gain more options over time",
          "You become more decisive naturally"
        ],
        correctAnswer: 1,
        explanation: "Every undecided project takes up 'RAM' in your brain, creating low-level background anxiety that drains energy."
      },
      {
        id: 3,
        question: "What does 'Loss of Agency' mean in the context of indecision?",
        options: [
          "You lose your driver's license",
          "If you don't decide, the world decides for you",
          "You become an agent of change",
          "You lose the ability to work"
        ],
        correctAnswer: 1,
        explanation: "If you don't decide, external circumstances will decide for you as time passes and markets change."
      },
      {
        id: 4,
        question: "What is the 'Hard Deadline' technique mentioned?",
        options: [
          "Wait for the perfect moment",
          "Give yourself 24 hours to gather data, then decide",
          "Never set deadlines for decisions",
          "Only decide on weekdays"
        ],
        correctAnswer: 1,
        explanation: "Set a hard deadline: give yourself 24 hours to gather data, then flip a coin if needed. Wrong decisions can be corrected; indecision just rots."
      },
      {
        id: 5,
        question: "What is 'Fear Setting'?",
        options: [
          "Setting goals based on fear",
          "Writing down the worst thing that could happen",
          "Being afraid to set deadlines",
          "A type of horror movie"
        ],
        correctAnswer: 1,
        explanation: "Fear Setting involves writing down the absolute worst thing that could happen if you make the 'wrong' choice. Usually, the cost of doing nothing is higher."
      }
    ]
  },
  {
    id: "3",
    slug: "building-habits",
    title: "Building habits that stick",
    description: "The mechanics of cue, routine, reward — and why most habits fail.",
    category: "habit",
    hasChart: true,
    hasAction: true,
    content: `
Most people fail at building habits because they rely on willpower. Willpower is a finite resource—it's like a muscle that gets tired. To build a habit that lasts, you need a **system**.

### The Habit Loop
Every habit is driven by a simple neurological loop:
1. **The Cue**: The trigger that tells your brain to go into automatic mode.
2. **The Routine**: The behavior itself.
3. **The Reward**: The positive reinforcement that tells your brain, "This is worth remembering."

### Habit Stacking
The most effective way to build a new habit is to "stack" it onto an existing one. 
**Formula: After [Current Habit], I will [New Habit].**

*Example:* "After I pour my morning coffee, I will write down one thing I'm grateful for."

### The Goldilocks Rule
Humans experience peak motivation when working on tasks that are "just right"—neither too easy nor too difficult. If your new habit is too hard, you'll quit. If it's too easy, you'll get bored.
    `,
    nodes: [
      { id: '1', position: { x: 250, y: 0 }, data: { label: 'Trigger: Morning Coffee' }, type: 'custom' },
      { id: '2', position: { x: 250, y: 150 }, data: { label: 'Action: Read 5 pages' }, type: 'custom' },
      { id: '3', position: { x: 250, y: 300 }, data: { label: 'Reward: Check phone' }, type: 'custom' },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    questions: [
      {
        id: 1,
        question: "Why do most people fail at building habits according to the module?",
        options: [
          "They don't have enough time",
          "They rely on willpower which is finite",
          "They set goals that are too small",
          "They lack motivation from others"
        ],
        correctAnswer: 1,
        explanation: "Willpower is a finite resource—like a muscle that gets tired. To build lasting habits, you need a system, not reliance on willpower."
      },
      {
        id: 2,
        question: "What are the three components of the Habit Loop?",
        options: [
          "Goal, Action, Result",
          "Cue, Routine, Reward",
          "Start, Middle, End",
          "Trigger, Response, Consequence"
        ],
        correctAnswer: 1,
        explanation: "Every habit is driven by: 1. The Cue (trigger), 2. The Routine (behavior), 3. The Reward (positive reinforcement)."
      },
      {
        id: 3,
        question: "What is 'Habit Stacking'?",
        options: [
          "Stacking books to read",
          "After [Current Habit], I will [New Habit]",
          "Doing multiple habits at once",
          "Piling up rewards for motivation"
        ],
        correctAnswer: 1,
        explanation: "Habit Stacking means attaching a new habit to an existing one using the formula: 'After [Current Habit], I will [New Habit]'."
      },
      {
        id: 4,
        question: "What is the Goldilocks Rule?",
        options: [
          "Always choose the middle option",
          "Humans peak in motivation when tasks are 'just right'",
          "Only do easy tasks to avoid failure",
          "Gold is the best reward for habits"
        ],
        correctAnswer: 1,
        explanation: "Peak motivation occurs when working on tasks that are 'just right'—neither too easy (boring) nor too difficult (quit)."
      },
      {
        id: 5,
        question: "According to the module, what should you use to build a habit that lasts?",
        options: [
          "Pure willpower and determination",
          "A system",
          "External pressure from friends",
          "Expensive equipment and tools"
        ],
        correctAnswer: 1,
        explanation: "To build a habit that lasts, you need a system. Relying on willpower alone will fail because willpower is finite."
      }
    ]
  },
  {
    id: "4",
    slug: "first-principles",
    title: "First Principles Thinking",
    description: "Break down complex problems into basic elements and rebuild from ground up.",
    category: "mental-model",
    hasChart: true,
    hasAction: true,
    content: `First Principles Thinking is about breaking a situation down to its fundamental truths...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "5",
    slug: "pareto-principle",
    title: "Pareto Principle",
    description: "80% of results come from 20% of efforts.",
    category: "productivity",
    hasChart: true,
    hasAction: false,
    content: `The Pareto Principle states that for many outcomes, roughly 80%...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "6",
    slug: "occams-razor",
    title: "Occam's Razor",
    description: "The simplest solution is usually the correct one.",
    category: "logic",
    hasChart: false,
    hasAction: false,
    content: `Occam's Razor is a principle that suggests when presented...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "7",
    slug: "confirmation-bias",
    title: "Confirmation Bias",
    description: "The tendency to search for information that confirms your beliefs.",
    category: "psychology",
    hasChart: true,
    hasAction: true,
    content: `Confirmation bias is the tendency to search for, interpret...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "8",
    slug: "compound-effect",
    title: "The Compound Effect",
    description: "Small, smart choices + consistency + time = radical difference.",
    category: "success",
    hasChart: true,
    hasAction: true,
    content: `The Compound Effect is the principle of reaping huge rewards...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "9",
    slug: "circle-influence",
    title: "Circle of Influence",
    description: "Focus on what you can control, not what you can't.",
    category: "stoicism",
    hasChart: false,
    hasAction: false,
    content: `Stephen Covey's Circle of Influence concept teaches us...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "10",
    slug: "dunning-kruger",
    title: "Dunning-Kruger Effect",
    description: "People with low ability overestimate their skill level.",
    category: "cognitive-bias",
    hasChart: true,
    hasAction: false,
    content: `The Dunning-Kruger effect is a cognitive bias where people...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "11",
    slug: "eisenhower-matrix",
    title: "Eisenhower Matrix",
    description: "Prioritize tasks by urgency and importance.",
    category: "productivity",
    hasChart: false,
    hasAction: true,
    content: `The Eisenhower Matrix is a time management tool that helps...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "12",
    slug: "growth-mindset",
    title: "Growth Mindset",
    description: "Believe your abilities can be developed through dedication.",
    category: "mindset",
    hasChart: false,
    hasAction: true,
    content: `A growth mindset is the belief that your basic qualities...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "13",
    slug: "imposter-syndrome",
    title: "Imposter Syndrome",
    description: "Feeling like a fraud despite evident success.",
    category: "psychology",
    hasChart: true,
    hasAction: false,
    content: `Imposter syndrome is a psychological pattern where one...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "14",
    slug: "marginal-thinking",
    title: "Marginal Thinking",
    description: "Decisions based on incremental costs vs. total costs.",
    category: "decision-making",
    hasChart: false,
    hasAction: false,
    content: `Marginal thinking focuses on the additional cost or benefit...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "15",
    slug: "network-effect",
    title: "Network Effect",
    description: "Product becomes more valuable as more people use it.",
    category: "business",
    hasChart: true,
    hasAction: false,
    content: `The network effect occurs when a product or service...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "16",
    slug: "opportunity-cost",
    title: "Opportunity Cost",
    description: "The loss of potential gain from other alternatives.",
    category: "decision-making",
    hasChart: false,
    hasAction: true,
    content: `Opportunity cost is the loss of potential gain from other...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "17",
    slug: "parkinsons-law",
    title: "Parkinson's Law",
    description: "Work expands to fill the time available for completion.",
    category: "productivity",
    hasChart: false,
    hasAction: false,
    content: `Parkinson's Law states that work expands so as to fill...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "18",
    slug: "rubber-ducky",
    title: "Rubber Duck Debugging",
    description: "Explain your problem to an inanimate object to solve it.",
    category: "problem-solving",
    hasChart: false,
    hasAction: true,
    content: `Rubber duck debugging is a method of debugging code...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "19",
    slug: "sunk-cost",
    title: "Sunk Cost Fallacy",
    description: "Don't let past investments dictate future decisions.",
    category: "cognitive-bias",
    hasChart: true,
    hasAction: true,
    content: `The sunk cost fallacy is the tendency to continue an endeavor...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "20",
    slug: "systems-thinking",
    title: "Systems Thinking",
    description: "Understand how parts interrelate in a whole system.",
    category: "mental-model",
    hasChart: true,
    hasAction: false,
    content: `Systems thinking is a holistic approach to analysis...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "21",
    slug: "two-system",
    title: "Two Systems Theory",
    description: "Fast, intuitive vs. slow, deliberate thinking.",
    category: "psychology",
    hasChart: true,
    hasAction: false,
    content: `Two Systems Theory, popularized by Daniel Kahneman...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "22",
    slug: "zero-sum",
    title: "Zero-Sum Game",
    description: "One person's gain is another's loss.",
    category: "game-theory",
    hasChart: false,
    hasAction: false,
    content: `A zero-sum game is a mathematical representation of a situation...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "23",
    slug: "antifragile",
    title: "Antifragile",
    description: "Systems that improve with disorder and stress.",
    category: "resilience",
    hasChart: true,
    hasAction: true,
    content: `Antifragile is a concept by Nassim Nicholas Taleb...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "24",
    slug: "baader-meinhof",
    title: "Baader-Meinhof Phenomenon",
    description: "Learning something new makes you see it everywhere.",
    category: "psychology",
    hasChart: false,
    hasAction: false,
    content: `The Baader-Meinhof phenomenon, also called frequency illusion...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "25",
    slug: "black-swan",
    title: "Black Swan Events",
    description: "Rare, unpredictable events with massive impact.",
    category: "risk",
    hasChart: true,
    hasAction: false,
    content: `A Black Swan event is an unpredictable event that is...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "26",
    slug: "diminishing-returns",
    title: "Law of Diminishing Returns",
    description: "After a point, each additional unit yields less benefit.",
    category: "economics",
    hasChart: true,
    hasAction: false,
    content: `The law of diminishing returns states that in all productive...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "27",
    slug: "goodharts-law",
    title: "Goodhart's Law",
    description: "When a measure becomes a target, it ceases to be useful.",
    category: "economics",
    hasChart: false,
    hasAction: false,
    content: `Goodhart's Law states that when a measure becomes a target...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "28",
    slug: "hanlons-razor",
    title: "Hanlon's Razor",
    description: "Never attribute to malice what can be explained by stupidity.",
    category: "logic",
    hasChart: false,
    hasAction: false,
    content: `Hanlon's Razor is a principle that suggests we should not...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "29",
    slug: "keynesian-multiplier",
    title: "Keynesian Multiplier",
    description: "Initial spending leads to increased consumption.",
    category: "economics",
    hasChart: true,
    hasAction: false,
    content: `The Keynesian multiplier effect describes how an initial...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "30",
    slug: "survivorship-bias",
    title: "Survivorship Bias",
    description: "Focusing on successes while ignoring failures.",
    category: "cognitive-bias",
    hasChart: true,
    hasAction: true,
    content: `Survivorship bias is the logical error of concentrating...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "31",
    slug: "mindfulness-basics",
    title: "Mindfulness Basics",
    description: "Training your brain to be present and focused.",
    category: "wellbeing",
    hasChart: false,
    hasAction: true,
    content: `Mindfulness is the practice of paying attention to the present moment...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "32",
    slug: "cognitive-restructuring",
    title: "Cognitive Restructuring",
    description: "Changing negative thought patterns to improve mental health.",
    category: "wellbeing",
    hasChart: false,
    hasAction: true,
    content: `Cognitive restructuring is a core technique in cognitive behavioral therapy...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "33",
    slug: "deliberate-practice",
    title: "Deliberate Practice",
    description: "The science of becoming an expert at anything.",
    category: "focus",
    hasChart: true,
    hasAction: true,
    content: `Deliberate practice is a structured approach to skill improvement...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "34",
    slug: "monk-mode",
    title: "Monk Mode",
    description: "Radical focus by eliminating all distractions for a set period.",
    category: "focus",
    hasChart: false,
    hasAction: true,
    content: `Monk mode is an extreme productivity strategy where you eliminate all non-essential activities...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "35",
    slug: "divergent-thinking",
    title: "Divergent Thinking",
    description: "Generating creative ideas by exploring many possible solutions.",
    category: "creativity",
    hasChart: true,
    hasAction: true,
    content: `Divergent thinking is a thought process used to generate creative ideas...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "36",
    slug: "lateral-thinking",
    title: "Lateral Thinking",
    description: "Solving problems through an indirect and creative approach.",
    category: "creativity",
    hasChart: false,
    hasAction: true,
    content: `Lateral thinking is a manner of solving problems using an indirect and creative approach...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "37",
    slug: "learning-how-to-learn",
    title: "Learning How to Learn",
    description: "Meta-learning strategies to accelerate your skill acquisition.",
    category: "learning",
    hasChart: false,
    hasAction: true,
    content: `Learning how to learn is the ultimate meta-skill. Understanding how your brain works...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "38",
    slug: "spaced-repetition",
    title: "Spaced Repetition",
    description: "Optimizing memory retention through strategic review intervals.",
    category: "learning",
    hasChart: true,
    hasAction: true,
    content: `Spaced repetition is a memory technique that involves reviewing information...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "39",
    slug: "decision-matrix",
    title: "Decision Matrix",
    description: "A framework for making rational choices under uncertainty.",
    category: "clarity",
    hasChart: true,
    hasAction: true,
    content: `A decision matrix helps you evaluate and prioritize a list of options...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "40",
    slug: "inversion-thinking",
    title: "Inversion Thinking",
    description: "Solving problems backward by considering the opposite.",
    category: "clarity",
    hasChart: false,
    hasAction: true,
    content: `Inversion is a powerful thinking tool that involves looking at a problem from the opposite direction...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "41",
    slug: "habit-stacking",
    title: "Habit Stacking",
    description: "Building new habits by linking them to existing routines.",
    category: "habit",
    hasChart: false,
    hasAction: true,
    content: `Habit stacking is a strategy where you pair a new habit with an existing one...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "42",
    slug: "identity-based-habits",
    title: "Identity-Based Habits",
    description: "Lasting behavior change by shifting your self-identity.",
    category: "habit",
    hasChart: false,
    hasAction: true,
    content: `The key to building lasting habits is to focus on who you want to become...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "43",
    slug: "sunken-cost-fallacy",
    title: "Sunken Cost Fallacy",
    description: "Why we struggle to walk away from bad investments.",
    category: "strategy",
    hasChart: false,
    hasAction: true,
    content: `The sunken cost fallacy occurs when we continue investing in something...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "44",
    slug: "blue-ocean",
    title: "Blue Ocean Strategy",
    description: "Creating uncontested market space instead of competing.",
    category: "strategy",
    hasChart: true,
    hasAction: true,
    content: `Blue Ocean Strategy is about creating new market space rather than competing in existing ones...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "45",
    slug: "stoic-morning",
    title: "Stoic Morning Routine",
    description: "Starting your day with ancient wisdom for modern resilience.",
    category: "stoicism",
    hasChart: false,
    hasAction: true,
    content: `The Stoics believed that how you start your morning sets the tone for your entire day...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "46",
    slug: "memento-mori",
    title: "Memento Mori",
    description: "Remembering your mortality to live a more meaningful life.",
    category: "stoicism",
    hasChart: false,
    hasAction: false,
    content: `Memento Mori is the ancient practice of reflecting on one's own mortality...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "47",
    slug: "winner-effect",
    title: "Winner Effect",
    description: "How winning changes your brain chemistry for future success.",
    category: "success",
    hasChart: true,
    hasAction: false,
    content: `The winner effect is a phenomenon where winning a competition increases the likelihood of winning future ones...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "48",
    slug: "ikigai",
    title: "Ikigai",
    description: "Finding your reason for being, Japanese philosophy style.",
    category: "success",
    hasChart: true,
    hasAction: true,
    content: `Ikigai is a Japanese concept meaning 'reason for being'. It sits at the intersection of what you love...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "49",
    slug: "first-principles-problem",
    title: "First Principles Problem Solving",
    description: "Breaking down complex problems into basic elements.",
    category: "problem-solving",
    hasChart: true,
    hasAction: true,
    content: `First principles thinking is about breaking down a problem into its fundamental truths...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "50",
    slug: "triz",
    title: "TRIZ Method",
    description: "Systematic problem-solving based on patterns of invention.",
    category: "problem-solving",
    hasChart: true,
    hasAction: true,
    content: `TRIZ is a problem-solving methodology based on patterns of invention found in global patent literature...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "51",
    slug: "priming-effect",
    title: "Priming Effect",
    description: "How subtle cues unconsciously influence your behavior.",
    category: "psychology",
    hasChart: false,
    hasAction: true,
    content: `The priming effect occurs when exposure to one stimulus influences your response to a subsequent stimulus...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "52",
    slug: "halo-effect",
    title: "Halo Effect",
    description: "How one positive trait influences perception of everything else.",
    category: "psychology",
    hasChart: false,
    hasAction: false,
    content: `The halo effect is a cognitive bias where your overall impression of a person influences how you feel about their specific traits...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "53",
    slug: "tragedy-commons",
    title: "Tragedy of the Commons",
    description: "How shared resources get depleted when everyone acts in self-interest.",
    category: "game-theory",
    hasChart: true,
    hasAction: false,
    content: `The tragedy of the commons describes a situation where individuals acting independently and rationally according to their own self-interest...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "54",
    slug: "prisoners-dilemma",
    title: "Prisoner's Dilemma",
    description: "Why cooperation is hard even when it benefits everyone.",
    category: "game-theory",
    hasChart: true,
    hasAction: false,
    content: `The prisoner's dilemma is a thought experiment that shows why two rational individuals might not cooperate...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "55",
    slug: "bounce-rate",
    title: "Antifragile Bouncing",
    description: "Getting stronger from stressors and shocks.",
    category: "resilience",
    hasChart: false,
    hasAction: true,
    content: `Being antifragile means you don't just withstand stress - you actually improve because of it...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "56",
    slug: "post-traumatic-growth",
    title: "Post-Traumatic Growth",
    description: "How adversity can lead to profound personal development.",
    category: "resilience",
    hasChart: false,
    hasAction: true,
    content: `Post-traumatic growth refers to positive psychological change experienced as a result of struggling with challenging life circumstances...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "57",
    slug: "grey-swan",
    title: "Grey Swan Events",
    description: "Predictable yet ignored high-impact events.",
    category: "risk",
    hasChart: true,
    hasAction: false,
    content: `A grey swan is a potentially significant event whose possibility can be predicted...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "58",
    slug: "risk-reward",
    title: "Risk-Reward Ratio",
    description: "Calculating whether a bet is worth taking.",
    category: "risk",
    hasChart: true,
    hasAction: true,
    content: `The risk-reward ratio measures the potential loss vs potential gain of a decision...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "59",
    slug: "network-effects-business",
    title: "Network Effects in Business",
    description: "How platforms become more valuable as more people use them.",
    category: "business",
    hasChart: true,
    hasAction: false,
    content: `Network effects occur when a product or service becomes more valuable as more people use it...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "60",
    slug: "moats",
    title: "Economic Moats",
    description: "Sustainable competitive advantages that protect a business.",
    category: "business",
    hasChart: true,
    hasAction: false,
    content: `An economic moat refers to a business's ability to maintain competitive advantages over its rivals...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "61",
    slug: "buckley-effect",
    title: "The Buckley Effect",
    description: "Why direction matters more than speed in decision-making.",
    category: "decision-making",
    hasChart: false,
    hasAction: true,
    content: `The Buckley effect describes how having a clear direction is more important than how fast you're moving...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "62",
    slug: "decoupling",
    title: "Decoupling Decisions",
    description: "Separating the decision from the outcome to think clearly.",
    category: "decision-making",
    hasChart: false,
    hasAction: true,
    content: `Decoupling is the practice of separating the quality of a decision from the outcome it produces...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "63",
    slug: "fixed-vs-growth",
    title: "Fixed vs Growth Mindset",
    description: "How your beliefs about intelligence shape your potential.",
    category: "mindset",
    hasChart: false,
    hasAction: true,
    content: `Carol Dweck's research on fixed vs growth mindset reveals how our beliefs about our own abilities...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "64",
    slug: "ladder-inference",
    title: "Ladder of Inference",
    description: "How your brain jumps from data to conclusions automatically.",
    category: "mental-model",
    hasChart: true,
    hasAction: true,
    content: `The ladder of inference describes the unconscious mental steps we take to move from observing a fact...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "65",
    slug: "burdens-proof",
    title: "Burden of Proof",
    description: "Understanding who is responsible for proving a claim.",
    category: "logic",
    hasChart: false,
    hasAction: false,
    content: `The burden of proof is the obligation to provide sufficient evidence for a claim...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "66",
    slug: "emotional-regulation",
    title: "Emotional Regulation",
    description: "Managing your emotions for better decision-making.",
    category: "wellbeing",
    hasChart: false,
    hasAction: true,
    content: `Emotional regulation is the ability to manage your emotional state...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "67",
    slug: "kaizen",
    title: "Kaizen",
    description: "Continuous improvement through small daily changes.",
    category: "success",
    hasChart: false,
    hasAction: true,
    content: `Kaizen is the Japanese philosophy of continuous improvement...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "68",
    slug: "occams-razor-decisions",
    title: "Occam's Razor in Decisions",
    description: "The simplest explanation is usually the best one.",
    category: "strategy",
    hasChart: false,
    hasAction: false,
    content: `Occam's razor suggests that when faced with competing hypotheses...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "69",
    slug: "amor-fati",
    title: "Amor Fati",
    description: "Loving everything that happens, including adversity.",
    category: "stoicism",
    hasChart: false,
    hasAction: true,
    content: `Amor Fati is a Stoic concept meaning "love of fate"...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "70",
    slug: "uncertainty-principle",
    title: "Uncertainty Principle",
    description: "Why some risks are fundamentally unknowable.",
    category: "risk",
    hasChart: true,
    hasAction: false,
    content: `In decision-making, some risks cannot be measured or predicted...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "71",
    slug: "emotional-immunity",
    title: "Emotional Immunity",
    description: "Building psychological resilience against daily stressors.",
    category: "resilience",
    hasChart: false,
    hasAction: true,
    content: `Emotional immunity is the practice of building mental defenses...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "72",
    slug: "five-whys",
    title: "Five Whys",
    description: "Getting to the root cause by asking why five times.",
    category: "problem-solving",
    hasChart: false,
    hasAction: true,
    content: `The Five Whys is a simple but powerful root cause analysis technique...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "73",
    slug: "active-recall",
    title: "Active Recall",
    description: "Testing yourself to dramatically improve retention.",
    category: "learning",
    hasChart: false,
    hasAction: true,
    content: `Active recall is a learning technique where you actively retrieve information from memory...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "74",
    slug: "implementation-intention",
    title: "Implementation Intention",
    description: "Using if-then plans to lock in new habits.",
    category: "habit",
    hasChart: false,
    hasAction: true,
    content: `Implementation intentions are specific if-then plans that automate decision-making...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "75",
    slug: "chicken-game",
    title: "Chicken Game",
    description: "The high-stakes game of mutual escalation.",
    category: "game-theory",
    hasChart: true,
    hasAction: false,
    content: `The chicken game is a model of conflict where two parties engage in a risky escalation...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "76",
    slug: "hyperfocus",
    title: "Hyperfocus",
    description: "Harnessing attention for deep productivity.",
    category: "focus",
    hasChart: false,
    hasAction: true,
    content: `Hyperfocus is a state of intense concentration where time seems to disappear...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "77",
    slug: "law-of-diminishing-marginal-utility",
    title: "Law of Diminishing Marginal Utility",
    description: "Each additional unit brings less satisfaction.",
    category: "economics",
    hasChart: true,
    hasAction: false,
    content: `The law of diminishing marginal utility states that as you consume more of a good...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "78",
    slug: "brainwriting",
    title: "Brainwriting",
    description: "Generating ideas in silence before group discussion.",
    category: "creativity",
    hasChart: false,
    hasAction: true,
    content: `Brainwriting is an alternative to traditional brainstorming where participants write down ideas...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "79",
    slug: "anchoring-bias",
    title: "Anchoring Bias",
    description: "How first impressions distort your judgment.",
    category: "cognitive-bias",
    hasChart: false,
    hasAction: false,
    content: `Anchoring bias is the tendency to rely too heavily on the first piece of information offered...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "80",
    slug: "second-order-thinking",
    title: "Second-Order Thinking",
    description: "Thinking about the consequences of consequences.",
    category: "clarity",
    hasChart: true,
    hasAction: true,
    content: `Second-order thinking is the practice of considering the downstream effects of your decisions...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "81",
    slug: "flywheel-effect",
    title: "Flywheel Effect",
    description: "How small efforts compound into massive momentum.",
    category: "business",
    hasChart: true,
    hasAction: true,
    content: `The flywheel effect describes how small, consistent efforts build momentum over time...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "82",
    slug: "antimindset",
    title: "Antimindset",
    description: "Challenging your own beliefs to think more clearly.",
    category: "mindset",
    hasChart: false,
    hasAction: true,
    content: `An antimindset is the willingness to actively challenge your own assumptions...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "83",
    slug: "mental-simulation",
    title: "Mental Simulation",
    description: "Running scenarios in your head to prepare for reality.",
    category: "mental-model",
    hasChart: false,
    hasAction: true,
    content: `Mental simulation involves running through scenarios in your mind before they happen...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "84",
    slug: "straw-man",
    title: "Straw Man Fallacy",
    description: "Misrepresenting an argument to make it easier to attack.",
    category: "logic",
    hasChart: false,
    hasAction: false,
    content: `The straw man fallacy involves distorting an opponent's argument to make it easier to refute...`,
    nodes: [],
    edges: [],
    questions: []
  },
  {
    id: "85",
    slug: "gtd-method",
    title: "GTD Method",
    description: "Getting things done through systematic organization.",
    category: "productivity",
    hasChart: false,
    hasAction: true,
    content: `Getting Things Done (GTD) is a productivity method developed by David Allen...`,
    nodes: [],
    edges: [],
    questions: []
  }
];

export interface Mission {
  id: number;
  title: string;
  step: string;
  module: string;
  progress: number;
}

export const activeMissions: Mission[] = [
  { id: 1, title: "Stop Waiting", step: "Do the 5-minute rule", module: "stop-waiting", progress: 75 },
  { id: 2, title: "Cost of Not Deciding", step: "Set a hard deadline", module: "cost-of-not-deciding", progress: 45 },
  { id: 3, title: "Building Habits", step: "Stack a new habit", module: "building-habits", progress: 20 },
];

export interface Card {
  id: string;
  title: string;
  content: string;
  category: string;
  timestamp: number;
  nodes?: any[];
  edges?: any[];
}

export const sampleCards: Card[] = [
  {
    id: "s1",
    title: "First Principles Thinking",
    content: "Break down complex problems into basic elements and then reassemble them from the ground up.",
    category: "Mental Model",
    timestamp: Date.now() - 86400000 * 5,
    nodes: [
      { id: '1', position: { x: 50, y: 0 }, data: { label: 'Complexity' }, style: { fontSize: '10px', padding: '5px', borderRadius: '8px' } },
      { id: '2', position: { x: 50, y: 50 }, data: { label: 'Elements' }, style: { fontSize: '10px', padding: '5px', borderRadius: '8px' } },
      { id: '3', position: { x: 50, y: 100 }, data: { label: 'Re-Build' }, style: { fontSize: '10px', padding: '5px', borderRadius: '8px' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ]
  },
  {
    id: "s2",
    title: "Pareto Principle",
    content: "80% of results come from 20% of efforts.",
    category: "Productivity",
    timestamp: Date.now() - 86400000 * 4,
    nodes: [
      { id: '1', position: { x: 20, y: 0 }, data: { label: '20% Effort' }, style: { background: '#fff', color: '#000', fontSize: '10px' } },
      { id: '2', position: { x: 100, y: 80 }, data: { label: '80% Results' }, style: { fontSize: '10px' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true }
    ]
  },
  {
    id: "s3",
    title: "Habit Loop",
    content: "Cue, Routine, Reward.",
    category: "Habit",
    timestamp: Date.now() - 86400000 * 3,
    nodes: [
      { id: '1', position: { x: 0, y: 50 }, data: { label: 'Cue' }, style: { fontSize: '8px' } },
      { id: '2', position: { x: 60, y: 0 }, data: { label: 'Routine' }, style: { fontSize: '8px' } },
      { id: '3', position: { x: 120, y: 50 }, data: { label: 'Reward' }, style: { fontSize: '8px' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-1', source: '3', target: '1' },
    ]
  }
];

export interface Reflection {
  id: string;
  title: string;
  content: string;
  moduleSlug: string;
  moduleTitle: string;
  timestamp: number;
}

export const reflections: Reflection[] = [
  {
    id: "r1",
    title: "My 5-minute rule experience",
    content: "Tried the 5-minute rule today on my report. I set a timer for 5 minutes and told myself I could stop after. Result: I worked for 45 minutes straight. The hardest part really is just starting. Going to apply this to my morning routine tomorrow.",
    moduleSlug: "stop-waiting",
    moduleTitle: "Stop waiting to feel ready",
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: "r2",
    title: "Decision paralysis insights",
    content: "Realized I've been stuck on the career decision for 3 months. After reading this module, I set a 24-hour deadline and made the call. The relief is immediate. Even if it's wrong, I can course-correct. Indecision was costing me more than any wrong choice would.",
    moduleSlug: "cost-of-not-deciding",
    moduleTitle: "The cost of not deciding",
    timestamp: Date.now() - 86400000 * 1,
  },
  {
    id: "r3",
    title: "Habit stacking works",
    content: "Successfully stacked reading 5 pages after my morning coffee for 7 days straight. The key was making it tiny - 5 pages feels almost too easy, but I always end up reading more. Going to add a second stack for evening: after brushing teeth, I'll write 3 sentences in my journal.",
    moduleSlug: "building-habits",
    moduleTitle: "Building habits that stick",
    timestamp: Date.now() - 86400000 * 3,
  },
  {
    id: "r4",
    title: "Deep work is harder than I thought",
    content: "Tried the 90-minute block today. First 20 minutes were pure resistance. But around minute 25, something clicked. Got more done in that block than in 3 hours of distracted work. Need to find a way to silence notifications completely.",
    moduleSlug: "deep-work",
    moduleTitle: "Deep Work Mastery",
    timestamp: Date.now() - 86400000 * 5,
  },
  {
    id: "r5",
    title: "80/20 on my task list",
    content: "Applied the Pareto Principle to my to-do list. Identified the 20% of tasks that would drive 80% of results. Deleted or delegated the rest. Freed up about 4 hours per week. Should have done this years ago.",
    moduleSlug: "pareto-principle",
    moduleTitle: "The 80/20 Rule",
    timestamp: Date.now() - 86400000 * 4,
  },
];

export interface Highlight {
  id: string;
  text: string;
  note: string;
  moduleSlug: string;
  moduleTitle: string;
  timestamp: number;
}

export const highlights: Highlight[] = [
  {
    id: "h1",
    text: "Motivation follows action, not the other way around",
    note: "This changes everything. Stop waiting for motivation - just do 5 minutes.",
    moduleSlug: "stop-waiting",
    moduleTitle: "Stop waiting to feel ready",
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: "h2",
    text: "Indecision is actually a decision for stagnation",
    note: "The most powerful reframe. Not choosing IS a choice - the worst one.",
    moduleSlug: "cost-of-not-deciding",
    moduleTitle: "The cost of not deciding",
    timestamp: Date.now() - 86400000 * 1,
  },
  {
    id: "h3",
    text: "Habit stacking formula: After [Current], I will [New]",
    note: "Using this for my reading habit. After coffee → read 5 pages.",
    moduleSlug: "building-habits",
    moduleTitle: "Building habits that stick",
    timestamp: Date.now() - 86400000 * 3,
  },
  {
    id: "h4",
    text: "The Goldilocks Rule: tasks should be just right",
    note: "Not too hard, not too easy. The sweet spot is where growth happens.",
    moduleSlug: "building-habits",
    moduleTitle: "Building habits that stick",
    timestamp: Date.now() - 86400000 * 4,
  },
  {
    id: "h5",
    text: "Deep Work is the ability to focus without distraction on a cognitively demanding task",
    note: "This is what I'm building toward. 90-minute blocks with zero interruptions.",
    moduleSlug: "deep-work",
    moduleTitle: "Deep Work Mastery",
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: "h6",
    text: "Inversion: Solve problems backward by asking how you would fail",
    note: "Great for decision-making. Ask 'what would guarantee failure?' then avoid those things.",
    moduleSlug: "mental-models",
    moduleTitle: "Mental Models 101",
    timestamp: Date.now() - 86400000 * 5,
  },
];

export interface SavedItem {
  id: string;
  type: "model" | "card";
  itemId: string;
  timestamp: number;
}

export const savedItems: SavedItem[] = [
  { id: "sv1", type: "model", itemId: "stop-waiting", timestamp: Date.now() - 86400000 * 2 },
  { id: "sv2", type: "card", itemId: "s1", timestamp: Date.now() - 86400000 * 3 },
  { id: "sv3", type: "model", itemId: "cost-of-not-deciding", timestamp: Date.now() - 86400000 * 1 },
  { id: "sv4", type: "card", itemId: "s2", timestamp: Date.now() - 86400000 * 4 },
  { id: "sv5", type: "model", itemId: "building-habits", timestamp: Date.now() - 86400000 * 5 },
];
