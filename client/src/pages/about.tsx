import { useEffect } from "react";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us - Tamil Keetru";
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 font-['Roboto_Condensed']">About Tamil Keetru</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="lead text-xl text-gray-600 mb-8">
            Tamil Keetru is dedicated to delivering timely, accurate, and insightful news coverage focusing on issues that matter to the Tamil community and beyond.
          </p>
          
          <div className="relative h-80 mb-8 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Tamil Keetru News Team" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
          <p>
            Founded in 2020, Tamil Keetru aims to bridge information gaps and provide a voice to the Tamil community through quality journalism. We believe in the power of information to empower individuals and communities to make informed decisions.
          </p>
          
          <p>
            Our team of dedicated journalists and contributors work around the clock to bring you breaking news, in-depth analysis, and feature stories across a wide range of topics including politics, business, technology, culture, and more.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Our Values</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Accuracy:</strong> We are committed to factual reporting and rigorous fact-checking.</li>
            <li><strong>Independence:</strong> Our editorial decisions are made independently, free from political and commercial influence.</li>
            <li><strong>Fairness:</strong> We present diverse perspectives and treat all subjects of our reporting with respect and dignity.</li>
            <li><strong>Accountability:</strong> We take responsibility for our work and promptly correct errors.</li>
            <li><strong>Community:</strong> We prioritize stories that matter to our community and amplify voices that might otherwise go unheard.</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Our Team</h2>
          <p>
            Tamil Keetru's team consists of experienced journalists, editors, and digital media professionals who share a passion for storytelling and a commitment to journalistic excellence.
          </p>
          
          <p>
            Our diverse team brings a wealth of experience from various backgrounds, enabling us to cover a wide range of topics with depth and insight. We are united by our commitment to serving our readers with high-quality, trustworthy news content.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
          <p>
            We value your feedback and are always open to suggestions, tips, and story ideas. If you'd like to get in touch with our team, please visit our <a href="/contact" className="text-secondary hover:underline">Contact page</a> or email us directly at <a href="mailto:info@vinasai.ca" className="text-secondary hover:underline">info@vinasai.ca</a>.
          </p>
          
          <p className="mt-8 italic text-gray-600">
            Thank you for making Tamil Keetru your trusted source for news and information.
          </p>
        </div>
      </div>
    </div>
  );
} 