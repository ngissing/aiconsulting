
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const About = () => {
  const achievements = [
    "10+ years in educational technology",
    "Helped implement AI in 100+ schools",
    "Former education technology director",
    "Published author on AI in education",
    "Speaker at major education conferences",
    "Certified AI education specialist",
  ];

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-8 border-white">
              <img  className="w-full h-auto" alt="Nick Gissing, AI Education Consultant" src="https://images.unsplash.com/photo-1675270714610-11a5cadcc7b3" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-10 -right-10 bg-white rounded-lg shadow-lg p-4 border border-blue-100"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Trusted by</p>
                  <p className="text-lg font-bold">100+ Schools</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Meet <span className="text-gradient">Nick Gissing</span>
            </h2>
            
            <p className="text-lg text-gray-600">
              I'm passionate about helping schools and educators harness the power of AI to transform education. With over a decade of experience in educational technology, I provide practical, ethical, and effective AI solutions tailored to the unique needs of educational institutions.
            </p>
            
            <p className="text-lg text-gray-600">
              My approach combines technical expertise with a deep understanding of educational environments, ensuring that AI implementation enhances teaching and learning while addressing real challenges faced by schools today.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-700">{achievement}</span>
                </div>
              ))}
            </div>
            
            <Button className="bg-blue-600 hover:bg-blue-700 transition-colors mt-4">
              Learn More About Me
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
