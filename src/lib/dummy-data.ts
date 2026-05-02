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
  timestamp: number;
}

export const reflections: Reflection[] = [
  { id: "r1", title: "My 5-minute rule experience", content: "Tried the 5-minute rule today...", moduleSlug: "stop-waiting", timestamp: Date.now() - 86400000 * 2 },
  { id: "r2", title: "Decision paralysis insights", content: "Realized I've been waiting too long...", moduleSlug: "cost-of-not-deciding", timestamp: Date.now() - 86400000 * 1 },
  { id: "r3", title: "Habit stacking works", content: "Successfully stacked my reading habit...", moduleSlug: "building-habits", timestamp: Date.now() - 86400000 * 3 },
];

export interface Highlight {
  id: string;
  text: string;
  moduleSlug: string;
  timestamp: number;
}

export const highlights: Highlight[] = [
  { id: "h1", text: "Motivation follows action, not the other way around", moduleSlug: "stop-waiting", timestamp: Date.now() - 86400000 * 2 },
  { id: "h2", text: "Indecision is actually a decision for stagnation", moduleSlug: "cost-of-not-deciding", timestamp: Date.now() - 86400000 * 1 },
  { id: "h3", text: "Habit stacking formula: After [Current], I will [New]", moduleSlug: "building-habits", timestamp: Date.now() - 86400000 * 3 },
  { id: "h4", text: "The Goldilocks Rule: tasks should be just right", moduleSlug: "building-habits", timestamp: Date.now() - 86400000 * 4 },
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
