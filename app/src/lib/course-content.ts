const storyContent: Record<string, string[]> = {
  "The Fixed vs Growth Mindset Framework": [
    "Imagine two students facing a difficult exam. One thinks, \"I'm just not good at this — I never have been.\" The other thinks, \"This is hard, but if I study differently, I can figure it out.\"",
    "Same situation. Same challenge. Two completely different outcomes. The difference isn't talent, intelligence, or luck — it's mindset.",
    "This framework, pioneered by psychologist Carol Dweck, reveals a truth that changes everything: your beliefs about your own abilities shape what you're capable of achieving. Not your genetics. Not your circumstances. What you believe.",
  ],
  "Core Principles": [
    "At the heart of this idea are two opposing forces living inside every one of us.",
    "The fixed mindset whispers: \"You're either born with it or you're not. Why bother trying if failure might prove you don't have what it takes?\" It protects your ego by keeping you inside what you already know.",
    "The growth mindset answers: \"Every expert was once a beginner. Every failure is data. Every challenge is an opportunity to expand what you're capable of.\"",
    "The research is clear: people who embrace the growth mindset don't just feel better — they achieve more. They recover from setbacks faster. They take on harder challenges. They keep learning long after others have given up.",
  ],
  "Practical Application": [
    "Knowing the theory isn't enough. The real transformation happens when you start applying it to your daily life.",
    "Start by noticing your inner voice. When you catch yourself thinking \"I can't do this,\" add one word: \"yet.\" I can't do this yet. That single shift opens the door from fixed to growth.",
    "Next, change how you talk about your abilities. Instead of \"I'm bad at public speaking,\" say \"I'm working on becoming a better speaker.\" Instead of \"I'm not creative,\" say \"I'm practicing my creative skills.\"",
    "The science behind this is fascinating: your brain forms new neural pathways every time you learn something new. With deliberate practice, you're physically rewiring your brain to get better.",
  ],
  "Common Challenges": [
    "This isn't easy. Your fixed mindset was built over years of experience — it won't disappear overnight.",
    "One of the biggest traps is the \"false growth mindset\" — using the language of growth while avoiding real challenges. Saying \"I love learning!\" while staying safely inside your comfort zone isn't growth. Growth requires discomfort.",
    "Another challenge: comparing your progress to others. Someone else's mastery is just their journey, not evidence of your limitations. The only comparison that matters is you vs. who you were yesterday.",
  ],
  "Results & Mastery": [
    "Here's what happens when the growth mindset becomes your default.",
    "Failure stops being a verdict and starts being feedback. Criticism becomes a gift. Challenges become invitations to grow. The people around you feel your energy — and it's contagious.",
    "You don't just learn more. You become more resilient, more adaptable, and more confident. Not because you suddenly know everything, but because you know you can figure it out.",
    "This isn't about being positive all the time. It's about being honest with yourself and brave enough to keep going. That's the real meaning of growth.",
  ],
  "Info Asymmetry": [
    "Imagine you're buying a used car. The seller knows everything — the hidden engine noise, the occasional rough start, the check engine light that comes and goes. You? You only know what they choose to tell you.",
    "This imbalance of information is called information asymmetry, and it's everywhere. In job interviews, business negotiations, dating, even friendships. One side always knows more than the other.",
    "The question isn't whether information asymmetry exists — it's how you navigate it. Do you trust blindly? Do you assume everyone's hiding something? Or do you learn to read the signals people send, whether they intend to or not?",
  ],
  "Sender Acts": [
    "When someone has more information, they have a choice: share it honestly or exploit it. This act of sending information — whether truthful or deceptive — is called signaling.",
    "Every day, you're both a sender and a receiver of signals. The resume you send, the way you dress for a meeting, the brand of watch you wear, the words you choose. Each one is a signal carrying hidden information about who you are and what you're worth.",
    "But here's the problem: if anyone can send any signal, how do you know which ones to trust? That's where the type of signal matters most.",
  ],
  "Costly Signal": [
    "A costly signal is one that's hard to fake. It requires real investment — time, money, effort, or risk. Think of a peacock's tail: it's heavy, energy-draining, and makes it easier for predators to spot. Why would evolution create such a disadvantage?",
    "Because that's exactly the point. The peacock's tail is so costly that only a genuinely healthy, strong peacock can afford one. The cost makes the signal trustworthy.",
    "In human terms, a costly signal might be spending years earning a degree from a top university, or building a portfolio of real work, or turning down a high-paying job to start your own company. These signals are credible because they require real sacrifice.",
  ],
  "Cheap Signal": [
    "A cheap signal costs little to produce. Anyone can make one, regardless of their actual quality or intentions.",
    "\"I'm the best candidate for this job.\" \"This product will change your life.\" \"Trust me, I know what I'm doing.\" These are cheap signals — just words, easily said, easily faked.",
    "Cheap signals aren't necessarily lies. But because they cost nothing to produce, they tell you almost nothing about the sender's true quality. Smart receivers learn to discount cheap signals and look for costly ones instead.",
  ],
  "Receiver Trust": [
    "When a receiver encounters a costly signal, trust can form. The cost makes it believable. This trust is the foundation of every functional relationship, every successful business, every healthy society.",
    "Think about the last time you hired someone, or bought something expensive, or made a major decision based on someone's advice. What made you trust them? Almost certainly, it was some form of costly signal — a proven track record, a recommendation from someone you trust, a visible sacrifice they made.",
    "Trust built on costly signals is resilient because it's earned. It can't be claimed or demanded. It must be demonstrated through action.",
  ],
  "Receiver Doubt": [
    "But what happens when a receiver can't distinguish between costly and cheap signals? Doubt creeps in. And doubt destroys markets.",
    "This is called the \"lemons problem\" — when buyers can't tell quality products from defective ones, they assume everything is defective and only offer low prices. Good products leave the market, leaving only \"lemons\" behind.",
    "The same dynamic plays out in dating apps, freelance marketplaces, and entry-level job applications. When everyone looks the same on paper, receivers become skeptical. The good ones struggle to stand out, and the market suffers.",
  ],
  "Decision": [
    "Every signal leads to a decision. Trust or doubt. Engage or walk away. Invest or pass.",
    "The art of reading signals isn't about being paranoid — it's about being discerning. Look for costly signals when the stakes are high. Don't be swayed by cheap talk. And when you're the sender, invest in costly signals that genuinely reflect your quality.",
    "Because in the end, the signals you send and the signals you trust shape everything: the opportunities you get, the relationships you build, and the person you become.",
  ],
};

const fallbackIntro = [
  "Let's begin by exploring",
  "Now let's dive deeper into",
  "Building on that, let's look at",
  "Here's where things get interesting —",
  "Next up:",
  "Let's continue with",
];

const fallbackOutro = [
  "Take a moment to reflect on that before moving on.",
  "Keep this in mind as we continue.",
  "This will be important for what comes next.",
];

function matchLabel(label: string): string[] | null {
  for (const [key, value] of Object.entries(storyContent)) {
    if (label.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(label.toLowerCase())) {
      return value;
    }
  }
  return null;
}

export function getNodeContent(label: string, description: string, index: number, total: number): string[] {
  const matched = matchLabel(label);
  if (matched) return matched;

  const lines: string[] = [];
  const intro = fallbackIntro[index % fallbackIntro.length];
  lines.push(`${intro} "${label}". ${description}`);
  if (index < total - 1) {
    lines.push(fallbackOutro[index % fallbackOutro.length]);
  }
  return lines;
}

export function getFullText(nodes: any[]): string {
  return nodes
    .map((n: any, i: number) => {
      const label = n.data?.label || "";
      const desc = n.data?.description || "";
      return getNodeContent(label, desc, i, nodes.length).join(" ");
    })
    .join(" ");
}

export function getNodeLabels(nodes: any[]): string[] {
  return nodes.map((n: any) => n.data?.label || "Untitled");
}

export interface Slide {
  nodeId: string;
  nodeLabel: string;
  nodeIndex: number;
  slideIndex: number;
  totalSlidesInNode: number;
  content: string;
}

export function getSlides(nodes: any[]): Slide[] {
  const slides: Slide[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const label = n.data?.label || "";
    const desc = n.data?.description || "";
    const paragraphs = getNodeContent(label, desc, i, nodes.length);
    paragraphs.forEach((p, pi) => {
      slides.push({
        nodeId: n.id,
        nodeLabel: label,
        nodeIndex: i,
        slideIndex: pi,
        totalSlidesInNode: paragraphs.length,
        content: p,
      });
    });
  }
  return slides;
}
