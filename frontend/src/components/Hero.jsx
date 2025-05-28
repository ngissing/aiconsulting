
import React from "react";
import { motion } from "framer-motion";
import LeadMagnetForm from "@/components/LeadMagnetForm";
import { ArrowRight, BookOpen, School, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-2">
              <School className="w-4 h-4 mr-2" />
              AI Education Consultant
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Transform Your School with <span className="text-gradient">AI-Powered</span> Education
            </h1>
            
            <p className="text-lg text-gray-600 md:pr-10">
              Helping educators and schools implement AI solutions that enhance learning outcomes, streamline administrative tasks, and prepare students for the future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button className="bg-blue-600 hover:bg-blue-700 transition-colors text-white flex items-center gap-2 px-6 py-6">
                Book a Consultation
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" className="border-blue-200 hover:bg-blue-50 transition-colors flex items-center gap-2 px-6 py-6">
                <BookOpen className="w-4 h-4" />
                View Case Studies
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="text-blue-600 font-bold text-2xl">100+</div>
                <div className="text-gray-600 text-sm">Schools Helped</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="text-blue-600 font-bold text-2xl">5000+</div>
                <div className="text-gray-600 text-sm">Teachers Trained</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="text-blue-600 font-bold text-2xl">98%</div>
                <div className="text-gray-600 text-sm">Satisfaction Rate</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 p-6">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <LeadMagnetForm />
            </div>
            
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full hero-gradient rounded-full blur-3xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
