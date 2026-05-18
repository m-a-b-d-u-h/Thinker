import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.quizAttempt.deleteMany();
  await prisma.completedGraphNode.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.highlight.deleteMany();
  await prisma.reflection.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.moduleEdge.deleteMany();
  await prisma.moduleNode.deleteMany();
  await prisma.module.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@1section.com",
      name: "Demo User",
      passwordHash: null,
      subscriptionStatus: "FREE",
    },
  });
  console.log(`Created demo user: ${demoUser.email}`);

  function makeNodes(modSlug: string, nodes: any[]) {
    return nodes.map((n) => ({
      ...n,
      id: `${modSlug}-${n.id}`,
    }));
  }
  function makeEdges(modSlug: string, edges: any[]) {
    return edges.map((e) => ({
      ...e,
      id: `${modSlug}-${e.id}`,
      source: `${modSlug}-${e.source}`,
      target: `${modSlug}-${e.target}`,
    }));
  }

  // Full modules data
  const modulesData = [
    {
      slug: "stop-waiting",
      title: "Stop waiting to feel ready",
      description: "Why motivation follows action, not the other way around.",
      category: "mindset",
      content: `The greatest myth of productivity is that you need to "feel like it" before you start. We often wait for a surge of motivation, a clear mind, or the "perfect moment" to begin a difficult task.

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
3. **Embrace the "Shitty First Draft"**: Give yourself permission to do a bad job. Perfectionism is just procrastination in a fancy suit.`,
      nodes: [
        { id: "1", positionX: 250, positionY: 0, label: "Decision: Start a difficult project" },
        { id: "2", positionX: 50, positionY: 150, label: "Wait for motivation" },
        { id: "3", positionX: 450, positionY: 150, label: "Take immediate action (5 min)" },
        { id: "4", positionX: 50, positionY: 300, label: "Stagnation & Guilt" },
        { id: "5", positionX: 450, positionY: 300, label: "Clarity & Momentum" },
        { id: "6", positionX: 450, positionY: 450, label: "SUCCESS: Project completion" },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", label: "Fear-based" },
        { id: "e1-3", source: "1", target: "3", label: "Action-based" },
        { id: "e2-4", source: "2", target: "4" },
        { id: "e3-5", source: "3", target: "5" },
        { id: "e5-6", source: "5", target: "6" },
      ],
      questions: [
        {
          question: 'According to the module, what is the correct cycle of productivity?',
          options: ["Motivation → Action → Result", "Action → Result → Motivation", "Result → Action → Motivation", "Action → Motivation → Result"],
          correctAnswer: 1,
          explanation: 'The cycle is reversed: Action leads to Result, which then generates Motivation.'
        },
        {
          question: "What is the '5-Minute Rule' from this module?",
          options: ["Work for exactly 5 minutes and then take a 5-minute break", "Commit to just 5 minutes—afterward you can stop if you want", "Spend 5 minutes planning before you start working", "Work on weekends for at least 5 minutes"],
          correctAnswer: 1,
          explanation: "The 5-Minute Rule is about committing to just 5 minutes of work. Usually, the momentum from those 5 minutes is enough to keep you going."
        },
        {
          question: "If you can't start a task, what does the module suggest?",
          options: ["Wait until you feel more prepared", "Break the task down until it feels 'stupidly small'", "Ask someone else to do it for you", "Read more about the topic first"],
          correctAnswer: 1,
          explanation: "If you can't start, your first step is too big. Break it down until it feels 'stupidly small'."
        },
        {
          question: "What is the 'Shitty First Draft' concept?",
          options: ["Write a rough draft and then edit heavily", "Give yourself permission to do a bad job", "Only create content when you're inspired", "Always aim for perfection on the first try"],
          correctAnswer: 1,
          explanation: "Perfectionism is just procrastination in a fancy suit. Give yourself permission to do a bad job."
        },
        {
          question: "The module compares the brain to a car in winter. What's the point?",
          options: ["Driving in winter is dangerous", "You need to warm up the car before driving", "You have to start driving to get the engine warm", "Cars break down in cold weather"],
          correctAnswer: 2,
          explanation: "You have to start driving to generate heat. Same with action: you start to generate motivation."
        },
      ],
    },
    {
      slug: "cost-of-not-deciding",
      title: "The cost of not deciding",
      description: "Every delay is still a choice. Map out what inaction actually costs you.",
      category: "clarity",
      content: `We often view "waiting" as a neutral state. We think that by not making a choice, we are keeping our options open. This is a dangerous illusion.

### Indecision is a Decision
When you refuse to choose between Option A and Option B, you are actually choosing **Option C: Stagnation.**

### The Hidden Costs
1. **Mental Overhead**: Every undecided project takes up "RAM" in your brain.
2. **Opportunity Cost**: While you are waiting to decide, you are losing months of experience.
3. **Loss of Agency**: If you don't decide, the world will decide for you.

### How to break the loop:
- **Set a "Hard Deadline"**: Give yourself 24 hours to gather data, then flip a coin if you have to.
- **Fear Setting**: Write down the absolute worst thing that could happen if you make the "wrong" choice.`,
      nodes: [
        { id: "1", positionX: 400, positionY: 0, label: "CHALLENGE: Career Pivot?" },
        { id: "2", positionX: 100, positionY: 150, label: "ACTION: Stay in Current Role" },
        { id: "4", positionX: 50, positionY: 300, label: "6 MONTHS: Comfort but growing boredom" },
        { id: "6", positionX: 50, positionY: 450, label: "1 YEAR: Skill stagnation" },
        { id: "8", positionX: 50, positionY: 600, label: "2 YEARS: Deep regret & Golden Handcuffs" },
        { id: "3", positionX: 700, positionY: 150, label: "ACTION: Pivot Immediately" },
        { id: "5", positionX: 750, positionY: 300, label: "6 MONTHS: High stress, steep learning" },
        { id: "7", positionX: 750, positionY: 450, label: "1 YEAR: New network & base mastery" },
        { id: "9", positionX: 750, positionY: 600, label: "2 YEARS: Career acceleration & Fulfillment" },
        { id: "10", positionX: 400, positionY: 200, label: 'INDECISION: Wait for "Perfect" timing' },
        { id: "11", positionX: 400, positionY: 350, label: "6 MONTHS: Analysis Paralysis" },
        { id: "12", positionX: 400, positionY: 500, label: "1 YEAR: Lost $50k in potential growth" },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", label: "Safety" },
        { id: "e1-3", source: "1", target: "3", label: "Growth" },
        { id: "e1-10", source: "1", target: "10", label: "Fear" },
        { id: "e2-4", source: "2", target: "4" },
        { id: "e4-6", source: "4", target: "6" },
        { id: "e6-8", source: "6", target: "8" },
        { id: "e3-5", source: "3", target: "5" },
        { id: "e5-7", source: "5", target: "7" },
        { id: "e7-9", source: "7", target: "9" },
        { id: "e10-11", source: "10", target: "11" },
        { id: "e11-12", source: "11", target: "12" },
      ],
      questions: [
        {
          question: "According to the module, what does 'indecision' actually mean?",
          options: ["You are keeping your options open", "You are choosing Option C: Stagnation", "You are being wise and careful", "You are avoiding risk"],
          correctAnswer: 1,
          explanation: "Indecision is actually a decision itself—you're choosing stagnation by refusing to choose."
        },
        {
          question: "What is one of the 'Hidden Costs' of not deciding?",
          options: ["You save money by waiting", "Mental overhead that drains your energy", "You gain more options over time", "You become more decisive naturally"],
          correctAnswer: 1,
          explanation: "Every undecided project takes up 'RAM' in your brain, creating low-level background anxiety."
        },
        {
          question: "What does 'Loss of Agency' mean in the context of indecision?",
          options: ["You lose your driver's license", "If you don't decide, the world decides for you", "You become an agent of change", "You lose the ability to work"],
          correctAnswer: 1,
          explanation: "If you don't decide, external circumstances will decide for you."
        },
        {
          question: "What is the 'Hard Deadline' technique mentioned?",
          options: ["Wait for the perfect moment", "Give yourself 24 hours to gather data, then decide", "Never set deadlines for decisions", "Only decide on weekdays"],
          correctAnswer: 1,
          explanation: "Set a hard deadline: give yourself 24 hours to gather data, then flip a coin if needed."
        },
      ],
    },
    {
      slug: "building-habits",
      title: "Building habits that stick",
      description: "The mechanics of cue, routine, reward — and why most habits fail.",
      category: "habit",
      content: `Most people fail at building habits because they rely on willpower. Willpower is a finite resource—it's like a muscle that gets tired. To build a habit that lasts, you need a **system**.

### The Habit Loop
Every habit is driven by a simple neurological loop:
1. **The Cue**: The trigger that tells your brain to go into automatic mode.
2. **The Routine**: The behavior itself.
3. **The Reward**: The positive reinforcement that tells your brain, "This is worth remembering."

### Habit Stacking
The most effective way to build a new habit is to "stack" it onto an existing one.
**Formula: After [Current Habit], I will [New Habit].**

### The Goldilocks Rule
Humans experience peak motivation when working on tasks that are "just right"—neither too easy nor too difficult.`,
      nodes: [
        { id: "1", positionX: 250, positionY: 0, label: "Trigger: Morning Coffee" },
        { id: "2", positionX: 250, positionY: 150, label: "Action: Read 5 pages" },
        { id: "3", positionX: 250, positionY: 300, label: "Reward: Check phone" },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" },
      ],
      questions: [
        {
          question: "Why do most people fail at building habits according to the module?",
          options: ["They don't have enough time", "They rely on willpower which is finite", "They set goals that are too small", "They lack motivation from others"],
          correctAnswer: 1,
          explanation: "Willpower is a finite resource—like a muscle that gets tired. You need a system."
        },
        {
          question: "What are the three components of the Habit Loop?",
          options: ["Goal, Action, Result", "Cue, Routine, Reward", "Start, Middle, End", "Trigger, Response, Consequence"],
          correctAnswer: 1,
          explanation: "Every habit is driven by: 1. The Cue (trigger), 2. The Routine (behavior), 3. The Reward."
        },
        {
          question: "What is 'Habit Stacking'?",
          options: ["Stacking books to read", "After [Current Habit], I will [New Habit]", "Doing multiple habits at once", "Piling up rewards for motivation"],
          correctAnswer: 1,
          explanation: "Habit Stacking means attaching a new habit to an existing one."
        },
      ],
    },
    {
      slug: "deep-work",
      title: "Deep Work Mastery",
      description: "How to focus without distraction in a noisy world.",
      category: "focus",
      content: `Deep Work is the ability to focus without distraction on a cognitively demanding task.

### The Shallow Work Trap
Most people spend their day in "shallow work"—emails, meetings, Slack messages.

### The 4 Rules of Deep Work
1. **Work Deeply**: Build rituals and routines that minimize friction.
2. **Embrace Boredom**: Your ability to concentrate is like a muscle.
3. **Quit Social Media**: These tools fragment your attention.
4. **Drain the Shallows**: Be ruthless about eliminating low-value activities.`,
      nodes: [
        { id: "1", positionX: 250, positionY: 0, label: "Shallow Work" },
        { id: "2", positionX: 100, positionY: 150, label: "Emails & Meetings" },
        { id: "3", positionX: 400, positionY: 150, label: "Deep Work" },
        { id: "4", positionX: 400, positionY: 300, label: "High Value Creation" },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", label: "Easy" },
        { id: "e1-3", source: "1", target: "3", label: "Hard" },
        { id: "e3-4", source: "3", target: "4" },
      ],
      questions: [
        {
          question: "What is Deep Work?",
          options: ["Working long hours without sleep", "Focus without distraction on cognitively demanding tasks", "Doing multiple tasks at once", "Working in a noisy environment"],
          correctAnswer: 1,
          explanation: "Deep Work is the ability to focus without distraction on a cognitively demanding task."
        },
        {
          question: "What is the 'Shallow Work Trap'?",
          options: ["Working in shallow water", "Spending your day on emails, meetings, easy tasks", "Not working hard enough", "Working without a desk"],
          correctAnswer: 1,
          explanation: "Shallow work includes emails, meetings, Slack messages—activities that don't create much value."
        },
      ],
    },
    {
      slug: "pareto-principle",
      title: "The 80/20 Rule",
      description: "How to identify and amplify the vital few inputs that drive the majority of results.",
      category: "productivity",
      content: `The Pareto Principle states that for many outcomes, roughly 80% of consequences come from 20% of causes.

### The Power Law
In business: 80% of revenue comes from 20% of customers.
In productivity: 80% of results come from 20% of your efforts.

### How to Apply It
1. **Identify the Vital Few**: What 20% of your activities generate 80% of your results?
2. **Eliminate the Trivial Many**: Cut the 80% that only generate 20% of results.`,
      nodes: [
        { id: "1", positionX: 250, positionY: 0, label: "All Efforts (100%)" },
        { id: "2", positionX: 100, positionY: 150, label: "Vital Few (20%)" },
        { id: "3", positionX: 400, positionY: 150, label: "Trivial Many (80%)" },
        { id: "4", positionX: 100, positionY: 300, label: "80% of Results" },
        { id: "5", positionX: 400, positionY: 300, label: "20% of Results" },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e1-3", source: "1", target: "3" },
        { id: "e2-4", source: "2", target: "4", label: "80% Results" },
        { id: "e3-5", source: "3", target: "5", label: "20% Results" },
      ],
      questions: [
        {
          question: "What is the Pareto Principle (80/20 Rule)?",
          options: ["Work 80% and rest 20%", "80% of results come from 20% of efforts", "Spend 80% of time on planning", "Do 20% of work for 80% pay"],
          correctAnswer: 1,
          explanation: "Roughly 80% of consequences come from 20% of causes."
        },
        {
          question: "How should you apply the 80/20 rule?",
          options: ["Work less and hope for the best", "Identify the vital few activities and double down", "Only do 20% of your work", "Ignore 80% of your customers"],
          correctAnswer: 1,
          explanation: "Identify the Vital Few: what 20% generates 80% of results? Double down on those."
        },
      ],
    },
    {
      slug: "first-principles",
      title: "First Principles Thinking",
      description: "Break complex problems into basic truths and rebuild from scratch.",
      category: "strategy",
      content: `First Principles Thinking is a problem-solving approach that breaks complex problems down into basic, foundational truths (first principles) and then rebuilds from there.

### The Analogy: The Chef vs The Cook
- **The Cook**: Follows recipes. Uses what others have done.
- **The Chef**: Understands ingredients. Knows why things work.

### How to Use First Principles
1. **Identify the Problem**: What are you trying to solve?
2. **Break It Down**: What are the foundational truths?
3. **Rebuild**: How can you combine these truths in new ways?`,
      nodes: [
        { id: "1", positionX: 250, positionY: 0, label: "Complex Problem" },
        { id: "2", positionX: 100, positionY: 150, label: "Break Down" },
        { id: "3", positionX: 400, positionY: 150, label: "First Principles" },
        { id: "4", positionX: 250, positionY: 300, label: "Rebuild Solution" },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" },
        { id: "e3-4", source: "3", target: "4" },
      ],
      questions: [
        {
          question: "What is First Principles Thinking?",
          options: ["Following recipes and best practices", "Breaking problems into basic truths and rebuilding", "Using analogies to solve problems", "Thinking about principles first thing in the morning"],
          correctAnswer: 1,
          explanation: "First Principles breaks complex problems into basic truths and rebuilds from scratch."
        },
        {
          question: "What's the difference between The Chef and The Cook?",
          options: ["Chefs cook better food", "Chefs follow recipes, Cooks create new ones", "Cooks follow recipes, Chefs understand ingredients", "There is no difference"],
          correctAnswer: 2,
          explanation: "The Cook follows recipes. The Chef understands ingredients and creates new recipes."
        },
      ],
    },
    {
      slug: "creative-flow",
      title: "Unlocking Creative Flow",
      description: "Enter the zone where your best work happens automatically.",
      category: "creativity",
      content: `Flow is a state of complete immersion in an activity. You lose track of time. Performance peaks.

### The 3 Conditions for Flow
1. **Clear Goals**: You know exactly what you're trying to achieve.
2. **Immediate Feedback**: You know instantly if you're on track.
3. **Challenge-Skill Balance**: The task is neither too easy nor too hard.

### The Flow Cycle
1. **Struggle**: Initial resistance.
2. **Release**: Let go of forcing it.
3. **Flow**: Suddenly, you're in the zone.
4. **Consolidation**: Integrate what you learned.`,
      nodes: [
        { id: "1", positionX: 250, positionY: 0, label: "Struggle Phase" },
        { id: "2", positionX: 100, positionY: 150, label: "Release" },
        { id: "3", positionX: 400, positionY: 150, label: "Flow State" },
        { id: "4", positionX: 250, positionY: 300, label: "Peak Performance" },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" },
        { id: "e3-4", source: "3", target: "4" },
      ],
      questions: [
        {
          question: "What are the 3 conditions for Flow?",
          options: ["Money, Time, Resources", "Clear Goals, Immediate Feedback, Challenge-Skill Balance", "Music, Coffee, Silence", "Hard Work, Luck, Talent"],
          correctAnswer: 1,
          explanation: "Flow requires Clear Goals, Immediate Feedback, and Challenge-Skill Balance."
        },
        {
          question: "What is the Flow Cycle?",
          options: ["Wake up, Work, Sleep", "Struggle → Release → Flow → Consolidation", "Plan, Execute, Review", "Start, Stop, Restart"],
          correctAnswer: 1,
          explanation: "The Flow Cycle: Struggle, Release, Flow, Consolidation."
        },
      ],
    },
    {
      slug: "mental-models",
      title: "Mental Models 101",
      description: "Build a latticework of mental models to make better decisions.",
      category: "learning",
      content: `A mental model is a framework or lens through which you view the world.

### The Best Mental Models
1. **Occam's Razor**: The simplest explanation is usually correct.
2. **Inversion**: Solve problems backward.
3. **Circle of Competence**: Know what you know and what you don't.
4. **Margin of Safety**: Always leave room for error.
5. **Compound Interest**: Small gains, consistently applied, lead to exponential growth.`,
      nodes: [
        { id: "1", positionX: 250, positionY: 0, label: "Problem" },
        { id: "2", positionX: 100, positionY: 150, label: "Single Model" },
        { id: "3", positionX: 400, positionY: 150, label: "Latticework of Models" },
        { id: "4", positionX: 400, positionY: 300, label: "Better Decisions" },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", label: "Limited" },
        { id: "e1-3", source: "1", target: "3", label: "Diverse" },
        { id: "e3-4", source: "3", target: "4" },
      ],
      questions: [
        {
          question: "What is a Mental Model?",
          options: ["A physical model of the brain", "A framework or lens to simplify complexity", "A type of 3D modeling software", "A model for acting mentally ill"],
          correctAnswer: 1,
          explanation: "A mental model is a framework or lens through which you view the world."
        },
        {
          question: "What is 'Inversion' as a mental model?",
          options: ["Turning things upside down", "Solving problems backward: 'How do I fail?' then avoid", "Reversing your decisions", "Doing the opposite of what everyone says"],
          correctAnswer: 1,
          explanation: "Inversion means solving problems backward."
        },
      ],
    },
    {
      slug: "stress-management",
      title: "The Stress Reset",
      description: "Science-based techniques to manage stress and protect your mental bandwidth.",
      category: "wellbeing",
      content: `Stress isn't the enemy—chronic stress is.

### The Physiology of Stress
When you're stressed, your body releases cortisol and adrenaline.

### Stress Management Techniques
1. **Box Breathing**: Inhale 4 seconds, hold 4, exhale 4, hold 4.
2. **The 5-4-3-2-1 Grounding Technique**: Acknowledge 5 things you see, 4 you can touch, etc.
3. **Cognitive Reframing**: Instead of "I'm stressed," say "I'm excited."
4. **Nature Therapy**: 20 minutes in nature reduces cortisol levels.`,
      nodes: [
        { id: "1", positionX: 250, positionY: 0, label: "Stress Trigger" },
        { id: "2", positionX: 100, positionY: 150, label: "Chronic Stress" },
        { id: "3", positionX: 400, positionY: 150, label: "Managed Stress" },
        { id: "4", positionX: 100, positionY: 300, label: "Health Damage" },
        { id: "5", positionX: 400, positionY: 300, label: "Peak Performance" },
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", label: "Ignore" },
        { id: "e1-3", source: "1", target: "3", label: "Manage" },
        { id: "e2-4", source: "2", target: "4" },
        { id: "e3-5", source: "3", target: "5" },
      ],
      questions: [
        {
          question: "What is the difference between acute and chronic stress?",
          options: ["Acute is bad, chronic is good", "Acute is short-term (useful), chronic is long-term (damaging)", "They are the same thing", "Acute is physical, chronic is mental"],
          correctAnswer: 1,
          explanation: "Acute stress can improve performance. Chronic stress damages your brain and body."
        },
        {
          question: "What is Box Breathing?",
          options: ["Breathing in a square room", "Inhale 4s, hold 4s, exhale 4s, hold 4s", "Breathing into a box", "A breathing technique for boxers"],
          correctAnswer: 1,
          explanation: "Box Breathing activates the parasympathetic nervous system."
        },
      ],
    },
  ];

  // Stub modules
  const stubModules = [
    { slug: "occams-razor", title: "Occam's Razor", description: "The simplest solution is usually the correct one.", category: "logic", content: "Occam's Razor is a principle that suggests when presented with competing hypotheses, the one with the fewest assumptions should be selected." },
    { slug: "confirmation-bias", title: "Confirmation Bias", description: "The tendency to search for information that confirms your beliefs.", category: "psychology", content: "Confirmation bias is the tendency to search for, interpret, and recall information in a way that confirms your pre-existing beliefs." },
    { slug: "compound-effect", title: "The Compound Effect", description: "Small, smart choices + consistency + time = radical difference.", category: "success", content: "The Compound Effect is the principle of reaping huge rewards from small, consistent actions over time." },
    { slug: "circle-influence", title: "Circle of Influence", description: "Focus on what you can control, not what you can't.", category: "stoicism", content: "Stephen Covey's Circle of Influence concept teaches us to focus our energy on things we can actually control." },
    { slug: "dunning-kruger", title: "Dunning-Kruger Effect", description: "People with low ability overestimate their skill level.", category: "cognitive-bias", content: "The Dunning-Kruger effect is a cognitive bias where people with low ability at a task overestimate their ability." },
    { slug: "eisenhower-matrix", title: "Eisenhower Matrix", description: "Prioritize tasks by urgency and importance.", category: "productivity", content: "The Eisenhower Matrix helps you prioritize tasks by categorizing them into four quadrants." },
    { slug: "growth-mindset", title: "Growth Mindset", description: "Believe your abilities can be developed through dedication.", category: "mindset", content: "A growth mindset is the belief that your basic qualities are things you can cultivate through effort." },
    { slug: "imposter-syndrome", title: "Imposter Syndrome", description: "Feeling like a fraud despite evident success.", category: "psychology", content: "Imposter syndrome is a psychological pattern where one doubts their accomplishments." },
    { slug: "marginal-thinking", title: "Marginal Thinking", description: "Decisions based on incremental costs vs. total costs.", category: "decision-making", content: "Marginal thinking focuses on the additional cost or benefit of one more unit." },
    { slug: "network-effect", title: "Network Effect", description: "Product becomes more valuable as more people use it.", category: "business", content: "The network effect occurs when a product or service becomes more valuable as more people use it." },
    { slug: "opportunity-cost", title: "Opportunity Cost", description: "The loss of potential gain from other alternatives.", category: "decision-making", content: "Opportunity cost is the loss of potential gain from other alternatives when one alternative is chosen." },
    { slug: "parkinsons-law", title: "Parkinson's Law", description: "Work expands to fill the time available for completion.", category: "productivity", content: "Parkinson's Law states that work expands so as to fill the time available for its completion." },
    { slug: "rubber-ducky", title: "Rubber Duck Debugging", description: "Explain your problem to an inanimate object to solve it.", category: "problem-solving", content: "Rubber duck debugging is a method of debugging by explaining the problem to an inanimate object." },
    { slug: "sunk-cost", title: "Sunk Cost Fallacy", description: "Don't let past investments dictate future decisions.", category: "cognitive-bias", content: "The sunk cost fallacy is the tendency to continue an endeavor once an investment has been made." },
    { slug: "systems-thinking", title: "Systems Thinking", description: "Understand how parts interrelate in a whole system.", category: "mental-model", content: "Systems thinking is a holistic approach to analysis that focuses on how parts interrelate." },
    { slug: "two-system", title: "Two Systems Theory", description: "Fast, intuitive vs. slow, deliberate thinking.", category: "psychology", content: "Two Systems Theory describes System 1 (fast, intuitive) and System 2 (slow, deliberate)." },
    { slug: "zero-sum", title: "Zero-Sum Game", description: "One person's gain is another's loss.", category: "game-theory", content: "A zero-sum game is where one participant's gain is exactly balanced by another's loss." },
    { slug: "antifragile", title: "Antifragile", description: "Systems that improve with disorder and stress.", category: "resilience", content: "Antifragile describes things that gain from disorder. Like the immune system." },
    { slug: "baader-meinhof", title: "Baader-Meinhof Phenomenon", description: "Learning something new makes you see it everywhere.", category: "psychology", content: "The Baader-Meinhof phenomenon is when you learn something new and then see it everywhere." },
    { slug: "black-swan", title: "Black Swan Events", description: "Rare, unpredictable events with massive impact.", category: "risk", content: "A Black Swan event is an unpredictable event that has massive consequences." },
    { slug: "diminishing-returns", title: "Law of Diminishing Returns", description: "After a point, each additional unit yields less benefit.", category: "economics", content: "The law of diminishing returns states that adding more of one factor will at some point yield lower returns." },
    { slug: "goodharts-law", title: "Goodhart's Law", description: "When a measure becomes a target, it ceases to be useful.", category: "economics", content: "Goodhart's Law states that when a measure becomes a target, it ceases to be a good measure." },
    { slug: "hanlons-razor", title: "Hanlon's Razor", description: "Never attribute to malice what can be explained by stupidity.", category: "logic", content: "Hanlon's Razor suggests we should not attribute to malice what can be explained by ignorance." },
    { slug: "survivorship-bias", title: "Survivorship Bias", description: "Focusing on successes while ignoring failures.", category: "cognitive-bias", content: "Survivorship bias is concentrating on survivors and overlooking those that didn't make it." },
    { slug: "mindfulness-basics", title: "Mindfulness Basics", description: "Training your brain to be present and focused.", category: "wellbeing", content: "Mindfulness is the practice of paying attention to the present moment without judgment." },
    { slug: "cognitive-restructuring", title: "Cognitive Restructuring", description: "Changing negative thought patterns to improve mental health.", category: "wellbeing", content: "Cognitive restructuring involves identifying and challenging irrational thoughts." },
    { slug: "deliberate-practice", title: "Deliberate Practice", description: "The science of becoming an expert at anything.", category: "focus", content: "Deliberate practice is structured skill improvement with focused, repetitive practice and immediate feedback." },
    { slug: "monk-mode", title: "Monk Mode", description: "Radical focus by eliminating all distractions for a set period.", category: "focus", content: "Monk mode is an extreme productivity strategy where you eliminate all non-essential activities." },
    { slug: "divergent-thinking", title: "Divergent Thinking", description: "Generating creative ideas by exploring many possible solutions.", category: "creativity", content: "Divergent thinking explores many possible solutions. Convergent thinking narrows down." },
    { slug: "lateral-thinking", title: "Lateral Thinking", description: "Solving problems through an indirect and creative approach.", category: "creativity", content: "Lateral thinking solves problems using an indirect and creative approach." },
    { slug: "learning-how-to-learn", title: "Learning How to Learn", description: "Meta-learning strategies to accelerate your skill acquisition.", category: "learning", content: "Learning how to learn is the ultimate meta-skill using spaced repetition and active recall." },
    { slug: "spaced-repetition", title: "Spaced Repetition", description: "Optimizing memory retention through strategic review intervals.", category: "learning", content: "Spaced repetition involves reviewing information at increasing intervals over time." },
    { slug: "decision-matrix", title: "Decision Matrix", description: "A framework for making rational choices under uncertainty.", category: "clarity", content: "A decision matrix helps you evaluate options by scoring them against weighted criteria." },
    { slug: "inversion-thinking", title: "Inversion Thinking", description: "Solving problems backward by considering the opposite.", category: "clarity", content: "Inversion involves looking at a problem from the opposite direction." },
    { slug: "habit-stacking", title: "Habit Stacking", description: "Building new habits by linking them to existing routines.", category: "habit", content: "Habit stacking pairs a new habit with an existing one." },
    { slug: "identity-based-habits", title: "Identity-Based Habits", description: "Lasting behavior change by shifting your self-identity.", category: "habit", content: "Focus on who you want to become, not what you want to achieve." },
    { slug: "first-principles-problem", title: "First Principles Problem Solving", description: "Breaking down complex problems into basic elements.", category: "problem-solving", content: "First principles thinking breaks down problems into fundamental truths." },
    { slug: "blue-ocean", title: "Blue Ocean Strategy", description: "Creating uncontested market space instead of competing.", category: "strategy", content: "Blue Ocean Strategy creates new market space rather than competing in existing ones." },
    { slug: "stoic-morning", title: "Stoic Morning Routine", description: "Starting your day with ancient wisdom for modern resilience.", category: "stoicism", content: "A Stoic morning involves waking early and reflecting on what you can control." },
    { slug: "memento-mori", title: "Memento Mori", description: "Remembering your mortality to live a more meaningful life.", category: "stoicism", content: "Memento Mori is the practice of reflecting on one's own mortality." },
    { slug: "winner-effect", title: "Winner Effect", description: "How winning changes your brain chemistry for future success.", category: "success", content: "The winner effect increases the likelihood of winning future competitions." },
    { slug: "ikigai", title: "Ikigai", description: "Finding your reason for being, Japanese philosophy style.", category: "success", content: "Ikigai is the Japanese concept of 'reason for being.'" },
    { slug: "triz", title: "TRIZ Method", description: "Systematic problem-solving based on patterns of invention.", category: "problem-solving", content: "TRIZ is a problem-solving methodology based on patterns of invention." },
    { slug: "priming-effect", title: "Priming Effect", description: "How subtle cues unconsciously influence your behavior.", category: "psychology", content: "The priming effect occurs when exposure to one stimulus influences response to another." },
    { slug: "halo-effect", title: "Halo Effect", description: "How one positive trait influences perception of everything else.", category: "psychology", content: "The halo effect is a cognitive bias where overall impression influences specific traits." },
    { slug: "prisoners-dilemma", title: "Prisoner's Dilemma", description: "Why cooperation is hard even when it benefits everyone.", category: "game-theory", content: "The prisoner's dilemma shows why rational individuals might not cooperate." },
    { slug: "post-traumatic-growth", title: "Post-Traumatic Growth", description: "How adversity can lead to profound personal development.", category: "resilience", content: "Post-traumatic growth refers to positive psychological change from struggling with challenges." },
    { slug: "risk-reward", title: "Risk-Reward Ratio", description: "Calculating whether a bet is worth taking.", category: "risk", content: "The risk-reward ratio measures potential loss vs potential gain." },
    { slug: "network-effects-business", title: "Network Effects in Business", description: "How platforms become more valuable as more people use them.", category: "business", content: "Network effects occur when a product becomes more valuable as more people use it." },
    { slug: "moats", title: "Economic Moats", description: "Sustainable competitive advantages that protect a business.", category: "business", content: "An economic moat refers to a business's ability to maintain competitive advantages." },
    { slug: "decoupling", title: "Decoupling Decisions", description: "Separating the decision from the outcome to think clearly.", category: "decision-making", content: "Decoupling separates the quality of a decision from its outcome." },
    { slug: "ladder-inference", title: "Ladder of Inference", description: "How your brain jumps from data to conclusions automatically.", category: "mental-model", content: "The ladder of inference describes mental steps from observing to taking action." },
    { slug: "burdens-proof", title: "Burden of Proof", description: "Understanding who is responsible for proving a claim.", category: "logic", content: "The burden of proof is the obligation to provide sufficient evidence." },
    { slug: "emotional-regulation", title: "Emotional Regulation", description: "Managing your emotions for better decision-making.", category: "wellbeing", content: "Emotional regulation is the ability to manage your emotional state." },
    { slug: "kaizen", title: "Kaizen", description: "Continuous improvement through small daily changes.", category: "success", content: "Kaizen is the Japanese philosophy of continuous improvement through small changes." },
    { slug: "amor-fati", title: "Amor Fati", description: "Loving everything that happens, including adversity.", category: "stoicism", content: "Amor Fati is the Stoic concept of 'love of fate.'" },
    { slug: "five-whys", title: "Five Whys", description: "Getting to the root cause by asking why five times.", category: "problem-solving", content: "The Five Whys is a root cause analysis technique." },
    { slug: "active-recall", title: "Active Recall", description: "Testing yourself to dramatically improve retention.", category: "learning", content: "Active recall is retrieving information from memory rather than passive review." },
    { slug: "implementation-intention", title: "Implementation Intention", description: "Using if-then plans to lock in new habits.", category: "habit", content: "Implementation intentions are if-then plans that automate decision-making." },
    { slug: "chicken-game", title: "Chicken Game", description: "The high-stakes game of mutual escalation.", category: "game-theory", content: "The chicken game models conflict where two parties engage in risky escalation." },
    { slug: "hyperfocus", title: "Hyperfocus", description: "Harnessing attention for deep productivity.", category: "focus", content: "Hyperfocus is intense concentration where time disappears and productivity soars." },
    { slug: "brainwriting", title: "Brainwriting", description: "Generating ideas in silence before group discussion.", category: "creativity", content: "Brainwriting is generating ideas independently before sharing with the group." },
    { slug: "anchoring-bias", title: "Anchoring Bias", description: "How first impressions distort your judgment.", category: "cognitive-bias", content: "Anchoring bias is relying too heavily on the first piece of information." },
    { slug: "second-order-thinking", title: "Second-Order Thinking", description: "Thinking about the consequences of consequences.", category: "clarity", content: "Second-order thinking considers the downstream effects of decisions." },
    { slug: "flywheel-effect", title: "Flywheel Effect", description: "How small efforts compound into massive momentum.", category: "business", content: "The flywheel effect describes how small efforts build momentum over time." },
    { slug: "mental-simulation", title: "Mental Simulation", description: "Running scenarios in your head to prepare for reality.", category: "mental-model", content: "Mental simulation involves running through scenarios in your mind." },
    { slug: "straw-man", title: "Straw Man Fallacy", description: "Misrepresenting an argument to make it easier to attack.", category: "logic", content: "The straw man fallacy involves distorting an opponent's argument." },
    { slug: "gtd-method", title: "GTD Method", description: "Getting things done through systematic organization.", category: "productivity", content: "Getting Things Done (GTD) is based on the principle that your mind is for having ideas." },
    { slug: "tragedy-commons", title: "Tragedy of the Commons", description: "How shared resources get depleted when everyone acts in self-interest.", category: "game-theory", content: "The tragedy of the commons describes depletion of shared resources through self-interest." },
    { slug: "grey-swan", title: "Grey Swan Events", description: "Predictable yet ignored high-impact events.", category: "risk", content: "A grey swan is a potentially significant event whose possibility can be predicted." },
    { slug: "emotional-immunity", title: "Emotional Immunity", description: "Building psychological resilience against daily stressors.", category: "resilience", content: "Emotional immunity is building mental defenses against daily stressors." },
    { slug: "fixed-vs-growth", title: "Fixed vs Growth Mindset", description: "How your beliefs about intelligence shape your potential.", category: "mindset", content: "Carol Dweck's research shows how beliefs about abilities shape potential." },
  ];

  // Insert full modules
  for (const mod of modulesData) {
    const uniqueNodes = makeNodes(mod.slug, mod.nodes);
    const uniqueEdges = makeEdges(mod.slug, mod.edges);
    const created = await prisma.module.create({
      data: {
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        category: mod.category,
        content: mod.content,
        nodes: {
          create: uniqueNodes.map((n) => ({
            id: n.id,
            positionX: n.positionX,
            positionY: n.positionY,
            label: n.label,
          })),
        },
        edges: {
          create: uniqueEdges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label || null,
          })),
        },
        questions: {
          create: mod.questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
        },
      },
    });
    console.log(`  Created module: ${created.slug} (${created.id})`);
  }

  // Insert stub modules
  for (const mod of stubModules) {
    const created = await prisma.module.create({
      data: {
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        category: mod.category,
        content: mod.content,
      },
    });
    console.log(`  Created module: ${created.slug}`);
  }

  console.log(`Total modules created: ${modulesData.length + stubModules.length}`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
