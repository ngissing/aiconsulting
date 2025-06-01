
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox import
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2 } from "lucide-react";

const LeadMagnetForm = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [hasConsented, setHasConsented] = useState(false); // Added consent state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate email
    if (!email.includes('@') || !email.includes('.')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate form submission
    setTimeout(() => {
      // Store in localStorage
      try {
        const leads = JSON.parse(localStorage.getItem("leads") || "[]");
        leads.push({ name, email, school, hasConsented, date: new Date().toISOString() }); // Added hasConsented
        localStorage.setItem("leads", JSON.stringify(leads));
        
        setIsSuccess(true);
        toast({
          title: "Success!",
          description: "Your guide is on its way to your inbox!",
        });
      } catch (error) {
        toast({
          title: "Something went wrong",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
      
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!isSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl p-6 border border-blue-100"
        >
          <h3 className="text-xl font-bold mb-4 text-center">
            Get Your Free Guide: <span className="text-gradient">AI in Education</span>
          </h3>
          <p className="text-gray-600 mb-6 text-center text-sm">
            Discover how AI is transforming education with our comprehensive guide
          </p>
          
          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <FormItem>
                <FormLabel htmlFor="name">Name</FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-blue-200 focus:border-blue-500"
                  />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-blue-200 focus:border-blue-500"
                  />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel htmlFor="school">School/Institution</FormLabel>
                <FormControl>
                  <Input
                    id="school"
                    placeholder="Your school or institution"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </FormControl>
              </FormItem>

              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={hasConsented}
                    onCheckedChange={setHasConsented}
                    id="consent"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I agree to receive marketing communications and for my data to be processed according to the <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a>.
                  </FormLabel>
                  <p className="text-xs text-gray-500">
                    You can unsubscribe at any time. Providing consent is not required to use our services.
                  </p>
                </div>
              </FormItem>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
                disabled={isSubmitting || !hasConsented} // Disable if not consented
              >
                {isSubmitting ? "Sending..." : "Get My Free Guide"}
              </Button>
            </div>
          </Form>
          
          {/* Removed redundant privacy message, now part of the consent checkbox label */}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl p-8 border border-blue-100 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 text-green-500"
          >
            <CheckCircle2 size={60} className="mx-auto" />
          </motion.div>
          <h3 className="text-xl font-bold mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-4">
            Your guide is on its way to your inbox. Please check your email.
          </p>
          <Button 
            onClick={() => setIsSuccess(false)} 
            variant="outline"
            className="mt-2"
          >
            Back to Form
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default LeadMagnetForm;
