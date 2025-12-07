function HowToUse({ onBackToDashboard }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-r7-blue mb-2">
                📖 How to Use the R7 NEPQ Dialer
              </h1>
              <p className="text-gray-600">
                A simple guide to help you get the most out of your calling system
              </p>
            </div>
            <button
              onClick={onBackToDashboard}
              className="btn-secondary"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* What is this? */}
          <div className="card bg-white">
            <h2 className="text-2xl font-bold text-r7-blue mb-4">
              🎯 What is This App?
            </h2>
            <p className="text-gray-700 mb-4">
              The R7 NEPQ Dialer is your personal sales calling assistant. It helps you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Keep track of all your prospects in one place</li>
              <li>Make calls systematically without losing your place</li>
              <li>Log every conversation with notes and outcomes</li>
              <li>Track your progress using the proven NEPQ sales methodology</li>
              <li>See which approaches are working with built-in analytics</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Think of it as your calling notebook, tracker, and coach all in one.
            </p>
          </div>

          {/* Getting Started */}
          <div className="card bg-white">
            <h2 className="text-2xl font-bold text-r7-blue mb-4">
              🚀 Getting Started: Import Your Contacts
            </h2>
            <p className="text-gray-700 mb-4">
              First, you need to add contacts to call. The easiest way is to import them from a spreadsheet:
            </p>

            <div className="bg-blue-50 border-l-4 border-r7-blue p-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-2">Step 1: Prepare Your Spreadsheet</h3>
              <p className="text-gray-700 mb-2">Create a CSV file with these columns:</p>
              <div className="bg-white p-3 rounded font-mono text-sm">
                Company Name, Phone, Website, Industry, Company Size
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Example: "ABC Manufacturing, (555) 123-4567, https://abc.com, Manufacturing, 50-200"
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-r7-blue p-4">
              <h3 className="font-bold text-gray-800 mb-2">Step 2: Import to Dialer</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
                <li>Go to the Dashboard</li>
                <li>Click the "Import CSV" button</li>
                <li>Select your CSV file</li>
                <li>Your contacts will load automatically!</li>
              </ol>
            </div>

            <p className="text-gray-600 text-sm mt-4">
              💡 Tip: You can also add contacts one at a time by clicking "Add Contact" in the Contacts page.
            </p>
          </div>

          {/* Making Calls */}
          <div className="card bg-white">
            <h2 className="text-2xl font-bold text-r7-blue mb-4">
              📞 Making Calls: Your Daily Workflow
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-gray-800 mb-2">1. Click "Start Calling"</h3>
                <p className="text-gray-700">
                  The app will show you the next contact to call. You'll see their company info,
                  phone number, and any notes from previous calls.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-gray-800 mb-2">2. Dial the Number</h3>
                <p className="text-gray-700">
                  Click the phone number to dial (if on mobile) or use your desk phone.
                  Make your pitch!
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-gray-800 mb-2">3. Log the Outcome</h3>
                <p className="text-gray-700 mb-2">After each call, tell the app what happened:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 text-sm">
                  <li><strong>No Answer</strong> - Went to voicemail or just rang</li>
                  <li><strong>Gatekeeper</strong> - Spoke with receptionist or assistant</li>
                  <li><strong>Decision Maker</strong> - Got through to the person who can say yes!</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-gray-800 mb-2">4. Choose an OK Code</h3>
                <p className="text-gray-700 mb-2">
                  Pick the code that best describes what happened:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <strong>OK-01:</strong> Interested - Follow Up
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <strong>OK-02:</strong> Not Interested - Budget
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <strong>OK-07:</strong> Callback Requested
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <strong>OK-11:</strong> Meeting Scheduled!
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  (There are 12 codes total - they help you categorize and track patterns)
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-gray-800 mb-2">5. Add Notes</h3>
                <p className="text-gray-700">
                  Write down key details: what you discussed, objections they raised,
                  next steps, or anything to remember for the next call.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-gray-800 mb-2">6. Click "Save & Next"</h3>
                <p className="text-gray-700">
                  The app automatically moves you to the next contact. Keep the momentum going!
                </p>
              </div>
            </div>
          </div>

          {/* Understanding NEPQ */}
          <div className="card bg-white">
            <h2 className="text-2xl font-bold text-r7-blue mb-4">
              🧠 Understanding NEPQ: The Sales Framework
            </h2>

            <p className="text-gray-700 mb-4">
              NEPQ stands for <strong>Neuro-Emotional Persuasion Questioning</strong>.
              It's a proven sales methodology that helps you guide conversations naturally
              from small talk to signed deals. The app tracks where you are in this journey with each prospect.
            </p>

            <h3 className="font-bold text-gray-800 mb-3">The 7 Phases of NEPQ:</h3>

            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center mb-1">
                  <span className="text-2xl mr-2">🤝</span>
                  <h4 className="font-bold text-gray-800">1. Connection</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Build rapport. Get them comfortable talking to you.
                  <em className="block text-gray-600 mt-1">Ask: "What made you take my call today?"</em>
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center mb-1">
                  <span className="text-2xl mr-2">📋</span>
                  <h4 className="font-bold text-gray-800">2. Situation</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Understand their current state. What are they doing now?
                  <em className="block text-gray-600 mt-1">Ask: "How are you currently handling [their problem]?"</em>
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center mb-1">
                  <span className="text-2xl mr-2">🔍</span>
                  <h4 className="font-bold text-gray-800">3. Problem Awareness</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  <strong>This is where the magic happens!</strong> Help them see the real cost of their problems.
                  <em className="block text-gray-600 mt-1">Ask: "How is that affecting your bottom line?"</em>
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center mb-1">
                  <span className="text-2xl mr-2">💡</span>
                  <h4 className="font-bold text-gray-800">4. Solution Awareness</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  What would their ideal solution look like?
                  <em className="block text-gray-600 mt-1">Ask: "What would this mean for you personally if it was solved?"</em>
                </p>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center mb-1">
                  <span className="text-2xl mr-2">⚠️</span>
                  <h4 className="font-bold text-gray-800">5. Consequence</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  What happens if they don't solve this problem?
                  <em className="block text-gray-600 mt-1">Ask: "What if this continues for another 6 months?"</em>
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center mb-1">
                  <span className="text-2xl mr-2">🤝</span>
                  <h4 className="font-bold text-gray-800">6. Commitment</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Get their agreement to move forward.
                  <em className="block text-gray-600 mt-1">Ask: "Does it make sense to explore this further?"</em>
                </p>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 rounded-lg border-l-4 border-indigo-500">
                <div className="flex items-center mb-1">
                  <span className="text-2xl mr-2">📊</span>
                  <h4 className="font-bold text-gray-800">7. Presentation</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Now you present your solution (demo, proposal, etc.) based on everything you learned.
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
              <p className="text-gray-700">
                <strong>💡 Key Insight:</strong> Most salespeople jump straight to Presentation.
                NEPQ teaches you to slow down and really understand the problem first.
                When you do, closing becomes natural.
              </p>
            </div>
          </div>

          {/* Problem Levels */}
          <div className="card bg-white">
            <h2 className="text-2xl font-bold text-r7-blue mb-4">
              🎚️ The 4 Problem Levels
            </h2>

            <p className="text-gray-700 mb-4">
              During the <strong>Problem Awareness</strong> phase, your goal is to dig deeper.
              The app tracks how deep you've gone with each prospect using 4 levels:
            </p>

            <div className="space-y-3">
              <div className="flex items-start bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                <span className="text-2xl mr-3">🔵</span>
                <div>
                  <h4 className="font-bold text-gray-800">Level 1: Obvious (Surface Wants)</h4>
                  <p className="text-gray-700 text-sm">
                    "We want faster processing" or "We don't want downtime"
                  </p>
                  <p className="text-gray-600 text-xs italic mt-1">
                    This is surface-level. Everyone wants this. Not compelling yet.
                  </p>
                </div>
              </div>

              <div className="flex items-start bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                <span className="text-2xl mr-3">🟢</span>
                <div>
                  <h4 className="font-bold text-gray-800">Level 2: Common (Lack of Something)</h4>
                  <p className="text-gray-700 text-sm">
                    "We're missing real-time data" or "We don't have a good process for this"
                  </p>
                  <p className="text-gray-600 text-xs italic mt-1">
                    Getting warmer. Now they're identifying gaps.
                  </p>
                </div>
              </div>

              <div className="flex items-start bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                <span className="text-2xl mr-3">🟡</span>
                <div>
                  <h4 className="font-bold text-gray-800">Level 3: Specific (Quantified Impact)</h4>
                  <p className="text-gray-700 text-sm">
                    "This costs us $50K per year" or "We waste 10 hours every week on this"
                  </p>
                  <p className="text-gray-600 text-xs italic mt-1">
                    <strong>Now we're talking!</strong> When they put a number on it, it becomes real.
                  </p>
                </div>
              </div>

              <div className="flex items-start bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                <span className="text-2xl mr-3">🔴</span>
                <div>
                  <h4 className="font-bold text-gray-800">Level 4: Mission Critical (Cost of Inaction)</h4>
                  <p className="text-gray-700 text-sm">
                    "If we don't fix this, we'll lose our biggest client" or "Our competitors are eating our lunch"
                  </p>
                  <p className="text-gray-600 text-xs italic mt-1">
                    <strong>Jackpot!</strong> This is urgent. They NEED a solution now.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-4">
              <p className="text-gray-700">
                <strong>🎯 Your Goal:</strong> Get every prospect to Level 3 or 4.
                The deeper the problem, the easier the close. The app tracks this automatically
                when you log Decision Maker calls.
              </p>
            </div>
          </div>

          {/* Using Analytics */}
          <div className="card bg-white">
            <h2 className="text-2xl font-bold text-r7-blue mb-4">
              📊 Using Analytics to Improve
            </h2>

            <p className="text-gray-700 mb-4">
              Click "Analytics" from the Dashboard to see your performance. Here's what to look for:
            </p>

            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-bold text-gray-800 mb-1">NEPQ Funnel</h4>
                <p className="text-gray-700 text-sm">
                  Shows how many contacts are at each phase. Are most stuck at Connection?
                  You need better hooks. Are they dropping off at Problem Awareness?
                  You need to dig deeper with better questions.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-bold text-gray-800 mb-1">Problem Discovery Depth</h4>
                <p className="text-gray-700 text-sm">
                  How many prospects reached Level 3 or 4 problems? Aim for 40%+ at Level 3-4.
                  If you're stuck at Level 1-2, you're not asking deep enough questions.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-bold text-gray-800 mb-1">OK Code Distribution</h4>
                <p className="text-gray-700 text-sm">
                  See which outcomes are most common. Lots of "Not Interested - No Need"?
                  Your targeting might be off. Lots of gatekeepers? Work on your hook.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-bold text-gray-800 mb-1">Avatar Performance</h4>
                <p className="text-gray-700 text-sm">
                  If you've set up buyer personas (Avatars), see which ones convert best.
                  Double down on what's working!
                </p>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="card bg-gradient-to-r from-r7-blue to-indigo-600 text-white">
            <h2 className="text-2xl font-bold mb-4">
              💡 Pro Tips for Success
            </h2>

            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <strong>Consistency beats intensity.</strong> Make 20 calls every day rather than
                  100 calls once a week. The app makes it easy to pick up where you left off.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <strong>Take good notes.</strong> Your future self will thank you. Write down
                  what questions worked, objections they raised, and what to focus on next call.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <strong>Don't skip the NEPQ tracking.</strong> Yes, it takes an extra 30 seconds.
                  But it's what separates amateurs from pros. Track which phase you reached and
                  what problems you discovered.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <strong>Review your analytics weekly.</strong> What's working? What's not?
                  Adjust your approach based on the data, not your gut.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <strong>Use the Question Suggester.</strong> When you're on a Decision Maker call,
                  the app shows relevant questions based on where you are in NEPQ. Use them!
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <strong>Export your data regularly.</strong> Back up your contacts by clicking
                  "Export to CSV" every week. Better safe than sorry!
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Reference */}
          <div className="card bg-white">
            <h2 className="text-2xl font-bold text-r7-blue mb-4">
              📝 Quick Reference Card
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">Call Outcomes</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li><strong>NA:</strong> No Answer</li>
                  <li><strong>GK:</strong> Gatekeeper</li>
                  <li><strong>DM:</strong> Decision Maker</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">Top OK Codes</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li><strong>OK-01:</strong> Interested - Follow Up</li>
                  <li><strong>OK-07:</strong> Callback Requested</li>
                  <li><strong>OK-11:</strong> Meeting Scheduled</li>
                  <li><strong>OK-12:</strong> Qualified Lead - Hot</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">NEPQ Phases (Order)</h4>
                <ol className="text-sm space-y-1 text-gray-700 list-decimal list-inside">
                  <li>Connection</li>
                  <li>Situation</li>
                  <li>Problem Awareness</li>
                  <li>Solution Awareness</li>
                  <li>Consequence</li>
                  <li>Commitment</li>
                  <li>Presentation</li>
                </ol>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">Problem Levels</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li><strong>L1:</strong> Wants/Not Wants</li>
                  <li><strong>L2:</strong> Lack of...</li>
                  <li><strong>L3:</strong> Quantified Impact</li>
                  <li><strong>L4:</strong> Cost of Inaction</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="card bg-gradient-to-r from-r7-red to-red-600 text-white text-center py-8">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Calling? 🚀
            </h2>
            <p className="text-lg mb-6">
              You've got the knowledge. Now go make it happen!
            </p>
            <button
              onClick={onBackToDashboard}
              className="bg-white text-r7-red px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Back to Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowToUse;
