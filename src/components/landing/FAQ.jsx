import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, ChevronDown } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className={`transition-all duration-500 rounded-[2rem] overflow-hidden ${isOpen ? 'bg-white shadow-[0_30px_60px_rgba(0,0,0,0.04)] border-transparent' : 'bg-slate-50/50 border-gray-50 border hover:bg-slate-50'}`}>
            <button
                onClick={onClick}
                className="w-full px-10 py-8 text-left flex items-center justify-between transition-colors"
            >
                <span className={`font-bold text-xl pr-8 transition-colors duration-300 ${isOpen ? 'text-teal-600' : 'text-gray-900'}`}>{question}</span>
                <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-teal-600 text-white rotate-180 shadow-lg shadow-teal-200' : 'bg-white text-gray-400 shadow-sm'}`}>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </button>
            <div
                className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-10 pb-10 pt-0 text-gray-500 text-lg leading-relaxed font-medium">
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
            question: "Is my medical data secure?",
            answer: "Absolutely. We prioritize your privacy with industry-standard encryption for all data. Your medical records and consultation history are strictly confidential and only accessible to you and your authorized doctors."
        },
        {
            question: "Can I order medicines online?",
            answer: "Yes! You can browse our online pharmacy for OTC medicines or upload a prescription for verification. Once approved, our partner pharmacies will deliver the medicines directly to your doorstep."
        },
        {
            question: "Are the doctors verified?",
            answer: "Every doctor on our platform undergoes a rigorous verification process. We check their medical registration, qualifications, and practice history to ensure you receive care from trusted professionals."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We support seamless payments through Nepal's most popular digital wallets including eSewa and Khalti. Secure and instant transaction processing ensures your appointments are confirmed immediately."
        }
    ];

    return (
        <section id="faq" className="py-32 bg-white relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-40 right-0 w-96 h-96 bg-teal-50 rounded-full blur-[120px] opacity-60 translate-x-1/2"></div>
            
            <div className="max-w-5xl mx-auto px-8 relative z-10">
                <div className="max-w-3xl mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 mb-6">
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Support Center</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 font-serif tracking-tight leading-tight">
                        Common <span className="text-teal-600 italic">Questions</span>.
                    </h2>
                    <p className="text-xl text-gray-500 leading-relaxed font-medium">
                        Everything you need to know about Swasthya Connect. Can't find the answer you're looking for? Feel free to contact our support team.
                    </p>
                </div>

                <div className="space-y-6">
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
