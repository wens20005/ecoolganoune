import React from 'react';
import { Shield, Eye, Lock, Database, Globe, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <Shield className="h-8 w-8 mr-3 text-primary-600" />
          Privacy Policy
        </h1>
        <p className="text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8">
        <section className="card">
          <div className="flex items-center mb-4">
            <Eye className="h-6 w-6 mr-3 text-primary-600" />
            <h2 className="text-xl font-semibold">Information We Collect</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Personal Information</h3>
              <ul className="mt-2 text-gray-600 space-y-1">
                <li>• Email address and name for account creation</li>
                <li>• Profile information you choose to provide</li>
                <li>• Educational preferences and learning progress</li>
                <li>• Communication preferences</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Usage Data</h3>
              <ul className="mt-2 text-gray-600 space-y-1">
                <li>• Learning activities and exercise responses</li>
                <li>• Time spent on lessons and courses</li>
                <li>• Feature usage and interaction patterns</li>
                <li>• Device and browser information</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Content Data</h3>
              <ul className="mt-2 text-gray-600 space-y-1">
                <li>• Files you upload for educational purposes</li>
                <li>• Chat messages with AI assistant</li>
                <li>• Exercise submissions and responses</li>
                <li>• Notes and study materials</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 mr-3 text-primary-600" />
            <h2 className="text-xl font-semibold">How We Use Your Information</h2>
          </div>
          <div className="space-y-3 text-gray-600">
            <p>• <strong>Educational Services:</strong> Provide personalized learning experiences and track progress</p>
            <p>• <strong>AI Assistance:</strong> Improve AI responses and educational content recommendations</p>
            <p>• <strong>Communication:</strong> Send important updates about your courses and account</p>
            <p>• <strong>Analytics:</strong> Understand usage patterns to improve our platform</p>
            <p>• <strong>Security:</strong> Protect against fraud and ensure platform security</p>
            <p>• <strong>Legal Compliance:</strong> Meet legal obligations and enforce our terms</p>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center mb-4">
            <Lock className="h-6 w-6 mr-3 text-primary-600" />
            <h2 className="text-xl font-semibold">Data Protection & Security</h2>
          </div>
          <div className="space-y-3 text-gray-600">
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
              <li>• <strong>Access Controls:</strong> Strict role-based access to your information</li>
              <li>• <strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
              <li>• <strong>Secure Infrastructure:</strong> Hosted on secure, compliant cloud platforms</li>
              <li>• <strong>Data Minimization:</strong> We only collect necessary information</li>
              <li>• <strong>Staff Training:</strong> Regular security training for all personnel</li>
            </ul>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 mr-3 text-primary-600" />
            <h2 className="text-xl font-semibold">Data Sharing & Third Parties</h2>
          </div>
          <div className="space-y-3 text-gray-600">
            <p>We do not sell your personal information. We may share data only in these limited cases:</p>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Service Providers:</strong> Trusted partners who help operate our platform (Firebase, OpenAI)</li>
              <li>• <strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
              <li>• <strong>Business Transfers:</strong> In case of merger or acquisition (with notice)</li>
              <li>• <strong>Consent:</strong> When you explicitly consent to sharing</li>
            </ul>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <strong>Note:</strong> AI processing may involve sending anonymized content to OpenAI for educational assistance. 
                No personal identifiers are included in these requests.
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 mr-3 text-primary-600" />
            <h2 className="text-xl font-semibold">Your Rights & Choices</h2>
          </div>
          <div className="space-y-3 text-gray-600">
            <p>You have the following rights regarding your personal data:</p>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Access:</strong> Request a copy of your personal data</li>
              <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
              <li>• <strong>Deletion:</strong> Request deletion of your account and data</li>
              <li>• <strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li>• <strong>Objection:</strong> Object to certain types of data processing</li>
              <li>• <strong>Restriction:</strong> Request limitation of data processing</li>
            </ul>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800">
                To exercise these rights, contact us at privacy@yourplatform.com or use the settings in your account.
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 mr-3 text-primary-600" />
            <h2 className="text-xl font-semibold">Data Retention</h2>
          </div>
          <div className="space-y-3 text-gray-600">
            <p>We retain your information as follows:</p>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Account Data:</strong> Until you delete your account or request deletion</li>
              <li>• <strong>Learning Progress:</strong> Retained for educational continuity (can be deleted on request)</li>
              <li>• <strong>Chat Messages:</strong> 2 years from creation (or until deletion requested)</li>
              <li>• <strong>Security Logs:</strong> 1 year for security and fraud prevention</li>
              <li>• <strong>Analytics Data:</strong> Aggregated and anonymized indefinitely</li>
            </ul>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center mb-4">
            <Mail className="h-6 w-6 mr-3 text-primary-600" />
            <h2 className="text-xl font-semibold">Contact Information</h2>
          </div>
          <div className="space-y-3 text-gray-600">
            <p>For privacy-related questions or concerns, contact us:</p>
            <div className="ml-4 space-y-2">
              <p>• Email: privacy@yourplatform.com</p>
              <p>• Data Protection Officer: dpo@yourplatform.com</p>
              <p>• Physical Address: [Your Company Address]</p>
              <p>• Response Time: Within 30 days</p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold mb-4">Updates to This Policy</h2>
          <div className="space-y-3 text-gray-600">
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes via:
            </p>
            <ul className="space-y-1 ml-4">
              <li>• Email notification to your registered address</li>
              <li>• Prominent notice on our platform</li>
              <li>• In-app notification for major changes</li>
            </ul>
            <p className="mt-4">
              Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;