
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Lightbulb, Users, PenTool, BarChart, Zap } from "lucide-react";

const serviceItems = [
  {
    icon: <Lightbulb className="h-10 w-10 text-blue-500" />,
    title: "AI Strategy Development",
    description: "Custom AI implementation strategies tailored to your school's unique needs and goals.",
  },
  {
    icon: <Users className="h-10 w-10 text-blue-500" />,
    title: "Teacher Training",
    description: "Comprehensive training programs to help educators effectively use AI tools in the classroom.",
  },
  {
    icon: <PenTool className="h-10 w-10 text-blue-500" />,
    title: "Curriculum Integration",
    description: "Seamlessly integrate AI tools and concepts into your existing curriculum.",
  },
  {
    icon: <BarChart className="h-10 w-10 text-blue-500" />,
    title: "Data Analysis",
    description: "Leverage AI to analyze student performance data and identify areas for improvement.",
  },
  {
    icon: <BookOpen className="h-10 w-10 text-blue-500" />,
    title: "Educational Resource Development",
    description: "Create AI-enhanced learning materials and resources for your students.",
  },
  {
    icon: <Zap className="h-10 w-10 text-blue-500" />,
    title: "Administrative Automation",
    description: "Streamline administrative tasks with AI solutions that save time and reduce errors.",
  },
];

const Services = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            How I Can Help Your <span className="text-gradient">School</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            Comprehensive AI consulting services designed specifically for educational institutions
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {serviceItems.map((service, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Card className="h-full card-hover border-blue-100">
                <CardHeader>
                  <div className="mb-4">{service.icon}</div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full border-blue-200 hover:bg-blue-50 text-blue-600">
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-12"
        >
          <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
            View All Services
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
