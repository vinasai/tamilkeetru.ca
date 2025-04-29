import { useEffect } from "react";

export default function CookiesPolicyPage() {
  useEffect(() => {
    document.title = "Cookies Policy - Daily News";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Cookies Policy</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm text-gray-700">
          <p className="mb-4">Last updated: April 29, 2025</p>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold mt-8 mb-4">1. Introduction</h2>
            <p>
              This Cookies Policy explains what cookies are and how we use them on our website. You should read this policy
              to understand what cookies are, how we use them, the types of cookies we use, the information we collect using
              cookies and how that information is used, and how to control your cookie preferences.
            </p>
            <p className="mt-4">
              By using our website, you agree to the use of cookies in accordance with this Cookies Policy. If you do not agree
              to this Cookies Policy, please disable your cookies via your browser settings. However, if you disable cookies,
              you may not be able to use all the features of our website.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">2. What Are Cookies</h2>
            <p>
              Cookies are small text files that are used to store small pieces of information. They are stored on your device
              when the website is loaded on your browser. These cookies help us make the website function properly, make it more
              secure, provide better user experience, understand how the website performs and to analyze what works and where it
              needs improvement.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">3. How We Use Cookies</h2>
            <p>
              Like most online services, our website uses cookies for a variety of purposes. We use cookies for the following
              purposes:
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li><strong>Necessary cookies:</strong> These cookies are essential for you to browse the website and use its features, 
              such as accessing secure areas of the site. The website cannot function properly without these cookies.</li>
              <li><strong>Preferences cookies:</strong> These cookies enable the website to remember information that changes 
              the way the website behaves or looks, like your preferred language or the region you are in.</li>
              <li><strong>Statistics cookies:</strong> These cookies help us understand how visitors interact with the website 
              by collecting and reporting information anonymously.</li>
              <li><strong>Marketing cookies:</strong> These cookies are used to track visitors across websites. The intention 
              is to display ads that are relevant and engaging for the individual user.</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-8 mb-4">4. Types of Cookies We Use</h2>
            <h3 className="text-lg font-semibold mt-6 mb-2">4.1 Session Cookies</h3>
            <p>
              These are temporary cookies that expire when you close your browser. Session cookies help our website recognize
              you as you navigate between pages during a single browser session.
            </p>
            
            <h3 className="text-lg font-semibold mt-6 mb-2">4.2 Persistent Cookies</h3>
            <p>
              These remain on your device after you've closed your browser. They allow our website to remember your preferences
              for your next visit.
            </p>
            
            <h3 className="text-lg font-semibold mt-6 mb-2">4.3 First-Party Cookies</h3>
            <p>
              These cookies are set by the website you're visiting.
            </p>
            
            <h3 className="text-lg font-semibold mt-6 mb-2">4.4 Third-Party Cookies</h3>
            <p>
              These cookies are set by someone other than the owner of the website you're visiting. They could be used by
              marketers to track your internet usage and build a profile of your interests.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">5. Managing Your Cookie Preferences</h2>
            <p>
              Most browsers allow you to manage your cookie preferences. You can:
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li>Delete cookies from your device</li>
              <li>Block cookies by activating the setting on your browser that allows you to refuse all or some cookies</li>
              <li>Set your browser to notify you when you receive a cookie</li>
            </ul>
            <p className="mt-4">
              Please note that if you choose to block all cookies, you may not be able to access parts of our website and it
              may not function properly.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <div className="bg-gray-100 p-4 rounded mt-2">
              <p>Email: privacy@dailynews.com</p>
              <p>Address: 123 News Street, Downtown, Cityville, NY 10001</p>
              <p>Phone: (123) 456-7890</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}