function HowToUse({ onBackToDashboard }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-r7-light to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-r7-blue mb-2">
                📖 How to Use R7 Creative Dialer
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
              R7 Creative Dialer is your personal sales calling assistant. It helps you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Keep track of all your prospects in one place</li>
              <li>Make calls systematically without losing your place</li>
              <li>Log every conversation with notes and outcomes</li>
              <li>Track your progress with built-in analytics</li>
              <li>See which approaches are working</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Think of it as your calling notebook, tracker, and coach all in one.
            </p>
          </div>

          {/* Getting Started */}
          <div className="card bg-white">
            <h2 className="text-2xl font-bold text-r7-blue mb-4">
              🚀 Getting Started
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Import Your Contacts</h3>
                <p className="text-gray-700">
                  Click <span className="font-semibold text-r7-blue">"Import CSV"</span> on the dashboard to upload your contact list.
                  Make sure your CSV has columns for: Company Name, Phone, Website, Industry, and Company Size.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Create Avatars (Optional)</h3>
                <p className="text-gray-700">
                  Define buyer personas or ideal customer profiles to organize your contacts. This helps you tailor
                  your approach for different types of prospects.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Start Calling</h3>
                <p className="text-gray-700">
                  Click <span className="font-semibold text-r7-blue">"Start Calling"</span> to begin your session.
                  The system will guide you through each contact one by one.
                </p>
              </div>
            </div>
          </div>

          {/* During a Call */}
          <div className="card bg-white">
            <h2 className="text-2xl font-bold text-r7-blue mb-4">
              📞 During a Call
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 1: Select Call Outcome</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>NA (No Answer):</strong> Voicemail, busy, or no response</li>
                  <li><strong>GK (Gatekeeper):</strong> Reached a receptionist or assistant</li>
                  <li><strong>DM (Decision Maker):</strong> Spoke directly with the prospect</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 2: Choose an OK Code</h3>
                <p className="text-gray-700 mb-2">
                  Select the code that best describes the call outcome:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <div><span className="font-semibold">OK-01:</span> Interested - Follow Up</div>
                  <div><span className="font-semibold">OK-02:</span> Not Interested</div>
                  <div><span className="font-semibold">OK-03:</span> Wrong Contact</div>
                  <div><span className="font-semibold">OK-04:</span> Do Not Call</div>
                  <div><span className="font-semibold">OK-05:</span> Callback Requested</div>
                  <div><span className="font-semibold">OK-06:</span> Gatekeeper Block</div>
                  <div><span className="font-semibold">OK-07:</span> Voicemail - Left Message</div>
                  <div><span className="font-semibold">OK-08:</span> No Answer - Try Again</div>
                  <div><span className="font-semibold">OK-09:</span> Meeting Scheduled / Qualified Lead</div>
                  <div><span className="font-semibold">OK-10:</span> Hung Up</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 3: Add Notes</h3>
                <p className="text-gray-700">
                  Write down key points from the conversation, objections, interests, or next steps.
                  These notes will be saved with the contact for future reference.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 4: Save & Next</h3>
                <p className="text-gray-700">
                  Click <span className="font-semibold text-r7-blue">"Save & Next"</span> to log this call
                  and move to the next contact in your list.
                </p>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="card bg-white">
            <h2 className="text-2xl font-bold text-r7-blue mb-4">
              📊 Understanding Your Analytics
            </h2>

            <p className="text-gray-700 mb-4">
              Track your performance with these key metrics:
            </p>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Contact Rate</h3>
                <p className="text-gray-700">
                  Percentage of calls where you reached a decision maker. Higher is better!
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">Meeting Rate</h3>
                <p className="text-gray-700">
                  Percentage of DM calls that resulted in a scheduled meeting or qualified lead.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">Call Duration</h3>
                <p className="text-gray-700">
                  Average time spent on each call. Longer DM calls often indicate higher engagement.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">OK Code Distribution</h3>
                <p className="text-gray-700">
                  See which outcomes are most common. Use this to identify patterns and refine your approach.
                </p>
              </div>
            </div>
          </div>

          {/* Tips for Success */}
          <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              💡 Tips for Success
            </h2>

            <ul className="space-y-3 text-gray-800">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <div>
                  <strong>Be Consistent:</strong> Set aside dedicated calling blocks and work through your list systematically.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <div>
                  <strong>Take Notes:</strong> Even brief notes help you remember the conversation and build rapport on follow-ups.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <div>
                  <strong>Review Analytics:</strong> Check your stats weekly to see what's working and where you can improve.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <div>
                  <strong>Export Your Data:</strong> Use the Export CSV feature to backup your contacts and analyze data in spreadsheets.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <div>
                  <strong>Follow Up:</strong> Use the call history to review past conversations before making follow-up calls.
                </div>
              </li>
            </ul>
          </div>

          {/* Need Help? */}
          <div className="card bg-white text-center">
            <h2 className="text-2xl font-bold text-r7-blue mb-4">
              ❓ Need More Help?
            </h2>
            <p className="text-gray-700 mb-4">
              Remember: This tool is designed to be simple and intuitive. The more you use it, the more natural it becomes.
            </p>
            <p className="text-gray-700">
              Happy calling! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowToUse;
