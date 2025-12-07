// NEPQ Question Library Seed Data
// Based on Jeremy Miner's 7th Level NEPQ Methodology

export const SEED_QUESTIONS = [
  // ===== CONNECTION PHASE =====
  {
    text: "Hi [Name], this is [Your Name] with [Company]. How are you doing today?",
    phase: "connection",
    category: "opening",
    tags: ["greeting", "opener"],
    notes: "Standard opening - warm and conversational"
  },
  {
    text: "I know you're probably busy, so I appreciate you taking my call. How's your day going so far?",
    phase: "connection",
    category: "opening",
    tags: ["empathy", "busy-person"],
    notes: "Acknowledges their time - builds rapport"
  },
  {
    text: "Real quick - I know you probably get a lot of calls. Before we dive in, is this still a good time to chat for a few minutes?",
    phase: "connection",
    category: "opening",
    tags: ["permission", "respect"],
    notes: "Asks permission - shows respect for their time"
  },
  {
    text: "Just so you know where I'm coming from - I work with companies in [industry] to help with [general benefit]. Does that make sense?",
    phase: "connection",
    category: "discovery",
    tags: ["positioning", "credibility"],
    notes: "Establishes credibility without pitching"
  },
  {
    text: "I'm curious - how long have you been with [Company]?",
    phase: "connection",
    category: "discovery",
    tags: ["rapport", "background"],
    notes: "Simple rapport-building question"
  },
  {
    text: "What's your role there? What do you focus on day-to-day?",
    phase: "connection",
    category: "discovery",
    tags: ["role", "responsibilities"],
    notes: "Understand their position and responsibilities"
  },

  // ===== SITUATION PHASE =====
  {
    text: "Can you walk me through how you're currently handling [specific process/area]?",
    phase: "situation",
    category: "discovery",
    tags: ["current-state", "process"],
    notes: "Understand current situation"
  },
  {
    text: "What does your current setup look like for [specific area]?",
    phase: "situation",
    category: "discovery",
    tags: ["current-state", "infrastructure"],
    notes: "Get details on their current situation"
  },
  {
    text: "How long have you been doing it that way?",
    phase: "situation",
    category: "discovery",
    tags: ["timeline", "status-quo"],
    notes: "Understand duration of current state"
  },
  {
    text: "Who all is involved in [process/decision]?",
    phase: "situation",
    category: "discovery",
    tags: ["stakeholders", "team"],
    notes: "Identify all stakeholders"
  },
  {
    text: "What made you decide to go with that approach originally?",
    phase: "situation",
    category: "discovery",
    tags: ["history", "decision-making"],
    notes: "Understand past decision-making"
  },
  {
    text: "How's that been working out for you so far?",
    phase: "situation",
    category: "discovery",
    tags: ["satisfaction", "performance"],
    notes: "Open-ended - lets them share challenges"
  },

  // ===== PROBLEM AWARENESS PHASE =====

  // Level 1: Obvious (Wants/Not Wants)
  {
    text: "What would you say you're looking for when it comes to [area]?",
    phase: "problem-awareness",
    problemLevel: 1,
    category: "discovery",
    tags: ["wants", "L1"],
    notes: "Surface-level wants"
  },
  {
    text: "What don't you like about your current situation?",
    phase: "problem-awareness",
    problemLevel: 1,
    category: "discovery",
    tags: ["pain-points", "L1"],
    notes: "Simple pain identification"
  },
  {
    text: "If you could wave a magic wand, what would you want to improve?",
    phase: "problem-awareness",
    problemLevel: 1,
    category: "discovery",
    tags: ["ideal-state", "L1"],
    notes: "Dream scenario - reveals wants"
  },

  // Level 2: Common (Lack of...)
  {
    text: "What are you lacking right now that's making this challenging?",
    phase: "problem-awareness",
    problemLevel: 2,
    category: "discovery",
    tags: ["gaps", "L2"],
    notes: "Identify specific gaps"
  },
  {
    text: "What capabilities do you feel you're missing?",
    phase: "problem-awareness",
    problemLevel: 2,
    category: "discovery",
    tags: ["capabilities", "L2"],
    notes: "Functional gaps"
  },
  {
    text: "What's preventing you from achieving [desired outcome]?",
    phase: "problem-awareness",
    problemLevel: 2,
    category: "discovery",
    tags: ["obstacles", "L2"],
    notes: "Identify blockers"
  },
  {
    text: "How is that lack of [capability/resource] affecting your team?",
    phase: "problem-awareness",
    problemLevel: 2,
    category: "discovery",
    tags: ["impact", "L2"],
    notes: "Explore team impact"
  },

  // Level 3: Specific (Quantified Impact)
  {
    text: "Can you quantify that for me? What does that actually cost you?",
    phase: "problem-awareness",
    problemLevel: 3,
    category: "discovery",
    tags: ["quantify", "L3"],
    notes: "Get specific numbers"
  },
  {
    text: "How much time are you losing on [problem] each week?",
    phase: "problem-awareness",
    problemLevel: 3,
    category: "discovery",
    tags: ["time-cost", "L3"],
    notes: "Quantify time investment"
  },
  {
    text: "What's the dollar impact of [problem] on your bottom line?",
    phase: "problem-awareness",
    problemLevel: 3,
    category: "discovery",
    tags: ["financial-impact", "L3"],
    notes: "Direct financial impact"
  },
  {
    text: "How many deals/opportunities are you missing because of this?",
    phase: "problem-awareness",
    problemLevel: 3,
    category: "discovery",
    tags: ["opportunity-cost", "L3"],
    notes: "Lost opportunity quantification"
  },
  {
    text: "What percentage of your [time/budget/resources] is being wasted on this?",
    phase: "problem-awareness",
    problemLevel: 3,
    category: "discovery",
    tags: ["waste", "L3"],
    notes: "Percentage-based quantification"
  },

  // Level 4: Mission Critical (Cost of Inaction)
  {
    text: "What happens if this doesn't get fixed in the next [timeframe]?",
    phase: "problem-awareness",
    problemLevel: 4,
    category: "discovery",
    tags: ["urgency", "L4"],
    notes: "Future consequences"
  },
  {
    text: "How does this affect your ability to hit your annual goals?",
    phase: "problem-awareness",
    problemLevel: 4,
    category: "discovery",
    tags: ["strategic-impact", "L4"],
    notes: "Strategic business impact"
  },
  {
    text: "What's at stake personally for you if this continues?",
    phase: "problem-awareness",
    problemLevel: 4,
    category: "discovery",
    tags: ["personal-stakes", "L4"],
    notes: "Personal consequences"
  },
  {
    text: "If you don't solve this, what does that mean for your competitive position?",
    phase: "problem-awareness",
    problemLevel: 4,
    category: "discovery",
    tags: ["competitive-risk", "L4"],
    notes: "Competitive implications"
  },
  {
    text: "What are the ripple effects of not addressing this now?",
    phase: "problem-awareness",
    problemLevel: 4,
    category: "discovery",
    tags: ["cascading-impact", "L4"],
    notes: "Broader organizational impact"
  },
  {
    text: "How is this affecting your team's morale and retention?",
    phase: "problem-awareness",
    problemLevel: 4,
    category: "discovery",
    tags: ["culture-impact", "L4"],
    notes: "Human capital consequences"
  },

  // ===== SOLUTION AWARENESS PHASE =====
  {
    text: "Have you looked into solutions for this before?",
    phase: "solution-awareness",
    category: "discovery",
    tags: ["past-attempts", "research"],
    notes: "Understand past solution exploration"
  },
  {
    text: "What have you tried so far to fix this?",
    phase: "solution-awareness",
    category: "discovery",
    tags: ["attempts", "history"],
    notes: "Learn from past attempts"
  },
  {
    text: "Why didn't those solutions work out?",
    phase: "solution-awareness",
    category: "discovery",
    tags: ["failures", "lessons"],
    notes: "Understand failure points"
  },
  {
    text: "What would an ideal solution look like for you?",
    phase: "solution-awareness",
    category: "discovery",
    tags: ["requirements", "ideal"],
    notes: "Define solution criteria"
  },
  {
    text: "If you could design the perfect solution, what would it need to do?",
    phase: "solution-awareness",
    category: "discovery",
    tags: ["features", "needs"],
    notes: "Functional requirements"
  },
  {
    text: "What are your must-haves versus nice-to-haves?",
    phase: "solution-awareness",
    category: "discovery",
    tags: ["priorities", "requirements"],
    notes: "Prioritize solution features"
  },
  {
    text: "Who else would need to be involved in evaluating a solution?",
    phase: "solution-awareness",
    category: "discovery",
    tags: ["stakeholders", "decision-process"],
    notes: "Identify buying committee"
  },
  {
    text: "What's your process typically look like for bringing in something new?",
    phase: "solution-awareness",
    category: "discovery",
    tags: ["buying-process", "approval"],
    notes: "Understand buying process"
  },

  // ===== CONSEQUENCE PHASE =====
  {
    text: "So if I'm hearing you right, you're saying that [problem] is costing you [impact]. Is that accurate?",
    phase: "consequence",
    category: "discovery",
    tags: ["summary", "confirmation"],
    notes: "Confirm understanding of consequences"
  },
  {
    text: "Walk me through what happens if nothing changes in the next 6-12 months.",
    phase: "consequence",
    category: "discovery",
    tags: ["future-state", "status-quo"],
    notes: "Paint picture of inaction"
  },
  {
    text: "What does success look like for you in this area?",
    phase: "consequence",
    category: "discovery",
    tags: ["success-criteria", "goals"],
    notes: "Define positive outcome"
  },
  {
    text: "How would solving this change things for you and your team?",
    phase: "consequence",
    category: "discovery",
    tags: ["benefits", "transformation"],
    notes: "Envision positive transformation"
  },
  {
    text: "What would it mean for your business if you could eliminate [problem]?",
    phase: "consequence",
    category: "discovery",
    tags: ["value", "roi"],
    notes: "Calculate positive ROI"
  },
  {
    text: "How would that impact your ability to [achieve goal]?",
    phase: "consequence",
    category: "discovery",
    tags: ["goal-alignment", "strategic"],
    notes: "Connect to strategic objectives"
  },
  {
    text: "What would be different for you personally if this was fixed?",
    phase: "consequence",
    category: "discovery",
    tags: ["personal-benefit", "motivation"],
    notes: "Personal motivation"
  },

  // ===== COMMITMENT PHASE =====
  {
    text: "So based on everything we've discussed, does it make sense to explore this further?",
    phase: "commitment",
    category: "closing",
    tags: ["trial-close", "soft-commit"],
    notes: "Test commitment level"
  },
  {
    text: "What would need to happen for you to move forward with a solution?",
    phase: "commitment",
    category: "closing",
    tags: ["criteria", "decision-factors"],
    notes: "Understand decision criteria"
  },
  {
    text: "If I could show you how to [solve problem], would that be worth a conversation?",
    phase: "commitment",
    category: "closing",
    tags: ["value-prop", "commitment"],
    notes: "Value-based commitment question"
  },
  {
    text: "What's your timeline for addressing this?",
    phase: "commitment",
    category: "closing",
    tags: ["timeline", "urgency"],
    notes: "Establish timeline"
  },
  {
    text: "Who else needs to be part of this conversation going forward?",
    phase: "commitment",
    category: "closing",
    tags: ["stakeholders", "next-steps"],
    notes: "Expand stakeholder involvement"
  },
  {
    text: "What would be the best next step from here?",
    phase: "commitment",
    category: "closing",
    tags: ["next-steps", "process"],
    notes: "Collaborative next step"
  },
  {
    text: "Are you open to seeing how we've helped companies like yours solve [problem]?",
    phase: "commitment",
    category: "closing",
    tags: ["case-study", "proof"],
    notes: "Introduce social proof"
  },
  {
    text: "What questions do you have before we move forward?",
    phase: "commitment",
    category: "closing",
    tags: ["objections", "concerns"],
    notes: "Surface objections"
  },

  // ===== PRESENTATION PHASE =====
  {
    text: "Let me show you how this specifically addresses [their main problem].",
    phase: "presentation",
    category: "closing",
    tags: ["solution", "tailored"],
    notes: "Tailored solution presentation"
  },
  {
    text: "Remember when you mentioned [specific pain point]? Here's exactly how we solve that.",
    phase: "presentation",
    category: "closing",
    tags: ["callback", "personalization"],
    notes: "Reference their specific issues"
  },
  {
    text: "Based on the [quantified impact] you shared, here's what the ROI would look like for you.",
    phase: "presentation",
    category: "closing",
    tags: ["roi", "value"],
    notes: "Present customized ROI"
  },
  {
    text: "What concerns do you have about this approach?",
    phase: "presentation",
    category: "closing",
    tags: ["objections", "concerns"],
    notes: "Proactive objection handling"
  },
  {
    text: "How does this compare to what you were envisioning?",
    phase: "presentation",
    category: "closing",
    tags: ["fit", "expectations"],
    notes: "Check alignment with expectations"
  },
  {
    text: "Does this make sense for your situation?",
    phase: "presentation",
    category: "closing",
    tags: ["fit-check", "understanding"],
    notes: "Confirm understanding and fit"
  },
  {
    text: "What would you like to see happen next?",
    phase: "presentation",
    category: "closing",
    tags: ["next-steps", "close"],
    notes: "Collaborative close"
  },
  {
    text: "Given what you've told me about [their timeline/goals], when would you want to get started?",
    phase: "presentation",
    category: "closing",
    tags: ["timeline", "close"],
    notes: "Assumptive close with their context"
  }
];

// Helper function to seed questions into storage
export const seedQuestions = (bulkImportFunction) => {
  if (typeof bulkImportFunction === 'function') {
    return bulkImportFunction(SEED_QUESTIONS);
  }
  return SEED_QUESTIONS;
};
