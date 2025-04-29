import { useEffect } from "react";

export default function TermsOfServicePage() {
  useEffect(() => {
    document.title = "Terms of Service - Daily News";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm text-gray-700">
          <p className="mb-4">Last updated: April 29, 2025</p>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to Daily News. These terms and conditions outline the rules and regulations for the use of our website.
              By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use 
              Daily News if you do not accept all of the terms and conditions stated on this page.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">2. License to Use</h2>
            <p>
              Unless otherwise stated, Daily News and/or its licensors own the intellectual property rights for all material on Daily News.
              All intellectual property rights are reserved. You may view and/or print pages from our website for your own personal use 
              subject to restrictions set in these terms and conditions.
            </p>
            <p className="mt-4">You must not:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Republish material from our website</li>
              <li>Sell, rent, or sub-license material from our website</li>
              <li>Reproduce, duplicate, or copy material from our website</li>
              <li>Redistribute content from Daily News (unless content is specifically made for redistribution)</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-8 mb-4">3. User Comments</h2>
            <p>
              Certain parts of this website offer the opportunity for users to post and exchange opinions, information, material, and data.
              Daily News does not screen, edit, publish or review Comments prior to their appearance on the website and Comments do not
              reflect the views or opinions of Daily News, its agents, or affiliates. Comments reflect the view and opinion of the person
              who posts such view or opinion.
            </p>
            <p className="mt-4">
              You hereby grant Daily News a non-exclusive license to use, reproduce, edit and authorize others to use, reproduce and
              edit any of your Comments in any and all forms, formats, or media.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">4. User Account</h2>
            <p>
              If you create an account on our website, you are responsible for maintaining the security of your account, and you are
              fully responsible for all activities that occur under the account and any other actions taken in connection with the account.
              You must immediately notify Daily News of any unauthorized uses of your account or any other breaches of security.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">5. Content Liability</h2>
            <p>
              We shall have no responsibility or liability for any content appearing on your website. You agree to indemnify and defend us
              against all claims arising out of or based upon your Website. No link(s) may appear on any page on your website or within any
              context containing content or materials that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise
              violates, or advocates the infringement or other violation of, any third party rights.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">6. Reservation of Rights</h2>
            <p>
              We reserve the right at any time and in its sole discretion to request that you remove all links or any particular link to
              our website. You agree to immediately remove all links to our website upon such request. We also reserve the right to amend
              these terms and conditions and its linking policy at any time. By continuing to link to our website, you agree to be bound
              to and abide by these linking terms and conditions.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">7. Disclaimer</h2>
            <p>
              To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to
              our website and the use of this website (including, without limitation, any warranties implied by law in respect of
              satisfactory quality, fitness for purpose and/or the use of reasonable care and skill).
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-100 p-4 rounded mt-2">
              <p>Email: legal@dailynews.com</p>
              <p>Address: 123 News Street, Downtown, Cityville, NY 10001</p>
              <p>Phone: (123) 456-7890</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}