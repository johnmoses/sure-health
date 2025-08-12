'use client';

import { useState } from 'react';
import { MessageCircle, Send, Loader } from 'lucide-react';
import { medicationsService } from '../../../xlib/services';

export default function CounselingPage() {
  const [medication, setMedication] = useState('');
  const [counseling, setCounseling] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{medication: string, counseling: string}>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medication.trim()) return;

    setLoading(true);
    try {
      const response = await medicationsService.getMedicationCounseling({ medication });
      const counselingText = response.data.counseling;
      
      setCounseling(counselingText);
      setHistory([{medication, counseling: counselingText}, ...history]);
      setMedication('');
    } catch (error) {
      console.error('Failed to get counseling:', error);
      setCounseling('Sorry, there was an error getting medication counseling. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Medication Counseling</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Medication Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter medication name (e.g., Lisinopril, Metformin)"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !medication.trim()}
                className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Getting Counseling...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Get Counseling
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Counseling Information</h2>
            
            {counseling ? (
              <div className="prose prose-sm max-w-none">
                <div className="bg-teal-50 border border-teal-200 rounded-md p-4">
                  <div className="flex items-start">
                    <MessageCircle className="h-5 w-5 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="whitespace-pre-wrap text-sm text-gray-700">
                      {counseling}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Enter a medication name to get AI-powered counseling information</p>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Counseling History</h2>
            
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center mb-2">
                    <MessageCircle className="h-4 w-4 text-teal-600 mr-2" />
                    <h3 className="font-medium text-gray-900">{item.medication}</h3>
                  </div>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
                    {item.counseling.substring(0, 200)}...
                  </div>
                  <button
                    onClick={() => setCounseling(item.counseling)}
                    className="mt-2 text-teal-600 hover:text-teal-800 text-sm font-medium"
                  >
                    View Full Counseling
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important Disclaimer</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This AI-generated medication counseling is for educational purposes only and should not replace professional medical advice. 
                  Always consult with your healthcare provider or pharmacist for personalized medication guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}