
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Nick's guidance transformed how our school approaches technology. His AI implementation strategy was practical, ethical, and incredibly effective.",
    name: "Dr. Sarah Johnson",
    title: "Principal, Westfield Academy",
    image: "/Testimonial1.jpg"
  },
  {
    quote: "Working with Nick was eye-opening. He helped our teachers embrace AI tools that actually reduced their workload while improving student outcomes.",
    name: "Michael Fitzgerald",
    title: "Technology Director, Riverdale High School",
    image: "/Testimonial2.jpg"
  },
  {
    quote: "Nick's approach is refreshingly practical. He understands the real challenges educators face and provides solutions that make a meaningful difference.",
    name: "Emily Rodriguez",
    title: "Head of Curriculum, Oakridge Elementary",
    image: "/Testimonial3.jpg"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-blue-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            What <span className="text-gradient">Educators</span> Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            Hear from school leaders who have transformed their educational approach with AI
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-blue-100 shadow-lg">
                <CardContent className="p-6">
                  <Quote className="h-10 w-10 text-blue-200 mb-4" />
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="mr-4">
                      <img  className="h-12 w-12 rounded-full object-cover" alt={`${testimonial.name} portrait`} src={testimonial.image} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
