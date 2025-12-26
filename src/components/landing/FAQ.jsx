import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:shadow-md">
            <button
                onClick={onClick}
                className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            >
                <span className="font-semibold text-gray-900 text-lg pr-4">{question}</span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-teal-100 text-teal-600 rotate-180' : 'bg-gray-100 text-gray-500'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
            </button>
            <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
};

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: "How do I book a consultation?",
            answer: "Booking is simple! Just sign up for a free patient account, search for a doctor by specialty or name, view their available slots, and book an appointment instantly. You can choose between text chat or video consultations."
        },
        {
            question: "Is my medical data and personal information secure?",
            answer: "Absolutely. We prioritize your privacy with industry-standard encryption for all data. Your medical records and consultation history are strictly confidential and only accessible to you and your authorized doctors."
        },
        {
            question: "Can I order medicines through the platform?",
            answer: "Yes! You can browse our online pharmacy for OTC medicines or upload a prescription for verification. Once approved, our partner pharmacies will deliver the medicines directly to your doorstep."
        },
        {
            question: "Are the doctors on Swasthya Connect verified?",
            answer: "Every doctor on our platform undergoes a rigorous verification process. We check their medical registration, qualifications, and practice history to ensure you receive care from trusted professionals."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We support seamless payments through Nepal's most popular digital wallets including eSewa and Khalti. Secure and instant transaction processing ensures your appointments are confirmed immediately."
        }
    ];

    return (
        <section id="faq" className="py-24 bg-gray-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-teal-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30 translate-x-1/3 translate-y-1/3"></div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold mb-6">
                        <HelpCircle className="w-4 h-4" />
                        <span>Common Questions</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Everything you need to know about Swasthya Connect. Can't find the answer you're looking for? Feel free to contact our support team.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={index === openIndex}
                            onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
