import React, { useState } from "react";
import { motion } from "framer-motion";
function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Sideen alaab uga dalban karaa?",
      answer:
        "Waxaad si fudud uga dalban kartaa adigoo isticmaalaya website-ka, dooro alaabta, ka dibna dhameystir lacag bixinta.",
    },
    {
      question: "Intee ayaan ku sugi karaa dalabka?",
      answer:
        "Dalabkaaga waxa uu gaari doonaa inta badan 2-3 maalmood gudahood, iyadoo ku xiran meesha aad ku sugan tahay.",
    },
    {
      question: "Sideen ula xiriiri karaa adeegga macaamiisha?",
      answer:
        "Waad nagala soo xiriiri kartaa email, telefoon, ama adeegga fariimaha degdega ah ee website-ka.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex !== index ? index : null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <section className="py-8 bg-gray-50 flex-grow">
        <div className="max-w-3xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-center mb-14 text-primary"
          >
            Su'aalaha La Weydiiyo Badanaa (FAQ)
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="border rounded-lg overflow-hidden shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, ease: "linear" }}
              >
                <button
                  className="w-full text-left p-4 flex justify-between items-center bg-gradient-to-r from-primary/10 to-primary hover:from-primary hover:to-primary/20 transition-all duration-300"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-medium text-dark">{faq.question}</span>
                  <span className="text-xl font-bold text-dark">
                    {openIndex === index ? "-" : "+"}
                  </span>
                </button>
                {openIndex === index && (
                  <motion.div
                    className="p-4 bg-white border-t"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.1, ease: "easeIn" }}
                  >
                    <p className="text-gray-700">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Faq;
