import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">About PollWave</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            PollWave aims to make opinion gathering simple, fun, and insightful. We believe that everyone's voice matters.
          </p>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Who We Are</h2>
          <p className="text-gray-600 mb-4">
            We're a team of developers passionate about creating tools that help people connect and share ideas through interactive polls.
          </p>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Why PollWave</h2>
          <p className="text-gray-600 mb-4">
            Our platform offers an intuitive interface, real-time results, and beautiful visualizations to help you understand public opinion.
          </p>
        </Card>
      </div>
      
      <div className="bg-gradient-to-r from-primary-600 to-primary rounded-2xl p-8 md:p-12 mb-12 text-white">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-4 mb-8">
            <li className="text-lg">Create a poll with multiple options</li>
            <li className="text-lg">Share it with your audience</li>
            <li className="text-lg">Collect votes in real-time</li>
            <li className="text-lg">Analyze results with interactive charts</li>
          </ol>
          <Button 
            variant="secondary" 
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
            asChild
          >
            <Link href="/">Try It Now</Link>
          </Button>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Is PollWave free to use?</h3>
              <p className="text-gray-600">Yes, PollWave is completely free for basic usage. Create, share, and analyze polls at no cost.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">How many polls can I create?</h3>
              <p className="text-gray-600">There's no limit to the number of polls you can create with your account.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Can I embed polls on my website?</h3>
              <p className="text-gray-600">Currently, we don't offer embedding, but it's on our roadmap for future updates.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">How is my data handled?</h3>
              <p className="text-gray-600">We take data privacy seriously. Your poll data is stored securely and never shared with third parties.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Ready to start polling?</h2>
        <p className="text-gray-600 mb-6">Join thousands of users who are already gathering valuable feedback with PollWave.</p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            className="bg-primary hover:bg-primary-600 text-white"
            asChild
          >
            <Link href="/">Create Your First Poll</Link>
          </Button>
          <Button 
            variant="outline"
            asChild
          >
            <Link href="/discover">Browse Existing Polls</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
