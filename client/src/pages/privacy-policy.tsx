import { useEffect } from "react";

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = "Privacy Policy - Tamil Keetru";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm text-gray-700">
          <p className="mb-4">Last updated: April 29, 2025</p>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to Tamil Keetru. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website
              and tell you about your privacy rights and how the law protects you.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">2. The Data We Collect About You</h2>
            <p>
              Personal data, or personal information, means any information about an individual from which that person can be identified.
              It does not include data where the identity has been removed (anonymous data).
            </p>
            <p className="mt-4">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version,
                time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology
                on the devices you use to access this website.</li>
              <li><strong>Profile Data</strong> includes your username and password, your interests, preferences, feedback and survey responses.</li>
              <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-8 mb-4">3. How We Use Your Personal Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-8 mb-4">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way,
              altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have
              a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">5. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data. These include the right to:
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
              <li>Request restriction of processing your personal data.</li>
              <li>Request transfer of your personal data.</li>
              <li>Right to withdraw consent.</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-8 mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-gray-100 p-4 rounded mt-2">
              <p>Email: privacy@dailynews.com</p>
              <p>Address: 123 News Street, Downtown, Cityville, NY 10001</p>
              <p>Phone: (123) 456-7890</p>
            </div>
            
            <p className="mt-8">
              We hope this helps clarify how we use your data. Thank you for trusting Tamil Keetru.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}